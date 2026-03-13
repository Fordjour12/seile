"use node";

import { internal } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";
import { buildReviewSummary, calculateBurnoutRisk, clampMaxTasksPerDay } from "../../lib/planner";
import {
  burnoutAssessmentSchema,
  planningModeSchema,
  replanningAssessmentSchema,
  weeklyReviewSchema,
} from "../plannerSchema";
import { createPlannerThread, plannerAgent } from "../agents/planner";
import { generateWeeklyPlanObject } from "../generateWeeklyPlan";

const internalApi = internal as unknown as Record<string, Record<string, any>>;

const DEFAULT_PROFILE = {
  timezone: "UTC",
  workHours: {
    start: "09:00",
    end: "17:00",
  },
  restDays: ["sunday"],
  energyPattern: "morning" as const,
  planningStyle: "structured" as const,
  maxTasksPerDay: 3,
  deepWorkPreference: true,
};

export async function draftWeeklyPlanForUser(
  ctx: ActionCtx,
  input: {
    userId: string;
    weekStart?: string;
    mode: "directed" | "discovery" | "zero_input" | "recovery";
    createdBy: "user" | "agent" | "system";
  },
) {
  const existing = await ctx.runQuery(internalApi["planner/queries"].getPlannerAgentContext, {
    userId: input.userId,
    weekStart: input.weekStart,
  });
  if (existing.currentPlan) {
    return { id: existing.currentPlan._id, reused: true };
  }

  const generated = await generateWeeklyPlanObject(ctx, input);
  return await ctx.runMutation(internalApi["planner/mutations"].storeAgentWeeklyPlan, {
    userId: input.userId,
    weekStart: generated.context.week.startDate,
    endDate: generated.context.week.endDate,
    mode: planningModeSchema.parse(input.mode),
    createdBy: input.createdBy,
    title: generated.plan.title,
    summary: generated.plan.summary,
    priorityTitles: generated.plan.priorityTitles,
    warnings: generated.plan.warnings,
    burnoutRiskScore: generated.plan.burnoutRiskScore,
    recoverySuggested: generated.plan.recoverySuggested,
    agentThreadId: generated.threadId,
    reuseExisting: true,
    items: generated.plan.items,
  });
}

export async function reviewWeeklyPlanForUser(
  ctx: ActionCtx,
  input: {
    userId: string;
    planId: string;
    stressRating?: number;
    satisfactionRating?: number;
  },
) {
  const detail = await ctx.runQuery(internalApi["planner/queries"].getPlanByIdForUser, {
    userId: input.userId,
    id: input.planId,
  });
  const plannerContext = await ctx.runQuery(internalApi["planner/queries"].getPlannerAgentContext, {
    userId: input.userId,
    weekStart: detail.plan.startDate,
  });
  const baselineReview = buildReviewSummary(
    detail.plan,
    detail.items,
    input.stressRating,
    input.satisfactionRating,
    clampMaxTasksPerDay(plannerContext.profile?.maxTasksPerDay ?? DEFAULT_PROFILE.maxTasksPerDay),
  );

  const threadId = await createPlannerThread(ctx, {
    userId: input.userId,
    title: `Weekly review ${detail.plan.startDate}`,
    summary: "Analyze the user's previous week and produce a grounded review.",
  });

  const result = await plannerAgent.generateObject(
    ctx,
    { threadId },
    {
      prompt: [
        "Analyze the user's previous week.",
        "Return a grounded review using actual completed and missed work. No motivational language.",
        `Plan: ${JSON.stringify({
          title: detail.plan.title,
          summary: detail.plan.summary,
          priorityTitles: detail.plan.priorityTitles,
          warnings: detail.plan.warnings,
        })}`,
        `Plan items: ${JSON.stringify(
          detail.items.map((item: any) => ({
            title: item.title,
            itemType: item.itemType,
            status: item.status,
            date: item.date,
            priority: item.priority,
          })),
        )}`,
        `Baseline review: ${JSON.stringify({
          ...baselineReview,
          stressRating: input.stressRating,
          satisfactionRating: input.satisfactionRating,
        })}`,
      ].join("\n\n"),
      schema: weeklyReviewSchema,
    },
  );

  return await ctx.runMutation(internalApi["planner/mutations"].saveAgentReview, {
    userId: input.userId,
    planId: input.planId,
    agentThreadId: threadId,
    completionRate: result.object.completionRate,
    wins: result.object.wins,
    blockers: result.object.blockers,
    misses: result.object.misses,
    missedHabitsCount: baselineReview.missedHabitsCount,
    overloadIndicators: result.object.overloadIndicators,
    improvementSuggestions: result.object.improvementSuggestions,
    stressRating: result.object.stressRating ?? input.stressRating,
    satisfactionRating: result.object.satisfactionRating ?? input.satisfactionRating,
    burnoutScore: result.object.burnoutScore,
    burnoutState: result.object.burnoutState,
  });
}

export async function replanWeeklyPlanForUser(
  ctx: ActionCtx,
  input: {
    userId: string;
    planId: string;
  },
) {
  const detail = await ctx.runQuery(internalApi["planner/queries"].getPlanByIdForUser, {
    userId: input.userId,
    id: input.planId,
  });
  const threadId = await createPlannerThread(ctx, {
    userId: input.userId,
    title: `Replan ${detail.plan.startDate}`,
    summary: "Replan the remaining period while preserving locked items and reducing pressure.",
  });

  const result = await plannerAgent.generateObject(
    ctx,
    { threadId },
    {
      prompt: [
        "Replan the remaining period.",
        "Preserve locked items and deadlines. Drop low-value tasks first and reduce pressure if the user is behind.",
        `Plan: ${JSON.stringify({
          title: detail.plan.title,
          warnings: detail.plan.warnings,
          burnoutRiskScore: detail.plan.burnoutRiskScore,
        })}`,
        `Items: ${JSON.stringify(
          detail.items.map((item: any) => ({
            title: item.title,
            itemType: item.itemType,
            status: item.status,
            date: item.date,
            locked: item.locked,
            priority: item.priority,
          })),
        )}`,
      ].join("\n\n"),
      schema: replanningAssessmentSchema,
    },
  );

  if (!result.object.shouldAdjust) {
    return {
      movedCount: 0,
      droppedCount: 0,
      warning: "Agent kept the current weekly structure.",
    };
  }

  return await ctx.runMutation(internalApi["planner/mutations"].performAgentReplan, {
    userId: input.userId,
    planId: input.planId,
    reason: result.object.reason,
    preserveLockedItems: result.object.preserveLockedItems,
  });
}

export async function reviewLatestPastWeeklyPlanForUser(ctx: ActionCtx, userId: string) {
  const targetPlan = await ctx.runQuery(
    internalApi["planner/queries"].getLatestPastWeeklyPlanWithoutReview,
    { userId },
  );

  if (!targetPlan?._id) {
    return null;
  }

  return await reviewWeeklyPlanForUser(ctx, {
    userId,
    planId: targetPlan._id,
  });
}

export async function assessBurnoutForUser(ctx: ActionCtx, userId: string) {
  const context = await ctx.runQuery(internalApi["planner/queries"].getPlannerAgentContext, {
    userId,
  });
  const baselineRisk = calculateBurnoutRisk({
    latestReview: context.latestReview,
    agentState: context.agentState,
    openTasksCount: context.openTasks.length,
    missedHabitsCount:
      context.latestReview?.missedHabitsCount ?? context.latestReview?.misses.length ?? 0,
    mode: "discovery",
    health: context.health,
  });

  const threadId = await createPlannerThread(ctx, {
    userId,
    title: `Burnout monitor ${context.week.startDate}`,
    summary: "Assess burnout risk using planner execution data.",
  });

  return await plannerAgent.generateObject(
    ctx,
    { threadId },
    {
      prompt: [
        "Assess burnout risk using execution data.",
        `Context: ${JSON.stringify({
          baselineRisk,
          latestReview: context.latestReview,
          openTasks: context.openTasks.length,
          currentPlanWarnings: context.currentPlan?.warnings ?? [],
          health: context.health,
        })}`,
      ].join("\n\n"),
      schema: burnoutAssessmentSchema,
    },
  );
}

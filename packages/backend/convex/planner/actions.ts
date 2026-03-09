"use node";

import { v } from "convex/values";

import type { ActionCtx } from "../_generated/server";
import { action, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import {
  buildReviewSummary,
  buildWeeklyPlanDraft,
  calculateBurnoutRisk,
} from "../lib/planner";
import { requireUserId } from "../lib/identity";
import {
  burnoutAssessmentSchema,
  createPlannerThread,
  ensurePlannerAgentConfigured,
  plannerAgent,
  planningModeSchema,
  replanningAssessmentSchema,
  weeklyPlanSchema,
  weeklyReviewSchema,
} from "./agent";

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

export const draftWeeklyPlan = action({
  args: {
    weekStart: v.optional(v.string()),
    mode: v.optional(v.union(v.literal("directed"), v.literal("discovery"), v.literal("zero_input"), v.literal("recovery"))),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await draftWeeklyPlanForUser(ctx, {
      userId,
      weekStart: args.weekStart,
      mode: args.mode ?? "zero_input",
      createdBy: "user",
    });
  },
});

export const reviewWeeklyPlan = action({
  args: {
    planId: v.id("plans"),
    stressRating: v.optional(v.number()),
    satisfactionRating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await reviewWeeklyPlanForUser(ctx, {
      userId,
      planId: args.planId,
      stressRating: args.stressRating,
      satisfactionRating: args.satisfactionRating,
    });
  },
});

export const replanWeeklyPlan = action({
  args: {
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await replanWeeklyPlanForUser(ctx, { userId, planId: args.planId });
  },
});

export const runWeeklyReviewCycle = internalAction({
  args: {},
  handler: async (ctx) => {
    ensurePlannerAgentConfigured();
    const states = await ctx.runQuery(internalApi["planner/queries"].listAgentEnabledStates, {});
    let reviewedCount = 0;

    for (const state of states) {
      const targetPlan = await ctx.runQuery(
        internalApi["planner/queries"].getLatestPastWeeklyPlanWithoutReview,
        { userId: state.userId },
      );
      if (!targetPlan) continue;

      await reviewWeeklyPlanForUser(ctx, {
        userId: state.userId,
        planId: targetPlan._id,
      });
      reviewedCount += 1;
    }

    return { reviewedCount };
  },
});

export const runWeeklyPlanningCycle = internalAction({
  args: {},
  handler: async (ctx) => {
    ensurePlannerAgentConfigured();
    const states = await ctx.runQuery(internalApi["planner/queries"].listAgentEnabledStates, {});
    let createdCount = 0;
    const nextWeekStart = nextWeekMonday();

    for (const state of states) {
      const result = await draftWeeklyPlanForUser(ctx, {
        userId: state.userId,
        weekStart: nextWeekStart,
        mode: state.burnoutState === "recovery" ? "recovery" : "discovery",
        createdBy: "agent",
      });
      if (!result.reused) {
        createdCount += 1;
      }
    }

    return { createdCount };
  },
});

export const runMidweekAdjustmentCycle = internalAction({
  args: {},
  handler: async (ctx) => {
    ensurePlannerAgentConfigured();
    const states = await ctx.runQuery(internalApi["planner/queries"].listAgentEnabledStates, {});
    let adjustedCount = 0;

    for (const state of states) {
      const context = await ctx.runQuery(internalApi["planner/queries"].getPlannerAgentContext, {
        userId: state.userId,
      });
      if (!context.currentPlan) continue;

      const pendingTasks = context.currentPlanItems.filter(
        (item: { itemType: string; status: string }) => item.itemType === "task" && item.status === "pending",
      );
      const doneTasks = context.currentPlanItems.filter(
        (item: { itemType: string; status: string }) => item.itemType === "task" && item.status === "done",
      );

      const threadId = await createPlannerThread(ctx, {
        userId: state.userId,
        title: `Midweek adjustment ${context.week.startDate}`,
        summary: "Assess whether the remaining week needs a lighter plan.",
      });

      const result = await plannerAgent.generateObject(
        ctx,
        { threadId },
        {
          prompt: [
            "Assess midweek drift for this weekly plan.",
            "Return shouldAdjust=false unless remaining work is clearly overloaded or burnout risk is rising.",
            "If adjustment is needed, produce a direct reason focused on overload, rollover, or low energy.",
            `Current plan: ${JSON.stringify({
              title: context.currentPlan.title,
              warnings: context.currentPlan.warnings,
              burnoutRiskScore: context.currentPlan.burnoutRiskScore,
              pendingTasks: pendingTasks.map((item: { title: string; date: string; priority: string }) => ({
                title: item.title,
                date: item.date,
                priority: item.priority,
              })),
              doneTaskCount: doneTasks.length,
              latestReview: context.latestReview,
            })}`,
          ].join("\n\n"),
          schema: replanningAssessmentSchema,
        },
      );

      if (result.object.shouldAdjust) {
        const replanResult = await ctx.runMutation(internalApi["planner/mutations"].performAgentReplan, {
          userId: state.userId,
          planId: context.currentPlan._id,
          reason: result.object.reason,
          preserveLockedItems: result.object.preserveLockedItems,
        });
        if (replanResult.movedCount > 0 || replanResult.droppedCount > 0) {
          adjustedCount += 1;
        }
      }
    }

    return { adjustedCount };
  },
});

export const runBurnoutMonitoringCycle = internalAction({
  args: {},
  handler: async (ctx) => {
    ensurePlannerAgentConfigured();
    const states = await ctx.runQuery(internalApi["planner/queries"].listAgentEnabledStates, {});
    let updatedCount = 0;

    for (const state of states) {
      const context = await ctx.runQuery(internalApi["planner/queries"].getPlannerAgentContext, {
        userId: state.userId,
      });
      const baselineRisk = calculateBurnoutRisk({
        latestReview: context.latestReview,
        agentState: context.agentState,
        openTasksCount: context.openTasks.length,
        missedHabitsCount: context.latestReview?.misses.length ?? 0,
        mode: "discovery",
      });

      const threadId = await createPlannerThread(ctx, {
        userId: state.userId,
        title: `Burnout monitor ${context.week.startDate}`,
        summary: "Assess burnout risk using planner execution data.",
      });

      const result = await plannerAgent.generateObject(
        ctx,
        { threadId },
        {
          prompt: [
            "Assess burnout risk using execution data.",
            "Be conservative: recommend recovery when completion is repeatedly low and stress is elevated.",
            `Context: ${JSON.stringify({
              baselineRisk,
              latestReview: context.latestReview,
              openTasks: context.openTasks.length,
              currentPlanWarnings: context.currentPlan?.warnings ?? [],
            })}`,
          ].join("\n\n"),
          schema: burnoutAssessmentSchema,
        },
      );

      await ctx.runMutation(internalApi["planner/mutations"].updateAgentBurnoutState, {
        userId: state.userId,
        burnoutScore: result.object.burnoutScore,
        burnoutState: result.object.burnoutState,
        touchedAt: Date.now(),
      });
      updatedCount += 1;
    }

    return { updatedCount };
  },
});

async function draftWeeklyPlanForUser(
  ctx: ActionCtx,
  input: {
    userId: string;
    weekStart?: string;
    mode: "directed" | "discovery" | "zero_input" | "recovery";
    createdBy: "user" | "agent" | "system";
  },
) {
  ensurePlannerAgentConfigured();
  const context = await ctx.runQuery(internalApi["planner/queries"].getPlannerAgentContext, {
    userId: input.userId,
    weekStart: input.weekStart,
  });
  const profile = context.profile ?? DEFAULT_PROFILE;
  const baselineDraft = buildWeeklyPlanDraft({
    weekStart: context.week.startDate,
    mode: input.mode,
    goals: context.goals,
    tasks: context.openTasks,
    habits: context.habits,
    latestReview: context.latestReview,
    agentState: context.agentState,
    profile,
  });

  const threadId = await createPlannerThread(ctx, {
    userId: input.userId,
    title: `Weekly plan ${context.week.startDate}`,
    summary: "Generate a realistic weekly plan with buffers and recovery space.",
  });

  const result = await plannerAgent.generateObject(
    ctx,
    { threadId },
    {
      prompt: [
        "Generate a realistic weekly plan.",
        `Planning mode: ${input.mode}.`,
        "Keep the baseline structure unless you have a clear reason to reduce pressure further.",
        "Do not exceed 3 priorities. Do not overload any day. Include buffer space and a weekly review moment.",
        `Context: ${JSON.stringify({
          week: context.week,
          profile,
          goals: context.goals.map((goal: { title: string; domain: string; priority: string; horizon: string; targetDate?: string }) => ({
            title: goal.title,
            domain: goal.domain,
            priority: goal.priority,
            horizon: goal.horizon,
            targetDate: goal.targetDate,
          })),
          openTasks: context.openTasks.map((task: { title: string; priority: string; dueDate?: string }) => ({
            title: task.title,
            priority: task.priority,
            dueDate: task.dueDate,
          })),
          habits: context.habits.map((habit: { name: string; cadence: string; targetValue: number }) => ({
            name: habit.name,
            cadence: habit.cadence,
            targetValue: habit.targetValue,
          })),
          latestReview: context.latestReview,
        })}`,
        `Baseline draft: ${JSON.stringify(baselineDraft)}`,
      ].join("\n\n"),
      schema: weeklyPlanSchema,
    },
  );

  return await ctx.runMutation(internalApi["planner/mutations"].storeAgentWeeklyPlan, {
    userId: input.userId,
    weekStart: context.week.startDate,
    endDate: context.week.endDate,
    mode: planningModeSchema.parse(input.mode),
    createdBy: input.createdBy,
    title: result.object.title,
    summary: result.object.summary,
    priorityTitles: result.object.priorityTitles,
    warnings: result.object.warnings,
    burnoutRiskScore: result.object.burnoutRiskScore,
    recoverySuggested: result.object.recoverySuggested,
    agentThreadId: threadId,
    reuseExisting: true,
    items: result.object.items,
  });
}

async function reviewWeeklyPlanForUser(
  ctx: ActionCtx,
  input: {
    userId: string;
    planId: string;
    stressRating?: number;
    satisfactionRating?: number;
  },
) {
  ensurePlannerAgentConfigured();
  const detail = await ctx.runQuery(internalApi["planner/queries"].getPlanByIdForUser, {
    userId: input.userId,
    id: input.planId,
  });
  const baselineReview = buildReviewSummary(
    detail.plan,
    detail.items,
    input.stressRating,
    input.satisfactionRating,
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
          detail.items.map((item: { title: string; itemType: string; status: string; date: string; priority: string }) => ({
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
          burnoutScore: Math.max(0, Math.min(100, Math.round((100 - baselineReview.completionRate) * 0.55 + ((input.stressRating ?? 3) * 8)))),
          burnoutState:
            (100 - baselineReview.completionRate) * 0.55 + ((input.stressRating ?? 3) * 8) >= 70
              ? "recovery"
              : (100 - baselineReview.completionRate) * 0.55 + ((input.stressRating ?? 3) * 8) >= 45
                ? "watch"
                : "stable",
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
    overloadIndicators: result.object.overloadIndicators,
    improvementSuggestions: result.object.improvementSuggestions,
    stressRating: result.object.stressRating ?? input.stressRating,
    satisfactionRating: result.object.satisfactionRating ?? input.satisfactionRating,
    burnoutScore: result.object.burnoutScore,
    burnoutState: result.object.burnoutState,
  });
}

async function replanWeeklyPlanForUser(
  ctx: ActionCtx,
  input: {
    userId: string;
    planId: string;
  },
) {
  ensurePlannerAgentConfigured();
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
          detail.items.map((item: { title: string; itemType: string; status: string; date: string; locked: boolean; priority: string }) => ({
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
    return { movedCount: 0, droppedCount: 0, warning: "Agent kept the current weekly structure." };
  }

  return await ctx.runMutation(internalApi["planner/mutations"].performAgentReplan, {
    userId: input.userId,
    planId: input.planId,
    reason: result.object.reason,
    preserveLockedItems: result.object.preserveLockedItems,
  });
}

function nextWeekMonday() {
  const today = new Date();
  const offset = (today.getUTCDay() + 6) % 7;
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - offset + 7);
  return monday.toISOString().slice(0, 10);
}

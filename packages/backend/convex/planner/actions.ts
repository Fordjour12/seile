"use node";

import { ConvexError, v } from "convex/values";

import type { ActionCtx } from "../_generated/server";
import { action, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { requireUserId } from "../lib/identity";
import {
  createPlannerThread,
  isPlannerAgentConfigured,
  plannerAgent,
} from "../ai/agents/planner";
import { replanningAssessmentSchema } from "../ai/plannerSchema";
import { runAIForUser } from "../ai/runRouter";
import {
  assessBurnoutForUser,
  draftWeeklyPlanForUser,
  replanWeeklyPlanForUser,
  reviewLatestPastWeeklyPlanForUser,
  reviewWeeklyPlanForUser,
} from "../ai/workflows/weeklyPlanner";

const internalApi = internal as unknown as Record<string, Record<string, any>>;

export const draftWeeklyPlan = action({
  args: {
    weekStart: v.optional(v.string()),
    mode: v.optional(
      v.union(
        v.literal("directed"),
        v.literal("discovery"),
        v.literal("zero_input"),
        v.literal("recovery"),
      ),
    ),
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

export const ensurePlannerChatThread = action({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const threadId = await ensurePlannerChatThreadForUser(ctx, userId);
    return { threadId };
  },
});

export const sendPlannerChatMessage = action({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const text = args.text.trim();
    if (!text) {
      throw new ConvexError("Planner message cannot be empty.");
    }

    const threadId = await ensurePlannerChatThreadForUser(ctx, userId);
    const result = await runAIForUser(ctx, {
      userId,
      text,
      threadId,
      source: "planner_chat",
      preferredDomains: ["planner"],
      surface: "planner_chat",
      persistToThread: true,
    });

    return {
      threadId,
      userMessageId: result.userMessageId,
      assistantMessageId: result.assistantMessageId,
      text: result.text,
    };
  },
});

export const runWeeklyReviewCycle = internalAction({
  args: {},
  handler: async (ctx) => {
    if (!isPlannerAgentConfigured()) {
      return { reviewedCount: 0 };
    }
    const states = await ctx.runQuery(internalApi["planner/queries"].listAgentEnabledStates, {});
    let reviewedCount = 0;

    for (const state of states) {
    let targetPlanId: string | undefined;
    try {
        const review = await reviewLatestPastWeeklyPlanForUser(ctx, state.userId);
        if (!review) continue;
        targetPlanId = review.planId;
        reviewedCount += 1;
      } catch (error) {
        console.error("planner-weekly-review failed", {
          userId: state.userId,
          planId: targetPlanId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { reviewedCount };
  },
});

export const runWeeklyPlanningCycle = internalAction({
  args: {},
  handler: async (ctx) => {
    if (!isPlannerAgentConfigured()) {
      return { createdCount: 0 };
    }
    const states = await ctx.runQuery(internalApi["planner/queries"].listAgentEnabledStates, {});
    let createdCount = 0;
    const nextWeekStart = nextWeekMonday();

    for (const state of states) {
      try {
        const result = await draftWeeklyPlanForUser(ctx, {
          userId: state.userId,
          weekStart: nextWeekStart,
          mode: state.burnoutState === "recovery" ? "recovery" : "discovery",
          createdBy: "agent",
        });
        if (!result.reused) {
          createdCount += 1;
        }
      } catch (error) {
        console.error("planner-weekly-plan failed", {
          userId: state.userId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { createdCount };
  },
});

export const runMidweekAdjustmentCycle = internalAction({
  args: {},
  handler: async (ctx) => {
    if (!isPlannerAgentConfigured()) {
      return { adjustedCount: 0 };
    }
    const states = await ctx.runQuery(internalApi["planner/queries"].listAgentEnabledStates, {});
    let adjustedCount = 0;

    for (const state of states) {
      try {
        const context = await ctx.runQuery(internalApi["planner/queries"].getPlannerAgentContext, {
          userId: state.userId,
        });
        if (!context.currentPlan) continue;

        const pendingTasks = context.currentPlanItems.filter(
          (item: { itemType: string; status: string }) =>
            item.itemType === "task" && item.status === "pending",
        );
        const doneTasks = context.currentPlanItems.filter(
          (item: { itemType: string; status: string }) =>
            item.itemType === "task" && item.status === "done",
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
                health: summarizeHealthForPrompt(context.health, context.profile),
                pendingTasks: pendingTasks.map(
                  (item: { title: string; date: string; priority: string }) => ({
                    title: item.title,
                    date: item.date,
                    priority: item.priority,
                  }),
                ),
                doneTaskCount: doneTasks.length,
                latestReview: context.latestReview,
              })}`,
            ].join("\n\n"),
            schema: replanningAssessmentSchema,
          },
        );

        if (result.object.shouldAdjust) {
          const replanResult = await ctx.runMutation(
            internalApi["planner/mutations"].performAgentReplan,
            {
              userId: state.userId,
              planId: context.currentPlan._id,
              reason: result.object.reason,
              preserveLockedItems: result.object.preserveLockedItems,
            },
          );
          if (replanResult.movedCount > 0 || replanResult.droppedCount > 0) {
            adjustedCount += 1;
          }
        }
      } catch (error) {
        console.error("planner-midweek-adjustment failed", {
          userId: state.userId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { adjustedCount };
  },
});

export const runBurnoutMonitoringCycle = internalAction({
  args: {},
  handler: async (ctx) => {
    if (!isPlannerAgentConfigured()) {
      return { updatedCount: 0 };
    }
    const states = await ctx.runQuery(internalApi["planner/queries"].listAgentEnabledStates, {});
    let updatedCount = 0;

    for (const state of states) {
      try {
        const result = await assessBurnoutForUser(ctx, state.userId);

        await ctx.runMutation(internalApi["planner/mutations"].updateAgentBurnoutState, {
          userId: state.userId,
          burnoutScore: result.object.burnoutScore,
          burnoutState: result.object.burnoutState,
          touchedAt: Date.now(),
        });
        updatedCount += 1;
      } catch (error) {
        console.error("planner-burnout-monitor failed", {
          userId: state.userId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { updatedCount };
  },
});

function nextWeekMonday() {
  const today = new Date();
  const offset = (today.getUTCDay() + 6) % 7;
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - offset + 7);
  return monday.toISOString().slice(0, 10);
}

async function ensurePlannerChatThreadForUser(ctx: ActionCtx, userId: string) {
  const context = await ctx.runQuery(internalApi["planner/queries"].getPlannerAgentContext, {
    userId,
  });

  if (context.agentState?.activeThreadId) {
    return context.agentState.activeThreadId;
  }

  const threadId = await createPlannerThread(ctx, {
    userId,
    title: "Planner Concierge",
    summary: "Persistent planning assistant conversation",
  });

  await ctx.runMutation(internalApi["planner/mutations"].setActivePlannerThread, {
    userId,
    activeThreadId: threadId,
  });

  return threadId;
}

function summarizeHealthForPrompt(
  health:
    | {
        signals: {
          capacityEstimate: string;
          currentEnergyLevel: string;
          recoveryRecommended: boolean;
          recoveryScore: number;
          fatigueScore: number;
          burnoutSignals: string[];
        };
      }
    | null
    | undefined,
  profile?: { restDays?: string[] } | null,
) {
  if (!health) return null;

  return {
    capacityEstimate: health.signals.capacityEstimate,
    currentEnergyLevel: health.signals.currentEnergyLevel,
    recoveryRecommended: health.signals.recoveryRecommended,
    recoveryScore: health.signals.recoveryScore,
    fatigueScore: health.signals.fatigueScore,
    upcomingRestDays: profile?.restDays ?? [],
    explicitRestrictions: health.signals.burnoutSignals,
  };
}

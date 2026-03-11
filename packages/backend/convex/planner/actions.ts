"use node";

import { ConvexError, v } from "convex/values";

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
    clientRequestId: v.string(),
  },
  handler: async (ctx, args) => {
    ensurePlannerAgentConfigured();
    const userId = await requireUserId(ctx);
    const text = args.text.trim();
    const clientRequestId = args.clientRequestId.trim();
    if (!text) {
      throw new ConvexError("Planner message cannot be empty.");
    }
    if (!clientRequestId) {
      throw new ConvexError("Planner message is missing a client request id.");
    }

    const threadId = await ensurePlannerChatThreadForUser(ctx, userId);
    const existingRequest = await ctx.runQuery(internalApi["planner/queries"].getPlannerChatRequestByClientId, {
      userId,
      clientRequestId,
    });
    if (existingRequest?.status === "success") {
      return {
        threadId: existingRequest.threadId,
        userMessageId: existingRequest.userMessageId,
        assistantMessageId: existingRequest.assistantMessageId,
        text: existingRequest.assistantText ?? "",
        clientRequestId,
      };
    }

    await ctx.runMutation(internalApi["planner/mutations"].markPlannerChatRequestPending, {
      userId,
      clientRequestId,
      threadId,
      text,
    });

    const threadState = await plannerAgent.continueThread(ctx, { threadId, userId });
    try {
      const contextBefore = await ctx.runQuery(internalApi["planner/queries"].getPlannerAgentContext, { userId });
      const intent = detectPlannerChatIntent(text);
      const actionResult = await runPlannerChatIntent(ctx, {
        userId,
        intent,
        context: contextBefore,
      });
      const contextAfter = await ctx.runQuery(internalApi["planner/queries"].getPlannerAgentContext, { userId });

      const result = await threadState.thread.generateText({
        prompt: buildPlannerChatReplyPrompt({
          userText: text,
          intent,
          actionResult,
          context: contextAfter,
        }),
      });

      const savedMessages = result.savedMessages ?? [];
      let assistantMessageId: string | undefined;
      for (let index = savedMessages.length - 1; index >= 0; index -= 1) {
        const message = savedMessages[index];
        if (message.message?.role === "assistant") {
          assistantMessageId = message._id;
          break;
        }
      }
      await ctx.runMutation(internalApi["planner/mutations"].completePlannerChatRequest, {
        userId,
        clientRequestId,
        threadId,
        text,
        userMessageId: result.promptMessageId,
        assistantMessageId,
        assistantText: result.text,
      });

      return {
        threadId,
        userMessageId: result.promptMessageId,
        assistantMessageId,
        text: result.text,
        clientRequestId,
      };
    } catch (error) {
      await ctx.runMutation(internalApi["planner/mutations"].failPlannerChatRequest, {
        userId,
        clientRequestId,
        error: error instanceof Error ? error.message : "Planner chat failed",
      });
      throw error;
    }
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

async function ensurePlannerChatThreadForUser(ctx: ActionCtx, userId: string) {
  const context = await ctx.runQuery(internalApi["planner/queries"].getPlannerAgentContext, {
    userId,
  });

  if (context.agentState?.activeThreadId) {
    return context.agentState.activeThreadId;
  }

  const { threadId } = await plannerAgent.createThread(ctx, {
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

function detectPlannerChatIntent(text: string) {
  const normalized = text.toLowerCase();
  const wantsReview =
    normalized.includes("review") &&
    (normalized.includes("last week") || normalized.includes("previous week") || normalized.includes("week"));
  const wantsReplan =
    normalized.includes("replan") ||
    normalized.includes("adjust this week") ||
    normalized.includes("lighten this week") ||
    normalized.includes("lighter week") ||
    normalized.includes("reset this week");
  const wantsPlan =
    normalized.includes("plan my week") ||
    normalized.includes("draft my week") ||
    normalized.includes("build my week") ||
    normalized.includes("create my week") ||
    (normalized.includes("plan") && normalized.includes("week"));

  if (wantsReview) {
    return { kind: "review" } as const;
  }

  if (wantsReplan) {
    return { kind: "replan" } as const;
  }

  if (wantsPlan) {
    const mode = normalized.includes("recovery") || normalized.includes("gentle") || normalized.includes("lighter")
      ? "recovery"
      : "zero_input";
    return { kind: "plan", mode } as const;
  }

  return { kind: "chat" } as const;
}

async function runPlannerChatIntent(
  ctx: ActionCtx,
  input: {
    userId: string;
    intent:
      | { kind: "chat" }
      | { kind: "plan"; mode: "zero_input" | "recovery" }
      | { kind: "replan" }
      | { kind: "review" };
    context: {
      currentPlan: { _id: string } | null;
    };
  },
) {
  if (input.intent.kind === "chat") {
    return {
      kind: "chat",
      summary:
        "No planner mutation was run. Answer conversationally from the current planner context. If the user wants to edit profile or goals, direct them to Planner Settings.",
    } as const;
  }

  if (input.intent.kind === "plan") {
    const result = await draftWeeklyPlanForUser(ctx, {
      userId: input.userId,
      mode: input.intent.mode,
      createdBy: "user",
    });

    return {
      kind: "plan",
      summary: result.reused
        ? "A weekly plan for the current week already existed, so the existing plan was kept."
        : `A ${input.intent.mode === "recovery" ? "recovery" : "balanced"} week was drafted for the user.`,
    } as const;
  }

  if (input.intent.kind === "replan") {
    if (!input.context.currentPlan?._id) {
      return {
        kind: "replan",
        summary:
          "No current weekly plan exists yet, so replanning could not run. Offer to draft a new weekly plan instead.",
      } as const;
    }

    const result = await replanWeeklyPlanForUser(ctx, {
      userId: input.userId,
      planId: input.context.currentPlan._id,
    });

    return {
      kind: "replan",
      summary:
        result.movedCount > 0 || result.droppedCount > 0
          ? `The current week was replanned. Moved ${result.movedCount} items and dropped ${result.droppedCount} items.`
          : result.warning ?? "The current weekly structure was kept unchanged.",
    } as const;
  }

  const targetPlan = await ctx.runQuery(
    internalApi["planner/queries"].getLatestPastWeeklyPlanWithoutReview,
    { userId: input.userId },
  );

  if (!targetPlan?._id) {
    return {
      kind: "review",
      summary:
        "There is no unreviewed past weekly plan available right now. Explain that no pending weekly review was found.",
    } as const;
  }

  await reviewWeeklyPlanForUser(ctx, {
    userId: input.userId,
    planId: targetPlan._id,
  });

  return {
    kind: "review",
    summary: `A review was generated for the week starting ${targetPlan.startDate}.`,
  } as const;
}

function buildPlannerChatReplyPrompt(input: {
  userText: string;
  intent:
    | { kind: "chat" }
    | { kind: "plan"; mode: "zero_input" | "recovery" }
    | { kind: "replan" }
    | { kind: "review" };
  actionResult: { kind: string; summary: string };
  context: {
    week: { startDate: string; endDate: string };
    profile: any;
    agentState: any;
    goals: Array<any>;
    openTasks: Array<any>;
    habits: Array<any>;
    currentPlan: any;
    currentPlanItems: Array<any>;
    latestReview: any;
  };
}) {
  return [
    "You are replying inside an ongoing planner chat.",
    "Be clear, grounded, and concise. Prefer 2 to 5 short paragraphs or a compact list.",
    "This chat can help with planning, replanning, and weekly reviews. For profile or goal editing, tell the user to open Planner Settings.",
    `User message: ${input.userText}`,
    `Detected intent: ${input.intent.kind}`,
    `Action summary: ${input.actionResult.summary}`,
    `Planner context: ${JSON.stringify({
      week: input.context.week,
      profile: input.context.profile
        ? {
            timezone: input.context.profile.timezone,
            maxTasksPerDay: input.context.profile.maxTasksPerDay,
            energyPattern: input.context.profile.energyPattern,
            planningStyle: input.context.profile.planningStyle,
            restDays: input.context.profile.restDays,
            deepWorkPreference: input.context.profile.deepWorkPreference,
          }
        : null,
      agentState: input.context.agentState
        ? {
            agentEnabled: input.context.agentState.agentEnabled,
            burnoutScore: input.context.agentState.burnoutScore,
            burnoutState: input.context.agentState.burnoutState,
          }
        : null,
      goals: input.context.goals.map((goal: { title: string; domain: string; horizon: string; priority: string }) => ({
        title: goal.title,
        domain: goal.domain,
        horizon: goal.horizon,
        priority: goal.priority,
      })),
      openTasks: input.context.openTasks.slice(0, 8).map((task: { title: string; priority: string; dueDate?: string }) => ({
        title: task.title,
        priority: task.priority,
        dueDate: task.dueDate,
      })),
      habits: input.context.habits.slice(0, 6).map((habit: { name: string; cadence: string; targetValue: number }) => ({
        name: habit.name,
        cadence: habit.cadence,
        targetValue: habit.targetValue,
      })),
      currentPlan: input.context.currentPlan
        ? {
            title: input.context.currentPlan.title,
            summary: input.context.currentPlan.summary,
            mode: input.context.currentPlan.mode,
            priorityTitles: input.context.currentPlan.priorityTitles,
            warnings: input.context.currentPlan.warnings,
            burnoutRiskScore: input.context.currentPlan.burnoutRiskScore,
            recoverySuggested: input.context.currentPlan.recoverySuggested,
          }
        : null,
      currentPlanItems: input.context.currentPlanItems.slice(0, 18).map((item: {
        title: string;
        date: string;
        itemType: string;
        status: string;
        priority: string;
      }) => ({
        title: item.title,
        date: item.date,
        itemType: item.itemType,
        status: item.status,
        priority: item.priority,
      })),
      latestReview: input.context.latestReview
        ? {
            completionRate: input.context.latestReview.completionRate,
            wins: input.context.latestReview.wins,
            blockers: input.context.latestReview.blockers,
            misses: input.context.latestReview.misses,
          }
        : null,
    })}`,
    "If a plan or review action was run, confirm what happened first, then give the user the most relevant next step.",
    "If no action was run, answer directly from the planner context.",
  ].join("\n\n");
}

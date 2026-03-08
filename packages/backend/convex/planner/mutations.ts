import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import { internalMutation, mutation, type MutationCtx } from "../_generated/server";
import {
  addDays,
  buildReviewSummary,
  buildWeeklyPlanDraft,
  clampMaxTasksPerDay,
  compareDateKeys,
  getDayName,
  getWeekWindow,
  isoDateFromTimestamp,
} from "../lib/planner";
import { requireUserId } from "../lib/identity";

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

const DEFAULT_AGENT_STATE = {
  agentEnabled: false,
  reviewSchedule: "sunday-18:00",
  burnoutScore: 20,
  burnoutState: "stable" as const,
};

export const upsertPlannerProfile = mutation({
  args: {
    timezone: v.string(),
    workHours: v.object({
      start: v.string(),
      end: v.string(),
    }),
    restDays: v.array(v.string()),
    energyPattern: v.union(v.literal("morning"), v.literal("midday"), v.literal("evening"), v.literal("mixed")),
    planningStyle: v.union(v.literal("structured"), v.literal("flexible"), v.literal("minimal")),
    maxTasksPerDay: v.number(),
    deepWorkPreference: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db.query("plannerProfiles").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
    const now = Date.now();
    const profilePatch = {
      timezone: args.timezone.trim() || "UTC",
      workHours: args.workHours,
      restDays: uniqueStrings(args.restDays),
      energyPattern: args.energyPattern,
      planningStyle: args.planningStyle,
      maxTasksPerDay: clampMaxTasksPerDay(args.maxTasksPerDay),
      deepWorkPreference: args.deepWorkPreference,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, profilePatch);
      return await ctx.db.get(existing._id);
    }

    const id = await ctx.db.insert("plannerProfiles", {
      userId,
      ...DEFAULT_PROFILE,
      ...profilePatch,
      createdAt: now,
    });

    return await ctx.db.get(id);
  },
});

export const setAgentEnabled = mutation({
  args: {
    agentEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const state = await ensureAgentState(ctx, userId);
    await ctx.db.patch(state._id, {
      agentEnabled: args.agentEnabled,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(state._id);
  },
});

export const createPlanningGoal = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    domain: v.string(),
    horizon: v.union(v.literal("year"), v.literal("month"), v.literal("week"), v.literal("day")),
    targetDate: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const title = args.title.trim();
    if (!title) {
      throw new ConvexError("Validation: goal title is required");
    }

    const now = Date.now();
    const id = await ctx.db.insert("planningGoals", {
      userId,
      title,
      description: optionalTrim(args.description),
      domain: args.domain.trim() || "general",
      horizon: args.horizon,
      targetDate: optionalTrim(args.targetDate),
      priority: args.priority,
      active: true,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(id);
  },
});

export const createTask = mutation({
  args: {
    title: v.string(),
    dueDate: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    linkedGoalId: v.optional(v.id("planningGoals")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (args.linkedGoalId) {
      await requireOwnedGoal(ctx, userId, args.linkedGoalId);
    }

    const title = args.title.trim();
    if (!title) {
      throw new ConvexError("Validation: task title is required");
    }

    const now = Date.now();
    const id = await ctx.db.insert("planningTasks", {
      userId,
      title,
      dueDate: optionalTrim(args.dueDate),
      priority: args.priority,
      status: "pending",
      linkedGoalId: args.linkedGoalId,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(id);
  },
});

export const createHabit = mutation({
  args: {
    name: v.string(),
    cadence: v.union(v.literal("daily"), v.literal("weekdays"), v.literal("weekly"), v.literal("custom")),
    targetValue: v.number(),
    linkedGoalId: v.optional(v.id("planningGoals")),
    scheduleDays: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (args.linkedGoalId) {
      await requireOwnedGoal(ctx, userId, args.linkedGoalId);
    }

    const name = args.name.trim();
    if (!name) {
      throw new ConvexError("Validation: habit name is required");
    }

    const now = Date.now();
    const id = await ctx.db.insert("planningHabits", {
      userId,
      name,
      cadence: args.cadence,
      targetValue: Math.max(1, Math.round(args.targetValue)),
      linkedGoalId: args.linkedGoalId,
      active: true,
      scheduleDays: args.scheduleDays ? uniqueStrings(args.scheduleDays) : undefined,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(id);
  },
});

export const createPlan = mutation({
  args: {
    type: v.union(v.literal("year"), v.literal("month"), v.literal("week"), v.literal("day")),
    title: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    mode: v.optional(v.union(v.literal("directed"), v.literal("discovery"), v.literal("zero_input"), v.literal("recovery"))),
    summary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const id = await ctx.db.insert("plans", {
      userId,
      type: args.type,
      mode: args.mode ?? "directed",
      startDate: args.startDate,
      endDate: args.endDate,
      title: args.title.trim() || `${capitalize(args.type)} plan`,
      summary: args.summary?.trim() || "User-created plan container.",
      status: "draft",
      createdBy: "user",
      warnings: [],
      priorityTitles: [],
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(id);
  },
});

export const addPlanItem = mutation({
  args: {
    planId: v.id("plans"),
    itemType: v.union(
      v.literal("priority"),
      v.literal("task"),
      v.literal("habit"),
      v.literal("buffer"),
      v.literal("review"),
      v.literal("milestone"),
    ),
    title: v.string(),
    date: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    effort: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    linkedTaskId: v.optional(v.id("planningTasks")),
    linkedHabitId: v.optional(v.id("planningHabits")),
    notes: v.optional(v.string()),
    locked: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const plan = await requireOwnedPlan(ctx, userId, args.planId);
    validateItemDateWithinPlan(plan, args.date);

    if (args.linkedTaskId) await requireOwnedTask(ctx, userId, args.linkedTaskId);
    if (args.linkedHabitId) await requireOwnedHabit(ctx, userId, args.linkedHabitId);

    const now = Date.now();
    const id = await ctx.db.insert("planItems", {
      userId,
      planId: args.planId,
      itemType: args.itemType,
      status: "pending",
      title: args.title.trim(),
      date: args.date,
      startTime: optionalTrim(args.startTime),
      endTime: optionalTrim(args.endTime),
      priority: args.priority,
      effort: args.effort ?? "medium",
      linkedTaskId: args.linkedTaskId,
      linkedHabitId: args.linkedHabitId,
      notes: optionalTrim(args.notes),
      locked: args.locked ?? false,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(id);
  },
});

export const createWeeklyPlanDraft = mutation({
  args: {
    weekStart: v.optional(v.string()),
    mode: v.optional(v.union(v.literal("directed"), v.literal("discovery"), v.literal("zero_input"), v.literal("recovery"))),
    createdBy: v.optional(v.union(v.literal("user"), v.literal("agent"), v.literal("system"))),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const result = await buildAndStoreWeeklyPlan(ctx, {
      userId,
      weekStart: args.weekStart,
      mode: args.mode ?? "zero_input",
      createdBy: args.createdBy ?? "user",
      reuseExisting: true,
    });
    return result;
  },
});

export const replanPeriod = mutation({
  args: {
    planId: v.id("plans"),
    reason: v.string(),
    preserveLockedItems: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await performReplan(ctx, {
      userId,
      planId: args.planId,
      reason: args.reason,
      preserveLockedItems: args.preserveLockedItems,
    });
  },
});

export const setPlanItemStatus = mutation({
  args: {
    itemId: v.id("planItems"),
    status: v.union(v.literal("pending"), v.literal("done"), v.literal("moved"), v.literal("dropped")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const item = await requireOwnedPlanItem(ctx, userId, args.itemId);
    await ctx.db.patch(item._id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    if (item.linkedTaskId) {
      await ctx.db.patch(item.linkedTaskId, {
        status: args.status === "done" ? "done" : args.status === "dropped" ? "dropped" : "pending",
        updatedAt: Date.now(),
      });
    }

    return await ctx.db.get(item._id);
  },
});

export const submitWeeklyReview = mutation({
  args: {
    planId: v.id("plans"),
    stressRating: v.optional(v.number()),
    satisfactionRating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await createWeeklyReviewForPlan(ctx, {
      userId,
      planId: args.planId,
      stressRating: args.stressRating,
      satisfactionRating: args.satisfactionRating,
      markAgentTimestamp: true,
    });
  },
});

export const runWeeklyReviewCycle = internalMutation({
  args: {},
  handler: async (ctx) => {
    const states = await ctx.db.query("plannerAgentState").collect();
    let reviewedCount = 0;

    for (const state of states.filter((entry) => entry.agentEnabled)) {
      const plans = await ctx.db.query("plans").withIndex("by_userId_type", (q) => q.eq("userId", state.userId).eq("type", "week")).collect();
      const latestPastPlan = plans
        .filter((plan) => compareDateKeys(plan.endDate, isoDateFromTimestamp(Date.now())) < 0)
        .sort((left, right) => right.endDate.localeCompare(left.endDate))[0];
      if (!latestPastPlan) continue;

      const existingReview = await ctx.db.query("planningReviews").withIndex("by_planId", (q) => q.eq("planId", latestPastPlan._id)).first();
      if (existingReview) continue;

      await createWeeklyReviewForPlan(ctx, {
        userId: state.userId,
        planId: latestPastPlan._id,
        markAgentTimestamp: true,
      });
      reviewedCount += 1;
    }

    return { reviewedCount };
  },
});

export const runWeeklyPlanningCycle = internalMutation({
  args: {},
  handler: async (ctx) => {
    const states = await ctx.db.query("plannerAgentState").collect();
    let createdCount = 0;
    const nextWeekStart = getWeekWindow(isoDateFromTimestamp(Date.now())).startDate;
    const targetWeekStart = getWeekWindow(addDays(nextWeekStart, 7)).startDate;

    for (const state of states.filter((entry) => entry.agentEnabled)) {
      const result = await buildAndStoreWeeklyPlan(ctx, {
        userId: state.userId,
        weekStart: targetWeekStart,
        mode: state.burnoutState === "recovery" ? "recovery" : "discovery",
        createdBy: "agent",
        reuseExisting: true,
      });
      if (!result.reused) {
        createdCount += 1;
      }
    }

    return { createdCount };
  },
});

export const runMidweekAdjustmentCycle = internalMutation({
  args: {},
  handler: async (ctx) => {
    const states = await ctx.db.query("plannerAgentState").collect();
    let adjustedCount = 0;
    const week = getWeekWindow(isoDateFromTimestamp(Date.now()));

    for (const state of states.filter((entry) => entry.agentEnabled)) {
      const currentPlan = await ctx.db
        .query("plans")
        .withIndex("by_userId_type", (q) => q.eq("userId", state.userId).eq("type", "week"))
        .collect();
      const plan = currentPlan.find((entry) => entry.startDate === week.startDate && entry.status !== "archived");
      if (!plan) continue;

      const items = await ctx.db.query("planItems").withIndex("by_planId_date", (q) => q.eq("planId", plan._id)).collect();
      const pendingTasks = items.filter((item) => item.itemType === "task" && item.status === "pending");
      if (pendingTasks.length <= 6) continue;

      const result = await replanForUser(ctx, {
        userId: state.userId,
        planId: plan._id,
        reason: "Midweek drift detected",
        preserveLockedItems: true,
      });

      if (result.movedCount > 0 || result.droppedCount > 0) {
        adjustedCount += 1;
      }
      await ctx.db.patch(state._id, {
        lastMidweekCheckAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { adjustedCount };
  },
});

export const runBurnoutMonitoringCycle = internalMutation({
  args: {},
  handler: async (ctx) => {
    const states = await ctx.db.query("plannerAgentState").collect();
    let updatedCount = 0;

    for (const state of states.filter((entry) => entry.agentEnabled)) {
      const reviews = await ctx.db.query("planningReviews").withIndex("by_userId", (q) => q.eq("userId", state.userId)).collect();
      const latestReview = reviews.sort((left, right) => right.createdAt - left.createdAt)[0] ?? null;
      const tasks = await ctx.db.query("planningTasks").withIndex("by_userId_status", (q) => q.eq("userId", state.userId).eq("status", "pending")).collect();
      const nextBurnoutScore = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            (state.burnoutScore * 0.55) +
              ((latestReview ? Math.max(0, 65 - latestReview.completionRate) : 10) * 0.45) +
              Math.max(0, tasks.length - 6) * 2,
          ),
        ),
      );
      const burnoutState =
        nextBurnoutScore >= 70 ? "recovery" : nextBurnoutScore >= 45 ? "watch" : "stable";

      await ctx.db.patch(state._id, {
        burnoutScore: nextBurnoutScore,
        burnoutState,
        lastHabitOptimizationAt: Date.now(),
        updatedAt: Date.now(),
      });
      updatedCount += 1;
    }

    return { updatedCount };
  },
});

async function buildAndStoreWeeklyPlan(
  ctx: MutationCtx,
  input: {
    userId: string;
    weekStart?: string;
    mode: Doc<"plans">["mode"];
    createdBy: Doc<"plans">["createdBy"];
    reuseExisting: boolean;
  },
) {
  const week = getWeekWindow(input.weekStart ?? isoDateFromTimestamp(Date.now()));
  const existingPlans = await ctx.db
    .query("plans")
    .withIndex("by_userId_type", (q) => q.eq("userId", input.userId).eq("type", "week"))
    .collect();
  const existing = existingPlans
    .filter((plan) => plan.startDate === week.startDate && plan.status !== "archived")
    .sort((left, right) => right.createdAt - left.createdAt)[0];

  if (existing && input.reuseExisting) {
    return { id: existing._id, reused: true };
  }

  const [profile, agentState, goals, tasks, habits, reviews] = await Promise.all([
    ensureProfile(ctx, input.userId),
    ensureAgentState(ctx, input.userId),
    ctx.db.query("planningGoals").withIndex("by_userId_active", (q) => q.eq("userId", input.userId).eq("active", true)).collect(),
    ctx.db.query("planningTasks").withIndex("by_userId_status", (q) => q.eq("userId", input.userId).eq("status", "pending")).collect(),
    ctx.db.query("planningHabits").withIndex("by_userId_active", (q) => q.eq("userId", input.userId).eq("active", true)).collect(),
    ctx.db.query("planningReviews").withIndex("by_userId", (q) => q.eq("userId", input.userId)).collect(),
  ]);
  const latestReview = reviews.sort((left, right) => right.createdAt - left.createdAt)[0] ?? null;
  const draft = buildWeeklyPlanDraft({
    weekStart: week.startDate,
    mode: input.mode,
    goals,
    tasks,
    habits,
    latestReview,
    agentState,
    profile,
  });

  const now = Date.now();
  const planId = await ctx.db.insert("plans", {
    userId: input.userId,
    type: "week",
    mode: input.mode,
    startDate: week.startDate,
    endDate: week.endDate,
    title: draft.title,
    summary: draft.summary,
    status: week.startDate === getWeekWindow(isoDateFromTimestamp(Date.now())).startDate ? "active" : "draft",
    createdBy: input.createdBy,
    warnings: draft.warnings,
    priorityTitles: draft.priorityTitles,
    burnoutRiskScore: draft.burnoutRiskScore,
    recoverySuggested: draft.recoverySuggested,
    createdAt: now,
    updatedAt: now,
  });

  for (const item of draft.items) {
    let linkedTaskId = item.linkedTaskId;
    let linkedHabitId = item.linkedHabitId;

    if (!linkedTaskId && item.draftTask) {
      linkedTaskId = await ctx.db.insert("planningTasks", {
        userId: input.userId,
        title: item.draftTask.title,
        dueDate: item.draftTask.dueDate,
        priority: item.draftTask.priority,
        status: "pending",
        linkedGoalId: item.draftTask.linkedGoalId,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (!linkedHabitId && item.draftHabit) {
      linkedHabitId = await ctx.db.insert("planningHabits", {
        userId: input.userId,
        name: item.draftHabit.name,
        cadence: item.draftHabit.cadence,
        targetValue: item.draftHabit.targetValue,
        linkedGoalId: item.draftHabit.linkedGoalId,
        active: true,
        scheduleDays: item.draftHabit.scheduleDays,
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.insert("planItems", {
      userId: input.userId,
      planId,
      itemType: item.itemType,
      status: "pending",
      title: item.title,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      priority: item.priority,
      effort: item.effort,
      linkedTaskId,
      linkedHabitId,
      notes: item.notes,
      locked: item.locked ?? false,
      createdAt: now,
      updatedAt: now,
    });
  }

  await ctx.db.patch(agentState._id, {
    burnoutScore: draft.burnoutRiskScore,
    burnoutState: draft.recoverySuggested ? "recovery" : draft.burnoutRiskScore >= 45 ? "watch" : "stable",
    lastWeeklyPlanAt: now,
    updatedAt: now,
  });

  return { id: planId, reused: false };
}

async function createWeeklyReviewForPlan(
  ctx: MutationCtx,
  input: {
    userId: string;
    planId: Id<"plans">;
    stressRating?: number;
    satisfactionRating?: number;
    markAgentTimestamp: boolean;
  },
) {
  const plan = await requireOwnedPlan(ctx, input.userId, input.planId);
  const items = await ctx.db.query("planItems").withIndex("by_planId_date", (q) => q.eq("planId", plan._id)).collect();
  const summary = buildReviewSummary(plan, items, input.stressRating, input.satisfactionRating);
  const existing = await ctx.db.query("planningReviews").withIndex("by_planId", (q) => q.eq("planId", plan._id)).first();
  const now = Date.now();

  let reviewId = existing?._id;
  if (existing) {
    await ctx.db.patch(existing._id, {
      ...summary,
      stressRating: input.stressRating,
      satisfactionRating: input.satisfactionRating,
      updatedAt: now,
    });
  } else {
    reviewId = await ctx.db.insert("planningReviews", {
      userId: input.userId,
      planId: plan._id,
      ...summary,
      stressRating: input.stressRating,
      satisfactionRating: input.satisfactionRating,
      createdAt: now,
      updatedAt: now,
    });
  }

  const nextBurnoutScore = Math.max(
    0,
    Math.min(100, Math.round((100 - summary.completionRate) * 0.55 + (input.stressRating ?? 3) * 8)),
  );
  const burnoutState =
    nextBurnoutScore >= 70 ? "recovery" : nextBurnoutScore >= 45 ? "watch" : "stable";
  const agentState = await ensureAgentState(ctx, input.userId);
  await ctx.db.patch(agentState._id, {
    burnoutScore: nextBurnoutScore,
    burnoutState,
    lastWeeklyReviewAt: input.markAgentTimestamp ? now : agentState.lastWeeklyReviewAt,
    updatedAt: now,
  });
  await ctx.db.patch(plan._id, {
    status: "completed",
    updatedAt: now,
  });

  return await ctx.db.get(reviewId!);
}

async function ensureProfile(ctx: MutationCtx, userId: string) {
  const existing = await ctx.db.query("plannerProfiles").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
  if (existing) return existing;
  const now = Date.now();
  const id = await ctx.db.insert("plannerProfiles", {
    userId,
    ...DEFAULT_PROFILE,
    createdAt: now,
    updatedAt: now,
  });
  return (await ctx.db.get(id))!;
}

async function ensureAgentState(ctx: MutationCtx, userId: string) {
  const existing = await ctx.db.query("plannerAgentState").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
  if (existing) return existing;
  const now = Date.now();
  const id = await ctx.db.insert("plannerAgentState", {
    userId,
    ...DEFAULT_AGENT_STATE,
    createdAt: now,
    updatedAt: now,
  });
  return (await ctx.db.get(id))!;
}

async function replanForUser(
  ctx: MutationCtx,
  input: {
    userId: string;
    planId: Id<"plans">;
    reason: string;
    preserveLockedItems: boolean;
  },
) {
  return await performReplan(ctx, input);
}

async function requireOwnedPlan(ctx: MutationCtx, userId: string, planId: Id<"plans">) {
  const plan = await ctx.db.get(planId);
  if (!plan || plan.userId !== userId) {
    throw new ConvexError("Plan not found");
  }
  return plan;
}

async function requireOwnedPlanItem(ctx: MutationCtx, userId: string, itemId: Id<"planItems">) {
  const item = await ctx.db.get(itemId);
  if (!item || item.userId !== userId) {
    throw new ConvexError("Plan item not found");
  }
  return item;
}

async function requireOwnedGoal(ctx: MutationCtx, userId: string, goalId: Id<"planningGoals">) {
  const goal = await ctx.db.get(goalId);
  if (!goal || goal.userId !== userId) {
    throw new ConvexError("Goal not found");
  }
  return goal;
}

async function requireOwnedTask(ctx: MutationCtx, userId: string, taskId: Id<"planningTasks">) {
  const task = await ctx.db.get(taskId);
  if (!task || task.userId !== userId) {
    throw new ConvexError("Task not found");
  }
  return task;
}

async function requireOwnedHabit(ctx: MutationCtx, userId: string, habitId: Id<"planningHabits">) {
  const habit = await ctx.db.get(habitId);
  if (!habit || habit.userId !== userId) {
    throw new ConvexError("Habit not found");
  }
  return habit;
}

function validateItemDateWithinPlan(plan: Doc<"plans">, date: string) {
  if (compareDateKeys(date, plan.startDate) < 0 || compareDateKeys(date, plan.endDate) > 0) {
    throw new ConvexError("Validation: plan item date must be inside the plan window");
  }
}

function optionalTrim(value: string | undefined) {
  const nextValue = value?.trim();
  return nextValue ? nextValue : undefined;
}

function appendUnique(items: string[], nextItems: string[]) {
  return Array.from(new Set([...items, ...nextItems]));
}

function mergeNotes(current: string | undefined, next: string) {
  return current ? `${current} ${next}` : next;
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean)));
}

function maxDate(left: string, right: string) {
  return compareDateKeys(left, right) >= 0 ? left : right;
}

function getDateRange(startDate: string, endDate: string) {
  const dates: string[] = [];
  let current = startDate;
  while (compareDateKeys(current, endDate) <= 0) {
    dates.push(current);
    current = addDays(current, 1);
  }
  return dates;
}

function taskPriorityScore(priority: "low" | "medium" | "high") {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

function capitalize(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

async function performReplan(
  ctx: MutationCtx,
  input: {
    userId: string;
    planId: Id<"plans">;
    reason: string;
    preserveLockedItems: boolean;
  },
) {
  const plan = await requireOwnedPlan(ctx, input.userId, input.planId);
  const profile = await ensureProfile(ctx, input.userId);
  const items = await ctx.db.query("planItems").withIndex("by_planId_date", (q) => q.eq("planId", plan._id)).collect();
  const today = isoDateFromTimestamp(Date.now());
  const relevantDates = getDateRange(maxDate(today, plan.startDate), plan.endDate).filter(
    (date) => !profile.restDays.includes(getDayName(date)),
  );

  if (relevantDates.length === 0) {
    return { movedCount: 0, droppedCount: 0, warning: "No remaining dates available for replanning." };
  }

  const taskCapacityPerDay = Math.max(1, Math.min(3, clampMaxTasksPerDay(profile.maxTasksPerDay) - 2));
  const currentTaskCounts = new Map<string, number>();
  for (const item of items) {
    if (item.itemType !== "task") continue;
    if (item.status === "done") {
      currentTaskCounts.set(item.date, (currentTaskCounts.get(item.date) ?? 0) + 1);
    }
  }

  const movableItems = items
    .filter((item) => item.itemType === "task" && item.status === "pending" && compareDateKeys(item.date, today) >= 0)
    .sort((left, right) => taskPriorityScore(right.priority) - taskPriorityScore(left.priority));
  let movedCount = 0;
  let droppedCount = 0;

  for (const item of movableItems) {
    if (input.preserveLockedItems && item.locked) {
      currentTaskCounts.set(item.date, (currentTaskCounts.get(item.date) ?? 0) + 1);
      continue;
    }

    const nextDate = relevantDates.find((date) => (currentTaskCounts.get(date) ?? 0) < taskCapacityPerDay);
    if (!nextDate) {
      await ctx.db.patch(item._id, {
        status: "dropped",
        notes: mergeNotes(item.notes, `Dropped during replanning: ${input.reason}`),
        updatedAt: Date.now(),
      });
      droppedCount += 1;
      if (item.linkedTaskId) {
        await ctx.db.patch(item.linkedTaskId, {
          status: "dropped",
          updatedAt: Date.now(),
        });
      }
      continue;
    }

    currentTaskCounts.set(nextDate, (currentTaskCounts.get(nextDate) ?? 0) + 1);
    if (nextDate !== item.date) {
      movedCount += 1;
    }
    await ctx.db.patch(item._id, {
      date: nextDate,
      status: nextDate === item.date ? "pending" : "moved",
      notes: nextDate === item.date ? item.notes : mergeNotes(item.notes, `Moved during replanning: ${input.reason}`),
      updatedAt: Date.now(),
    });
  }

  const nextWarnings = appendUnique(plan.warnings, [
    `Replanned on ${today}: moved ${movedCount}, dropped ${droppedCount}.`,
  ]);
  await ctx.db.patch(plan._id, {
    warnings: nextWarnings,
    updatedAt: Date.now(),
  });

  return {
    movedCount,
    droppedCount,
    warning: nextWarnings[nextWarnings.length - 1],
  };
}

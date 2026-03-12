import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import { mutation, type MutationCtx } from "../_generated/server";
import { compareDateKeys, isoDateFromTimestamp } from "../lib/planner";
import { requireUserId } from "../lib/identity";
import { planningCadenceValidator } from "../schema/planner";
import { prayerStatusValidator, spiritualGoalStatusValidator } from "../schema/spiritual";

export const createSpiritualGoal = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    goalType: v.string(),
    targetValue: v.optional(v.number()),
    unit: v.optional(v.string()),
    deadline: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const title = requiredTrimmed(args.title, "Validation: goal title is required");
    const goalType = requiredTrimmed(args.goalType, "Validation: goal type is required");
    const deadline = optionalTrim(args.deadline);
    const now = Date.now();
    const plannerGoalId = await ctx.db.insert("planningGoals", {
      userId,
      title,
      description: optionalTrim(args.description),
      domain: "spiritual",
      horizon: inferGoalHorizon(deadline),
      targetDate: deadline,
      priority: "medium",
      active: true,
      createdAt: now,
      updatedAt: now,
    });

    const id = await ctx.db.insert("spiritualGoals", {
      userId,
      title,
      description: optionalTrim(args.description),
      goalType,
      targetValue: normalizeOptionalPositive(args.targetValue),
      unit: optionalTrim(args.unit),
      deadline,
      progress: 0,
      status: "active",
      plannerGoalId,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get("spiritualGoals", id);
  },
});

export const updateSpiritualGoalProgress = mutation({
  args: {
    id: v.id("spiritualGoals"),
    progress: v.number(),
    status: v.optional(spiritualGoalStatusValidator),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const goal = await requireOwnedSpiritualGoal(ctx, userId, args.id);
    const progress = clampProgress(args.progress);
    const nextStatus =
      args.status ?? (progress >= 100 ? "completed" : goal.status === "archived" ? "archived" : "active");

    await ctx.db.patch(goal._id, {
      progress,
      status: nextStatus,
      updatedAt: Date.now(),
    });

    if (goal.plannerGoalId) {
      const plannerGoal = await ctx.db.get("planningGoals", goal.plannerGoalId);
      if (plannerGoal && plannerGoal.userId === userId) {
        await ctx.db.patch(goal.plannerGoalId, {
          active: nextStatus === "active",
          targetDate: goal.deadline,
          updatedAt: Date.now(),
        });
      }
    }

    return await ctx.db.get("spiritualGoals", goal._id);
  },
});

export const createSpiritualPractice = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    practiceType: v.string(),
    cadence: planningCadenceValidator,
    targetValue: v.number(),
    unit: v.string(),
    timeOfDay: v.optional(v.string()),
    scheduleDays: v.optional(v.array(v.string())),
    syncToPlanner: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const title = requiredTrimmed(args.title, "Validation: practice title is required");
    const practiceType = requiredTrimmed(args.practiceType, "Validation: practice type is required");
    const unit = requiredTrimmed(args.unit, "Validation: unit is required");
    const targetValue = normalizeTargetValue(args.targetValue);
    const scheduleDays = args.scheduleDays ? uniqueStrings(args.scheduleDays) : undefined;
    const now = Date.now();

    const plannerHabitId =
      args.syncToPlanner === false
        ? undefined
        : await ctx.db.insert("planningHabits", {
            userId,
            name: title,
            cadence: args.cadence,
            targetValue,
            linkedGoalId: undefined,
            active: true,
            scheduleDays,
            createdAt: now,
            updatedAt: now,
          });

    const id = await ctx.db.insert("spiritualPractices", {
      userId,
      title,
      description: optionalTrim(args.description),
      practiceType,
      cadence: args.cadence,
      targetValue,
      unit,
      timeOfDay: optionalTrim(args.timeOfDay),
      scheduleDays,
      active: true,
      plannerHabitId,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get("spiritualPractices", id);
  },
});

export const toggleSpiritualPracticeActive = mutation({
  args: {
    id: v.id("spiritualPractices"),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const practice = await requireOwnedSpiritualPractice(ctx, userId, args.id);
    await ctx.db.patch(practice._id, {
      active: args.active,
      updatedAt: Date.now(),
    });

    if (practice.plannerHabitId) {
      const plannerHabit = await ctx.db.get("planningHabits", practice.plannerHabitId);
      if (plannerHabit && plannerHabit.userId === userId) {
        await ctx.db.patch(practice.plannerHabitId, {
          active: args.active,
          updatedAt: Date.now(),
        });
      }
    }

    return await ctx.db.get("spiritualPractices", practice._id);
  },
});

export const createPrayer = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const title = requiredTrimmed(args.title, "Validation: prayer title is required");
    const now = Date.now();
    const id = await ctx.db.insert("prayers", {
      userId,
      title,
      description: optionalTrim(args.description),
      category: optionalTrim(args.category),
      status: "active",
      answeredAt: undefined,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get("prayers", id);
  },
});

export const updatePrayerStatus = mutation({
  args: {
    id: v.id("prayers"),
    status: prayerStatusValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const prayer = await requireOwnedPrayer(ctx, userId, args.id);
    await ctx.db.patch(prayer._id, {
      status: args.status,
      answeredAt: args.status === "answered" ? Date.now() : undefined,
      updatedAt: Date.now(),
    });
    return await ctx.db.get("prayers", prayer._id);
  },
});

export const createSpiritualReading = mutation({
  args: {
    title: v.string(),
    source: v.optional(v.string()),
    passage: v.optional(v.string()),
    date: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const title = requiredTrimmed(args.title, "Validation: reading title is required");
    const date = requiredTrimmed(args.date, "Validation: reading date is required");
    const id = await ctx.db.insert("spiritualReadings", {
      userId,
      title,
      source: optionalTrim(args.source),
      passage: optionalTrim(args.passage),
      date,
      notes: optionalTrim(args.notes),
      createdAt: Date.now(),
    });
    return await ctx.db.get("spiritualReadings", id);
  },
});

export const createSpiritualReflection = mutation({
  args: {
    date: v.string(),
    reflectionType: v.string(),
    content: v.string(),
    mood: v.optional(v.string()),
    insights: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const date = requiredTrimmed(args.date, "Validation: reflection date is required");
    const reflectionType = requiredTrimmed(args.reflectionType, "Validation: reflection type is required");
    const content = requiredTrimmed(args.content, "Validation: reflection content is required");
    const now = Date.now();
    const id = await ctx.db.insert("spiritualReflections", {
      userId,
      date,
      reflectionType,
      content,
      mood: optionalTrim(args.mood),
      insights: optionalTrim(args.insights),
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get("spiritualReflections", id);
  },
});

async function requireOwnedSpiritualGoal(
  ctx: MutationCtx,
  userId: string,
  id: Id<"spiritualGoals">,
): Promise<Doc<"spiritualGoals">> {
  const row = await ctx.db.get("spiritualGoals", id);
  if (!row || row.userId !== userId) {
    throw new ConvexError("Spiritual goal not found");
  }
  return row;
}

async function requireOwnedSpiritualPractice(
  ctx: MutationCtx,
  userId: string,
  id: Id<"spiritualPractices">,
): Promise<Doc<"spiritualPractices">> {
  const row = await ctx.db.get("spiritualPractices", id);
  if (!row || row.userId !== userId) {
    throw new ConvexError("Spiritual practice not found");
  }
  return row;
}

async function requireOwnedPrayer(ctx: MutationCtx, userId: string, id: Id<"prayers">): Promise<Doc<"prayers">> {
  const row = await ctx.db.get("prayers", id);
  if (!row || row.userId !== userId) {
    throw new ConvexError("Prayer not found");
  }
  return row;
}

function requiredTrimmed(value: string, message: string) {
  const nextValue = value.trim();
  if (!nextValue) {
    throw new ConvexError(message);
  }
  return nextValue;
}

function optionalTrim(value: string | undefined) {
  const nextValue = value?.trim();
  return nextValue ? nextValue : undefined;
}

function normalizeTargetValue(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new ConvexError("Validation: target value must be greater than zero");
  }
  if (value < 0.5) {
    throw new ConvexError("Validation: target value must be at least 0.5");
  }
  return Math.max(1, Math.round(value));
}

function normalizeOptionalPositive(value: number | undefined) {
  if (value === undefined) {
    return undefined;
  }
  if (!Number.isFinite(value) || value <= 0) {
    throw new ConvexError("Validation: target value must be greater than zero");
  }
  return value;
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean)));
}

function clampProgress(value: number) {
  if (!Number.isFinite(value)) {
    throw new ConvexError("Validation: progress must be a number");
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function inferGoalHorizon(deadline: string | undefined): Doc<"planningGoals">["horizon"] {
  if (!deadline) {
    return "month";
  }

  const today = isoDateFromTimestamp(Date.now());
  if (compareDateKeys(deadline, today) <= 0) {
    return "day";
  }

  const dayDelta = Math.ceil((Date.parse(`${deadline}T00:00:00.000Z`) - Date.parse(`${today}T00:00:00.000Z`)) / 86400000);
  if (dayDelta <= 7) return "week";
  if (dayDelta <= 31) return "month";
  return "year";
}

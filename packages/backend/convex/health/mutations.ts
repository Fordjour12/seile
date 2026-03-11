import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import { mutation, type MutationCtx } from "../_generated/server";
import { requireUserId } from "../lib/identity";
import {
  healthCadenceValidator,
  healthDifficultyValidator,
  healthGoalTypeValidator,
  healthIntensityValidator,
  healthSignalLevelValidator,
  healthWorkoutTypeValidator,
} from "../schema";

const VALID_WEEKDAYS = new Set([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export const createWorkout = mutation({
  args: {
    type: healthWorkoutTypeValidator,
    durationMinutes: v.number(),
    intensity: healthIntensityValidator,
    date: v.string(),
    linkedPlanId: v.optional(v.id("planItems")),
    caloriesBurned: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Doc<"workouts">> => {
    const userId = await requireUserId(ctx);
    if (args.linkedPlanId) {
      await requireOwnedPlanItem(ctx, userId, args.linkedPlanId);
    }

    const now = Date.now();
    const id = await ctx.db.insert("workouts", {
      userId,
      workoutType: args.type,
      durationMinutes: normalizePositiveInt(args.durationMinutes, "durationMinutes", 360),
      intensity: args.intensity,
      caloriesBurned: normalizeOptionalNumber(args.caloriesBurned, 0, 5000),
      date: normalizeDateKey(args.date),
      linkedPlanItemId: args.linkedPlanId,
      notes: optionalTrim(args.notes),
      createdAt: now,
    });

    const created = await ctx.db.get(id);
    if (!created) {
      throw new ConvexError("Failed to create workout");
    }

    return created;
  },
});

export const createHealthHabit = mutation({
  args: {
    name: v.string(),
    cadence: healthCadenceValidator,
    targetValue: v.number(),
    unit: v.string(),
    difficulty: healthDifficultyValidator,
    scheduleDays: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args): Promise<Doc<"healthHabits">> => {
    const userId = await requireUserId(ctx);
    const name = normalizeRequiredString(args.name, "name");
    const unit = normalizeRequiredString(args.unit, "unit");
    const scheduleDays = normalizeScheduleDays(args.scheduleDays);
    const now = Date.now();
    const id = await ctx.db.insert("healthHabits", {
      userId,
      name,
      cadence: args.cadence,
      targetValue: normalizePositiveInt(args.targetValue, "targetValue", 10000),
      unit,
      difficulty: args.difficulty,
      active: true,
      scheduleDays,
      createdAt: now,
      updatedAt: now,
    });

    const created = await ctx.db.get(id);
    if (!created) {
      throw new ConvexError("Failed to create health habit");
    }

    return created;
  },
});

export const createHealthGoal = mutation({
  args: {
    title: v.string(),
    goalType: healthGoalTypeValidator,
    targetValue: v.number(),
    unit: v.string(),
    deadline: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Doc<"healthGoals">> => {
    const userId = await requireUserId(ctx);
    const title = normalizeRequiredString(args.title, "title");
    const unit = normalizeRequiredString(args.unit, "unit");
    const now = Date.now();
    const id = await ctx.db.insert("healthGoals", {
      userId,
      title,
      goalType: args.goalType,
      targetValue: normalizePositiveNumber(args.targetValue, "targetValue", 100000),
      unit,
      deadline: args.deadline ? normalizeDateKey(args.deadline) : undefined,
      progress: 0,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    const created = await ctx.db.get(id);
    if (!created) {
      throw new ConvexError("Failed to create health goal");
    }

    return created;
  },
});

export const logHealthMetrics = mutation({
  args: {
    date: v.string(),
    sleepHours: v.optional(v.number()),
    steps: v.optional(v.number()),
    weight: v.optional(v.number()),
    restingHeartRate: v.optional(v.number()),
    energyLevel: v.optional(healthSignalLevelValidator),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Doc<"healthMetrics">> => {
    const userId = await requireUserId(ctx);
    const date = normalizeDateKey(args.date);
    const existing = await ctx.db
      .query("healthMetrics")
      .withIndex("by_userId_and_date", (q) => q.eq("userId", userId).eq("date", date))
      .first();

    const patch = {
      date,
      sleepHours: normalizeOptionalNumber(args.sleepHours, 0, 24),
      steps: normalizeOptionalNumber(args.steps, 0, 200000),
      weight: normalizeOptionalNumber(args.weight, 0, 1000),
      restingHeartRate: normalizeOptionalNumber(args.restingHeartRate, 20, 240),
      energyLevel: args.energyLevel,
      notes: optionalTrim(args.notes),
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      const updated = await ctx.db.get(existing._id);
      if (!updated) throw new ConvexError("Health metrics not found");
      return updated;
    }

    const id = await ctx.db.insert("healthMetrics", {
      userId,
      ...patch,
      createdAt: Date.now(),
    });
    const created = await ctx.db.get(id);
    if (!created) {
      throw new ConvexError("Failed to log health metrics");
    }
    return created;
  },
});

export const logEnergy = mutation({
  args: {
    energyLevel: healthSignalLevelValidator,
    stressLevel: healthSignalLevelValidator,
    fatigueLevel: healthSignalLevelValidator,
    notes: v.optional(v.string()),
    timestamp: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Doc<"energyLogs">> => {
    const userId = await requireUserId(ctx);
    const timestamp = args.timestamp ?? Date.now();
    const id = await ctx.db.insert("energyLogs", {
      userId,
      timestamp,
      energyLevel: args.energyLevel,
      stressLevel: args.stressLevel,
      fatigueLevel: args.fatigueLevel,
      notes: optionalTrim(args.notes),
      createdAt: Date.now(),
    });

    const created = await ctx.db.get(id);
    if (!created) {
      throw new ConvexError("Failed to log energy");
    }

    return created;
  },
});

async function requireOwnedPlanItem(ctx: MutationCtx, userId: string, id: Id<"planItems">) {
  const item = await ctx.db.get(id);
  if (!item || item.userId !== userId) {
    throw new ConvexError("Plan item not found");
  }
  return item;
}

function normalizeRequiredString(value: string, fieldName: string) {
  const normalized = value.trim();
  if (!normalized) {
    throw new ConvexError(`Validation: ${fieldName} is required`);
  }
  return normalized;
}

function normalizeDateKey(value: string) {
  const normalized = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new ConvexError("Validation: date must use YYYY-MM-DD");
  }

  const [year, month, day] = normalized.split("-").map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    throw new ConvexError("Validation: date must use YYYY-MM-DD");
  }

  return normalized;
}

function normalizePositiveInt(value: number, fieldName: string, max: number) {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 1 || value > max) {
    throw new ConvexError(`Validation: ${fieldName} must be an integer between 1 and ${max}`);
  }
  return value;
}

function normalizePositiveNumber(value: number, fieldName: string, max: number) {
  if (!Number.isFinite(value) || value <= 0 || value > max) {
    throw new ConvexError(`Validation: ${fieldName} must be greater than zero and at most ${max}`);
  }
  return value;
}

function normalizeOptionalNumber(value: number | undefined, min: number, max: number) {
  if (value === undefined) return undefined;
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new ConvexError(`Validation: numeric input must be between ${min} and ${max}`);
  }
  return value;
}

function normalizeScheduleDays(values: string[] | undefined) {
  if (!values) return undefined;

  const normalized = values.map((value) => value.trim().toLowerCase()).filter(Boolean);
  const invalid = normalized.filter((value) => !VALID_WEEKDAYS.has(value));
  if (invalid.length > 0) {
    throw new ConvexError(`Validation: invalid scheduleDays values: ${invalid.join(", ")}`);
  }

  return Array.from(new Set(normalized));
}

function optionalTrim(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

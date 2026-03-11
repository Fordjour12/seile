import { defineTable } from "convex/server";
import { v } from "convex/values";

export const healthWorkoutTypeValidator = v.union(
  v.literal("strength"),
  v.literal("running"),
  v.literal("walking"),
  v.literal("cycling"),
  v.literal("yoga"),
  v.literal("stretching"),
  v.literal("sports"),
  v.literal("recovery"),
  v.literal("other"),
);

export const healthIntensityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);

export const healthCadenceValidator = v.union(
  v.literal("daily"),
  v.literal("weekdays"),
  v.literal("weekly"),
  v.literal("custom"),
);

export const healthDifficultyValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);

export const healthGoalTypeValidator = v.union(
  v.literal("exercise_frequency"),
  v.literal("distance"),
  v.literal("weight"),
  v.literal("sleep"),
  v.literal("steps"),
  v.literal("recovery"),
  v.literal("custom"),
);

export const healthGoalStatusValidator = v.union(
  v.literal("active"),
  v.literal("completed"),
  v.literal("paused"),
  v.literal("archived"),
);

export const healthSignalLevelValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);

export const workoutsTable = defineTable({
  userId: v.string(),
  workoutType: healthWorkoutTypeValidator,
  durationMinutes: v.number(),
  intensity: healthIntensityValidator,
  caloriesBurned: v.optional(v.number()),
  date: v.string(),
  linkedPlanItemId: v.optional(v.id("planItems")),
  notes: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_and_date", ["userId", "date"])
  .index("by_userId_and_workoutType", ["userId", "workoutType"])
  .index("by_userId_and_linkedPlanItemId", ["userId", "linkedPlanItemId"]);

export const healthHabitsTable = defineTable({
  userId: v.string(),
  name: v.string(),
  cadence: healthCadenceValidator,
  targetValue: v.number(),
  unit: v.string(),
  difficulty: healthDifficultyValidator,
  active: v.boolean(),
  scheduleDays: v.optional(v.array(v.string())),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_and_active", ["userId", "active"]);

export const healthGoalsTable = defineTable({
  userId: v.string(),
  title: v.string(),
  goalType: healthGoalTypeValidator,
  targetValue: v.number(),
  unit: v.string(),
  deadline: v.optional(v.string()),
  progress: v.number(),
  status: healthGoalStatusValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_and_status", ["userId", "status"])
  .index("by_userId_and_deadline", ["userId", "deadline"]);

export const healthMetricsTable = defineTable({
  userId: v.string(),
  date: v.string(),
  sleepHours: v.optional(v.number()),
  steps: v.optional(v.number()),
  weight: v.optional(v.number()),
  restingHeartRate: v.optional(v.number()),
  energyLevel: v.optional(healthSignalLevelValidator),
  notes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_and_date", ["userId", "date"]);

export const energyLogsTable = defineTable({
  userId: v.string(),
  timestamp: v.number(),
  energyLevel: healthSignalLevelValidator,
  stressLevel: healthSignalLevelValidator,
  fatigueLevel: healthSignalLevelValidator,
  notes: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_and_timestamp", ["userId", "timestamp"]);

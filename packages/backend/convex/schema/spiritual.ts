import { defineTable } from "convex/server";
import { v } from "convex/values";

import { planningCadenceValidator } from "./planner";

export const spiritualGoalStatusValidator = v.union(
  v.literal("active"),
  v.literal("completed"),
  v.literal("archived"),
);

export const prayerStatusValidator = v.union(
  v.literal("active"),
  v.literal("answered"),
  v.literal("archived"),
);

export const spiritualGoalsTable = defineTable({
  userId: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  goalType: v.string(),
  targetValue: v.optional(v.number()),
  unit: v.optional(v.string()),
  deadline: v.optional(v.string()),
  progress: v.number(),
  status: spiritualGoalStatusValidator,
  plannerGoalId: v.optional(v.id("planningGoals")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_status", ["userId", "status"])
  .index("by_userId_deadline", ["userId", "deadline"]);

export const spiritualPracticesTable = defineTable({
  userId: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  practiceType: v.string(),
  cadence: planningCadenceValidator,
  targetValue: v.number(),
  unit: v.string(),
  timeOfDay: v.optional(v.string()),
  scheduleDays: v.optional(v.array(v.string())),
  active: v.boolean(),
  plannerHabitId: v.optional(v.id("planningHabits")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_active", ["userId", "active"])
  .index("by_userId_type", ["userId", "practiceType"]);

export const spiritualReadingsTable = defineTable({
  userId: v.string(),
  title: v.string(),
  source: v.optional(v.string()),
  passage: v.optional(v.string()),
  date: v.string(),
  notes: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_date", ["userId", "date"]);

export const prayersTable = defineTable({
  userId: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  category: v.optional(v.string()),
  status: prayerStatusValidator,
  answeredAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_status", ["userId", "status"]);

export const spiritualReflectionsTable = defineTable({
  userId: v.string(),
  date: v.string(),
  reflectionType: v.string(),
  content: v.string(),
  mood: v.optional(v.string()),
  insights: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId_date", ["userId", "date"])
  .index("by_userId_reflectionType", ["userId", "reflectionType"]);

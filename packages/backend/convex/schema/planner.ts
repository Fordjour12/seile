import { defineTable } from "convex/server";
import { v } from "convex/values";

export const planningPriorityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);

export const planningEffortValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);

export const planningModeValidator = v.union(
  v.literal("directed"),
  v.literal("discovery"),
  v.literal("zero_input"),
  v.literal("recovery"),
);

export const planningHorizonValidator = v.union(
  v.literal("year"),
  v.literal("month"),
  v.literal("week"),
  v.literal("day"),
);

export const planStatusValidator = v.union(
  v.literal("draft"),
  v.literal("active"),
  v.literal("completed"),
  v.literal("archived"),
);

export const planItemTypeValidator = v.union(
  v.literal("priority"),
  v.literal("task"),
  v.literal("habit"),
  v.literal("buffer"),
  v.literal("review"),
  v.literal("milestone"),
);

export const planItemStatusValidator = v.union(
  v.literal("pending"),
  v.literal("done"),
  v.literal("moved"),
  v.literal("dropped"),
);

export const planningTaskStatusValidator = v.union(
  v.literal("pending"),
  v.literal("done"),
  v.literal("dropped"),
);

export const planningCadenceValidator = v.union(
  v.literal("daily"),
  v.literal("weekdays"),
  v.literal("weekly"),
  v.literal("custom"),
);

export const planningStyleValidator = v.union(
  v.literal("structured"),
  v.literal("flexible"),
  v.literal("minimal"),
);

export const planningEnergyPatternValidator = v.union(
  v.literal("morning"),
  v.literal("midday"),
  v.literal("evening"),
  v.literal("mixed"),
);

export const burnoutStateValidator = v.union(
  v.literal("stable"),
  v.literal("watch"),
  v.literal("recovery"),
);

export const plannerProfilesTable = defineTable({
  userId: v.string(),
  timezone: v.string(),
  workHours: v.object({
    start: v.string(),
    end: v.string(),
  }),
  restDays: v.array(v.string()),
  energyPattern: planningEnergyPatternValidator,
  planningStyle: planningStyleValidator,
  maxTasksPerDay: v.number(),
  deepWorkPreference: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_userId", ["userId"]);

export const planningGoalsTable = defineTable({
  userId: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  domain: v.string(),
  horizon: planningHorizonValidator,
  targetDate: v.optional(v.string()),
  priority: planningPriorityValidator,
  active: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_active", ["userId", "active"])
  .index("by_userId_horizon", ["userId", "horizon"]);

export const planningTasksTable = defineTable({
  userId: v.string(),
  title: v.string(),
  dueDate: v.optional(v.string()),
  priority: planningPriorityValidator,
  status: planningTaskStatusValidator,
  linkedGoalId: v.optional(v.id("planningGoals")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_status", ["userId", "status"])
  .index("by_userId_dueDate", ["userId", "dueDate"]);

export const planningHabitsTable = defineTable({
  userId: v.string(),
  name: v.string(),
  cadence: planningCadenceValidator,
  targetValue: v.number(),
  linkedGoalId: v.optional(v.id("planningGoals")),
  active: v.boolean(),
  scheduleDays: v.optional(v.array(v.string())),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_active", ["userId", "active"]);

export const plansTable = defineTable({
  userId: v.string(),
  type: planningHorizonValidator,
  mode: planningModeValidator,
  startDate: v.string(),
  endDate: v.string(),
  title: v.string(),
  summary: v.string(),
  status: planStatusValidator,
  createdBy: v.union(v.literal("user"), v.literal("agent"), v.literal("system")),
  warnings: v.array(v.string()),
  priorityTitles: v.array(v.string()),
  burnoutRiskScore: v.optional(v.number()),
  recoverySuggested: v.optional(v.boolean()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_type", ["userId", "type"])
  .index("by_userId_startDate", ["userId", "startDate"]);

export const planItemsTable = defineTable({
  userId: v.string(),
  planId: v.id("plans"),
  itemType: planItemTypeValidator,
  status: planItemStatusValidator,
  title: v.string(),
  date: v.string(),
  startTime: v.optional(v.string()),
  endTime: v.optional(v.string()),
  priority: planningPriorityValidator,
  effort: planningEffortValidator,
  linkedTaskId: v.optional(v.id("planningTasks")),
  linkedHabitId: v.optional(v.id("planningHabits")),
  notes: v.optional(v.string()),
  locked: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_planId", ["planId"])
  .index("by_planId_date", ["planId", "date"])
  .index("by_userId_date", ["userId", "date"]);

export const planningReviewsTable = defineTable({
  userId: v.string(),
  planId: v.id("plans"),
  wins: v.array(v.string()),
  blockers: v.array(v.string()),
  misses: v.array(v.string()),
  completionRate: v.number(),
  stressRating: v.optional(v.number()),
  satisfactionRating: v.optional(v.number()),
  overloadIndicators: v.array(v.string()),
  improvementSuggestions: v.array(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_planId", ["planId"])
  .index("by_userId_createdAt", ["userId", "createdAt"]);

export const plannerAgentStateTable = defineTable({
  userId: v.string(),
  agentEnabled: v.boolean(),
  reviewSchedule: v.string(),
  burnoutScore: v.number(),
  burnoutState: burnoutStateValidator,
  lastWeeklyReviewAt: v.optional(v.number()),
  lastWeeklyPlanAt: v.optional(v.number()),
  lastMidweekCheckAt: v.optional(v.number()),
  lastHabitOptimizationAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_userId", ["userId"]);

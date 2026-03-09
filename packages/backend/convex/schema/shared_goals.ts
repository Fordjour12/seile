import { defineTable } from "convex/server";
import { v } from "convex/values";

import { planningHorizonValidator, planningPriorityValidator } from "./planner";

export const sharedGoalStatusValidator = v.union(
  v.literal("draft"),
  v.literal("active"),
  v.literal("completed"),
  v.literal("archived"),
);

export const sharedGoalKindValidator = v.union(
  v.literal("general"),
  v.literal("savings"),
  v.literal("debt_payoff"),
);

export const sharedGoalSourceDomainValidator = v.union(
  v.literal("planner"),
  v.literal("finance"),
  v.literal("shared"),
);

export const linkedFinanceEntityTypeValidator = v.union(
  v.literal("savingsGoal"),
  v.literal("debtPlan"),
);

export const sharedGoalsTable = defineTable({
  userId: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  status: sharedGoalStatusValidator,
  priority: planningPriorityValidator,
  horizon: planningHorizonValidator,
  targetDate: v.optional(v.string()),
  goalKind: sharedGoalKindValidator,
  targetAmount: v.optional(v.number()),
  currentAmount: v.optional(v.number()),
  currencyCode: v.optional(v.string()),
  sourceDomain: sharedGoalSourceDomainValidator,
  linkedFinanceEntityType: v.optional(linkedFinanceEntityTypeValidator),
  linkedFinanceEntityId: v.optional(v.string()),
  active: v.boolean(),
  domain: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_active", ["userId", "active"])
  .index("by_userId_goalKind", ["userId", "goalKind"])
  .index("by_userId_sourceDomain", ["userId", "sourceDomain"]);

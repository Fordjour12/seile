import { defineTable } from "convex/server";
import { v } from "convex/values";

export const budgetPeriodStatusValidator = v.union(
  v.literal("draft"),
  v.literal("active"),
  v.literal("closed"),
  v.literal("archived"),
);

export const budgetPeriodsTable = defineTable({
  userId: v.string(),
  year: v.number(),
  month: v.number(),
  status: budgetPeriodStatusValidator,
  currency: v.string(),
  incomeTarget: v.number(),
  notes: v.optional(v.string()),
  closedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_status", ["userId", "status"])
  .index("by_userId_year_month", ["userId", "year", "month"]);

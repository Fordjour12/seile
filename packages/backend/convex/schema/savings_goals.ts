import { defineTable } from "convex/server";
import { v } from "convex/values";

export const savingsStatusValidator = v.union(
  v.literal("draft"),
  v.literal("active"),
  v.literal("completed"),
  v.literal("archived"),
);

export const savingsGoalsTable = defineTable({
  userId: v.string(),
  name: v.string(),
  status: savingsStatusValidator,
  currency: v.string(),
  targetAmount: v.number(),
  currentAmount: v.number(),
  monthlyContribution: v.optional(v.number()),
  targetDate: v.optional(v.number()),
  linkedAccountId: v.optional(v.id("accounts")),
  linkedRecurringId: v.optional(v.id("recurringTransactions")),
  categoryId: v.optional(v.id("categories")),
  color: v.optional(v.string()),
  icon: v.optional(v.string()),
  priorityRank: v.optional(v.string()),
  notes: v.optional(v.string()),
  publishedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_status", ["userId", "status"])
  .index("by_userId_priorityRank", ["userId", "priorityRank"])
  .index("by_userId_publishedAt", ["userId", "publishedAt"]);

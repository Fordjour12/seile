import { defineTable } from "convex/server";
import { v } from "convex/values";

export const debtTypeValidator = v.union(v.literal("installment"), v.literal("revolving"));
export const debtStatusValidator = v.union(v.literal("draft"), v.literal("active"), v.literal("archived"));
export const payoffStrategyValidator = v.union(
  v.literal("avalanche"),
  v.literal("snowball"),
  v.literal("custom"),
);

export const debtPlansTable = defineTable({
  userId: v.string(),
  name: v.string(),
  debtType: debtTypeValidator,
  status: debtStatusValidator,
  currency: v.string(),
  originalBalance: v.number(),
  currentBalance: v.number(),
  monthlyDue: v.number(),
  apr: v.optional(v.number()),
  nextDueDate: v.optional(v.number()),
  linkedAccountId: v.optional(v.id("accounts")),
  linkedRecurringId: v.optional(v.id("recurringTransactions")),
  payoffStrategy: v.optional(payoffStrategyValidator),
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

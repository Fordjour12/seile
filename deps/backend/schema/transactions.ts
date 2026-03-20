import { defineTable } from "convex/server";
import { v } from "convex/values";

export const transactionKindValidator = v.union(
  v.literal("expense"),
  v.literal("income"),
  v.literal("transfer"),
  v.literal("adjustment"),
);

export const transactionsTable = defineTable({
  userId: v.string(),
  kind: transactionKindValidator,
  amount: v.number(),
  currency: v.string(),
  accountId: v.optional(v.id("accounts")),
  fromAccountId: v.optional(v.id("accounts")),
  toAccountId: v.optional(v.id("accounts")),
  categoryId: v.optional(v.id("categories")),
  note: v.optional(v.string()),
  recurringTransactionId: v.optional(v.id("recurringTransactions")),
  idempotencyKey: v.optional(v.string()),
  occurredAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_occurredAt", ["userId", "occurredAt"])
  .index("by_userId_category", ["userId", "categoryId"])
  .index("by_recurringId", ["recurringTransactionId"])
  .index("by_idempotencyKey", ["idempotencyKey"]);

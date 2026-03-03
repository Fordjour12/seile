import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const accountTypeValidator = v.union(
  v.literal("cash"),
  v.literal("bank"),
  v.literal("investment"),
  v.literal("credit")
);

export default defineSchema({
  accounts: defineTable({
    userId: v.string(),
    name: v.string(),
    type: accountTypeValidator,
    currency: v.string(),
    balance: v.number(),
    isArchived: v.boolean(),
    note: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_isArchived", ["userId", "isArchived"]),

  requestNonces: defineTable({
    nonce: v.string(),
    createdAt: v.number(),
  }).index("by_nonce", ["nonce"]),
});

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const accountTypeValidator = v.union(
  v.literal("checking"),
  v.literal("savings"),
  v.literal("cash"),
  v.literal("credit"),
  v.literal("investment"),
  v.literal("bank")
);

export const accountStatusValidator = v.union(
  v.literal("active"),
  v.literal("archived"),
  v.literal("closed")
);

export default defineSchema({
  accounts: defineTable({
    userId: v.string(),
    name: v.string(),
    type: accountTypeValidator,
    status: accountStatusValidator,
    currency: v.string(),
    balance: v.number(),
    note: v.optional(v.string()),
    // Legacy field retained during migration window.
    isArchived: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_status", ["userId", "status"]),

  requestNonces: defineTable({
    nonce: v.string(),
    createdAt: v.number(),
  }).index("by_nonce", ["nonce"]),
});

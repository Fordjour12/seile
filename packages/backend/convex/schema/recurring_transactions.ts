import { defineTable } from "convex/server";
import { v } from "convex/values";

export const recurringKindValidator = v.union(
  v.literal("expense"),
  v.literal("income"),
  v.literal("transfer"),
);

export const scheduleTypeValidator = v.union(
  v.literal("daily"),
  v.literal("weekly"),
  v.literal("monthly"),
  v.literal("yearly"),
);

export const subscriptionStatusValidator = v.union(
  v.literal("active"),
  v.literal("trial"),
  v.literal("paused"),
  v.literal("cancelled"),
);

export const recurringTransactionsTable = defineTable({
  userId: v.string(),
  kind: recurringKindValidator,
  amount: v.number(),
  currency: v.string(),
  scheduleType: scheduleTypeValidator,
  interval: v.number(),
  dayOfMonth: v.optional(v.number()),
  dayOfWeek: v.optional(v.number()),
  startAt: v.number(),
  endAt: v.optional(v.number()),
  accountId: v.optional(v.id("accounts")),
  fromAccountId: v.optional(v.id("accounts")),
  toAccountId: v.optional(v.id("accounts")),
  categoryId: v.optional(v.id("categories")),
  note: v.optional(v.string()),
  isActive: v.boolean(),
  lastGeneratedAt: v.optional(v.number()),
  nextRunAt: v.number(),
  isSubscription: v.boolean(),
  subscriptionMeta: v.optional(
    v.object({
      serviceName: v.string(),
      serviceUrl: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      status: subscriptionStatusValidator,
      trialEndsAt: v.optional(v.number()),
      cancelledAt: v.optional(v.number()),
      billingProvider: v.optional(v.string()),
      externalSubscriptionId: v.optional(v.string()),
    }),
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_isActive", ["userId", "isActive"])
  .index("by_userId_nextRunAt", ["userId", "nextRunAt"])
  .index("by_userId_isSubscription", ["userId", "isSubscription"]);

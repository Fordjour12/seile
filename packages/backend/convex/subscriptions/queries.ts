import { v } from "convex/values";

import type { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { requireUserId } from "../lib/identity";

export const listSubscriptions = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<Doc<"recurringTransactions">[]> => {
    const userId = await requireUserId(ctx);
    const base = ctx.db
      .query("recurringTransactions")
      .withIndex("by_userId_isSubscription", (q) =>
        q.eq("userId", userId).eq("isSubscription", true),
      );

    if (args.includeInactive) {
      return base.collect();
    }

    return base.filter((q) => q.eq(q.field("isActive"), true)).collect();
  },
});

export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("active"),
      v.literal("trial"),
      v.literal("paused"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args): Promise<Doc<"recurringTransactions">[]> => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db
      .query("recurringTransactions")
      .withIndex("by_userId_isSubscription", (q) =>
        q.eq("userId", userId).eq("isSubscription", true),
      )
      .collect();

    return rows.filter((row) => row.subscriptionMeta?.status === args.status);
  },
});

export const getUpcomingRenewals = query({
  args: {
    withinDays: v.number(),
  },
  handler: async (ctx, args): Promise<Doc<"recurringTransactions">[]> => {
    const userId = await requireUserId(ctx);
    const horizon = Date.now() + args.withinDays * 24 * 60 * 60 * 1000;

    return ctx.db
      .query("recurringTransactions")
      .withIndex("by_userId_nextRunAt", (q) => q.eq("userId", userId).lte("nextRunAt", horizon))
      .filter((q) =>
        q.and(
          q.eq(q.field("isSubscription"), true),
          q.eq(q.field("isActive"), true),
        ),
      )
      .collect();
  },
});

export const getMonthlySubscriptionSpend = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const subscriptions = await ctx.db
      .query("recurringTransactions")
      .withIndex("by_userId_isSubscription", (q) =>
        q.eq("userId", userId).eq("isSubscription", true),
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const monthlyTotal = subscriptions.reduce((sum, subscription) => {
      let monthly = subscription.amount;
      if (subscription.scheduleType === "yearly") monthly = subscription.amount / 12;
      if (subscription.scheduleType === "weekly") monthly = subscription.amount * 4.33;
      return sum + monthly;
    }, 0);

    return {
      monthlyTotal: Number(monthlyTotal.toFixed(2)),
      count: subscriptions.length,
    };
  },
});

import { v } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import { internalQuery, query } from "../../_generated/server";
import { requireUserId } from "../../lib/identity";

export const listRecurringTransactions = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<Doc<"recurringTransactions">[]> => {
    const userId = await requireUserId(ctx);
    if (args.includeInactive) {
      return ctx.db
        .query("recurringTransactions")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();
    }

    return ctx.db
      .query("recurringTransactions")
      .withIndex("by_userId_isActive", (q) => q.eq("userId", userId).eq("isActive", true))
      .order("asc")
      .collect();
  },
});

export const getDueRecurring = internalQuery({
  args: {
    nowMs: v.number(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Doc<"recurringTransactions">[]> => {
    if (args.userId) {
      return ctx.db
        .query("recurringTransactions")
        .withIndex("by_userId_isActive", (q) => q.eq("userId", args.userId!).eq("isActive", true))
        .filter((q) => q.lte(q.field("nextRunAt"), args.nowMs))
        .collect();
    }

    return ctx.db
      .query("recurringTransactions")
      .filter((q) => q.and(q.eq(q.field("isActive"), true), q.lte(q.field("nextRunAt"), args.nowMs)))
      .collect();
  },
});

export const getUpcomingRecurring = query({
  args: {
    withinDays: v.number(),
  },
  handler: async (ctx, args): Promise<Doc<"recurringTransactions">[]> => {
    const userId = await requireUserId(ctx);
    const horizon = Date.now() + args.withinDays * 24 * 60 * 60 * 1000;

    return ctx.db
      .query("recurringTransactions")
      .withIndex("by_userId_nextRunAt", (q) => q.eq("userId", userId).lte("nextRunAt", horizon))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

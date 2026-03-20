import { v } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import { query } from "../../_generated/server";
import { requireUserId } from "../../lib/identity";

export const listTransactions = query({
  args: {
    limit: v.optional(v.number()),
    before: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Doc<"transactions">[]> => {
    const userId = await requireUserId(ctx);
    const limit = Math.min(Math.max(Math.floor(args.limit ?? 50), 1), 200);
    const before = args.before;

    const base = ctx.db
      .query("transactions")
      .withIndex("by_userId_occurredAt", (q) => q.eq("userId", userId));

    if (before !== undefined) {
      return base.order("desc").filter((q) => q.lt(q.field("occurredAt"), before)).take(limit);
    }

    return base.order("desc").take(limit);
  },
});

export const getTransactionById = query({
  args: {
    id: v.id("transactions"),
  },
  handler: async (ctx, args): Promise<Doc<"transactions"> | null> => {
    const userId = await requireUserId(ctx);
    const tx = await ctx.db.get(args.id);
    if (!tx || tx.userId !== userId) {
      return null;
    }
    return tx;
  },
});

export const getTransactionSummary = query({
  args: {
    from: v.number(),
    to: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db
      .query("transactions")
      .withIndex("by_userId_occurredAt", (q) => q.eq("userId", userId))
      .filter((q) => q.and(q.gte(q.field("occurredAt"), args.from), q.lte(q.field("occurredAt"), args.to)))
      .collect();

    let expense = 0;
    let transfer = 0;
    let income = 0;

    for (const tx of rows) {
      if (tx.kind === "income" || tx.kind === "adjustment") {
        income += tx.amount;
      } else if (tx.kind === "expense") {
        expense += tx.amount;
      } else {
        transfer += tx.amount;
      }
    }

    return {
      count: rows.length,
      income,
      expense,
      transfer,
      net: income - expense,
    };
  },
});

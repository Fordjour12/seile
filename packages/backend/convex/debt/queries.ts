import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import { query, type QueryCtx } from "../_generated/server";
import { requireUserId } from "../lib/identity";
import { debtStatusValidator } from "../schema/debt_plans";

export const listDebtPlans = query({
  args: { status: v.optional(debtStatusValidator), includeArchived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db.query("debtPlans").withIndex("by_userId", (q) => q.eq("userId", userId)).collect();
    return rows
      .filter((row) => (args.status ? row.status === args.status : true))
      .filter((row) => (args.includeArchived ? true : row.status !== "archived"))
      .sort((a, b) => (a.priorityRank ?? "").localeCompare(b.priorityRank ?? ""))
      .map(attachComputed);
  },
});

export const getDebtPlanById = query({
  args: { id: v.id("debtPlans") },
  handler: async (ctx, args) => attachComputed(await requireOwnedDebt(ctx, args.id)),
});

export const getDebtSnapshot = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db
      .query("debtPlans")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return {
      totalCurrentBalance: rows.reduce((sum, row) => sum + row.currentBalance, 0),
      totalMonthlyDue: rows.reduce((sum, row) => sum + row.monthlyDue, 0),
      countByStatus: rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.status] = (acc[row.status] ?? 0) + 1;
        return acc;
      }, {}),
    };
  },
});

function attachComputed(row: Doc<"debtPlans">) {
  return {
    ...row,
    monthlyLedgerImpact: row.monthlyDue,
    balanceExceedsOriginal: row.currentBalance > row.originalBalance,
  };
}

async function requireOwnedDebt(ctx: QueryCtx, id: Id<"debtPlans">): Promise<Doc<"debtPlans">> {
  const userId = await requireUserId(ctx);
  const debt = await ctx.db.get(id);
  if (!debt || debt.userId !== userId) {
    throw new ConvexError("Debt plan not found");
  }
  return debt;
}

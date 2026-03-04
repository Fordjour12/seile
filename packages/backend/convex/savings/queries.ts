import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import { query, type QueryCtx } from "../_generated/server";
import { resolveSystemUserId } from "../lib/security";
import { savingsStatusValidator } from "../schema/savings_goals";

export const listSavingsGoals = query({
  args: { status: v.optional(savingsStatusValidator), includeArchived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("savingsGoals")
      .withIndex("by_userId", (q) => q.eq("userId", resolveSystemUserId()))
      .collect();

    return rows
      .filter((row) => (args.status ? row.status === args.status : true))
      .filter((row) => (args.includeArchived ? true : row.status !== "archived"))
      .sort((a, b) => (a.priorityRank ?? "").localeCompare(b.priorityRank ?? ""))
      .map(attachComputed);
  },
});

export const getSavingsGoalById = query({
  args: { id: v.id("savingsGoals") },
  handler: async (ctx, args) => attachComputed(await requireOwnedGoal(ctx, args.id)),
});

export const getSavingsSummary = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("savingsGoals")
      .withIndex("by_userId", (q) => q.eq("userId", resolveSystemUserId()))
      .collect();

    const totalTarget = rows.reduce((sum, row) => sum + row.targetAmount, 0);
    const totalCurrent = rows.reduce((sum, row) => sum + row.currentAmount, 0);
    return {
      totalTarget,
      totalCurrent,
      percentComplete: totalTarget === 0 ? 0 : (totalCurrent / totalTarget) * 100,
      totalMonthlyCommitment: rows.reduce((sum, row) => sum + (row.monthlyContribution ?? 0), 0),
      countByStatus: rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.status] = (acc[row.status] ?? 0) + 1;
        return acc;
      }, {}),
    };
  },
});

function attachComputed(row: Doc<"savingsGoals">) {
  const targetDate = row.targetDate;
  const now = Date.now();
  const monthsUntilTarget = targetDate && targetDate > now ? Math.max(1, Math.ceil((targetDate - now) / (30 * 24 * 60 * 60 * 1000))) : undefined;
  const monthlyLedgerImpact = row.monthlyContribution ?? (monthsUntilTarget ? row.targetAmount / monthsUntilTarget : 0);

  return {
    ...row,
    monthsUntilTarget,
    projectedCompletionDate: targetDate,
    monthlyLedgerImpact,
  };
}

async function requireOwnedGoal(ctx: QueryCtx, id: Id<"savingsGoals">): Promise<Doc<"savingsGoals">> {
  const row = await ctx.db.get(id);
  if (!row || row.userId !== resolveSystemUserId()) {
    throw new ConvexError("Savings goal not found");
  }
  return row;
}

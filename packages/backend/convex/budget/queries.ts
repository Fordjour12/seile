import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import { query, type QueryCtx } from "../_generated/server";
import { resolveSystemUserId } from "../lib/security";
import { budgetPeriodStatusValidator } from "../schema/budget_periods";
import { computeActualSpend, computeEnvelopeComputed, periodDateRange } from "./helpers";

export const listBudgetPeriods = query({
  args: { status: v.optional(budgetPeriodStatusValidator), year: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = resolveSystemUserId();
    const periods = await ctx.db.query("budgetPeriods").withIndex("by_userId", (q) => q.eq("userId", userId)).collect();
    const filtered = periods
      .filter((period) => (args.status ? period.status === args.status : true))
      .filter((period) => (args.year ? period.year === args.year : true))
      .sort((a, b) => (b.year - a.year) || (b.month - a.month));

    return Promise.all(filtered.map((period) => withComputedPeriod(ctx, period)));
  },
});

export const getActivePeriod = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("budgetPeriods")
      .withIndex("by_userId_status", (q) => q.eq("userId", resolveSystemUserId()).eq("status", "active"))
      .first();

    if (!active) return null;
    return withComputedPeriod(ctx, active);
  },
});

export const getBudgetPeriodById = query({
  args: { id: v.id("budgetPeriods") },
  handler: async (ctx, args) => {
    const period = await requireOwnedPeriod(ctx, args.id);
    const envelopes = await listEnvelopesWithComputed(ctx, period);
    return { ...(await withComputedPeriod(ctx, period)), envelopeCount: envelopes.length };
  },
});

export const getBudgetSummary = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("budgetPeriods")
      .withIndex("by_userId_status", (q) => q.eq("userId", resolveSystemUserId()).eq("status", "active"))
      .first();

    if (!active) {
      return { activePeriod: null, overspentCount: 0, topEnvelopes: [] };
    }

    const activeWithComputed = await withComputedPeriod(ctx, active);
    const envelopes = await listEnvelopesWithComputed(ctx, active);
    const overspentCount = envelopes.filter((item) => item.overspent).length;
    const topEnvelopes = [...envelopes].sort((a, b) => b.spendPercent - a.spendPercent).slice(0, 4);

    return {
      activePeriod: activeWithComputed,
      overspentCount,
      topEnvelopes,
    };
  },
});

export const listEnvelopes = query({
  args: { periodId: v.id("budgetPeriods") },
  handler: async (ctx, args) => {
    const period = await requireOwnedPeriod(ctx, args.periodId);
    return listEnvelopesWithComputed(ctx, period);
  },
});

export const getEnvelopeById = query({
  args: { id: v.id("budgetEnvelopes") },
  handler: async (ctx, args) => {
    const envelope = await ctx.db.get(args.id);
    if (!envelope || envelope.userId !== resolveSystemUserId()) {
      throw new ConvexError("Envelope not found");
    }
    const period = await requireOwnedPeriod(ctx, envelope.periodId);
    return withComputedEnvelope(ctx, period, envelope);
  },
});

export const getEnvelopeHistory = query({
  args: { categoryId: v.id("categories"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = resolveSystemUserId();
    const limit = Math.min(Math.max(Math.floor(args.limit ?? 6), 1), 24);
    const rows = await ctx.db
      .query("budgetEnvelopes")
      .withIndex("by_userId_categoryId", (q) => q.eq("userId", userId).eq("categoryId", args.categoryId))
      .collect();

    const mapped = await Promise.all(rows.map(async (row) => {
      const period = await ctx.db.get(row.periodId);
      if (!period || period.userId !== userId) return null;
      const computed = await withComputedEnvelope(ctx, period, row);
      return {
        periodLabel: `${period.year}-${String(period.month).padStart(2, "0")}`,
        allocatedAmount: row.allocatedAmount,
        actualSpend: computed.actualSpend,
      };
    }));

    return mapped.filter((row) => row !== null).slice(-limit);
  },
});

async function withComputedPeriod(ctx: QueryCtx, period: Doc<"budgetPeriods">) {
  const envelopes = await listEnvelopesWithComputed(ctx, period);
  const totalAllocated = envelopes.reduce((sum, envelope) => sum + envelope.effectiveAllocation, 0);
  const totalActualSpend = envelopes.reduce((sum, envelope) => sum + envelope.actualSpend, 0);

  return {
    ...period,
    totalAllocated,
    totalActualSpend,
    unallocated: period.incomeTarget - totalAllocated,
    overallVariance: totalAllocated - totalActualSpend,
  };
}

async function listEnvelopesWithComputed(ctx: QueryCtx, period: Doc<"budgetPeriods">) {
  const rows = await ctx.db
    .query("budgetEnvelopes")
    .withIndex("by_periodId", (q) => q.eq("periodId", period._id))
    .collect();

  const enriched = await Promise.all(rows.map((row) => withComputedEnvelope(ctx, period, row)));
  return enriched.sort((a, b) => {
    if (a.overspent !== b.overspent) return a.overspent ? -1 : 1;
    return (a.sortOrder ?? "").localeCompare(b.sortOrder ?? "");
  });
}

async function withComputedEnvelope(ctx: QueryCtx, period: Doc<"budgetPeriods">, row: Doc<"budgetEnvelopes">) {
  const { start, end } = periodDateRange(period.year, period.month);
  const actualSpend = await computeActualSpend(ctx, row.userId, row.categoryId, start, end);
  return {
    ...row,
    actualSpend,
    ...computeEnvelopeComputed(row.allocatedAmount, row.rolloverAmount, actualSpend),
  };
}

async function requireOwnedPeriod(ctx: QueryCtx, id: Id<"budgetPeriods">): Promise<Doc<"budgetPeriods">> {
  const period = await ctx.db.get(id);
  if (!period || period.userId !== resolveSystemUserId()) {
    throw new ConvexError("Budget period not found");
  }
  return period;
}

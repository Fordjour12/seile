import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import { mutation, type MutationCtx } from "../_generated/server";
import { buildRanks } from "../lib/fractionalIndex";
import { resolveSystemUserId } from "../lib/security";
import { budgetPeriodStatusValidator } from "../schema/budget_periods";
import { computeActualSpend, periodDateRange } from "./helpers";
import {
  validateBudgetCurrency,
  validateMoney,
  validateMonth,
  validateOptionalNotes,
  validateSortOrder,
  validateYear,
} from "./validators";

export const createBudgetPeriod = mutation({
  args: {
    year: v.number(),
    month: v.number(),
    currency: v.optional(v.string()),
    incomeTarget: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ id: Id<"budgetPeriods"> }> => {
    const userId = resolveSystemUserId();
    const year = validateYear(args.year);
    const month = validateMonth(args.month);

    const existing = await ctx.db
      .query("budgetPeriods")
      .withIndex("by_userId_year_month", (q) => q.eq("userId", userId).eq("year", year).eq("month", month))
      .first();

    if (existing) {
      throw new ConvexError("Validation: budget period already exists for this month");
    }

    const now = Date.now();
    const id = await ctx.db.insert("budgetPeriods", {
      userId,
      year,
      month,
      status: "draft",
      currency: validateBudgetCurrency(args.currency ?? "GHS"),
      incomeTarget: validateMoney("incomeTarget", args.incomeTarget),
      notes: validateOptionalNotes(args.notes),
      closedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });

    return { id };
  },
});

export const updateBudgetPeriod = mutation({
  args: {
    id: v.id("budgetPeriods"),
    incomeTarget: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Doc<"budgetPeriods">> => {
    const period = await requireOwnedPeriod(ctx, args.id);
    const patch: Partial<Doc<"budgetPeriods">> = { updatedAt: Date.now() };
    if (args.incomeTarget !== undefined) patch.incomeTarget = validateMoney("incomeTarget", args.incomeTarget);
    if (args.notes !== undefined) patch.notes = validateOptionalNotes(args.notes);
    await ctx.db.patch(args.id, patch);
    const updated = await ctx.db.get(args.id);
    if (!updated) throw new ConvexError("Budget period not found after update");
    return updated;
  },
});

export const activateBudgetPeriod = mutation({
  args: { id: v.id("budgetPeriods") },
  handler: async (ctx, args): Promise<boolean> => {
    const period = await requireOwnedPeriod(ctx, args.id);
    if (period.status !== "draft" && period.status !== "active") {
      throw new ConvexError("Validation: only draft periods can be activated");
    }

    const userId = resolveSystemUserId();
    const active = await ctx.db
      .query("budgetPeriods")
      .withIndex("by_userId_status", (q) => q.eq("userId", userId).eq("status", "active"))
      .collect();

    for (const current of active) {
      if (current._id !== args.id) {
        await ctx.db.patch(current._id, { status: "draft", updatedAt: Date.now() });
      }
    }

    await ctx.db.patch(args.id, { status: "active", updatedAt: Date.now() });
    return true;
  },
});

export const closeBudgetPeriod = mutation({
  args: { id: v.id("budgetPeriods") },
  handler: async (ctx, args): Promise<boolean> => {
    const period = await requireOwnedPeriod(ctx, args.id);
    if (period.status !== "active") {
      throw new ConvexError("Validation: only active periods can be closed");
    }

    const nextYear = period.month === 12 ? period.year + 1 : period.year;
    const nextMonth = period.month === 12 ? 1 : period.month + 1;
    const userId = resolveSystemUserId();

    const nextPeriod = await ctx.db
      .query("budgetPeriods")
      .withIndex("by_userId_year_month", (q) => q.eq("userId", userId).eq("year", nextYear).eq("month", nextMonth))
      .first();

    if (nextPeriod) {
      const envelopes = await ctx.db.query("budgetEnvelopes").withIndex("by_periodId", (q) => q.eq("periodId", period._id)).collect();
      const { start, end } = periodDateRange(period.year, period.month);
      for (const envelope of envelopes) {
        if (!envelope.rolloverEnabled) continue;
        const actualSpend = await computeActualSpend(ctx, userId, envelope.categoryId, start, end);
        const rolloverAmount = Math.max(0, envelope.allocatedAmount + envelope.rolloverAmount - actualSpend);
        const target = await ctx.db
          .query("budgetEnvelopes")
          .withIndex("by_periodId_categoryId", (q) => q.eq("periodId", nextPeriod._id).eq("categoryId", envelope.categoryId))
          .first();
        if (target) {
          await ctx.db.patch(target._id, { rolloverAmount, updatedAt: Date.now() });
        }
      }
    }

    await ctx.db.patch(period._id, { status: "closed", closedAt: Date.now(), updatedAt: Date.now() });
    return true;
  },
});

export const archiveBudgetPeriod = mutation({
  args: { id: v.id("budgetPeriods") },
  handler: async (ctx, args): Promise<boolean> => {
    const period = await requireOwnedPeriod(ctx, args.id);
    if (period.status === "archived") return true;
    if (period.status !== "closed") {
      throw new ConvexError("Validation: only closed periods can be archived");
    }
    await ctx.db.patch(args.id, { status: "archived", updatedAt: Date.now() });
    return true;
  },
});

export const copyPreviousPeriod = mutation({
  args: { toPeriodId: v.id("budgetPeriods") },
  handler: async (ctx, args): Promise<{ copiedCount: number; noPreviousPeriod?: boolean }> => {
    const toPeriod = await requireOwnedPeriod(ctx, args.toPeriodId);
    const userId = resolveSystemUserId();
    const periods = await ctx.db.query("budgetPeriods").withIndex("by_userId", (q) => q.eq("userId", userId)).collect();
    const previous = periods
      .filter((item) => item._id !== toPeriod._id && (item.status === "active" || item.status === "closed"))
      .filter((item) => item.year < toPeriod.year || (item.year === toPeriod.year && item.month < toPeriod.month))
      .sort((a, b) => (b.year - a.year) || (b.month - a.month))[0];

    if (!previous) return { copiedCount: 0, noPreviousPeriod: true };

    const rows = await ctx.db.query("budgetEnvelopes").withIndex("by_periodId", (q) => q.eq("periodId", previous._id)).collect();
    for (const row of rows) {
      const exists = await ctx.db
        .query("budgetEnvelopes")
        .withIndex("by_periodId_categoryId", (q) => q.eq("periodId", toPeriod._id).eq("categoryId", row.categoryId))
        .first();
      if (exists) continue;

      await ctx.db.insert("budgetEnvelopes", {
        userId,
        periodId: toPeriod._id,
        categoryId: row.categoryId,
        name: row.name,
        allocatedAmount: row.allocatedAmount,
        rolloverAmount: 0,
        rolloverEnabled: row.rolloverEnabled,
        sortOrder: row.sortOrder,
        color: row.color,
        icon: row.icon,
        categoryDeleted: row.categoryDeleted,
        notes: row.notes,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { copiedCount: rows.length };
  },
});

export const createEnvelope = mutation({
  args: {
    periodId: v.id("budgetPeriods"),
    categoryId: v.id("categories"),
    allocatedAmount: v.number(),
    rolloverEnabled: v.optional(v.boolean()),
    sortOrder: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ id: Id<"budgetEnvelopes"> }> => {
    const period = await requireOwnedPeriod(ctx, args.periodId);
    const userId = resolveSystemUserId();

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.userId !== userId) {
      throw new ConvexError("Validation: category not found");
    }

    const existing = await ctx.db
      .query("budgetEnvelopes")
      .withIndex("by_periodId_categoryId", (q) => q.eq("periodId", period._id).eq("categoryId", args.categoryId))
      .first();
    if (existing) {
      throw new ConvexError("Validation: envelope already exists for this category in the period");
    }

    const now = Date.now();
    const id = await ctx.db.insert("budgetEnvelopes", {
      userId,
      periodId: period._id,
      categoryId: args.categoryId,
      name: category.name,
      allocatedAmount: validateMoney("allocatedAmount", args.allocatedAmount),
      rolloverAmount: 0,
      rolloverEnabled: args.rolloverEnabled ?? false,
      sortOrder: validateSortOrder(args.sortOrder),
      color: args.color ?? category.color,
      icon: args.icon ?? category.icon,
      categoryDeleted: false,
      notes: validateOptionalNotes(args.notes),
      createdAt: now,
      updatedAt: now,
    });

    return { id };
  },
});

export const updateEnvelope = mutation({
  args: {
    id: v.id("budgetEnvelopes"),
    allocatedAmount: v.optional(v.number()),
    rolloverEnabled: v.optional(v.boolean()),
    sortOrder: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Doc<"budgetEnvelopes">> => {
    const envelope = await requireOwnedEnvelope(ctx, args.id);
    const patch: Partial<Doc<"budgetEnvelopes">> = { updatedAt: Date.now() };

    if (args.allocatedAmount !== undefined) patch.allocatedAmount = validateMoney("allocatedAmount", args.allocatedAmount);
    if (args.rolloverEnabled !== undefined) patch.rolloverEnabled = args.rolloverEnabled;
    if (args.sortOrder !== undefined) patch.sortOrder = validateSortOrder(args.sortOrder);
    if (args.color !== undefined) patch.color = args.color;
    if (args.icon !== undefined) patch.icon = args.icon;
    if (args.notes !== undefined) patch.notes = validateOptionalNotes(args.notes);

    await ctx.db.patch(envelope._id, patch);
    const updated = await ctx.db.get(args.id);
    if (!updated) throw new ConvexError("Envelope not found after update");
    return updated;
  },
});

export const reorderEnvelopes = mutation({
  args: { orderedIds: v.array(v.id("budgetEnvelopes")) },
  handler: async (ctx, args): Promise<boolean> => {
    const ranks = buildRanks(args.orderedIds.length);
    const userId = resolveSystemUserId();

    for (const [index, id] of args.orderedIds.entries()) {
      const envelope = await ctx.db.get(id);
      if (!envelope || envelope.userId !== userId) {
        throw new ConvexError("Envelope not found");
      }
      await ctx.db.patch(id, { sortOrder: ranks[index], updatedAt: Date.now() });
    }

    return true;
  },
});

export const deleteEnvelope = mutation({
  args: { id: v.id("budgetEnvelopes") },
  handler: async (ctx, args): Promise<{ deleted: boolean; softArchived: boolean }> => {
    const envelope = await requireOwnedEnvelope(ctx, args.id);
    const period = await requireOwnedPeriod(ctx, envelope.periodId);
    const { start, end } = periodDateRange(period.year, period.month);
    const actualSpend = await computeActualSpend(ctx, envelope.userId, envelope.categoryId, start, end);

    if (actualSpend > 0) {
      await ctx.db.patch(envelope._id, { allocatedAmount: 0, updatedAt: Date.now() });
      throw new ConvexError("Validation: envelope has spend activity; use soft-archive (allocatedAmount: 0)");
    }

    await ctx.db.delete(envelope._id);
    return { deleted: true, softArchived: false };
  },
});

async function requireOwnedPeriod(ctx: MutationCtx, id: Id<"budgetPeriods">): Promise<Doc<"budgetPeriods">> {
  const period = await ctx.db.get(id);
  if (!period || period.userId !== resolveSystemUserId()) {
    throw new ConvexError("Budget period not found");
  }
  return period;
}

async function requireOwnedEnvelope(ctx: MutationCtx, id: Id<"budgetEnvelopes">): Promise<Doc<"budgetEnvelopes">> {
  const envelope = await ctx.db.get(id);
  if (!envelope || envelope.userId !== resolveSystemUserId()) {
    throw new ConvexError("Envelope not found");
  }
  return envelope;
}

export const _budgetPeriodStatusValidator = budgetPeriodStatusValidator;

import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import { mutation, type MutationCtx } from "../_generated/server";
import { buildRanks } from "../lib/fractionalIndex";
import { requireUserId } from "../lib/identity";
import { debtTypeValidator, payoffStrategyValidator } from "../schema/debt_plans";
import { validateApr, validateDebtCurrency, validateDebtMoney, validateDebtName, validatePriorityRank } from "./validators";

export const createDebtPlan = mutation({
  args: {
    name: v.string(),
    debtType: debtTypeValidator,
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))),
    currency: v.optional(v.string()),
    originalBalance: v.number(),
    currentBalance: v.number(),
    monthlyDue: v.number(),
    apr: v.optional(v.number()),
    nextDueDate: v.optional(v.number()),
    linkedAccountId: v.optional(v.id("accounts")),
    linkedRecurringId: v.optional(v.id("recurringTransactions")),
    payoffStrategy: v.optional(payoffStrategyValidator),
    priorityRank: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ id: Id<"debtPlans"> }> => {
    const now = Date.now();
    const originalBalance = validateDebtMoney("originalBalance", args.originalBalance);
    const currentBalance = validateDebtMoney("currentBalance", args.currentBalance);
    if (currentBalance > originalBalance) {
      throw new ConvexError("Validation: currentBalance cannot exceed originalBalance");
    }
    const id = await ctx.db.insert("debtPlans", {
      userId: await requireUserId(ctx),
      name: validateDebtName(args.name),
      debtType: args.debtType,
      status: args.status ?? "active",
      currency: validateDebtCurrency(args.currency ?? "GHS"),
      originalBalance,
      currentBalance,
      monthlyDue: validateDebtMoney("monthlyDue", args.monthlyDue),
      apr: validateApr(args.apr),
      nextDueDate: args.nextDueDate,
      linkedAccountId: args.linkedAccountId,
      linkedRecurringId: args.linkedRecurringId,
      payoffStrategy: args.payoffStrategy,
      priorityRank: validatePriorityRank(args.priorityRank),
      notes: args.notes?.trim() || undefined,
      publishedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });

    return { id };
  },
});

export const updateDebtPlan = mutation({
  args: {
    id: v.id("debtPlans"),
    name: v.optional(v.string()),
    debtType: v.optional(debtTypeValidator),
    currency: v.optional(v.string()),
    originalBalance: v.optional(v.number()),
    currentBalance: v.optional(v.number()),
    monthlyDue: v.optional(v.number()),
    apr: v.optional(v.number()),
    nextDueDate: v.optional(v.number()),
    linkedAccountId: v.optional(v.id("accounts")),
    linkedRecurringId: v.optional(v.id("recurringTransactions")),
    payoffStrategy: v.optional(payoffStrategyValidator),
    priorityRank: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))),
  },
  handler: async (ctx, args): Promise<Doc<"debtPlans">> => {
    const existing = await requireOwnedDebt(ctx, args.id);
    const patch: Partial<Doc<"debtPlans">> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = validateDebtName(args.name);
    if (args.debtType !== undefined) patch.debtType = args.debtType;
    if (args.currency !== undefined) patch.currency = validateDebtCurrency(args.currency);
    if (args.originalBalance !== undefined) patch.originalBalance = validateDebtMoney("originalBalance", args.originalBalance);
    if (args.currentBalance !== undefined) patch.currentBalance = validateDebtMoney("currentBalance", args.currentBalance);
    if (args.monthlyDue !== undefined) patch.monthlyDue = validateDebtMoney("monthlyDue", args.monthlyDue);
    if (args.apr !== undefined) patch.apr = validateApr(args.apr);
    if (args.nextDueDate !== undefined) patch.nextDueDate = args.nextDueDate;
    if (args.linkedAccountId !== undefined) patch.linkedAccountId = args.linkedAccountId;
    if (args.linkedRecurringId !== undefined) patch.linkedRecurringId = args.linkedRecurringId;
    if (args.payoffStrategy !== undefined) patch.payoffStrategy = args.payoffStrategy;
    if (args.priorityRank !== undefined) patch.priorityRank = validatePriorityRank(args.priorityRank);
    if (args.notes !== undefined) patch.notes = args.notes.trim() || undefined;
    if (args.status !== undefined) patch.status = args.status;
    if (
      patch.originalBalance !== undefined &&
      (patch.currentBalance ?? existing.currentBalance) > patch.originalBalance
    ) {
      throw new ConvexError("Validation: currentBalance cannot exceed originalBalance");
    }
    if (
      patch.originalBalance === undefined &&
      patch.currentBalance !== undefined &&
      patch.currentBalance > existing.originalBalance
    ) {
      throw new ConvexError("Validation: currentBalance cannot exceed originalBalance");
    }

    await ctx.db.patch(existing._id, patch);
    const updated = await ctx.db.get(existing._id);
    if (!updated) throw new ConvexError("Debt plan not found after update");
    return updated;
  },
});

export const reorderDebtPlans = mutation({
  args: { orderedIds: v.array(v.id("debtPlans")) },
  handler: async (ctx, args): Promise<boolean> => {
    const ranks = buildRanks(args.orderedIds.length);
    const userId = await requireUserId(ctx);
    for (const [index, id] of args.orderedIds.entries()) {
      const debt = await ctx.db.get(id);
      if (!debt || debt.userId !== userId) {
        throw new ConvexError("Debt plan not found");
      }
      await ctx.db.patch(id, { priorityRank: ranks[index], updatedAt: Date.now() });
    }
    return true;
  },
});

export const archiveDebtPlan = mutation({
  args: { id: v.id("debtPlans") },
  handler: async (ctx, args): Promise<boolean> => {
    const debt = await requireOwnedDebt(ctx, args.id);
    if (debt.status === "archived") return true;
    await ctx.db.patch(args.id, { status: "archived", updatedAt: Date.now() });
    return true;
  },
});

export const publishDebtPlan = mutation({
  args: { id: v.id("debtPlans") },
  handler: async (_ctx, _args): Promise<never> => {
    throw new ConvexError("NotImplemented: publishDebtPlan is scheduled for phase 2");
  },
});

async function requireOwnedDebt(ctx: MutationCtx, id: Id<"debtPlans">): Promise<Doc<"debtPlans">> {
  const userId = await requireUserId(ctx);
  const debt = await ctx.db.get(id);
  if (!debt || debt.userId !== userId) {
    throw new ConvexError("Debt plan not found");
  }
  return debt;
}

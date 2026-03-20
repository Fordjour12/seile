import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "../../_generated/dataModel";
import { mutation, type MutationCtx } from "../../_generated/server";
import { buildRanks } from "../../lib/fractionalIndex";
import { requireUserId } from "../../lib/identity";
import { syncSavingsGoalSharedGoal } from "../../shared_goals/helpers";
import { savingsStatusValidator } from "../../schema/savings_goals";
import {
  validateCurrentAmount,
  validateMonthlyContribution,
  validateSavingsCurrency,
  validateSavingsName,
  validateTargetAmount,
} from "./validators";

export const createSavingsGoal = mutation({
  args: {
    name: v.string(),
    status: v.optional(savingsStatusValidator),
    currency: v.optional(v.string()),
    targetAmount: v.number(),
    currentAmount: v.number(),
    monthlyContribution: v.optional(v.number()),
    targetDate: v.optional(v.number()),
    linkedAccountId: v.optional(v.id("accounts")),
    linkedRecurringId: v.optional(v.id("recurringTransactions")),
    categoryId: v.optional(v.id("categories")),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    priorityRank: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ id: Id<"savingsGoals"> }> => {
    const userId = await requireUserId(ctx);
    const targetAmount = validateTargetAmount(args.targetAmount);
    const currentAmount = validateCurrentAmount(args.currentAmount, targetAmount);
    const now = Date.now();
    if (args.targetDate !== undefined && args.targetDate <= now) {
      throw new ConvexError("Validation: targetDate must be in the future");
    }
    const id = await ctx.db.insert("savingsGoals", {
      userId,
      name: validateSavingsName(args.name),
      status: args.status ?? "active",
      currency: validateSavingsCurrency(args.currency ?? "GHS"),
      targetAmount,
      currentAmount,
      monthlyContribution: validateMonthlyContribution(args.monthlyContribution),
      targetDate: args.targetDate,
      linkedAccountId: args.linkedAccountId,
      linkedRecurringId: args.linkedRecurringId,
      categoryId: args.categoryId,
      color: args.color,
      icon: args.icon,
      priorityRank: args.priorityRank?.trim() || undefined,
      sharedGoalId: undefined,
      notes: args.notes?.trim() || undefined,
      publishedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });

    const sharedGoal = await syncSavingsGoalSharedGoal(ctx, {
      userId,
      savingsGoalId: id,
      name: validateSavingsName(args.name),
      status: args.status ?? "active",
      currency: validateSavingsCurrency(args.currency ?? "GHS"),
      targetAmount,
      currentAmount,
      targetDate: args.targetDate,
      notes: args.notes?.trim() || undefined,
    });
    await ctx.db.patch(id, {
      sharedGoalId: sharedGoal._id,
      updatedAt: Date.now(),
    });

    return { id };
  },
});

export const updateSavingsGoal = mutation({
  args: {
    id: v.id("savingsGoals"),
    name: v.optional(v.string()),
    status: v.optional(savingsStatusValidator),
    currency: v.optional(v.string()),
    targetAmount: v.optional(v.number()),
    currentAmount: v.optional(v.number()),
    monthlyContribution: v.optional(v.number()),
    targetDate: v.optional(v.number()),
    linkedAccountId: v.optional(v.id("accounts")),
    linkedRecurringId: v.optional(v.id("recurringTransactions")),
    categoryId: v.optional(v.id("categories")),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    priorityRank: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Doc<"savingsGoals">> => {
    const existing = await requireOwnedGoal(ctx, args.id);
    const userId = await requireUserId(ctx);
    const patch: Partial<Doc<"savingsGoals">> = { updatedAt: Date.now() };
    const targetAmount = args.targetAmount ?? existing.targetAmount;
    const currentAmount = args.currentAmount ?? existing.currentAmount;
    validateCurrentAmount(currentAmount, validateTargetAmount(targetAmount));
    if (args.targetDate !== undefined && args.targetDate <= Date.now()) {
      throw new ConvexError("Validation: targetDate must be in the future");
    }
    if (args.name !== undefined) patch.name = validateSavingsName(args.name);
    if (args.status !== undefined) patch.status = args.status;
    if (args.currency !== undefined) patch.currency = validateSavingsCurrency(args.currency);
    if (args.targetAmount !== undefined) patch.targetAmount = targetAmount;
    if (args.currentAmount !== undefined) patch.currentAmount = currentAmount;
    if (args.monthlyContribution !== undefined) patch.monthlyContribution = validateMonthlyContribution(args.monthlyContribution);
    if (args.targetDate !== undefined) patch.targetDate = args.targetDate;
    if (args.linkedAccountId !== undefined) patch.linkedAccountId = args.linkedAccountId;
    if (args.linkedRecurringId !== undefined) patch.linkedRecurringId = args.linkedRecurringId;
    if (args.categoryId !== undefined) patch.categoryId = args.categoryId;
    if (args.color !== undefined) patch.color = args.color;
    if (args.icon !== undefined) patch.icon = args.icon;
    if (args.priorityRank !== undefined) patch.priorityRank = args.priorityRank.trim() || undefined;
    if (args.notes !== undefined) patch.notes = args.notes.trim() || undefined;

    await ctx.db.patch(args.id, patch);
    const updated = await ctx.db.get(args.id);
    if (!updated) throw new ConvexError("Savings goal not found after update");
    const sharedGoal = await syncSavingsGoalSharedGoal(ctx, {
      userId,
      savingsGoalId: updated._id,
      sharedGoalId: updated.sharedGoalId,
      name: updated.name,
      status: updated.status,
      currency: updated.currency,
      targetAmount: updated.targetAmount,
      currentAmount: updated.currentAmount,
      targetDate: updated.targetDate,
      notes: updated.notes,
    });
    if (updated.sharedGoalId !== sharedGoal._id) {
      await ctx.db.patch(updated._id, {
        sharedGoalId: sharedGoal._id,
        updatedAt: Date.now(),
      });
      return (await ctx.db.get(updated._id))!;
    }
    return updated;
  },
});

export const reorderSavingsGoals = mutation({
  args: { orderedIds: v.array(v.id("savingsGoals")) },
  handler: async (ctx, args): Promise<boolean> => {
    const ranks = buildRanks(args.orderedIds.length);
    const userId = await requireUserId(ctx);
    for (const [index, id] of args.orderedIds.entries()) {
      const row = await ctx.db.get(id);
      if (!row || row.userId !== userId) throw new ConvexError("Savings goal not found");
      await ctx.db.patch(id, { priorityRank: ranks[index], updatedAt: Date.now() });
    }
    return true;
  },
});

export const archiveSavingsGoal = mutation({
  args: { id: v.id("savingsGoals") },
  handler: async (ctx, args): Promise<boolean> => {
    const row = await requireOwnedGoal(ctx, args.id);
    if (row.status === "archived") return true;
    await ctx.db.patch(args.id, { status: "archived", updatedAt: Date.now() });
    if (row.sharedGoalId) {
      const sharedGoal = await ctx.db.get(row.sharedGoalId);
      if (sharedGoal) {
        await ctx.db.patch(sharedGoal._id, {
          status: "archived",
          active: false,
          updatedAt: Date.now(),
        });
      }
    }
    return true;
  },
});

export const publishSavingsGoal = mutation({
  args: { id: v.id("savingsGoals") },
  handler: async (): Promise<never> => {
    throw new ConvexError("NotImplemented: publishSavingsGoal is scheduled for phase 2");
  },
});

async function requireOwnedGoal(ctx: MutationCtx, id: Id<"savingsGoals">): Promise<Doc<"savingsGoals">> {
  const userId = await requireUserId(ctx);
  const row = await ctx.db.get(id);
  if (!row || row.userId !== userId) {
    throw new ConvexError("Savings goal not found");
  }
  return row;
}

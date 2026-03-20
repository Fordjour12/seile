import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "../../_generated/dataModel";
import { mutation } from "../../_generated/server";
import { assertValidAmount, assertValidCurrency } from "../../lib/money";
import { computeNextRun, type ScheduleConfig } from "../../lib/recurring";
import { requireUserId } from "../../lib/identity";
import {
  recurringKindValidator,
  scheduleTypeValidator,
  subscriptionStatusValidator,
} from "../../schema/recurring_transactions";

const subscriptionMetaValidator = v.object({
  serviceName: v.string(),
  serviceUrl: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  status: subscriptionStatusValidator,
  trialEndsAt: v.optional(v.number()),
  cancelledAt: v.optional(v.number()),
  billingProvider: v.optional(v.string()),
  externalSubscriptionId: v.optional(v.string()),
});

export const createRecurringTransaction = mutation({
  args: {
    kind: recurringKindValidator,
    amount: v.number(),
    currency: v.string(),
    accountId: v.optional(v.id("accounts")),
    fromAccountId: v.optional(v.id("accounts")),
    toAccountId: v.optional(v.id("accounts")),
    categoryId: v.optional(v.id("categories")),
    note: v.optional(v.string()),
    scheduleType: scheduleTypeValidator,
    interval: v.number(),
    dayOfMonth: v.optional(v.number()),
    dayOfWeek: v.optional(v.number()),
    startAt: v.number(),
    endAt: v.optional(v.number()),
    isSubscription: v.optional(v.boolean()),
    subscriptionMeta: v.optional(subscriptionMetaValidator),
  },
  handler: async (ctx, args): Promise<Doc<"recurringTransactions">> => {
    assertValidAmount(args.amount);
    const currency = assertValidCurrency(args.currency);
    assertValidSchedule(args);
    assertAccountShape(args.kind, args.accountId, args.fromAccountId, args.toAccountId);

    const now = Date.now();
    const schedule: ScheduleConfig = {
      scheduleType: args.scheduleType,
      interval: Math.max(Math.floor(args.interval), 1),
      dayOfMonth: args.dayOfMonth,
      dayOfWeek: args.dayOfWeek,
      startAt: args.startAt,
      endAt: args.endAt,
    };

    const nextRunAt = computeNextRun(schedule, args.startAt - 1);
    if (!nextRunAt) {
      throw new ConvexError("Schedule produces no valid run dates");
    }

    const id = await ctx.db.insert("recurringTransactions", {
      userId: await requireUserId(ctx),
      kind: args.kind,
      amount: args.amount,
      currency,
      scheduleType: schedule.scheduleType,
      interval: schedule.interval,
      dayOfMonth: schedule.dayOfMonth,
      dayOfWeek: schedule.dayOfWeek,
      startAt: schedule.startAt,
      endAt: schedule.endAt,
      accountId: args.accountId,
      fromAccountId: args.fromAccountId,
      toAccountId: args.toAccountId,
      categoryId: args.categoryId,
      note: args.note?.trim() || undefined,
      isActive: true,
      lastGeneratedAt: undefined,
      nextRunAt,
      isSubscription: args.isSubscription ?? false,
      subscriptionMeta: args.subscriptionMeta,
      createdAt: now,
      updatedAt: now,
    });

    const created = await ctx.db.get("recurringTransactions", id);
    if (!created) {
      throw new ConvexError("Failed to create recurring transaction");
    }

    return created;
  },
});

export const updateRecurringTransaction = mutation({
  args: {
    id: v.id("recurringTransactions"),
    amount: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    note: v.optional(v.string()),
    endAt: v.optional(v.number()),
    dayOfMonth: v.optional(v.number()),
    dayOfWeek: v.optional(v.number()),
    interval: v.optional(v.number()),
    subscriptionMeta: v.optional(subscriptionMetaValidator),
  },
  handler: async (ctx, args): Promise<Doc<"recurringTransactions">> => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db.get("recurringTransactions", args.id);
    if (!existing || existing.userId !== userId) {
      throw new ConvexError("Recurring transaction not found");
    }

    if (args.amount !== undefined) {
      assertValidAmount(args.amount);
    }

    const patch: Partial<Doc<"recurringTransactions">> = {
      updatedAt: Date.now(),
    };

    if (args.amount !== undefined) patch.amount = args.amount;
    if (args.categoryId !== undefined) patch.categoryId = args.categoryId;
    if (args.note !== undefined) patch.note = args.note.trim() || undefined;
    if (args.endAt !== undefined) patch.endAt = args.endAt;
    if (args.dayOfMonth !== undefined) patch.dayOfMonth = args.dayOfMonth;
    if (args.dayOfWeek !== undefined) patch.dayOfWeek = args.dayOfWeek;
    if (args.interval !== undefined) patch.interval = Math.max(Math.floor(args.interval), 1);
    if (args.subscriptionMeta !== undefined) patch.subscriptionMeta = args.subscriptionMeta;

    await ctx.db.patch(args.id, patch);

    const updated = await ctx.db.get("recurringTransactions", args.id);
    if (!updated) {
      throw new ConvexError("Recurring transaction not found after update");
    }

    return updated;
  },
});

export const pauseRecurringTransaction = mutation({
  args: { id: v.id("recurringTransactions") },
  handler: async (ctx, args): Promise<boolean> => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db.get("recurringTransactions", args.id);
    if (!existing || existing.userId !== userId) {
      throw new ConvexError("Recurring transaction not found");
    }

    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return true;
  },
});

export const resumeRecurringTransaction = mutation({
  args: { id: v.id("recurringTransactions") },
  handler: async (ctx, args): Promise<Doc<"recurringTransactions">> => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db.get("recurringTransactions", args.id);
    if (!existing || existing.userId !== userId) {
      throw new ConvexError("Recurring transaction not found");
    }

    const nextRunAt = computeNextRun(existing, Date.now());

    await ctx.db.patch(args.id, {
      isActive: true,
      nextRunAt: nextRunAt ?? existing.nextRunAt,
      updatedAt: Date.now(),
    });

    const updated = await ctx.db.get("recurringTransactions", args.id);
    if (!updated) {
      throw new ConvexError("Recurring transaction not found after resume");
    }

    return updated;
  },
});

export const deleteRecurringTransaction = mutation({
  args: {
    id: v.id("recurringTransactions"),
    deleteGeneratedTransactions: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db.get("recurringTransactions", args.id);
    if (!existing || existing.userId !== userId) {
      throw new ConvexError("Recurring transaction not found");
    }

    if (args.deleteGeneratedTransactions) {
      const generated = await ctx.db
        .query("transactions")
        .withIndex("by_recurringId", (q) => q.eq("recurringTransactionId", args.id))
        .collect();

      for (const transaction of generated) {
        await ctx.db.delete(transaction._id);
      }
    }

    await ctx.db.delete(args.id);
    return true;
  },
});

function assertValidSchedule(args: {
  scheduleType: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startAt: number;
  endAt?: number;
}): void {
  if (!Number.isInteger(args.interval) || args.interval <= 0) {
    throw new ConvexError("Validation: interval must be a positive integer");
  }

  if (args.scheduleType === "monthly" && args.dayOfMonth !== undefined) {
    if (!Number.isInteger(args.dayOfMonth) || args.dayOfMonth < 1 || args.dayOfMonth > 28) {
      throw new ConvexError("Validation: dayOfMonth must be between 1 and 28");
    }
  }

  if (args.scheduleType === "weekly" && args.dayOfWeek !== undefined) {
    if (!Number.isInteger(args.dayOfWeek) || args.dayOfWeek < 0 || args.dayOfWeek > 6) {
      throw new ConvexError("Validation: dayOfWeek must be between 0 and 6");
    }
  }

  if (args.endAt !== undefined && args.endAt <= args.startAt) {
    throw new ConvexError("Validation: endAt must be greater than startAt");
  }
}

function assertAccountShape(
  kind: "expense" | "income" | "transfer",
  accountId?: Id<"accounts">,
  fromAccountId?: Id<"accounts">,
  toAccountId?: Id<"accounts">,
): void {
  if (kind === "transfer") {
    if (!fromAccountId || !toAccountId) {
      throw new ConvexError("Validation: transfer recurring transactions require fromAccountId and toAccountId");
    }
    return;
  }

  if (!accountId) {
    throw new ConvexError("Validation: accountId is required for non-transfer recurring transactions");
  }
}

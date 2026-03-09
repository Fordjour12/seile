import { v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { internalMutation } from "../_generated/server";
import { applyDelta } from "../lib/ledger";
import { buildIdempotencyKey, computeNextRun } from "../lib/recurring";

export const generateDueRecurringTransactions = internalMutation({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const dueRecords = await listDueRecurring(ctx, args.userId, now);

    let failed = 0;
    for (const recurring of dueRecords) {
      try {
        await generateOneEntryInternal(ctx, recurring._id, now);
      } catch {
        failed += 1;
      }
    }

    return {
      processed: dueRecords.length,
      failed,
    };
  },
});

export const generateOneEntry = internalMutation({
  args: {
    recurringId: v.id("recurringTransactions"),
    runAt: v.number(),
  },
  handler: async (ctx, args) => {
    return generateOneEntryInternal(ctx, args.recurringId, args.runAt);
  },
});

async function listDueRecurring(
  ctx: MutationCtx,
  userId: string | undefined,
  nowMs: number,
): Promise<Doc<"recurringTransactions">[]> {
  if (userId) {
    return ctx.db
      .query("recurringTransactions")
      .withIndex("by_userId_isActive", (q) => q.eq("userId", userId).eq("isActive", true))
      .filter((q) => q.lte(q.field("nextRunAt"), nowMs))
      .collect();
  }

  return ctx.db
    .query("recurringTransactions")
    .filter((q) => q.and(q.eq(q.field("isActive"), true), q.lte(q.field("nextRunAt"), nowMs)))
    .collect();
}

async function generateOneEntryInternal(
  ctx: MutationCtx,
  recurringId: Id<"recurringTransactions">,
  runAt: number,
): Promise<{ success: true; idempotencyKey: string } | { skipped: true; reason: "inactive" | "duplicate"; key?: string }> {
  const recurring = await ctx.db.get(recurringId);
  if (!recurring || !recurring.isActive) {
    return { skipped: true as const, reason: "inactive" as const };
  }

  const idempotencyKey = buildIdempotencyKey(
    recurring._id,
    recurring.scheduleType,
    runAt,
  );

  const existing = await ctx.db
    .query("transactions")
    .withIndex("by_idempotencyKey", (q) => q.eq("idempotencyKey", idempotencyKey))
    .first();

  if (existing) {
    return { skipped: true as const, reason: "duplicate" as const, key: idempotencyKey };
  }

  const now = Date.now();
  await ctx.db.insert("transactions", {
    userId: recurring.userId,
    kind: recurring.kind,
    amount: recurring.amount,
    currency: recurring.currency,
    accountId: recurring.accountId,
    fromAccountId: recurring.fromAccountId,
    toAccountId: recurring.toAccountId,
    categoryId: recurring.categoryId,
    note: recurring.note,
    recurringTransactionId: recurring._id,
    idempotencyKey,
    occurredAt: runAt,
    createdAt: now,
    updatedAt: now,
  });

  await applyDelta(ctx, {
    kind: recurring.kind,
    amount: recurring.amount,
    accountId: recurring.accountId,
    fromAccountId: recurring.fromAccountId,
    toAccountId: recurring.toAccountId,
  }, recurring.userId);

  const nextRunAt = computeNextRun(recurring, runAt);
  await ctx.db.patch(recurring._id, {
    lastGeneratedAt: runAt,
    nextRunAt: nextRunAt ?? recurring.nextRunAt,
    isActive: nextRunAt !== null,
    updatedAt: now,
  });

  return { success: true as const, idempotencyKey };
}

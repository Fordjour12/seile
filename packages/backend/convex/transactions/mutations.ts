import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { mutation } from "../_generated/server";
import { applyDelta, reverseDelta } from "../lib/ledger";
import { assertValidAmount, assertValidCurrency } from "../lib/money";
import { resolveSystemUserId } from "../lib/security";
import { transactionKindValidator } from "../schema/transactions";

const updateTransactionArgs = v.object({
  id: v.id("transactions"),
  amount: v.optional(v.number()),
  categoryId: v.optional(v.id("categories")),
  note: v.optional(v.string()),
  occurredAt: v.optional(v.number()),
});

export const createTransaction = mutation({
  args: {
    kind: transactionKindValidator,
    amount: v.number(),
    currency: v.string(),
    accountId: v.optional(v.id("accounts")),
    fromAccountId: v.optional(v.id("accounts")),
    toAccountId: v.optional(v.id("accounts")),
    categoryId: v.optional(v.id("categories")),
    note: v.optional(v.string()),
    occurredAt: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Doc<"transactions">> => {
    assertValidAmount(args.amount);
    const currency = assertValidCurrency(args.currency);

    assertTransactionShape(args.kind, {
      accountId: args.accountId,
      fromAccountId: args.fromAccountId,
      toAccountId: args.toAccountId,
    });

    const now = Date.now();
    const id = await ctx.db.insert("transactions", {
      userId: resolveSystemUserId(),
      kind: args.kind,
      amount: args.amount,
      currency,
      accountId: args.accountId,
      fromAccountId: args.fromAccountId,
      toAccountId: args.toAccountId,
      categoryId: args.categoryId,
      note: args.note?.trim() || undefined,
      occurredAt: args.occurredAt ?? now,
      createdAt: now,
      updatedAt: now,
    });

    await applyDelta(ctx, {
      kind: args.kind,
      amount: args.amount,
      accountId: args.accountId,
      fromAccountId: args.fromAccountId,
      toAccountId: args.toAccountId,
    });

    const inserted = await ctx.db.get(id);
    if (!inserted) {
      throw new ConvexError("Failed to create transaction");
    }

    return inserted;
  },
});

export const updateTransaction = mutation({
  args: updateTransactionArgs,
  handler: async (ctx, args): Promise<Doc<"transactions">> => {
    const existing = await requireOwnedTransaction(ctx, args.id, resolveSystemUserId());

    if (args.amount !== undefined) {
      assertValidAmount(args.amount);
      if (args.amount !== existing.amount) {
        throw new ConvexError("Validation: changing amount is not supported on update");
      }
    }

    const patch: Partial<Doc<"transactions">> = {
      updatedAt: Date.now(),
    };

    if (args.categoryId !== undefined) {
      patch.categoryId = args.categoryId;
    }
    if (args.note !== undefined) {
      patch.note = args.note.trim() || undefined;
    }
    if (args.occurredAt !== undefined) {
      patch.occurredAt = args.occurredAt;
    }

    await ctx.db.patch(args.id, patch);

    const updated = await ctx.db.get(args.id);
    if (!updated) {
      throw new ConvexError("Transaction not found after update");
    }

    return updated;
  },
});

export const deleteTransaction = mutation({
  args: {
    id: v.id("transactions"),
    reverseAccountDelta: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<boolean> => {
    await requireOwnedTransaction(ctx, args.id, resolveSystemUserId());

    if (args.reverseAccountDelta ?? true) {
      await reverseDelta(ctx, args.id);
    }

    await ctx.db.delete(args.id);
    return true;
  },
});

export const reverseTransaction = mutation({
  args: {
    id: v.id("transactions"),
  },
  handler: async (ctx, args): Promise<Doc<"transactions">> => {
    const existing = await requireOwnedTransaction(ctx, args.id, resolveSystemUserId());
    const now = Date.now();

    const oppositeKind =
      existing.kind === "income"
        ? "expense"
        : existing.kind === "expense"
          ? "income"
          : "adjustment";

    const id = await ctx.db.insert("transactions", {
      userId: existing.userId,
      kind: oppositeKind,
      amount: existing.amount,
      currency: existing.currency,
      accountId: existing.accountId,
      fromAccountId: existing.toAccountId,
      toAccountId: existing.fromAccountId,
      categoryId: existing.categoryId,
      note: `Reversal for ${existing._id}`,
      occurredAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await applyDelta(ctx, {
      kind: oppositeKind,
      amount: existing.amount,
      accountId: existing.accountId,
      fromAccountId: existing.toAccountId,
      toAccountId: existing.fromAccountId,
    });

    const reversed = await ctx.db.get(id);
    if (!reversed) {
      throw new ConvexError("Failed to create reversal transaction");
    }

    return reversed;
  },
});

async function requireOwnedTransaction(
  ctx: MutationCtx,
  id: Id<"transactions">,
  expectedUserId: string,
): Promise<Doc<"transactions">> {
  const transaction = await ctx.db.get(id);
  if (!transaction || transaction.userId !== expectedUserId) {
    throw new ConvexError("Transaction not found");
  }
  return transaction;
}

function assertTransactionShape(
  kind: "expense" | "income" | "transfer" | "adjustment",
  ids: {
    accountId?: Id<"accounts">;
    fromAccountId?: Id<"accounts">;
    toAccountId?: Id<"accounts">;
  },
): void {
  if (kind === "transfer") {
    if (!ids.fromAccountId || !ids.toAccountId) {
      throw new ConvexError("Validation: transfer requires fromAccountId and toAccountId");
    }
    return;
  }

  if (!ids.accountId) {
    throw new ConvexError("Validation: accountId is required for non-transfer transactions");
  }
}

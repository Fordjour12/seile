import { ConvexError } from "convex/values";

import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function applyDelta(
  ctx: MutationCtx,
  args: {
    kind: "expense" | "income" | "transfer" | "adjustment";
    amount: number;
    accountId?: Id<"accounts">;
    fromAccountId?: Id<"accounts">;
    toAccountId?: Id<"accounts">;
  },
  expectedUserId?: string,
): Promise<void> {
  const now = Date.now();
  const amount = args.amount;

  if (args.kind === "transfer") {
    if (!args.fromAccountId || !args.toAccountId) {
      throw new ConvexError("Transfer requires fromAccountId and toAccountId");
    }
    await updateBalance(ctx, args.fromAccountId, -amount, now, expectedUserId);
    await updateBalance(ctx, args.toAccountId, amount, now, expectedUserId);
    return;
  }

  if (!args.accountId) {
    throw new ConvexError("accountId required for non-transfer transaction");
  }

  const delta = args.kind === "income" || args.kind === "adjustment" ? amount : -amount;
  await updateBalance(ctx, args.accountId, delta, now, expectedUserId);
}

export async function reverseDelta(
  ctx: MutationCtx,
  transactionId: Id<"transactions">,
  expectedUserId?: string,
): Promise<void> {
  const transaction = await ctx.db.get(transactionId);
  if (!transaction) {
    throw new ConvexError("Transaction not found");
  }
  if (expectedUserId && transaction.userId !== expectedUserId) {
    throw new ConvexError("Transaction not found");
  }

  const oppositeKind =
    transaction.kind === "income"
      ? "expense"
      : transaction.kind === "expense"
        ? "income"
        : transaction.kind;

  await applyDelta(ctx, {
    kind: oppositeKind,
    amount: transaction.amount,
    accountId: transaction.accountId,
    fromAccountId: transaction.toAccountId,
    toAccountId: transaction.fromAccountId,
  }, expectedUserId ?? transaction.userId);
}

async function updateBalance(
  ctx: MutationCtx,
  accountId: Id<"accounts">,
  delta: number,
  now: number,
  expectedUserId?: string,
): Promise<void> {
  const account = await ctx.db.get(accountId);
  if (!account) {
    throw new ConvexError(`Account ${accountId} not found`);
  }
  if (expectedUserId && account.userId !== expectedUserId) {
    throw new ConvexError(`Account ${accountId} not found`);
  }

  await ctx.db.patch(accountId, {
    balance: account.balance + delta,
    updatedAt: now,
  });
}

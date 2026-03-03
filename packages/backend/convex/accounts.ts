import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation } from "./_generated/server";
import { requireSignedRequest } from "./lib/auth";
import { resolveSystemUserId } from "./lib/security";
import {
  accountNameValidator,
  accountTypeValidator,
  authPayloadValidator,
  currencyValidator,
  normalizeAccountName,
  normalizeCurrency,
  normalizeOptionalNote,
  paginationValidator,
  updateAccountValidator,
} from "./lib/validation";

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 20;
const MAX_ACCOUNT_COUNT = 50;
const ACTIVE_STATUS = "active";
const ARCHIVED_STATUS = "archived";

export const createAccount = mutation({
  args: {
    name: accountNameValidator,
    type: accountTypeValidator,
    currency: currencyValidator,
    openingBalance: v.optional(v.number()),
    note: v.optional(v.string()),
    auth: authPayloadValidator,
  },
  handler: async (ctx, args): Promise<Doc<"accounts">> => {
    await requireSignedRequest(ctx, args, "accounts:createAccount");

    const userId = resolveSystemUserId();
    const existingCount = await countUserAccounts(ctx, userId);
    if (existingCount >= MAX_ACCOUNT_COUNT) {
      throw new ConvexError("Validation: account limit reached");
    }

    const now = Date.now();
    const accountId = await ctx.db.insert("accounts", {
      userId,
      name: normalizeAccountName(args.name),
      type: args.type,
      status: ACTIVE_STATUS,
      currency: normalizeCurrency(args.currency),
      balance: args.openingBalance ?? 0,
      note: normalizeOptionalNote(args.note),
      createdAt: now,
      updatedAt: now,
    } as any);

    const account = await ctx.db.get(accountId);
    if (!account) {
      throw new ConvexError("Failed to create account");
    }

    return account;
  },
});

export const updateAccount = mutation({
  args: updateAccountValidator,
  handler: async (ctx, args): Promise<Doc<"accounts">> => {
    await requireSignedRequest(ctx, args, "accounts:updateAccount");

    const userId = resolveSystemUserId();
    const account = await requireOwnedAccount(ctx, args.accountId, userId);
    const patch = buildAccountPatch(args);
    if (Object.keys(patch).length === 0) {
      throw new ConvexError("Validation: no updatable fields provided");
    }

    await ctx.db.patch(
      account._id,
      {
        ...patch,
        updatedAt: Date.now(),
      } as any
    );

    const updatedAccount = await ctx.db.get(account._id);
    if (!updatedAccount) {
      throw new ConvexError("Account not found");
    }

    return updatedAccount;
  },
});

export const deleteAccount = mutation({
  args: {
    accountId: v.id("accounts"),
    auth: authPayloadValidator,
  },
  handler: async (ctx, args): Promise<boolean> => {
    await requireSignedRequest(ctx, args, "accounts:deleteAccount");

    const userId = resolveSystemUserId();
    const account = await requireOwnedAccount(ctx, args.accountId, userId);
    await ctx.db.patch(account._id, {
      status: ARCHIVED_STATUS,
      updatedAt: Date.now(),
    } as any);

    return true;
  },
});

export const listAccounts = mutation({
  args: {
    includeArchived: v.optional(v.boolean()),
    pagination: paginationValidator,
    auth: authPayloadValidator,
  },
  handler: async (ctx, args) => {
    await requireSignedRequest(ctx, args, "accounts:listAccounts");

    const userId = resolveSystemUserId();
    const cursor = args.pagination?.cursor ?? null;
    const limit = Math.min(args.pagination?.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const accountQuery = args.includeArchived
      ? ctx.db.query("accounts").withIndex("by_userId", (queryByUser) => queryByUser.eq("userId", userId))
      : (ctx.db.query("accounts") as any).withIndex("by_userId_and_status", (queryByStatus: any) =>
          queryByStatus.eq("userId", userId).eq("status", ACTIVE_STATUS)
        );

    return accountQuery.order("desc").paginate({
      cursor,
      numItems: limit,
    });
  },
});

export const getAccountById = mutation({
  args: {
    accountId: v.id("accounts"),
    auth: authPayloadValidator,
  },
  handler: async (ctx, args): Promise<Doc<"accounts">> => {
    await requireSignedRequest(ctx, args, "accounts:getAccountById");
    return requireOwnedAccount(ctx, args.accountId, resolveSystemUserId());
  },
});

async function requireOwnedAccount(
  ctx: MutationCtx,
  accountId: Id<"accounts">,
  expectedUserId: string
): Promise<Doc<"accounts">> {
  const account = await ctx.db.get(accountId);
  if (!account || account.userId !== expectedUserId) {
    throw new ConvexError("Account not found");
  }
  return account;
}

async function countUserAccounts(
  ctx: MutationCtx,
  userId: string
): Promise<number> {
  const activeAccounts = await (ctx.db.query("accounts") as any)
    .withIndex("by_userId_and_status", (queryByStatus: any) =>
      queryByStatus.eq("userId", userId).eq("status", ACTIVE_STATUS)
    )
    .collect();

  const closedAccounts = await (ctx.db.query("accounts") as any)
    .withIndex("by_userId_and_status", (queryByStatus: any) =>
      queryByStatus.eq("userId", userId).eq("status", "closed")
    )
    .collect();

  // Soft-deleted (archived) accounts are excluded from the active account cap.
  return activeAccounts.length + closedAccounts.length;
}

function buildAccountPatch(
  args: Pick<
    {
      name?: string;
      type?: "checking" | "savings" | "cash" | "credit" | "investment" | "bank";
      currency?: string;
      balance?: number;
      status?: "active" | "archived" | "closed";
      note?: string;
    },
    "name" | "type" | "currency" | "balance" | "status" | "note"
  >
): Partial<{
  name: string;
  type: "checking" | "savings" | "cash" | "credit" | "investment" | "bank";
  currency: string;
  balance: number;
  status: "active" | "archived" | "closed";
  note: string | undefined;
}> {
  const patch: Partial<{
    name: string;
    type: "checking" | "savings" | "cash" | "credit" | "investment" | "bank";
    currency: string;
    balance: number;
    status: "active" | "archived" | "closed";
    note: string | undefined;
  }> = {};

  if (args.name !== undefined) {
    patch.name = normalizeAccountName(args.name);
  }
  if (args.type !== undefined) {
    patch.type = args.type;
  }
  if (args.currency !== undefined) {
    patch.currency = normalizeCurrency(args.currency);
  }
  if (args.balance !== undefined) {
    patch.balance = args.balance;
  }
  if (args.status !== undefined) {
    patch.status = args.status;
  }
  if (args.note !== undefined) {
    patch.note = normalizeOptionalNote(args.note);
  }

  return patch;
}

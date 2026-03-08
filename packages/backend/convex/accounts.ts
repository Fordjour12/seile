import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/identity";
import {
  accountNameValidator,
  accountTypeValidator,
  currencyValidator,
  normalizeAccountName,
  normalizeCurrency,
  normalizeOptionalNote,
  normalizeOptionalProviderName,
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
    providerName: v.optional(v.string()),
    type: accountTypeValidator,
    currency: currencyValidator,
    openingBalance: v.optional(v.number()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Doc<"accounts">> => {
    const userId = await requireUserId(ctx);
    const existingCount = await countUserAccounts(ctx, userId);
    if (existingCount >= MAX_ACCOUNT_COUNT) {
      throw new ConvexError("Validation: account limit reached");
    }

    const now = Date.now();
    const providerName = normalizeOptionalProviderName(args.providerName);
    assertProviderNameByType(args.type, providerName);
    const accountId = await ctx.db.insert("accounts", {
      userId,
      name: normalizeAccountName(args.name),
      providerName,
      type: args.type,
      status: ACTIVE_STATUS,
      currency: normalizeCurrency(args.currency),
      balance: args.openingBalance ?? 0,
      note: normalizeOptionalNote(args.note),
      createdAt: now,
      updatedAt: now,
    });

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
    const userId = await requireUserId(ctx);
    const account = await requireOwnedAccount(ctx, args.accountId, userId);
    const patch = buildAccountPatch(args);
    const hasProviderNameUpdate = Object.prototype.hasOwnProperty.call(args, "providerName");
    if (patch.type !== undefined || hasProviderNameUpdate) {
      const nextType = patch.type ?? account.type;
      const nextProviderName = hasProviderNameUpdate ? patch.providerName : account.providerName;
      assertProviderNameByType(nextType, nextProviderName);
    }
    if (Object.keys(patch).length === 0) {
      throw new ConvexError("Validation: no updatable fields provided");
    }

    await ctx.db.patch(account._id, {
      ...patch,
      updatedAt: Date.now(),
    });

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
  },
  handler: async (ctx, args): Promise<boolean> => {
    const userId = await requireUserId(ctx);
    const account = await requireOwnedAccount(ctx, args.accountId, userId);
    await ctx.db.patch(account._id, {
      status: ARCHIVED_STATUS,
      updatedAt: Date.now(),
    });

    return true;
  },
});

export const listAccounts = query({
  args: {
    includeArchived: v.optional(v.boolean()),
    pagination: paginationValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const cursor = args.pagination?.cursor ?? null;
    const limit = Math.min(args.pagination?.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const accountQuery = args.includeArchived
      ? ctx.db.query("accounts").withIndex("by_userId", (queryByUser) => queryByUser.eq("userId", userId))
      : ctx.db.query("accounts").withIndex("by_userId_and_status", (queryByStatus) =>
          queryByStatus.eq("userId", userId).eq("status", ACTIVE_STATUS)
        );

    return accountQuery.order("desc").paginate({
      cursor,
      numItems: limit,
    });
  },
});

export const getAccountById = query({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args): Promise<Doc<"accounts">> => {
    return requireOwnedAccount(ctx, args.accountId, await requireUserId(ctx));
  },
});

async function requireOwnedAccount(
  ctx: MutationCtx | QueryCtx,
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
  const activeAccounts = await ctx.db
    .query("accounts")
    .withIndex("by_userId_and_status", (queryByStatus) =>
      queryByStatus.eq("userId", userId).eq("status", ACTIVE_STATUS)
    )
    .collect();

  const closedAccounts = await ctx.db
    .query("accounts")
    .withIndex("by_userId_and_status", (queryByStatus) =>
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
      providerName?: string;
      type?: "checking" | "savings" | "cash" | "credit" | "investment" | "bank";
      currency?: string;
      balance?: number;
      status?: "active" | "archived" | "closed";
      note?: string;
    },
    "name" | "providerName" | "type" | "currency" | "balance" | "status" | "note"
  >
): Partial<{
  name: string;
  providerName: string | undefined;
  type: "checking" | "savings" | "cash" | "credit" | "investment" | "bank";
  currency: string;
  balance: number;
  status: "active" | "archived" | "closed";
  note: string | undefined;
}> {
  const patch: Partial<{
    name: string;
    providerName: string | undefined;
    type: "checking" | "savings" | "cash" | "credit" | "investment" | "bank";
    currency: string;
    balance: number;
    status: "active" | "archived" | "closed";
    note: string | undefined;
  }> = {};

  if (args.name !== undefined) {
    patch.name = normalizeAccountName(args.name);
  }
  if (args.providerName !== undefined) {
    patch.providerName = normalizeOptionalProviderName(args.providerName);
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

function isProviderRequired(type: "checking" | "savings" | "cash" | "credit" | "investment" | "bank"): boolean {
  return type !== "cash";
}

function assertProviderNameByType(
  type: "checking" | "savings" | "cash" | "credit" | "investment" | "bank",
  providerName: string | undefined
): void {
  if (isProviderRequired(type) && !providerName) {
    throw new ConvexError("Validation: provider name is required for this account type");
  }
}

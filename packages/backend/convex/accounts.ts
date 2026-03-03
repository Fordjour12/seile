import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
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

export const createAccount = mutation({
  args: {
    name: accountNameValidator,
    type: accountTypeValidator,
    currency: currencyValidator,
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
      currency: normalizeCurrency(args.currency),
      balance: 0,
      isArchived: false,
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
    await requireSignedRequest(ctx, args, "accounts:updateAccount");

    const userId = resolveSystemUserId();
    const account = await requireOwnedAccount(ctx, args.accountId, userId);
    const patch = buildAccountPatch(args);
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
    auth: authPayloadValidator,
  },
  handler: async (ctx, args): Promise<boolean> => {
    await requireSignedRequest(ctx, args, "accounts:deleteAccount");

    const userId = resolveSystemUserId();
    const account = await requireOwnedAccount(ctx, args.accountId, userId);
    await ctx.db.patch(account._id, {
      isArchived: true,
      updatedAt: Date.now(),
    });

    return true;
  },
});

export const listAccounts = query({
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
      : ctx.db
          .query("accounts")
          .withIndex("by_userId_and_isArchived", (queryByArchive) =>
            queryByArchive.eq("userId", userId).eq("isArchived", false)
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
    auth: authPayloadValidator,
  },
  handler: async (ctx, args): Promise<Doc<"accounts">> => {
    await requireSignedRequest(ctx, args, "accounts:getAccountById");
    return requireOwnedAccount(ctx, args.accountId, resolveSystemUserId());
  },
});

async function requireOwnedAccount(
  ctx: { db: { get: (id: Id<"accounts">) => Promise<Doc<"accounts"> | null> } },
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
  ctx: {
    db: {
      query: (table: "accounts") => {
        withIndex: (
          indexName: "by_userId",
          cb: (query: { eq: (field: "userId", value: string) => unknown }) => unknown
        ) => { collect: () => Promise<Doc<"accounts">[]> };
      };
    };
  },
  userId: string
): Promise<number> {
  const accounts = await ctx.db
    .query("accounts")
    .withIndex("by_userId", (queryByUser) => queryByUser.eq("userId", userId))
    .collect();

  return accounts.length;
}

function buildAccountPatch(
  args: Pick<
    {
      name?: string;
      type?: "cash" | "bank" | "investment" | "credit";
      currency?: string;
      isArchived?: boolean;
      note?: string;
    },
    "name" | "type" | "currency" | "isArchived" | "note"
  >
): Partial<Pick<Doc<"accounts">, "name" | "type" | "currency" | "isArchived" | "note">> {
  const patch: Partial<Pick<Doc<"accounts">, "name" | "type" | "currency" | "isArchived" | "note">> = {};

  if (args.name !== undefined) {
    patch.name = normalizeAccountName(args.name);
  }
  if (args.type !== undefined) {
    patch.type = args.type;
  }
  if (args.currency !== undefined) {
    patch.currency = normalizeCurrency(args.currency);
  }
  if (args.isArchived !== undefined) {
    patch.isArchived = args.isArchived;
  }
  if (args.note !== undefined) {
    patch.note = normalizeOptionalNote(args.note);
  }

  return patch;
}

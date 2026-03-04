import { v } from "convex/values";

import { internalMutation, mutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { REQUEST_NONCE_RETENTION_MS } from "./lib/security";

const DEFAULT_NONCE_CLEANUP_LIMIT = 500;
const MAX_NONCE_CLEANUP_LIMIT = 2000;

export const backfillAccountsV2 = mutation({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("accounts").collect();

    let updatedCount = 0;

    for (const account of accounts as Doc<"accounts">[]) {
      const nextStatus = account.status ?? (account.isArchived ? "archived" : "active");
      const nextType = account.type === "bank" ? "checking" : account.type;

      const patch: Record<string, unknown> = {};

      if (account.status !== nextStatus) {
        patch.status = nextStatus;
      }

      if (account.type !== nextType && nextType) {
        patch.type = nextType;
      }

      if (Object.keys(patch).length > 0) {
        patch.updatedAt = Date.now();
        await ctx.db.patch(account._id, patch);
        updatedCount += 1;
      }
    }

    return {
      scannedCount: accounts.length,
      updatedCount,
    };
  },
});

export const cleanupExpiredRequestNonces = internalMutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const requestedLimit = Math.floor(args.limit ?? DEFAULT_NONCE_CLEANUP_LIMIT);
    const limit = Math.min(Math.max(requestedLimit, 1), MAX_NONCE_CLEANUP_LIMIT);
    const cutoff = Date.now() - REQUEST_NONCE_RETENTION_MS;

    const expired = await ctx.db
      .query("requestNonces")
      .withIndex("by_createdAt", (query) => query.lt("createdAt", cutoff))
      .order("asc")
      .take(limit);

    for (const nonce of expired) {
      await ctx.db.delete(nonce._id);
    }

    return {
      deletedCount: expired.length,
      cutoff,
      hasMore: expired.length === limit,
    };
  },
});

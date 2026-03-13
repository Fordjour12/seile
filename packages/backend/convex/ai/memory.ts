import { ConvexError, v } from "convex/values";

import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { requireUserId } from "../lib/identity";
import { aiDomainValidator, aiMemoryConfidenceValidator } from "../schema/ai";

export const getMemoryForDomain = query({
  args: {
    domain: aiDomainValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("aiMemory")
      .withIndex("by_user_domain", (q) =>
        q.eq("userId", userId).eq("domain", args.domain),
      )
      .collect();
  },
});

export const getAllMemory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("aiMemory")
      .withIndex("by_user_domain", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getAllMemoryForUser = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("aiMemory")
      .withIndex("by_user_domain", (q) => q.eq("userId", args.userId))
      .collect();

    return rows.sort((left, right) => right.updatedAt - left.updatedAt);
  },
});

export const getMemoryEntryForUserKey = internalQuery({
  args: {
    userId: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiMemory")
      .withIndex("by_user_key", (q) => q.eq("userId", args.userId).eq("key", args.key.trim()))
      .first();
  },
});

export const upsertMemory = mutation({
  args: {
    domain: aiDomainValidator,
    key: v.string(),
    value: v.string(),
    confidence: aiMemoryConfidenceValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const key = args.key.trim();
    const value = args.value.trim();

    if (!key || !value) {
      throw new ConvexError("Memory key and value are required.");
    }

    const existing = await ctx.db
      .query("aiMemory")
      .withIndex("by_user_key", (q) =>
        q.eq("userId", userId).eq("key", key),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        domain: args.domain,
        value,
        confidence: args.confidence,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("aiMemory", {
      userId,
      domain: args.domain,
      key,
      value,
      confidence: args.confidence,
      updatedAt: Date.now(),
    });
  },
});

export const upsertMemoryForUserInternal = internalMutation({
  args: {
    userId: v.string(),
    domain: aiDomainValidator,
    key: v.string(),
    value: v.string(),
    confidence: aiMemoryConfidenceValidator,
  },
  handler: async (ctx, args) => {
    const key = args.key.trim();
    const value = args.value.trim();

    if (!key || !value) {
      throw new ConvexError("Memory key and value are required.");
    }

    const existing = await ctx.db
      .query("aiMemory")
      .withIndex("by_user_key", (q) => q.eq("userId", args.userId).eq("key", key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        domain: args.domain,
        value,
        confidence: args.confidence,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("aiMemory", {
      userId: args.userId,
      domain: args.domain,
      key,
      value,
      confidence: args.confidence,
      updatedAt: Date.now(),
    });
  },
});

export const deleteMemoryKey = mutation({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const entry = await ctx.db
      .query("aiMemory")
      .withIndex("by_user_key", (q) =>
        q.eq("userId", userId).eq("key", args.key.trim()),
      )
      .first();

    if (entry) {
      await ctx.db.delete(entry._id);
    }

    return { ok: true };
  },
});

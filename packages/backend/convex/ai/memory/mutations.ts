import { ConvexError, v } from "convex/values";

import { internalMutation, mutation } from "../../_generated/server";
import { requireUserId } from "../../lib/identity";
import { aiDomainValidator, memoryKindValidator, memorySourceValidator } from "../types";

export const upsertMemory = mutation({
  args: {
    domain: aiDomainValidator,
    kind: memoryKindValidator,
    key: v.string(),
    valueJson: v.string(),
    summary: v.string(),
    confidence: v.optional(v.number()),
    source: v.optional(memorySourceValidator),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await upsertMemoryForUser(ctx, {
      userId,
      domain: args.domain,
      kind: args.kind,
      key: args.key,
      valueJson: args.valueJson,
      summary: args.summary,
      confidence: args.confidence,
      source: args.source ?? "user",
    });
  },
});

export const upsertMemoryInternal = internalMutation({
  args: {
    userId: v.string(),
    domain: aiDomainValidator,
    kind: memoryKindValidator,
    key: v.string(),
    valueJson: v.string(),
    summary: v.string(),
    confidence: v.optional(v.number()),
    source: memorySourceValidator,
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await upsertMemoryForUser(ctx, args);
  },
});

export const touchMemoryInternal = internalMutation({
  args: {
    ids: v.array(v.id("aiMemory")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const touchedAt = Date.now();
    await Promise.all(args.ids.map((id) => ctx.db.patch(id, { lastUsedAt: touchedAt })));
    return null;
  },
});

async function upsertMemoryForUser(
  ctx: {
    db: {
      query: (...args: any[]) => any;
      insert: (...args: any[]) => any;
      patch: (...args: any[]) => any;
      get: (...args: any[]) => any;
    };
  },
  args: {
    userId: string;
    domain: "finance" | "health" | "wellness" | "productivity" | "career" | "relationships" | "faith" | "space" | "planner" | "global";
    kind: "semantic" | "episodic" | "preference" | "constraint";
    key: string;
    valueJson: string;
    summary: string;
    confidence?: number;
    source: "user" | "agent" | "workflow" | "system";
  },
) {
  if (!args.key.trim()) {
    throw new ConvexError("Memory key is required.");
  }
  if (!args.summary.trim()) {
    throw new ConvexError("Memory summary is required.");
  }

  const existing = await ctx.db
    .query("aiMemory")
    .withIndex("by_userId_key", (q: any) => q.eq("userId", args.userId).eq("key", args.key))
    .first();
  const now = Date.now();

  if (existing) {
    await ctx.db.patch(existing._id, {
      domain: args.domain,
      kind: args.kind,
      valueJson: args.valueJson,
      summary: args.summary,
      confidence: args.confidence,
      source: args.source,
      updatedAt: now,
    });
    return await ctx.db.get(existing._id);
  }

  const id = await ctx.db.insert("aiMemory", {
    ...args,
    createdAt: now,
    updatedAt: now,
    lastUsedAt: undefined,
  });
  return await ctx.db.get(id);
}

import { v } from "convex/values";

import { query, internalQuery } from "../../_generated/server";
import { requireUserId } from "../../lib/identity";
import { aiDomainValidator, memoryKindValidator } from "../types";
import { summarizeMemoryForPrompt } from "./summarizer";

export const listMemoryByDomain = query({
  args: {
    domain: v.optional(aiDomainValidator),
    kind: v.optional(memoryKindValidator),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    let rows = args.domain
      ? await ctx.db
          .query("aiMemory")
          .withIndex("by_userId_domain", (q) => q.eq("userId", userId).eq("domain", args.domain!))
          .collect()
      : await ctx.db.query("aiMemory").withIndex("by_userId", (q) => q.eq("userId", userId)).collect();

    if (args.kind) {
      rows = rows.filter((row) => row.kind === args.kind);
    }

    return rows.sort((left, right) => right.updatedAt - left.updatedAt);
  },
});

export const getRelevantMemory = internalQuery({
  args: {
    userId: v.string(),
    domains: v.array(aiDomainValidator),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    records: v.array(v.any()),
    summary: v.string(),
  }),
  handler: async (ctx, args) => {
    const allRows = await ctx.db.query("aiMemory").withIndex("by_userId", (q) => q.eq("userId", args.userId)).collect();
    const domainSet = new Set(args.domains);
    const filtered = allRows
      .filter((row) => row.domain === "global" || domainSet.has(row.domain))
      .sort((left, right) => {
        const rightScore = (right.lastUsedAt ?? right.updatedAt) + (right.confidence ?? 0);
        const leftScore = (left.lastUsedAt ?? left.updatedAt) + (left.confidence ?? 0);
        return rightScore - leftScore;
      })
      .slice(0, Math.max(1, Math.min(args.limit ?? 8, 20)));

    return {
      records: filtered,
      summary: summarizeMemoryForPrompt(filtered),
    };
  },
});

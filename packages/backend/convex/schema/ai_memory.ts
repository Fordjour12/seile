import { defineTable } from "convex/server";
import { v } from "convex/values";

import { aiDomainValidator, memoryKindValidator, memorySourceValidator } from "../ai/types";

export const aiMemoryTable = defineTable({
  userId: v.string(),
  domain: aiDomainValidator,
  kind: memoryKindValidator,
  key: v.string(),
  valueJson: v.string(),
  summary: v.string(),
  confidence: v.optional(v.number()),
  source: memorySourceValidator,
  lastUsedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_domain", ["userId", "domain"])
  .index("by_userId_domain_kind", ["userId", "domain", "kind"])
  .index("by_userId_key", ["userId", "key"]);


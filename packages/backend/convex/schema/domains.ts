import { defineTable } from "convex/server";
import { v } from "convex/values";

import { aiDomainValidator } from "./ai";

export const domainStatusValidator = v.union(
  v.literal("active"),
  v.literal("inactive"),
  v.literal("pinned"),
);

export const userDomainsTable = defineTable({
  userId: v.string(),
  domain: aiDomainValidator,
  status: domainStatusValidator,
  activatedAt: v.optional(v.number()),
  pinnedAt: v.optional(v.number()),
  deactivatedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_domain", ["userId", "domain"]);

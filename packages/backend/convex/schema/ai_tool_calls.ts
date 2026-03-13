import { defineTable } from "convex/server";
import { v } from "convex/values";

import { aiDomainValidator, approvalModeValidator } from "../ai/types";

export const aiToolCallOutcomeValidator = v.union(
  v.literal("succeeded"),
  v.literal("failed"),
  v.literal("approval_requested"),
);

export const aiToolCallsTable = defineTable({
  userId: v.string(),
  runId: v.optional(v.id("aiRuns")),
  domain: aiDomainValidator,
  toolName: v.string(),
  actionType: v.optional(v.string()),
  approvalMode: approvalModeValidator,
  outcome: aiToolCallOutcomeValidator,
  error: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_runId", ["runId"])
  .index("by_domain", ["domain"]);

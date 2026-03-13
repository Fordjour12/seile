import { defineTable } from "convex/server";
import { v } from "convex/values";

import { aiDomainValidator, approvalModeValidator, runSourceValidator } from "../ai/types";

export const aiApprovalStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("rejected"),
  v.literal("failed"),
  v.literal("expired"),
);

export const aiApprovalsTable = defineTable({
  userId: v.string(),
  threadId: v.optional(v.string()),
  runId: v.optional(v.id("aiRuns")),
  domain: aiDomainValidator,
  actionType: v.string(),
  title: v.string(),
  preview: v.string(),
  payloadJson: v.string(),
  approvalMode: approvalModeValidator,
  status: aiApprovalStatusValidator,
  destructive: v.boolean(),
  confirmationHint: v.optional(v.string()),
  source: runSourceValidator,
  confirmedAt: v.optional(v.number()),
  rejectedAt: v.optional(v.number()),
  failedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_status", ["userId", "status"])
  .index("by_runId", ["runId"])
  .index("by_threadId", ["threadId"]);


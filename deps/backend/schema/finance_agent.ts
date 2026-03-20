import { defineTable } from "convex/server";
import { v } from "convex/values";

export const financeAgentStateTable = defineTable({
  userId: v.string(),
  agentEnabled: v.boolean(),
  activeThreadId: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_userId", ["userId"]);

export const financeAgentAuditLogTable = defineTable({
  userId: v.string(),
  threadId: v.optional(v.string()),
  proposalId: v.string(),
  actionType: v.string(),
  actionStatus: v.union(
    v.literal("confirmed"),
    v.literal("rejected"),
    v.literal("failed"),
  ),
  preview: v.string(),
  payloadJson: v.string(),
  createdAt: v.number(),
}).index("by_userId_createdAt", ["userId", "createdAt"]);

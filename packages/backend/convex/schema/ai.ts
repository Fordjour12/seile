import { defineTable } from "convex/server";
import { v } from "convex/values";

export const aiDomainValidator = v.union(
  v.literal("finance"),
  v.literal("health"),
  v.literal("wellness"),
  v.literal("productivity"),
  v.literal("career"),
  v.literal("relationships"),
  v.literal("faith"),
  v.literal("space"),
);

export const approvalModeValidator = v.union(
  v.literal("auto"),
  v.literal("confirm"),
  v.literal("confirmText"),
  v.literal("restricted"),
);

export const aiMemoryConfidenceValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);

export const approvalRequestStatusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("expired"),
  v.literal("failed"),
);

export const aiMemoryTable = defineTable({
  userId: v.string(),
  domain: aiDomainValidator,
  key: v.string(),
  value: v.string(),
  confidence: aiMemoryConfidenceValidator,
  updatedAt: v.number(),
})
  .index("by_user_domain", ["userId", "domain"])
  .index("by_user_key", ["userId", "key"]);

export const approvalRequestsTable = defineTable({
  userId: v.string(),
  requestId: v.string(),
  actions: v.array(
    v.object({
      toolName: v.string(),
      approvalMode: approvalModeValidator,
      argsJson: v.string(),
      domain: aiDomainValidator,
      previewText: v.string(),
      expectedConfirmation: v.optional(v.string()),
    }),
  ),
  status: approvalRequestStatusValidator,
  createdAt: v.number(),
  expiresAt: v.number(),
  resolvedAt: v.optional(v.number()),
  error: v.optional(v.string()),
})
  .index("by_user_status", ["userId", "status"])
  .index("by_requestId", ["requestId"]);

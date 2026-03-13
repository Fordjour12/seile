import { defineTable } from "convex/server";
import { v } from "convex/values";

import {
  aiDomainValidator,
  aiIntentValidator,
  aiResponseKindValidator,
  runSourceValidator,
} from "../ai/types";

export const aiRunStatusValidator = v.union(
  v.literal("started"),
  v.literal("completed"),
  v.literal("failed"),
);

export const aiRunsTable = defineTable({
  userId: v.string(),
  threadId: v.optional(v.string()),
  source: runSourceValidator,
  surface: v.optional(v.string()),
  text: v.string(),
  intent: aiIntentValidator,
  domains: v.array(aiDomainValidator),
  agentName: v.string(),
  model: v.optional(v.string()),
  responseKind: v.optional(aiResponseKindValidator),
  status: aiRunStatusValidator,
  error: v.optional(v.string()),
  startedAt: v.number(),
  completedAt: v.optional(v.number()),
  latencyMs: v.optional(v.number()),
})
  .index("by_userId", ["userId"])
  .index("by_userId_startedAt", ["userId", "startedAt"])
  .index("by_threadId", ["threadId"])
  .index("by_status", ["status"]);


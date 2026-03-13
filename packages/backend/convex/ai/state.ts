import { v } from "convex/values";

import { internalMutation, internalQuery } from "../_generated/server";
import { aiDomainValidator, aiIntentValidator, runSourceValidator } from "./types";

export const createRunInternal = internalMutation({
  args: {
    userId: v.string(),
    threadId: v.optional(v.string()),
    source: runSourceValidator,
    surface: v.optional(v.string()),
    text: v.string(),
    intent: aiIntentValidator,
    domains: v.array(aiDomainValidator),
    agentName: v.string(),
  },
  returns: v.id("aiRuns"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiRuns", {
      ...args,
      status: "started",
      startedAt: Date.now(),
      completedAt: undefined,
      latencyMs: undefined,
      responseKind: undefined,
      model: undefined,
      error: undefined,
    });
  },
});

export const completeRunInternal = internalMutation({
  args: {
    runId: v.id("aiRuns"),
    responseKind: v.union(
      v.literal("message"),
      v.literal("plan"),
      v.literal("approval_request"),
      v.literal("suggestions"),
      v.literal("review"),
    ),
    latencyMs: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.runId, {
      status: "completed",
      responseKind: args.responseKind,
      completedAt: Date.now(),
      latencyMs: args.latencyMs,
    });
    return null;
  },
});

export const failRunInternal = internalMutation({
  args: {
    runId: v.id("aiRuns"),
    error: v.string(),
    latencyMs: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.runId, {
      status: "failed",
      error: args.error,
      completedAt: Date.now(),
      latencyMs: args.latencyMs,
    });
    return null;
  },
});

export const logToolCallInternal = internalMutation({
  args: {
    userId: v.string(),
    runId: v.optional(v.id("aiRuns")),
    domain: aiDomainValidator,
    toolName: v.string(),
    actionType: v.optional(v.string()),
    approvalMode: v.union(v.literal("auto"), v.literal("confirm"), v.literal("restricted")),
    outcome: v.union(
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("approval_requested"),
    ),
    error: v.optional(v.string()),
  },
  returns: v.id("aiToolCalls"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiToolCalls", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const createApprovalInternal = internalMutation({
  args: {
    userId: v.string(),
    threadId: v.optional(v.string()),
    runId: v.optional(v.id("aiRuns")),
    domain: aiDomainValidator,
    actionType: v.string(),
    title: v.string(),
    preview: v.string(),
    payloadJson: v.string(),
    approvalMode: v.union(v.literal("auto"), v.literal("confirm"), v.literal("restricted")),
    destructive: v.boolean(),
    source: runSourceValidator,
  },
  returns: v.id("aiApprovals"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiApprovals", {
      ...args,
      status: "pending",
      confirmationHint: "Explicit confirmation required.",
      confirmedAt: undefined,
      rejectedAt: undefined,
      failedAt: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getApprovalInternal = internalQuery({
  args: {
    approvalId: v.id("aiApprovals"),
    userId: v.string(),
  },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const approval = await ctx.db.get(args.approvalId);
    if (!approval || approval.userId !== args.userId) {
      return null;
    }
    return approval;
  },
});

export const updateApprovalStatusInternal = internalMutation({
  args: {
    approvalId: v.id("aiApprovals"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("rejected"),
      v.literal("failed"),
      v.literal("expired"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.approvalId, {
      status: args.status,
      updatedAt: now,
      confirmedAt: args.status === "confirmed" ? now : undefined,
      rejectedAt: args.status === "rejected" ? now : undefined,
      failedAt: args.status === "failed" ? now : undefined,
    });
    return null;
  },
});

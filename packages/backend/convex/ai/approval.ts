import { ConvexError, v } from "convex/values";

import { internalMutation, internalQuery, query } from "../_generated/server";
import { requireUserId } from "../lib/identity";
import { aiDomainValidator, approvalModeValidator } from "../schema/ai";
import type { PendingAction } from "./types";

const approvalActionValidator = v.object({
  toolName: v.string(),
  approvalMode: approvalModeValidator,
  argsJson: v.string(),
  domain: aiDomainValidator,
  previewText: v.string(),
});

export const createApprovalRequestInternal = internalMutation({
  args: {
    userId: v.string(),
    requestId: v.optional(v.string()),
    actions: v.array(approvalActionValidator),
  },
  handler: async (ctx, args) => {
    const requestId =
      args.requestId ??
      `${args.userId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const expiresAt = Date.now() + 1000 * 60 * 30;
    await ctx.db.insert("approvalRequests", {
      userId: args.userId,
      requestId,
      actions: args.actions,
      status: "pending",
      createdAt: Date.now(),
      expiresAt,
      resolvedAt: undefined,
    });

    return { requestId, expiresAt };
  },
});

export const getPendingApprovals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db
      .query("approvalRequests")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "pending"),
      )
      .collect();

    return rows.map((row) => ({
      requestId: row.requestId,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
      actions: row.actions.map(deserializePendingAction),
    }));
  },
});

export const getApprovalRequestByRequestId = internalQuery({
  args: {
    requestId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("approvalRequests")
      .withIndex("by_requestId", (q) => q.eq("requestId", args.requestId))
      .first();
  },
});

export const markApprovalRequestResolved = internalMutation({
  args: {
    requestId: v.string(),
    status: v.union(
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("expired"),
    ),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("approvalRequests")
      .withIndex("by_requestId", (q) => q.eq("requestId", args.requestId))
      .first();

    if (!request) {
      throw new ConvexError("Approval request not found.");
    }

    await ctx.db.patch(request._id, {
      status: args.status,
      resolvedAt: Date.now(),
    });
  },
});

export function serializePendingActions(actions: PendingAction[]) {
  return actions.map((action) => ({
    toolName: action.toolName,
    approvalMode: action.approvalMode,
    argsJson: JSON.stringify(action.args),
    domain: action.domain,
    previewText: action.previewText,
  }));
}

export function deserializePendingAction(action: {
  toolName: string;
  approvalMode: "auto" | "confirm" | "restricted";
  argsJson: string;
  domain:
    | "finance"
    | "health"
    | "wellness"
    | "productivity"
    | "career"
    | "relationships"
    | "faith"
    | "space";
  previewText: string;
}) {
  return {
    toolName: action.toolName,
    approvalMode: action.approvalMode,
    args: JSON.parse(action.argsJson) as Record<string, unknown>,
    domain: action.domain,
    previewText: action.previewText,
  } satisfies PendingAction;
}

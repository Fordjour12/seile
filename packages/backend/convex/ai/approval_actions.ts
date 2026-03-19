"use node";

import { ConvexError, v } from "convex/values";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { requireUserId } from "../lib/identity";
import { deserializePendingAction } from "./approval";
import { executeFaithPendingAction } from "./tools/faith";
import { executeFinancePendingAction } from "./tools/finance";
import { executeHealthPendingAction } from "./tools/health";
import type { PendingAction } from "./types";

export const resolveApprovalRequest = action({
  args: {
    requestId: v.string(),
    approved: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const request = await ctx.runQuery(
      internal.ai.approval.getApprovalRequestByRequestId,
      {
        requestId: args.requestId,
      },
    );

    if (!request || request.userId !== userId) {
      throw new ConvexError("Approval request not found.");
    }

    if (request.status !== "pending") {
      throw new ConvexError("Approval request is no longer pending.");
    }

    if (Date.now() > request.expiresAt) {
      await ctx.runMutation(internal.ai.approval.markApprovalRequestResolved, {
        requestId: args.requestId,
        status: "expired",
      });
      throw new ConvexError("Approval request expired.");
    }

    if (!args.approved) {
      await ctx.runMutation(internal.ai.approval.markApprovalRequestResolved, {
        requestId: args.requestId,
        status: "rejected",
      });
      return { approved: false };
    }

    try {
      for (const actionRow of request.actions) {
        await executePendingAction(ctx, deserializePendingAction(actionRow));
      }
    } catch (error) {
      await ctx.runMutation(internal.ai.approval.markApprovalRequestResolved, {
        requestId: args.requestId,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }

    await ctx.runMutation(internal.ai.approval.markApprovalRequestResolved, {
      requestId: args.requestId,
      status: "approved",
    });
    return { approved: true };
  },
});

async function executePendingAction(ctx: any, action: PendingAction) {
  switch (action.domain) {
    case "finance":
      return await executeFinancePendingAction(ctx, action);
    case "health":
      return await executeHealthPendingAction(ctx, action);
    case "wellness":
      return await executeWellnessPendingAction(ctx, action);
    case "productivity":
      return await executeProductivityPendingAction(ctx, action);
    case "career":
      return await executeCareerPendingAction(ctx, action);
    case "relationships":
      return await executeRelationshipsPendingAction(ctx, action);
    case "faith":
      return await executeFaithPendingAction(ctx, action);
    case "space":
      return await executeSpacePendingAction(ctx, action);
  }
}

async function executeWellnessPendingAction(_ctx: any, action: PendingAction) {
  throw new ConvexError(
    `Unsupported wellness approval action: ${action.toolName}`,
  );
}

async function executeProductivityPendingAction(_ctx: any, action: PendingAction) {
  throw new ConvexError(
    `Unsupported productivity approval action: ${action.toolName}`,
  );
}

async function executeCareerPendingAction(_ctx: any, action: PendingAction) {
  throw new ConvexError(
    `Unsupported career approval action: ${action.toolName}`,
  );
}

async function executeRelationshipsPendingAction(_ctx: any, action: PendingAction) {
  throw new ConvexError(
    `Unsupported relationships approval action: ${action.toolName}`,
  );
}

async function executeSpacePendingAction(_ctx: any, action: PendingAction) {
  throw new ConvexError(`Unsupported space approval action: ${action.toolName}`);
}

"use node";

import { ConvexError, v } from "convex/values";

import { action } from "../_generated/server";
import type { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { requireUserId } from "../lib/identity";
import {
  createFinanceThread,
} from "../ai/agents/finance";
import {
  confirmPendingAIActionForUser,
  mapPendingActionsToFinanceProposals,
  runAIForUser,
} from "../ai/runRouter";
import { executeConfirmedFinanceProposal } from "../ai/executeWithApproval";
import { financeProposalSchema } from "../ai/types";

const internalApi = internal as unknown as Record<string, Record<string, any>>;

export const ensureFinanceAgentChatThread = action({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const threadId = await ensureFinanceAgentThreadForUser(ctx, userId);
    return { threadId };
  },
});

export const sendFinanceAgentMessage = action({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const text = args.text.trim();
    if (!text) {
      throw new ConvexError("Finance agent message cannot be empty.");
    }

    const threadId = await ensureFinanceAgentThreadForUser(ctx, userId);
    const result = await runAIForUser(ctx, {
      userId,
      text,
      threadId,
      source: "finance_chat",
      preferredDomains: ["finance"],
      surface: "finance_chat",
      persistToThread: true,
    });

    return {
      threadId,
      userMessageId: result.userMessageId,
      assistantMessageId: result.assistantMessageId,
      text: result.text,
      proposedActions:
        result.kind === "approval_request"
          ? mapPendingActionsToFinanceProposals(result.pendingActions)
          : [],
    };
  },
});

export const executeFinanceAgentProposal = action({
  args: {
    proposalJson: v.string(),
    confirmationText: v.string(),
    threadId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const proposal = financeProposalSchema.parse(JSON.parse(args.proposalJson));

    try {
      let approval: any = null;
      try {
        approval = await ctx.runQuery(internalApi["ai/state"].getApprovalInternal, {
          approvalId: proposal.proposalId,
          userId,
        });
      } catch {
        approval = null;
      }
      const result = approval
        ? await confirmPendingAIActionForUser(ctx, {
            userId,
            approvalId: approval._id,
            confirmationText: args.confirmationText,
          })
        : await executeConfirmedFinanceProposal(ctx, {
            proposalJson: args.proposalJson,
            confirmationText: args.confirmationText,
          });
      await ctx.runMutation(
        internalApi["finance_agent/mutations"].logConfirmedFinanceAction,
        {
          userId,
          threadId: args.threadId,
          proposalId: proposal.proposalId,
          actionType: proposal.actionType,
          actionStatus: "confirmed",
          preview: proposal.preview,
          payloadJson: proposal.payloadJson,
        },
      );
      return { ok: true, result };
    } catch (error) {
      await ctx.runMutation(
        internalApi["finance_agent/mutations"].logConfirmedFinanceAction,
        {
          userId,
          threadId: args.threadId,
          proposalId: proposal.proposalId,
          actionType: proposal.actionType,
          actionStatus: "failed",
          preview: proposal.preview,
          payloadJson: proposal.payloadJson,
        },
      );
      throw error;
    }
  },
});

async function ensureFinanceAgentThreadForUser(ctx: ActionCtx, userId: string) {
  const state = await ctx.runMutation(
    internalApi["finance_agent/mutations"].getOrCreateFinanceAgentState,
    { userId },
  );
  if (state.activeThreadId) {
    return state.activeThreadId;
  }

  const threadId = await createFinanceThread(ctx, {
    userId,
    title: "Finance agent",
    summary: "Analyze finances and propose confirmed actions.",
  });

  await ctx.runMutation(
    internalApi["finance_agent/mutations"].setActiveFinanceThread,
    {
      userId,
      activeThreadId: threadId,
    },
  );

  return threadId;
}

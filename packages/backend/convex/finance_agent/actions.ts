"use node";

import { ConvexError, v } from "convex/values";

import { action } from "../_generated/server";
import type { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { requireUserId } from "../lib/identity";
import {
  createFinanceAgentThread,
  ensureFinanceAgentConfigured,
  financeAgent,
} from "./agent";
import {
  financeAssistantResponseSchema,
  financeProposalSchema,
} from "./validators";
import { executeConfirmedFinanceProposal } from "./tools";

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
    ensureFinanceAgentConfigured();
    const userId = await requireUserId(ctx);
    const text = args.text.trim();
    if (!text) {
      throw new ConvexError("Finance agent message cannot be empty.");
    }

    const threadId = await ensureFinanceAgentThreadForUser(ctx, userId);
    const threadState = await financeAgent.continueThread(ctx, { threadId, userId });
    const context = await ctx.runQuery(
      internalApi["finance_agent/queries"].getFinanceAgentContext,
      { userId },
    );

    const structured = await financeAgent.generateObject(
      ctx,
      { threadId },
      {
        prompt: buildFinanceAgentProposalPrompt({ userText: text, context: context.summary }),
        schema: financeAssistantResponseSchema,
      },
    );

    const textResult = await threadState.thread.generateText({
      prompt: buildFinanceAgentReplyPrompt({
        userText: text,
        context: context.summary,
        suggestedReply: structured.object.reply,
        proposedActions: structured.object.proposedActions,
      }),
    });

    const savedMessages = textResult.savedMessages ?? [];
    let assistantMessageId: string | undefined;
    for (let index = savedMessages.length - 1; index >= 0; index -= 1) {
      const message = savedMessages[index];
      if (message.message?.role === "assistant") {
        assistantMessageId = message._id;
        break;
      }
    }

    return {
      threadId,
      userMessageId: textResult.promptMessageId,
      assistantMessageId,
      text: textResult.text,
      proposedActions: structured.object.proposedActions.map((proposal) =>
        financeProposalSchema.parse(proposal),
      ),
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
      const result = await executeConfirmedFinanceProposal(ctx, {
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

  const threadId = await createFinanceAgentThread(ctx, {
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

function buildFinanceAgentProposalPrompt(input: {
  userText: string;
  context: any;
}) {
  return [
    "You are preparing a finance-agent response.",
    "Return JSON only.",
    "If the user asks to change finance data, include proposedActions.",
    "Use exact entity ids from the provided context when an existing record is referenced.",
    "Do not propose planner actions.",
    `Finance context: ${JSON.stringify(input.context)}`,
    `User message: ${input.userText}`,
  ].join("\n\n");
}

function buildFinanceAgentReplyPrompt(input: {
  userText: string;
  context: any;
  suggestedReply: string;
  proposedActions: Array<{
    title: string;
    preview: string;
    actionType: string;
  }>;
}) {
  return [
    "You are replying inside an ongoing finance-agent chat.",
    "Reply directly and concisely.",
    "If proposed actions exist, explain that they require explicit confirmation.",
    "Do not say that a mutation already ran.",
    `Finance context: ${JSON.stringify(input.context)}`,
    `User message: ${input.userText}`,
    `Suggested answer: ${input.suggestedReply}`,
    input.proposedActions.length > 0
      ? `Proposed actions: ${JSON.stringify(input.proposedActions)}`
      : "No proposed actions.",
  ].join("\n\n");
}

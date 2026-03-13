"use node";

import { z } from "zod";

import type { ActionCtx } from "../../_generated/server";
import type { PendingAction } from "../types";
import { financeCoachAgent } from "../agents/finance";
import { executeConfirmedFinanceProposal } from "../../finance_agent/tools";
import { financeAssistantResponseSchema, financeProposalSchema } from "../../finance_agent/validators";

export async function analyzeFinanceRequest(
  ctx: ActionCtx,
  input: {
    threadId?: string;
    userId: string;
    userMessage: string;
    snapshot: unknown;
    memory: unknown;
  },
) {
  const thread = input.threadId
    ? { threadId: input.threadId }
    : await financeCoachAgent.createThread(ctx, {
        userId: input.userId,
        title: "Finance AI",
        summary: "Finance specialist conversation",
      });

  const structured = await financeCoachAgent.generateObject(ctx, thread, {
    prompt: [
      "You are analyzing a finance request for a Life OS assistant.",
      "Return JSON only.",
      "If the user is asking to mutate finance data, propose up to 3 confirm-gated actions.",
      "If the user is only asking a question, return no proposed actions.",
      `Finance snapshot: ${JSON.stringify(input.snapshot)}`,
      `Memory: ${JSON.stringify(input.memory)}`,
      `User message: ${input.userMessage}`,
    ].join("\n\n"),
    schema: financeAssistantResponseSchema,
  });

  const actions: PendingAction[] = structured.object.proposedActions.map((proposal) => {
    const parsed = financeProposalSchema.parse(proposal);

    return {
      toolName: parsed.actionType,
      approvalMode: "confirm",
      args: parsed as unknown as Record<string, unknown>,
      domain: "finance",
      previewText: parsed.preview,
    };
  });

  return {
    reply: structured.object.reply,
    actions,
  };
}

export async function executeFinancePendingAction(
  ctx: ActionCtx,
  action: PendingAction,
) {
  const proposal = financeProposalSchema.parse(action.args);
  return await executeConfirmedFinanceProposal(ctx, {
    proposalJson: JSON.stringify(proposal),
    confirmationText: proposal.destructive ? "APPROVE" : "approved",
  });
}

export const financeProposalEnvelopeSchema = z.object({
  reply: z.string().min(1),
  proposedActions: z.array(financeProposalSchema).max(3).default([]),
});

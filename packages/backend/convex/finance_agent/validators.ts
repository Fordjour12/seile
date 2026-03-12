import { z } from "zod";

export const financeActionTypeSchema = z.enum([
  "account.create",
  "account.update",
  "account.archive",
  "transaction.create",
  "transaction.update",
  "transaction.reverse",
  "budgetPeriod.create",
  "budgetPeriod.update",
  "budgetPeriod.close",
  "budgetPeriod.archive",
  "budgetEnvelope.create",
  "budgetEnvelope.update",
  "budgetEnvelope.delete",
  "debt.create",
  "debt.update",
  "debt.archive",
  "savings.create",
  "savings.update",
  "savings.archive",
  "recurring.create",
  "recurring.update",
  "recurring.pause",
  "recurring.resume",
  "recurring.delete",
  "subscription.create",
  "subscription.cancel",
]);

export const financeProposalSchema = z.object({
  proposalId: z.string().min(1),
  actionType: financeActionTypeSchema,
  title: z.string().min(1),
  preview: z.string().min(1),
  payloadJson: z.string().min(2),
  destructive: z.boolean().default(false),
  requiresConfirmation: z.boolean().default(true),
});

export const financeAssistantResponseSchema = z.object({
  reply: z.string().min(1),
  proposedActions: z.array(financeProposalSchema).max(3).default([]),
});

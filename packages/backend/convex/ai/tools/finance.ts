"use node";

import { z } from "zod";

import { api } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import type { PendingAction } from "../types";
import { financeCoachAgent } from "../agents/finance";

const apiAny = api as any;
const dateInputSchema = z.union([
  z.number(),
  z.string().transform((value) => new Date(value).getTime()),
]);

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
  expectedConfirmation: z.string().optional(),
});

export const financeAssistantResponseSchema = z.object({
  reply: z.string().min(1),
  proposedActions: z.array(financeProposalSchema).max(3).default([]),
});

const accountCreatePayloadSchema = z.object({
  name: z.string(),
  providerName: z.string().optional(),
  type: z.enum(["checking", "savings", "cash", "credit", "investment", "bank"]),
  currency: z.string().default("GHS"),
  openingBalance: z.number().optional(),
  note: z.string().optional(),
});

const accountUpdatePayloadSchema = z.object({
  accountId: z.string(),
  name: z.string().optional(),
  providerName: z.string().optional(),
  type: z
    .enum(["checking", "savings", "cash", "credit", "investment", "bank"])
    .optional(),
  currency: z.string().optional(),
  balance: z.number().optional(),
  status: z.enum(["active", "archived", "closed"]).optional(),
  note: z.string().optional(),
});

const transactionCreatePayloadSchema = z.object({
  kind: z.enum(["expense", "income", "transfer", "adjustment"]),
  amount: z.number(),
  currency: z.string(),
  accountId: z.string().optional(),
  fromAccountId: z.string().optional(),
  toAccountId: z.string().optional(),
  categoryId: z.string().optional(),
  note: z.string().optional(),
  occurredAt: dateInputSchema.optional(),
});

const transactionUpdatePayloadSchema = z.object({
  id: z.string(),
  categoryId: z.string().optional(),
  note: z.string().optional(),
  occurredAt: dateInputSchema.optional(),
});

const budgetPeriodCreatePayloadSchema = z.object({
  year: z.number(),
  month: z.number(),
  currency: z.string().optional(),
  incomeTarget: z.number(),
  notes: z.string().optional(),
});

const budgetPeriodUpdatePayloadSchema = z.object({
  id: z.string(),
  incomeTarget: z.number().optional(),
  notes: z.string().optional(),
});

const budgetEnvelopeCreatePayloadSchema = z.object({
  periodId: z.string(),
  categoryId: z.string(),
  allocatedAmount: z.number(),
  rolloverEnabled: z.boolean().optional(),
  sortOrder: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  notes: z.string().optional(),
});

const budgetEnvelopeUpdatePayloadSchema = z.object({
  id: z.string(),
  allocatedAmount: z.number().optional(),
  rolloverEnabled: z.boolean().optional(),
  sortOrder: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  notes: z.string().optional(),
});

const debtCreatePayloadSchema = z.object({
  name: z.string(),
  debtType: z.enum(["installment", "revolving"]),
  status: z.enum(["draft", "active", "archived"]).optional(),
  currency: z.string().optional(),
  originalBalance: z.number(),
  currentBalance: z.number(),
  monthlyDue: z.number(),
  apr: z.number().optional(),
  nextDueDate: dateInputSchema.optional(),
  linkedAccountId: z.string().optional(),
  linkedRecurringId: z.string().optional(),
  payoffStrategy: z.enum(["avalanche", "snowball", "custom"]).optional(),
  priorityRank: z.string().optional(),
  notes: z.string().optional(),
});

const debtUpdatePayloadSchema = debtCreatePayloadSchema
  .partial()
  .extend({ id: z.string() });

const savingsCreatePayloadSchema = z.object({
  name: z.string(),
  status: z.enum(["draft", "active", "completed", "archived"]).optional(),
  currency: z.string().optional(),
  targetAmount: z.number(),
  currentAmount: z.number(),
  monthlyContribution: z.number().optional(),
  targetDate: dateInputSchema.optional(),
  linkedAccountId: z.string().optional(),
  linkedRecurringId: z.string().optional(),
  categoryId: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  priorityRank: z.string().optional(),
  notes: z.string().optional(),
});

const savingsUpdatePayloadSchema = savingsCreatePayloadSchema
  .partial()
  .extend({ id: z.string() });

const recurringCreatePayloadSchema = z.object({
  kind: z.enum(["expense", "income", "transfer"]),
  amount: z.number(),
  currency: z.string(),
  accountId: z.string().optional(),
  fromAccountId: z.string().optional(),
  toAccountId: z.string().optional(),
  categoryId: z.string().optional(),
  note: z.string().optional(),
  scheduleType: z.enum(["daily", "weekly", "monthly", "yearly"]),
  interval: z.number(),
  dayOfMonth: z.number().optional(),
  dayOfWeek: z.number().optional(),
  startAt: dateInputSchema,
  endAt: dateInputSchema.optional(),
  isSubscription: z.boolean().optional(),
});

const recurringUpdatePayloadSchema = z.object({
  id: z.string(),
  amount: z.number().optional(),
  categoryId: z.string().optional(),
  note: z.string().optional(),
  endAt: dateInputSchema.optional(),
  dayOfMonth: z.number().optional(),
  dayOfWeek: z.number().optional(),
  interval: z.number().optional(),
});

const subscriptionCreatePayloadSchema = z.object({
  serviceName: z.string(),
  serviceUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  amount: z.number(),
  currency: z.string(),
  accountId: z.string(),
  categoryId: z.string().optional(),
  scheduleType: z.enum(["weekly", "monthly", "yearly"]),
  startAt: dateInputSchema,
  endAt: dateInputSchema.optional(),
  status: z.enum(["trial", "active", "cancelled", "paused"]),
  trialEndsAt: dateInputSchema.optional(),
  billingProvider: z.string().optional(),
  externalSubscriptionId: z.string().optional(),
});

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
  const threadId = input.threadId ?? thread.threadId;

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
    const expectedConfirmation = getExpectedConfirmation(parsed);

    return {
      toolName: parsed.actionType,
      approvalMode: expectedConfirmation ? "confirmText" : "confirm",
      args: parsed as unknown as Record<string, unknown>,
      domain: "finance",
      previewText: parsed.preview,
      expectedConfirmation,
    };
  });

  return {
    threadId,
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
    confirmationText:
      action.expectedConfirmation ??
      proposal.expectedConfirmation ??
      getExpectedConfirmation(proposal) ??
      "CONFIRM",
  });
}

export const financeProposalEnvelopeSchema = z.object({
  reply: z.string().min(1),
  proposedActions: z.array(financeProposalSchema).max(3).default([]),
});

export async function executeConfirmedFinanceProposal(
  ctx: ActionCtx,
  input: {
    proposalJson: string;
    confirmationText: string;
  },
) {
  const proposal = financeProposalSchema.parse(JSON.parse(input.proposalJson));
  assertConfirmationText(
    proposal.expectedConfirmation ?? getExpectedConfirmation(proposal),
    input.confirmationText,
  );

  switch (proposal.actionType) {
    case "account.create": {
      return await ctx.runMutation(
        apiAny.finance.accounts.createAccount,
        accountCreatePayloadSchema.parse(JSON.parse(proposal.payloadJson)),
      );
    }
    case "account.update": {
      const payload = accountUpdatePayloadSchema.parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(apiAny.finance.accounts.updateAccount, {
        ...payload,
        accountId: payload.accountId as Id<"accounts">,
      });
    }
    case "account.archive": {
      const payload = z.object({ accountId: z.string() }).parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(apiAny.finance.accounts.deleteAccount, {
        accountId: payload.accountId as Id<"accounts">,
      });
    }
    case "transaction.create": {
      const payload = transactionCreatePayloadSchema.parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(
        apiAny.finance.transactions.mutations.createTransaction,
        {
          ...payload,
          accountId: payload.accountId as Id<"accounts"> | undefined,
          fromAccountId: payload.fromAccountId as Id<"accounts"> | undefined,
          toAccountId: payload.toAccountId as Id<"accounts"> | undefined,
          categoryId: payload.categoryId as Id<"categories"> | undefined,
        },
      );
    }
    case "transaction.update": {
      const payload = transactionUpdatePayloadSchema.parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(
        apiAny.finance.transactions.mutations.updateTransaction,
        {
          id: payload.id as Id<"transactions">,
          categoryId: payload.categoryId as Id<"categories"> | undefined,
          note: payload.note,
          occurredAt: payload.occurredAt,
        },
      );
    }
    case "transaction.reverse": {
      const payload = z.object({ id: z.string() }).parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(
        apiAny.finance.transactions.mutations.reverseTransaction,
        {
          id: payload.id as Id<"transactions">,
        },
      );
    }
    case "budgetPeriod.create": {
      return await ctx.runMutation(
        apiAny.finance.budget.mutations.createBudgetPeriod,
        budgetPeriodCreatePayloadSchema.parse(JSON.parse(proposal.payloadJson)),
      );
    }
    case "budgetPeriod.update": {
      const payload = budgetPeriodUpdatePayloadSchema.parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(apiAny.finance.budget.mutations.updateBudgetPeriod, {
        ...payload,
        id: payload.id as Id<"budgetPeriods">,
      });
    }
    case "budgetPeriod.close": {
      const payload = z.object({ id: z.string() }).parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(apiAny.finance.budget.mutations.closeBudgetPeriod, {
        id: payload.id as Id<"budgetPeriods">,
      });
    }
    case "budgetPeriod.archive": {
      const payload = z.object({ id: z.string() }).parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(
        apiAny.finance.budget.mutations.archiveBudgetPeriod,
        {
          id: payload.id as Id<"budgetPeriods">,
        },
      );
    }
    case "budgetEnvelope.create": {
      const payload = budgetEnvelopeCreatePayloadSchema.parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(apiAny.finance.budget.mutations.createEnvelope, {
        ...payload,
        periodId: payload.periodId as Id<"budgetPeriods">,
        categoryId: payload.categoryId as Id<"categories">,
      });
    }
    case "budgetEnvelope.update": {
      const payload = budgetEnvelopeUpdatePayloadSchema.parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(apiAny.finance.budget.mutations.updateEnvelope, {
        ...payload,
        id: payload.id as Id<"budgetEnvelopes">,
      });
    }
    case "budgetEnvelope.delete": {
      const payload = z.object({ id: z.string() }).parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(apiAny.finance.budget.mutations.deleteEnvelope, {
        id: payload.id as Id<"budgetEnvelopes">,
      });
    }
    case "debt.create": {
      const payload = debtCreatePayloadSchema.parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(apiAny.finance.debt.mutations.createDebtPlan, {
        ...payload,
        linkedAccountId: payload.linkedAccountId as Id<"accounts"> | undefined,
        linkedRecurringId:
          payload.linkedRecurringId as Id<"recurringTransactions"> | undefined,
      });
    }
    case "debt.update": {
      const payload = debtUpdatePayloadSchema.parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(apiAny.finance.debt.mutations.updateDebtPlan, {
        ...payload,
        id: payload.id as Id<"debtPlans">,
        linkedAccountId: payload.linkedAccountId as Id<"accounts"> | undefined,
        linkedRecurringId:
          payload.linkedRecurringId as Id<"recurringTransactions"> | undefined,
      });
    }
    case "debt.archive": {
      const payload = z.object({ id: z.string() }).parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(apiAny.finance.debt.mutations.archiveDebtPlan, {
        id: payload.id as Id<"debtPlans">,
      });
    }
    case "savings.create": {
      const payload = savingsCreatePayloadSchema.parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(apiAny.finance.savings.mutations.createSavingsGoal, {
        ...payload,
        linkedAccountId: payload.linkedAccountId as Id<"accounts"> | undefined,
        linkedRecurringId:
          payload.linkedRecurringId as Id<"recurringTransactions"> | undefined,
        categoryId: payload.categoryId as Id<"categories"> | undefined,
      });
    }
    case "savings.update": {
      const payload = savingsUpdatePayloadSchema.parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(apiAny.finance.savings.mutations.updateSavingsGoal, {
        ...payload,
        id: payload.id as Id<"savingsGoals">,
        linkedAccountId: payload.linkedAccountId as Id<"accounts"> | undefined,
        linkedRecurringId:
          payload.linkedRecurringId as Id<"recurringTransactions"> | undefined,
        categoryId: payload.categoryId as Id<"categories"> | undefined,
      });
    }
    case "savings.archive": {
      const payload = z.object({ id: z.string() }).parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(apiAny.finance.savings.mutations.archiveSavingsGoal, {
        id: payload.id as Id<"savingsGoals">,
      });
    }
    case "recurring.create": {
      const payload = recurringCreatePayloadSchema.parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(
        apiAny.finance.recurring.mutations.createRecurringTransaction,
        {
          ...payload,
          accountId: payload.accountId as Id<"accounts"> | undefined,
          fromAccountId: payload.fromAccountId as Id<"accounts"> | undefined,
          toAccountId: payload.toAccountId as Id<"accounts"> | undefined,
          categoryId: payload.categoryId as Id<"categories"> | undefined,
        },
      );
    }
    case "recurring.update": {
      const payload = recurringUpdatePayloadSchema.parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(
        apiAny.finance.recurring.mutations.updateRecurringTransaction,
        {
          ...payload,
          id: payload.id as Id<"recurringTransactions">,
          categoryId: payload.categoryId as Id<"categories"> | undefined,
        },
      );
    }
    case "recurring.pause": {
      const payload = z.object({ id: z.string() }).parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(
        apiAny.finance.recurring.mutations.pauseRecurringTransaction,
        {
          id: payload.id as Id<"recurringTransactions">,
        },
      );
    }
    case "recurring.resume": {
      const payload = z.object({ id: z.string() }).parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(
        apiAny.finance.recurring.mutations.resumeRecurringTransaction,
        {
          id: payload.id as Id<"recurringTransactions">,
        },
      );
    }
    case "recurring.delete": {
      const payload = z
        .object({
          id: z.string(),
          deleteGeneratedTransactions: z.boolean().optional(),
        })
        .parse(JSON.parse(proposal.payloadJson));
      return await ctx.runMutation(
        apiAny.finance.recurring.mutations.deleteRecurringTransaction,
        {
          id: payload.id as Id<"recurringTransactions">,
          deleteGeneratedTransactions: payload.deleteGeneratedTransactions,
        },
      );
    }
    case "subscription.create": {
      const payload = subscriptionCreatePayloadSchema.parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(
        apiAny.finance.subscriptions.mutations.createSubscription,
        {
          ...payload,
          accountId: payload.accountId as Id<"accounts">,
          categoryId: payload.categoryId as Id<"categories"> | undefined,
        },
      );
    }
    case "subscription.cancel": {
      const payload = z.object({ id: z.string() }).parse(
        JSON.parse(proposal.payloadJson),
      );
      return await ctx.runMutation(
        apiAny.finance.subscriptions.mutations.cancelSubscription,
        {
          id: payload.id as Id<"recurringTransactions">,
        },
      );
    }
    default:
      return exhaustiveActionType(proposal.actionType);
  }
}

function assertConfirmationText(
  expectedConfirmation: string | undefined,
  confirmationText: string,
) {
  const normalized = confirmationText.trim().toUpperCase();
  const expected = (expectedConfirmation ?? "CONFIRM").trim().toUpperCase();
  if (normalized !== expected) {
    throw new Error(`Finance actions require ${expected} before execution.`);
  }
}

function exhaustiveActionType(value: never): never {
  throw new Error(`Unsupported finance action type: ${String(value)}`);
}

function getExpectedConfirmation(
  proposal: Pick<
    z.infer<typeof financeProposalSchema>,
    "actionType" | "destructive" | "expectedConfirmation"
  >,
) {
  if (proposal.expectedConfirmation?.trim()) {
    return proposal.expectedConfirmation.trim().toUpperCase();
  }

  if (
    proposal.destructive ||
    proposal.actionType === "budgetEnvelope.delete" ||
    proposal.actionType.endsWith(".archive") ||
    proposal.actionType.endsWith(".delete") ||
    proposal.actionType === "subscription.cancel"
  ) {
    return "DELETE";
  }

  return undefined;
}

import { ConvexError } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type SharedGoalPriority = Doc<"sharedGoals">["priority"];
type SharedGoalHorizon = Doc<"sharedGoals">["horizon"];

type SharedGoalBaseInput = {
  userId: string;
  title: string;
  description?: string;
  status: Doc<"sharedGoals">["status"];
  priority: SharedGoalPriority;
  horizon: SharedGoalHorizon;
  targetDate?: string;
  goalKind: Doc<"sharedGoals">["goalKind"];
  targetAmount?: number;
  currentAmount?: number;
  currencyCode?: string;
  sourceDomain: Doc<"sharedGoals">["sourceDomain"];
  linkedFinanceEntityType?: Doc<"sharedGoals">["linkedFinanceEntityType"];
  linkedFinanceEntityId?: string;
  domain?: string;
};

export async function requireOwnedSharedGoal(
  ctx: MutationCtx | QueryCtx,
  userId: string,
  sharedGoalId: Id<"sharedGoals">,
) {
  const goal = await ctx.db.get("sharedGoals", sharedGoalId);
  if (!goal || goal.userId !== userId) {
    throw new ConvexError("Shared goal not found");
  }
  return goal;
}

export async function createSharedGoalRecord(
  ctx: MutationCtx,
  input: SharedGoalBaseInput,
) {
  const now = Date.now();
  const title = optionalTrim(input.title);
  if (!title) {
    throw new ConvexError("Validation: shared goal title is required");
  }

  const id = await ctx.db.insert("sharedGoals", {
    userId: input.userId,
    title,
    description: optionalTrim(input.description),
    status: input.status,
    priority: input.priority,
    horizon: input.horizon,
    targetDate: optionalTrim(input.targetDate),
    goalKind: input.goalKind,
    targetAmount:
      input.targetAmount !== undefined ? Math.max(0, input.targetAmount) : undefined,
    currentAmount:
      input.currentAmount !== undefined ? Math.max(0, input.currentAmount) : undefined,
    currencyCode: optionalTrim(input.currencyCode)?.toUpperCase(),
    sourceDomain: input.sourceDomain,
    linkedFinanceEntityType: input.linkedFinanceEntityType,
    linkedFinanceEntityId: input.linkedFinanceEntityId,
    domain: optionalTrim(input.domain),
    active: input.status === "active" || input.status === "draft",
    createdAt: now,
    updatedAt: now,
  });
  return (await ctx.db.get("sharedGoals", id))!;
}

export async function updateSharedGoalRecord(
  ctx: MutationCtx,
  sharedGoalId: Id<"sharedGoals">,
  input: Partial<SharedGoalBaseInput>,
) {
  const patch = normalizeSharedGoalInput(input);
  await ctx.db.patch(sharedGoalId, {
    ...patch,
    updatedAt: Date.now(),
  });
  return (await ctx.db.get("sharedGoals", sharedGoalId))!;
}

export async function createPlannerSharedGoal(
  ctx: MutationCtx,
  input: {
    userId: string;
    title: string;
    description?: string;
    domain: string;
    horizon: SharedGoalHorizon;
    targetDate?: string;
    priority: SharedGoalPriority;
  },
) {
  return await createSharedGoalRecord(ctx, {
    userId: input.userId,
    title: input.title,
    description: input.description,
    status: "active",
    priority: input.priority,
    horizon: input.horizon,
    targetDate: input.targetDate,
    goalKind: "general",
    sourceDomain: "planner",
    domain: input.domain,
  });
}

export async function syncSavingsGoalSharedGoal(
  ctx: MutationCtx,
  input: {
    userId: string;
    savingsGoalId: Id<"savingsGoals">;
    sharedGoalId?: Id<"sharedGoals">;
    name: string;
    status: Doc<"savingsGoals">["status"];
    currency: string;
    targetAmount: number;
    currentAmount: number;
    targetDate?: number;
    notes?: string;
  },
) {
  const payload: SharedGoalBaseInput = {
    userId: input.userId,
    title: input.name,
    description: input.notes,
    status: mapFinanceStatusToSharedGoalStatus(input.status),
    priority: "high",
    horizon: input.targetDate ? "year" : "month",
    targetDate: input.targetDate
      ? new Date(input.targetDate).toISOString().slice(0, 10)
      : undefined,
    goalKind: "savings",
    targetAmount: input.targetAmount,
    currentAmount: input.currentAmount,
    currencyCode: input.currency,
    sourceDomain: "finance",
    linkedFinanceEntityType: "savingsGoal",
    linkedFinanceEntityId: input.savingsGoalId,
    domain: "finance",
  };

  if (input.sharedGoalId) {
    return await updateSharedGoalRecord(ctx, input.sharedGoalId, payload);
  }

  return await createSharedGoalRecord(ctx, payload);
}

export async function syncDebtPlanSharedGoal(
  ctx: MutationCtx,
  input: {
    userId: string;
    debtPlanId: Id<"debtPlans">;
    sharedGoalId?: Id<"sharedGoals">;
    name: string;
    status: Doc<"debtPlans">["status"];
    currency: string;
    originalBalance: number;
    currentBalance: number;
    nextDueDate?: number;
    notes?: string;
  },
) {
  const progress = Math.max(0, input.originalBalance - input.currentBalance);
  const payload: SharedGoalBaseInput = {
    userId: input.userId,
    title: `Pay off ${input.name}`,
    description: input.notes,
    status: mapFinanceStatusToSharedGoalStatus(input.status),
    priority: "high",
    horizon: input.nextDueDate ? "month" : "year",
    targetDate: input.nextDueDate
      ? new Date(input.nextDueDate).toISOString().slice(0, 10)
      : undefined,
    goalKind: "debt_payoff",
    targetAmount: input.originalBalance,
    currentAmount: progress,
    currencyCode: input.currency,
    sourceDomain: "finance",
    linkedFinanceEntityType: "debtPlan",
    linkedFinanceEntityId: input.debtPlanId,
    domain: "finance",
  };

  if (input.sharedGoalId) {
    return await updateSharedGoalRecord(ctx, input.sharedGoalId, payload);
  }

  return await createSharedGoalRecord(ctx, payload);
}

function normalizeSharedGoalInput(input: Partial<SharedGoalBaseInput>) {
  const title = optionalTrim(input.title);
  if (input.title !== undefined && !title) {
    throw new ConvexError("Validation: shared goal title is required");
  }

  const targetAmount =
    input.targetAmount !== undefined ? Math.max(0, input.targetAmount) : undefined;
  const currentAmount =
    input.currentAmount !== undefined ? Math.max(0, input.currentAmount) : undefined;

  return {
    ...(title !== undefined ? { title } : {}),
    ...(input.description !== undefined
      ? { description: optionalTrim(input.description) }
      : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    ...(input.horizon !== undefined ? { horizon: input.horizon } : {}),
    ...(input.targetDate !== undefined ? { targetDate: optionalTrim(input.targetDate) } : {}),
    ...(input.goalKind !== undefined ? { goalKind: input.goalKind } : {}),
    ...(targetAmount !== undefined ? { targetAmount } : {}),
    ...(currentAmount !== undefined ? { currentAmount } : {}),
    ...(input.currencyCode !== undefined
      ? { currencyCode: optionalTrim(input.currencyCode)?.toUpperCase() }
      : {}),
    ...(input.sourceDomain !== undefined ? { sourceDomain: input.sourceDomain } : {}),
    ...(input.linkedFinanceEntityType !== undefined
      ? { linkedFinanceEntityType: input.linkedFinanceEntityType }
      : {}),
    ...(input.linkedFinanceEntityId !== undefined
      ? { linkedFinanceEntityId: input.linkedFinanceEntityId }
      : {}),
    ...(input.domain !== undefined ? { domain: optionalTrim(input.domain) } : {}),
    ...(input.userId !== undefined ? { userId: input.userId } : {}),
    ...(input.status !== undefined
      ? {
          active: input.status === "active" || input.status === "draft",
        }
      : {}),
  };
}

function mapFinanceStatusToSharedGoalStatus(
  status: Doc<"savingsGoals">["status"] | Doc<"debtPlans">["status"],
): Doc<"sharedGoals">["status"] {
  if (status === "archived") return "archived";
  if (status === "completed") return "completed";
  return status === "draft" ? "draft" : "active";
}

function optionalTrim(value: string | undefined) {
  const next = value?.trim();
  return next ? next : undefined;
}

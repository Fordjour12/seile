import { api, asId, asOptionalId } from "@/lib/backend-api";
import { useMutation, useQuery } from "convex/react";

import type {
  CreateSavingsGoalPayload,
  SavingsGoal,
  SavingsGoalStatus,
  SavingsSummary,
  UpdateSavingsGoalPayload,
} from "./types";

type BackendSavingsGoal = {
  _id: string;
  name: string;
  status: SavingsGoalStatus;
  currency: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution?: number;
  targetDate?: number;
  linkedAccountId?: string;
  linkedRecurringId?: string;
  categoryId?: string;
  color?: string;
  icon?: string;
  priorityRank?: string;
  notes?: string;
  monthsUntilTarget?: number;
  projectedCompletionDate?: number;
  monthlyLedgerImpact: number;
  createdAt: number;
  updatedAt: number;
};

function mapSavingsGoal(row: BackendSavingsGoal): SavingsGoal {
  return {
    id: row._id,
    name: row.name,
    status: row.status,
    currencyCode: row.currency,
    targetAmount: row.targetAmount,
    currentAmount: row.currentAmount,
    monthlyContribution: row.monthlyContribution,
    targetDate: row.targetDate ? new Date(row.targetDate).toISOString() : undefined,
    linkedAccountId: row.linkedAccountId,
    linkedRecurringId: row.linkedRecurringId,
    categoryId: row.categoryId,
    color: row.color,
    icon: row.icon,
    priorityRank: row.priorityRank,
    notes: row.notes,
    monthsUntilTarget: row.monthsUntilTarget,
    projectedCompletionDate: row.projectedCompletionDate
      ? new Date(row.projectedCompletionDate).toISOString()
      : undefined,
    monthlyLedgerImpact: row.monthlyLedgerImpact,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

export function useSavingsSummary(): SavingsSummary | undefined {
  return useQuery(api.finance.savings.queries.getSavingsSummary, {});
}

export function useSavingsGoals(
  status?: SavingsGoalStatus,
): SavingsGoal[] | undefined {
  const rows = useQuery(api.finance.savings.queries.listSavingsGoals, { status });
  return rows?.map(mapSavingsGoal);
}

export function useSavingsGoal(id?: string): SavingsGoal | undefined {
  const row = useQuery(
    api.finance.savings.queries.getSavingsGoalById,
    id ? { id: asId<"savingsGoals">(id) } : "skip",
  );
  return row ? mapSavingsGoal(row) : undefined;
}

export function useCreateSavingsGoal(): (
  payload: CreateSavingsGoalPayload,
) => Promise<void> {
  const createSavingsGoal = useMutation(api.finance.savings.mutations.createSavingsGoal);

  return async (payload) => {
    await createSavingsGoal({
      name: payload.name,
      status: payload.status,
      currency: payload.currencyCode,
      targetAmount: payload.targetAmount,
      currentAmount: payload.currentAmount,
      monthlyContribution: payload.monthlyContribution,
      targetDate: payload.targetDate ? new Date(payload.targetDate).getTime() : undefined,
      linkedAccountId: asOptionalId<"accounts">(payload.linkedAccountId),
      categoryId: asOptionalId<"categories">(payload.categoryId),
      color: payload.color,
      icon: payload.icon,
      notes: payload.notes,
    });
  };
}

export function useUpdateSavingsGoal(): (
  id: string,
  payload: UpdateSavingsGoalPayload,
) => Promise<void> {
  const updateSavingsGoal = useMutation(api.finance.savings.mutations.updateSavingsGoal);

  return async (id, payload) => {
    await updateSavingsGoal({
      id: asId<"savingsGoals">(id),
      name: payload.name,
      status: payload.status,
      currency: payload.currencyCode,
      targetAmount: payload.targetAmount,
      currentAmount: payload.currentAmount,
      monthlyContribution: payload.monthlyContribution,
      targetDate: payload.targetDate ? new Date(payload.targetDate).getTime() : undefined,
      linkedAccountId: asOptionalId<"accounts">(payload.linkedAccountId),
      categoryId: asOptionalId<"categories">(payload.categoryId),
      color: payload.color,
      icon: payload.icon,
      notes: payload.notes,
    });
  };
}

export function useArchiveSavingsGoal(): (id: string) => Promise<boolean> {
  const archiveSavingsGoal = useMutation(api.finance.savings.mutations.archiveSavingsGoal);

  return (id) =>
    archiveSavingsGoal({
      id: asId<"savingsGoals">(id),
    });
}

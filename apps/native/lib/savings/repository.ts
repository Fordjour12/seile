import { apiAny } from "@/lib/backend-api";
import { convex } from "@/lib/convex-client";

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

export async function getSavingsSummary(): Promise<SavingsSummary> {
  try {
    return await convex.query(apiAny["savings/queries"].getSavingsSummary, {});
  } catch {
    return {
      totalTarget: 0,
      totalCurrent: 0,
      percentComplete: 0,
      totalMonthlyCommitment: 0,
      countByStatus: {},
    };
  }
}

export async function listSavingsGoals(status?: SavingsGoalStatus): Promise<SavingsGoal[]> {
  try {
    const rows = await convex.query(apiAny["savings/queries"].listSavingsGoals, { status });
    return rows.map(mapSavingsGoal);
  } catch {
    return [];
  }
}

export async function getSavingsGoalById(id: string): Promise<SavingsGoal> {
  const row = await convex.query(apiAny["savings/queries"].getSavingsGoalById, { id });
  return mapSavingsGoal(row);
}

export async function createSavingsGoal(payload: CreateSavingsGoalPayload): Promise<SavingsGoal> {
  const result = await convex.mutation(apiAny["savings/mutations"].createSavingsGoal, {
    name: payload.name,
    status: payload.status,
    currency: payload.currencyCode,
    targetAmount: payload.targetAmount,
    currentAmount: payload.currentAmount,
    monthlyContribution: payload.monthlyContribution,
    targetDate: payload.targetDate ? new Date(payload.targetDate).getTime() : undefined,
    linkedAccountId: payload.linkedAccountId,
    categoryId: payload.categoryId,
    color: payload.color,
    icon: payload.icon,
    notes: payload.notes,
  });
  return getSavingsGoalById(result.id);
}

export async function updateSavingsGoal(id: string, payload: UpdateSavingsGoalPayload): Promise<SavingsGoal> {
  const row = await convex.mutation(apiAny["savings/mutations"].updateSavingsGoal, {
    id,
    name: payload.name,
    status: payload.status,
    currency: payload.currencyCode,
    targetAmount: payload.targetAmount,
    currentAmount: payload.currentAmount,
    monthlyContribution: payload.monthlyContribution,
    targetDate: payload.targetDate ? new Date(payload.targetDate).getTime() : undefined,
    linkedAccountId: payload.linkedAccountId,
    categoryId: payload.categoryId,
    color: payload.color,
    icon: payload.icon,
    notes: payload.notes,
  });
  return mapSavingsGoal(row);
}

export async function archiveSavingsGoal(id: string): Promise<boolean> {
  return convex.mutation(apiAny["savings/mutations"].archiveSavingsGoal, { id });
}

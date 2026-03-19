import { api, asId } from "@/lib/backend-api";
import { useMutation, useQuery } from "convex/react";

import type {
  BudgetEnvelopeHistoryItem,
  BudgetEnvelopeWithComputed,
  BudgetPeriodDetail,
  BudgetPeriodWithComputed,
  BudgetSummary,
  CreateBudgetEnvelopePayload,
  CreateBudgetPeriodPayload,
  UpdateBudgetEnvelopePayload,
  UpdateBudgetPeriodPayload,
} from "./types";

type BackendPeriod = {
  _id: string;
  year: number;
  month: number;
  status: "draft" | "active" | "closed" | "archived";
  currency: string;
  incomeTarget: number;
  notes?: string;
  closedAt?: number;
  totalAllocated: number;
  totalActualSpend: number;
  unallocated: number;
  overallVariance: number;
};

type BackendEnvelope = {
  _id: string;
  periodId: string;
  categoryId: string;
  name: string;
  allocatedAmount: number;
  rolloverAmount: number;
  rolloverEnabled: boolean;
  color?: string;
  icon?: string;
  notes?: string;
  actualSpend: number;
  effectiveAllocation: number;
  remaining: number;
  overspent: boolean;
  spendPercent: number;
};

function mapPeriod(row: BackendPeriod): BudgetPeriodWithComputed {
  return {
    id: row._id,
    year: row.year,
    month: row.month,
    status: row.status,
    currencyCode: row.currency,
    incomeTarget: row.incomeTarget,
    totalAllocated: row.totalAllocated,
    totalActualSpend: row.totalActualSpend,
    unallocated: row.unallocated,
    overallVariance: row.overallVariance,
  };
}

function mapPeriodDetail(
  row: BackendPeriod & { envelopeCount: number },
): BudgetPeriodDetail {
  return {
    ...mapPeriod(row),
    notes: row.notes,
    closedAt: row.closedAt ? new Date(row.closedAt).toISOString() : undefined,
    envelopeCount: row.envelopeCount,
  };
}

function mapEnvelope(row: BackendEnvelope): BudgetEnvelopeWithComputed {
  return {
    id: row._id,
    periodId: row.periodId,
    categoryId: row.categoryId,
    name: row.name,
    allocatedAmount: row.allocatedAmount,
    rolloverAmount: row.rolloverAmount,
    rolloverEnabled: row.rolloverEnabled,
    color: row.color,
    icon: row.icon,
    notes: row.notes,
    actualSpend: row.actualSpend,
    effectiveAllocation: row.effectiveAllocation,
    remaining: row.remaining,
    overspent: row.overspent,
    spendPercent: Math.max(0, Math.min(100, row.spendPercent)),
  };
}

export function useBudgetSummary(): BudgetSummary | undefined {
  const payload = useQuery(api.finance.budget.queries.getBudgetSummary, {});
  if (payload === undefined) {
    return undefined;
  }

  return {
    activePeriod: payload.activePeriod ? mapPeriod(payload.activePeriod) : null,
    overspentCount: payload.overspentCount,
    topEnvelopes: payload.topEnvelopes.map(mapEnvelope),
  };
}

export function useActiveBudgetPeriod():
  | BudgetPeriodWithComputed
  | null
  | undefined {
  const row = useQuery(api.finance.budget.queries.getActivePeriod, {});
  return row ? mapPeriod(row) : row;
}

export function useBudgetEnvelopes(
  periodId?: string,
): BudgetEnvelopeWithComputed[] | undefined {
  const rows = useQuery(
    api.finance.budget.queries.listEnvelopes,
    periodId ? { periodId: asId<"budgetPeriods">(periodId) } : "skip",
  );

  return rows?.map(mapEnvelope);
}

export function useBudgetPeriods(
  status?: BudgetPeriodWithComputed["status"],
): BudgetPeriodWithComputed[] | undefined {
  const rows = useQuery(api.finance.budget.queries.listBudgetPeriods, { status });
  return rows?.map(mapPeriod);
}

export function useBudgetPeriod(
  id?: string,
): BudgetPeriodDetail | undefined {
  const row = useQuery(
    api.finance.budget.queries.getBudgetPeriodById,
    id ? { id: asId<"budgetPeriods">(id) } : "skip",
  );

  return row ? mapPeriodDetail(row) : undefined;
}

export function useCreateBudgetPeriod(): (
  payload: CreateBudgetPeriodPayload,
) => Promise<{ id: string }> {
  const createBudgetPeriod = useMutation(api.finance.budget.mutations.createBudgetPeriod);

  return async (payload) => {
    const result = await createBudgetPeriod({
      year: payload.year,
      month: payload.month,
      currency: payload.currencyCode,
      incomeTarget: payload.incomeTarget,
      notes: payload.notes,
    });

    return { id: result.id };
  };
}

export function useUpdateBudgetPeriod(): (
  id: string,
  payload: UpdateBudgetPeriodPayload,
) => Promise<void> {
  const updateBudgetPeriod = useMutation(api.finance.budget.mutations.updateBudgetPeriod);

  return async (id, payload) => {
    await updateBudgetPeriod({
      id: asId<"budgetPeriods">(id),
      incomeTarget: payload.incomeTarget,
      notes: payload.notes,
    });
  };
}

export function useActivateBudgetPeriod(): (
  id: string,
) => Promise<boolean> {
  const activateBudgetPeriod = useMutation(
    api.finance.budget.mutations.activateBudgetPeriod,
  );

  return (id) =>
    activateBudgetPeriod({
      id: asId<"budgetPeriods">(id),
    });
}

export function useCloseBudgetPeriod(): (
  id: string,
) => Promise<boolean> {
  const closeBudgetPeriod = useMutation(api.finance.budget.mutations.closeBudgetPeriod);

  return (id) =>
    closeBudgetPeriod({
      id: asId<"budgetPeriods">(id),
    });
}

export function useArchiveBudgetPeriod(): (
  id: string,
) => Promise<boolean> {
  const archiveBudgetPeriod = useMutation(
    api.finance.budget.mutations.archiveBudgetPeriod,
  );

  return (id) =>
    archiveBudgetPeriod({
      id: asId<"budgetPeriods">(id),
    });
}

export function useCopyPreviousBudgetPeriod(): (
  toPeriodId: string,
) => Promise<{ copiedCount: number; noPreviousPeriod?: boolean }> {
  const copyPreviousPeriod = useMutation(api.finance.budget.mutations.copyPreviousPeriod);

  return (toPeriodId) =>
    copyPreviousPeriod({
      toPeriodId: asId<"budgetPeriods">(toPeriodId),
    });
}

export function useBudgetEnvelope(
  id?: string,
): BudgetEnvelopeWithComputed | undefined {
  const row = useQuery(
    api.finance.budget.queries.getEnvelopeById,
    id ? { id: asId<"budgetEnvelopes">(id) } : "skip",
  );

  return row ? mapEnvelope(row) : undefined;
}

export function useCreateEnvelope(): (
  payload: CreateBudgetEnvelopePayload,
) => Promise<{ id: string }> {
  const createEnvelope = useMutation(api.finance.budget.mutations.createEnvelope);

  return async (payload) => {
    const result = await createEnvelope({
      periodId: asId<"budgetPeriods">(payload.periodId),
      categoryId: asId<"categories">(payload.categoryId),
      allocatedAmount: payload.allocatedAmount,
      rolloverEnabled: payload.rolloverEnabled,
      color: payload.color,
      icon: payload.icon,
      notes: payload.notes,
    });

    return { id: result.id };
  };
}

export function useUpdateEnvelope(): (
  id: string,
  payload: UpdateBudgetEnvelopePayload,
) => Promise<void> {
  const updateEnvelope = useMutation(api.finance.budget.mutations.updateEnvelope);

  return async (id, payload) => {
    await updateEnvelope({
      id: asId<"budgetEnvelopes">(id),
      ...payload,
    });
  };
}

export function useDeleteEnvelope(): (
  id: string,
) => Promise<{ deleted: boolean; softArchived: boolean }> {
  const deleteEnvelope = useMutation(api.finance.budget.mutations.deleteEnvelope);

  return (id) =>
    deleteEnvelope({
      id: asId<"budgetEnvelopes">(id),
    });
}

export function useEnvelopeHistory(
  categoryId?: string,
  limit = 6,
): BudgetEnvelopeHistoryItem[] | undefined {
  return useQuery(
    api.finance.budget.queries.getEnvelopeHistory,
    categoryId ? { categoryId: asId<"categories">(categoryId), limit } : "skip",
  );
}

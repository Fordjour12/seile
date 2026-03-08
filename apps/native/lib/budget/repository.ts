import { apiAny } from "@/lib/backend-api";
import { convex } from "@/lib/convex-client";

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

function mapPeriodDetail(row: BackendPeriod & { envelopeCount: number }): BudgetPeriodDetail {
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

export async function getBudgetSummary(): Promise<BudgetSummary> {
  try {
    const payload = await convex.query(apiAny["budget/queries"].getBudgetSummary, {});
    return {
      activePeriod: payload.activePeriod ? mapPeriod(payload.activePeriod) : null,
      overspentCount: payload.overspentCount,
      topEnvelopes: payload.topEnvelopes.map(mapEnvelope),
    };
  } catch {
    return {
      activePeriod: null,
      overspentCount: 0,
      topEnvelopes: [],
    };
  }
}

export async function getActivePeriod(): Promise<BudgetPeriodWithComputed | null> {
  const row = await convex.query(apiAny["budget/queries"].getActivePeriod, {});
  return row ? mapPeriod(row) : null;
}

export async function listEnvelopes(periodId: string): Promise<BudgetEnvelopeWithComputed[]> {
  try {
    const rows = await convex.query(apiAny["budget/queries"].listEnvelopes, { periodId });
    return rows.map(mapEnvelope);
  } catch {
    return [];
  }
}

export async function listBudgetPeriods(status?: BudgetPeriodWithComputed["status"]): Promise<BudgetPeriodWithComputed[]> {
  const rows = await convex.query(apiAny["budget/queries"].listBudgetPeriods, { status });
  return rows.map(mapPeriod);
}

export async function getBudgetPeriodById(id: string): Promise<BudgetPeriodDetail> {
  const row = await convex.query(apiAny["budget/queries"].getBudgetPeriodById, { id });
  return mapPeriodDetail(row);
}

export async function createBudgetPeriod(payload: CreateBudgetPeriodPayload): Promise<BudgetPeriodDetail> {
  const result = await convex.mutation(apiAny["budget/mutations"].createBudgetPeriod, {
    year: payload.year,
    month: payload.month,
    currency: payload.currencyCode,
    incomeTarget: payload.incomeTarget,
    notes: payload.notes,
  });
  return getBudgetPeriodById(result.id);
}

export async function updateBudgetPeriod(id: string, payload: UpdateBudgetPeriodPayload): Promise<BudgetPeriodDetail> {
  await convex.mutation(apiAny["budget/mutations"].updateBudgetPeriod, {
    id,
    incomeTarget: payload.incomeTarget,
    notes: payload.notes,
  });
  return getBudgetPeriodById(id);
}

export async function activateBudgetPeriod(id: string): Promise<boolean> {
  return convex.mutation(apiAny["budget/mutations"].activateBudgetPeriod, { id });
}

export async function closeBudgetPeriod(id: string): Promise<boolean> {
  return convex.mutation(apiAny["budget/mutations"].closeBudgetPeriod, { id });
}

export async function archiveBudgetPeriod(id: string): Promise<boolean> {
  return convex.mutation(apiAny["budget/mutations"].archiveBudgetPeriod, { id });
}

export async function copyPreviousBudgetPeriod(toPeriodId: string): Promise<{ copiedCount: number; noPreviousPeriod?: boolean }> {
  return convex.mutation(apiAny["budget/mutations"].copyPreviousPeriod, { toPeriodId });
}

export async function getEnvelopeById(id: string): Promise<BudgetEnvelopeWithComputed> {
  const row = await convex.query(apiAny["budget/queries"].getEnvelopeById, { id });
  return mapEnvelope(row);
}

export async function createEnvelope(payload: CreateBudgetEnvelopePayload): Promise<BudgetEnvelopeWithComputed> {
  const result = await convex.mutation(apiAny["budget/mutations"].createEnvelope, {
    periodId: payload.periodId,
    categoryId: payload.categoryId,
    allocatedAmount: payload.allocatedAmount,
    rolloverEnabled: payload.rolloverEnabled,
    color: payload.color,
    icon: payload.icon,
    notes: payload.notes,
  });
  return getEnvelopeById(result.id);
}

export async function updateEnvelope(id: string, payload: UpdateBudgetEnvelopePayload): Promise<BudgetEnvelopeWithComputed> {
  const row = await convex.mutation(apiAny["budget/mutations"].updateEnvelope, {
    id,
    ...payload,
  });
  return mapEnvelope(row);
}

export async function deleteEnvelope(id: string): Promise<{ deleted: boolean; softArchived: boolean }> {
  return convex.mutation(apiAny["budget/mutations"].deleteEnvelope, { id });
}

export async function getEnvelopeHistory(categoryId: string, limit = 6): Promise<BudgetEnvelopeHistoryItem[]> {
  return convex.query(apiAny["budget/queries"].getEnvelopeHistory, { categoryId, limit });
}

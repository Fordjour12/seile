import * as SecureStore from "expo-secure-store";

import { postJson } from "@/lib/accounts/http-client";

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
  const cacheKey = "budget:activePeriod:system";
  try {
    const payload = await postJson<{ activePeriod: BackendPeriod | null; overspentCount: number; topEnvelopes: BackendEnvelope[] }>(
      "/budget/periods/summary",
      {},
    );
    await SecureStore.setItemAsync(cacheKey, JSON.stringify(payload));
    return {
      activePeriod: payload.activePeriod ? mapPeriod(payload.activePeriod) : null,
      overspentCount: payload.overspentCount,
      topEnvelopes: payload.topEnvelopes.map(mapEnvelope),
    };
  } catch {
    const cached = await SecureStore.getItemAsync(cacheKey);
    if (!cached) throw new Error("Unable to load budget summary");
    const payload = JSON.parse(cached) as { activePeriod: BackendPeriod | null; overspentCount: number; topEnvelopes: BackendEnvelope[] };
    return {
      activePeriod: payload.activePeriod ? mapPeriod(payload.activePeriod) : null,
      overspentCount: payload.overspentCount,
      topEnvelopes: payload.topEnvelopes.map(mapEnvelope),
    };
  }
}

export async function getActivePeriod(): Promise<BudgetPeriodWithComputed | null> {
  const row = await postJson<BackendPeriod | null>("/budget/periods/active", {});
  return row ? mapPeriod(row) : null;
}

export async function listEnvelopes(periodId: string): Promise<BudgetEnvelopeWithComputed[]> {
  const cacheKey = `budget:envelopes:${periodId}:system`;
  try {
    const rows = await postJson<BackendEnvelope[]>("/budget/envelopes/list", { periodId });
    await SecureStore.setItemAsync(cacheKey, JSON.stringify(rows));
    return rows.map(mapEnvelope);
  } catch {
    const cached = await SecureStore.getItemAsync(cacheKey);
    if (!cached) throw new Error("Unable to load envelopes");
    return (JSON.parse(cached) as BackendEnvelope[]).map(mapEnvelope);
  }
}

export async function listBudgetPeriods(status?: BudgetPeriodWithComputed["status"]): Promise<BudgetPeriodWithComputed[]> {
  const rows = await postJson<BackendPeriod[]>("/budget/periods/list", { status });
  return rows.map(mapPeriod);
}

export async function getBudgetPeriodById(id: string): Promise<BudgetPeriodDetail> {
  const row = await postJson<BackendPeriod & { envelopeCount: number }>("/budget/periods/getById", { id });
  return mapPeriodDetail(row);
}

export async function createBudgetPeriod(payload: CreateBudgetPeriodPayload): Promise<BudgetPeriodDetail> {
  const result = await postJson<{ id: string }>("/budget/periods/create", {
    year: payload.year,
    month: payload.month,
    currency: payload.currencyCode,
    incomeTarget: payload.incomeTarget,
    notes: payload.notes,
  });
  return getBudgetPeriodById(result.id);
}

export async function updateBudgetPeriod(id: string, payload: UpdateBudgetPeriodPayload): Promise<BudgetPeriodDetail> {
  await postJson<BackendPeriod>("/budget/periods/update", {
    id,
    incomeTarget: payload.incomeTarget,
    notes: payload.notes,
  });
  return getBudgetPeriodById(id);
}

export async function activateBudgetPeriod(id: string): Promise<boolean> {
  return postJson<boolean>("/budget/periods/activate", { id });
}

export async function closeBudgetPeriod(id: string): Promise<boolean> {
  return postJson<boolean>("/budget/periods/close", { id });
}

export async function archiveBudgetPeriod(id: string): Promise<boolean> {
  return postJson<boolean>("/budget/periods/archive", { id });
}

export async function copyPreviousBudgetPeriod(toPeriodId: string): Promise<{ copiedCount: number; noPreviousPeriod?: boolean }> {
  return postJson<{ copiedCount: number; noPreviousPeriod?: boolean }>("/budget/periods/copy", { toPeriodId });
}

export async function getEnvelopeById(id: string): Promise<BudgetEnvelopeWithComputed> {
  const row = await postJson<BackendEnvelope>("/budget/envelopes/getById", { id });
  return mapEnvelope(row);
}

export async function createEnvelope(payload: CreateBudgetEnvelopePayload): Promise<BudgetEnvelopeWithComputed> {
  const result = await postJson<{ id: string }>("/budget/envelopes/create", {
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
  const row = await postJson<BackendEnvelope>("/budget/envelopes/update", {
    id,
    ...payload,
  });
  return mapEnvelope(row);
}

export async function deleteEnvelope(id: string): Promise<{ deleted: boolean; softArchived: boolean }> {
  return postJson<{ deleted: boolean; softArchived: boolean }>("/budget/envelopes/delete", { id });
}

export async function getEnvelopeHistory(categoryId: string, limit = 6): Promise<BudgetEnvelopeHistoryItem[]> {
  return postJson<BudgetEnvelopeHistoryItem[]>("/budget/envelopes/history", { categoryId, limit });
}

import * as SecureStore from "expo-secure-store";

import { postJson } from "@/lib/accounts/http-client";

import type { BudgetEnvelopeWithComputed, BudgetPeriodWithComputed, BudgetSummary } from "./types";

type BackendPeriod = {
  _id: string;
  year: number;
  month: number;
  status: "draft" | "active" | "closed" | "archived";
  currency: string;
  incomeTarget: number;
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

import * as SecureStore from "expo-secure-store";

import { postJson } from "@/lib/accounts/http-client";

import type {
  CreateDebtPlanPayload,
  DebtPlan,
  DebtPlanStatus,
  DebtSnapshot,
  UpdateDebtPlanPayload,
} from "./types";

type BackendDebtPlan = {
  _id: string;
  name: string;
  debtType: "installment" | "revolving";
  status: DebtPlanStatus;
  currency: string;
  originalBalance: number;
  currentBalance: number;
  monthlyDue: number;
  apr?: number;
  nextDueDate?: number;
  balanceExceedsOriginal: boolean;
  monthlyLedgerImpact: number;
  createdAt: number;
  updatedAt: number;
};

const CACHE_KEY = "debt:list:system";

function mapDebtPlan(item: BackendDebtPlan): DebtPlan {
  return {
    id: item._id,
    name: item.name,
    debtType: item.debtType,
    status: item.status,
    currencyCode: item.currency,
    originalBalance: item.originalBalance,
    currentBalance: item.currentBalance,
    monthlyDue: item.monthlyDue,
    apr: item.apr,
    nextDueDate: item.nextDueDate ? new Date(item.nextDueDate).toISOString() : undefined,
    balanceExceedsOriginal: item.balanceExceedsOriginal,
    monthlyLedgerImpact: item.monthlyLedgerImpact,
    createdAt: new Date(item.createdAt).toISOString(),
    updatedAt: new Date(item.updatedAt).toISOString(),
  };
}

export async function listDebtPlans(status?: DebtPlanStatus): Promise<DebtPlan[]> {
  try {
    const rows = await postJson<BackendDebtPlan[]>("/debt/list", { status });
    await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify({ at: Date.now(), rows }));
    return rows.map(mapDebtPlan);
  } catch {
    const cached = await SecureStore.getItemAsync(CACHE_KEY);
    if (!cached) throw new Error("Unable to load debt plans");
    return (JSON.parse(cached).rows as BackendDebtPlan[]).map(mapDebtPlan);
  }
}

export async function getDebtPlanById(id: string): Promise<DebtPlan> {
  const row = await postJson<BackendDebtPlan>("/debt/getById", { id });
  return mapDebtPlan(row);
}

export async function createDebtPlan(
  payload: CreateDebtPlanPayload & { status?: DebtPlanStatus },
): Promise<DebtPlan> {
  const result = await postJson<{ id: string }>("/debt/create", {
    name: payload.name,
    debtType: payload.debtType,
    currency: payload.currencyCode,
    originalBalance: payload.originalBalance,
    currentBalance: payload.currentBalance,
    monthlyDue: payload.monthlyDue,
    apr: payload.apr,
    status: payload.status,
  });
  return getDebtPlanById(result.id);
}

export async function updateDebtPlan(id: string, payload: UpdateDebtPlanPayload): Promise<DebtPlan> {
  const row = await postJson<BackendDebtPlan>("/debt/update", {
    id,
    ...payload,
    debtType: payload.debtType,
    originalBalance: payload.originalBalance,
    currency: payload.currencyCode,
  });
  return mapDebtPlan(row);
}

export async function archiveDebtPlan(id: string): Promise<boolean> {
  return postJson<boolean>("/debt/archive", { id });
}

export async function getDebtSnapshot(): Promise<DebtSnapshot> {
  return postJson<DebtSnapshot>("/debt/snapshot", {});
}

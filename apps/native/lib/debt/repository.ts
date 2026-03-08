import { apiAny } from "@/lib/backend-api";
import { convex } from "@/lib/convex-client";

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
    const rows = await convex.query(apiAny["debt/queries"].listDebtPlans, { status });
    return rows.map(mapDebtPlan);
  } catch {
    return [];
  }
}

export async function getDebtPlanById(id: string): Promise<DebtPlan> {
  const row = await convex.query(apiAny["debt/queries"].getDebtPlanById, { id });
  return mapDebtPlan(row);
}

export async function createDebtPlan(
  payload: CreateDebtPlanPayload & { status?: DebtPlanStatus },
): Promise<DebtPlan> {
  const result = await convex.mutation(apiAny["debt/mutations"].createDebtPlan, {
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
  const row = await convex.mutation(apiAny["debt/mutations"].updateDebtPlan, {
    id,
    ...payload,
    debtType: payload.debtType,
    originalBalance: payload.originalBalance,
    currency: payload.currencyCode,
  });
  return mapDebtPlan(row);
}

export async function archiveDebtPlan(id: string): Promise<boolean> {
  return convex.mutation(apiAny["debt/mutations"].archiveDebtPlan, { id });
}

export async function getDebtSnapshot(): Promise<DebtSnapshot> {
  return convex.query(apiAny["debt/queries"].getDebtSnapshot, {});
}

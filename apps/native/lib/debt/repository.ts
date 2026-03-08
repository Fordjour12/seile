import { api, asId } from "@/lib/backend-api";
import { useMutation, useQuery } from "convex/react";

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

export function useDebtPlans(status?: DebtPlanStatus): DebtPlan[] | undefined {
  const rows = useQuery(api.debt.queries.listDebtPlans, { status });
  return rows?.map(mapDebtPlan);
}

export function useDebtPlan(id?: string): DebtPlan | undefined {
  const row = useQuery(
    api.debt.queries.getDebtPlanById,
    id ? { id: asId<"debtPlans">(id) } : "skip",
  );
  return row ? mapDebtPlan(row) : undefined;
}

export function useCreateDebtPlan(): (
  payload: CreateDebtPlanPayload & { status?: DebtPlanStatus },
  ) => Promise<void> {
  const createDebtPlan = useMutation(api.debt.mutations.createDebtPlan);

  return async (payload) => {
    await createDebtPlan({
      name: payload.name,
      debtType: payload.debtType,
      currency: payload.currencyCode,
      originalBalance: payload.originalBalance,
      currentBalance: payload.currentBalance,
      monthlyDue: payload.monthlyDue,
      apr: payload.apr,
      status: payload.status,
    });
  };
}

export function useUpdateDebtPlan(): (
  id: string,
  payload: UpdateDebtPlanPayload,
) => Promise<void> {
  const updateDebtPlan = useMutation(api.debt.mutations.updateDebtPlan);

  return async (id, payload) => {
    await updateDebtPlan({
      id: asId<"debtPlans">(id),
      ...payload,
      debtType: payload.debtType,
      originalBalance: payload.originalBalance,
      currency: payload.currencyCode,
    });
  };
}

export function useArchiveDebtPlan(): (id: string) => Promise<boolean> {
  const archiveDebtPlan = useMutation(api.debt.mutations.archiveDebtPlan);

  return (id) =>
    archiveDebtPlan({
      id: asId<"debtPlans">(id),
    });
}

export function useDebtSnapshot(): DebtSnapshot | undefined {
  return useQuery(api.debt.queries.getDebtSnapshot, {});
}

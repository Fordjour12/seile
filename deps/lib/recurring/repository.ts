import { api, asId, asOptionalId } from "@/lib/backend-api";
import { useMutation, useQuery } from "convex/react";

import type {
  CreateRecurringPayload,
  RecurringTransaction,
  UpdateRecurringPayload,
} from "./types";

type BackendRecurring = {
  _id: string;
  kind: "expense" | "income" | "transfer";
  amount: number;
  currency: string;
  scheduleType: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startAt: number;
  endAt?: number;
  accountId?: string;
  fromAccountId?: string;
  toAccountId?: string;
  categoryId?: string;
  note?: string;
  isActive: boolean;
  isSubscription: boolean;
  nextRunAt: number;
  lastGeneratedAt?: number;
  subscriptionMeta?: {
    serviceName: string;
    serviceUrl?: string;
    logoUrl?: string;
    status: "active" | "trial" | "paused" | "cancelled";
    trialEndsAt?: number;
    cancelledAt?: number;
    billingProvider?: string;
    externalSubscriptionId?: string;
  };
  createdAt: number;
  updatedAt: number;
};

function mapRecurring(item: BackendRecurring): RecurringTransaction {
  return {
    id: item._id,
    kind: item.kind,
    amount: item.amount,
    currencyCode: item.currency,
    scheduleType: item.scheduleType,
    interval: item.interval,
    dayOfMonth: item.dayOfMonth,
    dayOfWeek: item.dayOfWeek,
    startAt: new Date(item.startAt).toISOString(),
    endAt: item.endAt ? new Date(item.endAt).toISOString() : undefined,
    accountId: item.accountId,
    fromAccountId: item.fromAccountId,
    toAccountId: item.toAccountId,
    categoryId: item.categoryId,
    note: item.note,
    isActive: item.isActive,
    isSubscription: item.isSubscription,
    nextRunAt: new Date(item.nextRunAt).toISOString(),
    lastGeneratedAt: item.lastGeneratedAt ? new Date(item.lastGeneratedAt).toISOString() : undefined,
    subscriptionMeta: item.subscriptionMeta
      ? {
          ...item.subscriptionMeta,
          trialEndsAt: item.subscriptionMeta.trialEndsAt
            ? new Date(item.subscriptionMeta.trialEndsAt).toISOString()
            : undefined,
          cancelledAt: item.subscriptionMeta.cancelledAt
            ? new Date(item.subscriptionMeta.cancelledAt).toISOString()
            : undefined,
        }
      : undefined,
    createdAt: new Date(item.createdAt).toISOString(),
    updatedAt: new Date(item.updatedAt).toISOString(),
  };
}

export function useRecurringTransactions(
  includeInactive: boolean = false,
): RecurringTransaction[] | undefined {
  const rows = useQuery(api.finance.recurring.queries.listRecurringTransactions, {
    includeInactive,
  });

  return rows?.map(mapRecurring);
}

export function useRecurringTransaction(
  id?: string,
): RecurringTransaction | null | undefined {
  const rows = useRecurringTransactions(true);
  if (rows === undefined) {
    return undefined;
  }

  return rows.find((item) => item.id === id) ?? null;
}

export function useUpcomingRecurring(
  withinDays: number,
): RecurringTransaction[] | undefined {
  const rows = useQuery(api.finance.recurring.queries.getUpcomingRecurring, {
    withinDays,
  });

  return rows?.map(mapRecurring);
}

export function useCreateRecurringTransaction(): (
  payload: CreateRecurringPayload,
) => Promise<void> {
  const createRecurringTransaction = useMutation(api.finance.recurring.mutations.createRecurringTransaction);

  return async (payload) => {
    await createRecurringTransaction({
      kind: payload.kind,
      amount: payload.amount,
      currency: payload.currencyCode ?? "GHS",
      scheduleType: payload.scheduleType,
      interval: payload.interval,
      dayOfMonth: payload.dayOfMonth,
      dayOfWeek: payload.dayOfWeek,
      startAt: new Date(payload.startAt).getTime(),
      endAt: payload.endAt ? new Date(payload.endAt).getTime() : undefined,
      accountId: asOptionalId<"accounts">(payload.accountId),
      fromAccountId: asOptionalId<"accounts">(payload.fromAccountId),
      toAccountId: asOptionalId<"accounts">(payload.toAccountId),
      categoryId: asOptionalId<"categories">(payload.categoryId),
      note: payload.note,
      isSubscription: payload.isSubscription,
      subscriptionMeta: payload.subscriptionMeta
        ? {
            ...payload.subscriptionMeta,
            trialEndsAt: payload.subscriptionMeta.trialEndsAt
              ? new Date(payload.subscriptionMeta.trialEndsAt).getTime()
              : undefined,
            cancelledAt: payload.subscriptionMeta.cancelledAt
              ? new Date(payload.subscriptionMeta.cancelledAt).getTime()
              : undefined,
          }
        : undefined,
    });
  };
}

export function useUpdateRecurringTransaction(): (
  id: string,
  payload: UpdateRecurringPayload,
  ) => Promise<void> {
  const updateRecurringTransaction = useMutation(api.finance.recurring.mutations.updateRecurringTransaction);

  return async (id, payload) => {
    await updateRecurringTransaction({
      id: asId<"recurringTransactions">(id),
      amount: payload.amount,
      categoryId: asOptionalId<"categories">(payload.categoryId),
      note: payload.note,
      endAt: payload.endAt ? new Date(payload.endAt).getTime() : undefined,
      dayOfMonth: payload.dayOfMonth,
      dayOfWeek: payload.dayOfWeek,
      interval: payload.interval,
      subscriptionMeta: payload.subscriptionMeta
        ? {
            ...payload.subscriptionMeta,
            trialEndsAt: payload.subscriptionMeta.trialEndsAt
              ? new Date(payload.subscriptionMeta.trialEndsAt).getTime()
              : undefined,
            cancelledAt: payload.subscriptionMeta.cancelledAt
              ? new Date(payload.subscriptionMeta.cancelledAt).getTime()
              : undefined,
          }
        : undefined,
    });
  };
}

export function usePauseRecurringTransaction(): (id: string) => Promise<boolean> {
  const pauseRecurringTransaction = useMutation(api.finance.recurring.mutations.pauseRecurringTransaction);

  return (id) =>
    pauseRecurringTransaction({
      id: asId<"recurringTransactions">(id),
    });
}

export function useResumeRecurringTransaction(): (id: string) => Promise<void> {
  const resumeRecurringTransaction = useMutation(api.finance.recurring.mutations.resumeRecurringTransaction);

  return async (id) => {
    await resumeRecurringTransaction({
      id: asId<"recurringTransactions">(id),
    });
  };
}

export function useDeleteRecurringTransaction(): (
  id: string,
  deleteGeneratedTransactions?: boolean,
) => Promise<boolean> {
  const deleteRecurringTransaction = useMutation(api.finance.recurring.mutations.deleteRecurringTransaction);

  return (id, deleteGeneratedTransactions = false) =>
    deleteRecurringTransaction({
      id: asId<"recurringTransactions">(id),
      deleteGeneratedTransactions,
    });
}

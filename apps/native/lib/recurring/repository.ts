import { api } from "@/lib/backend-api";
import { convex } from "@/lib/convex-client";

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

export async function listRecurringTransactions(includeInactive: boolean = false): Promise<RecurringTransaction[]> {
  const rows = await convex.query(api["recurring/queries"].listRecurringTransactions, {
    includeInactive,
  });

  return rows.map(mapRecurring);
}

export async function getRecurringTransaction(id: string): Promise<RecurringTransaction | null> {
  const rows = await listRecurringTransactions(true);
  return rows.find((item) => item.id === id) ?? null;
}

export async function listUpcomingRecurring(withinDays: number): Promise<RecurringTransaction[]> {
  const rows = await convex.query(api["recurring/queries"].getUpcomingRecurring, {
    withinDays,
  });

  return rows.map(mapRecurring);
}

export async function createRecurringTransaction(payload: CreateRecurringPayload): Promise<RecurringTransaction> {
  const row = await convex.mutation(api["recurring/mutations"].createRecurringTransaction, {
    kind: payload.kind,
    amount: payload.amount,
    currency: payload.currencyCode ?? "GHS",
    scheduleType: payload.scheduleType,
    interval: payload.interval,
    dayOfMonth: payload.dayOfMonth,
    dayOfWeek: payload.dayOfWeek,
    startAt: new Date(payload.startAt).getTime(),
    endAt: payload.endAt ? new Date(payload.endAt).getTime() : undefined,
    accountId: payload.accountId,
    fromAccountId: payload.fromAccountId,
    toAccountId: payload.toAccountId,
    categoryId: payload.categoryId,
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

  return mapRecurring(row);
}

export async function updateRecurringTransaction(
  id: string,
  payload: UpdateRecurringPayload,
): Promise<RecurringTransaction> {
  const row = await convex.mutation(api["recurring/mutations"].updateRecurringTransaction, {
    id,
    amount: payload.amount,
    categoryId: payload.categoryId,
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

  return mapRecurring(row);
}

export async function pauseRecurringTransaction(id: string): Promise<boolean> {
  return convex.mutation(api["recurring/mutations"].pauseRecurringTransaction, { id });
}

export async function resumeRecurringTransaction(id: string): Promise<RecurringTransaction> {
  const row = await convex.mutation(api["recurring/mutations"].resumeRecurringTransaction, { id });
  return mapRecurring(row);
}

export async function deleteRecurringTransaction(
  id: string,
  deleteGeneratedTransactions: boolean = false,
): Promise<boolean> {
  return convex.mutation(api["recurring/mutations"].deleteRecurringTransaction, {
    id,
    deleteGeneratedTransactions,
  });
}

import { postJson } from "@/lib/accounts/http-client";

import type { RecurringTransaction } from "@/lib/recurring";

import type {
  CreateSubscriptionPayload,
  MonthlySubscriptionSpend,
  Subscription,
} from "./types";

function toSubscription(input: RecurringTransaction): Subscription {
  if (!input.isSubscription || !input.subscriptionMeta) {
    throw new Error("Invalid subscription payload");
  }

  return {
    ...input,
    isSubscription: true,
    subscriptionMeta: input.subscriptionMeta,
  };
}

function mapRecurring(row: any): RecurringTransaction {
  return {
    id: row._id,
    kind: row.kind,
    amount: row.amount,
    currencyCode: row.currency,
    scheduleType: row.scheduleType,
    interval: row.interval,
    dayOfMonth: row.dayOfMonth,
    dayOfWeek: row.dayOfWeek,
    startAt: new Date(row.startAt).toISOString(),
    endAt: row.endAt ? new Date(row.endAt).toISOString() : undefined,
    accountId: row.accountId,
    fromAccountId: row.fromAccountId,
    toAccountId: row.toAccountId,
    categoryId: row.categoryId,
    note: row.note,
    isActive: row.isActive,
    isSubscription: row.isSubscription,
    nextRunAt: new Date(row.nextRunAt).toISOString(),
    lastGeneratedAt: row.lastGeneratedAt ? new Date(row.lastGeneratedAt).toISOString() : undefined,
    subscriptionMeta: row.subscriptionMeta
      ? {
          ...row.subscriptionMeta,
          trialEndsAt: row.subscriptionMeta.trialEndsAt
            ? new Date(row.subscriptionMeta.trialEndsAt).toISOString()
            : undefined,
          cancelledAt: row.subscriptionMeta.cancelledAt
            ? new Date(row.subscriptionMeta.cancelledAt).toISOString()
            : undefined,
        }
      : undefined,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

export async function listSubscriptions(includeInactive: boolean = false): Promise<Subscription[]> {
  const rows = await postJson<any[]>("/subscriptions/list", {
    includeInactive,
  });

  return rows.map((item) => toSubscription(mapRecurring(item)));
}

export async function getSubscription(id: string): Promise<Subscription | null> {
  const rows = await listSubscriptions(true);
  return rows.find((item) => item.id === id) ?? null;
}

export async function listSubscriptionsByStatus(
  status: "active" | "trial" | "paused" | "cancelled",
): Promise<Subscription[]> {
  const rows = await postJson<any[]>("/subscriptions/by-status", {
    status,
  });

  return rows.map((item) => toSubscription(mapRecurring(item)));
}

export async function listUpcomingRenewals(withinDays: number): Promise<Subscription[]> {
  const rows = await postJson<any[]>("/subscriptions/upcoming", {
    withinDays,
  });

  return rows.map((item) => toSubscription(mapRecurring(item)));
}

export async function createSubscription(payload: CreateSubscriptionPayload): Promise<Subscription> {
  const row = await postJson<any>("/subscriptions/create", {
    serviceName: payload.serviceName,
    serviceUrl: payload.serviceUrl,
    logoUrl: payload.logoUrl,
    amount: payload.amount,
    currency: payload.currencyCode ?? "GHS",
    accountId: payload.accountId,
    categoryId: payload.categoryId,
    scheduleType: payload.scheduleType,
    startAt: new Date(payload.startAt).getTime(),
    endAt: payload.endAt ? new Date(payload.endAt).getTime() : undefined,
    status: payload.status,
    trialEndsAt: payload.trialEndsAt ? new Date(payload.trialEndsAt).getTime() : undefined,
    billingProvider: payload.billingProvider,
    externalSubscriptionId: payload.externalSubscriptionId,
  });

  return toSubscription(mapRecurring(row));
}

export async function cancelSubscription(id: string): Promise<boolean> {
  return postJson<boolean>("/subscriptions/cancel", { id });
}

export async function getMonthlySubscriptionSpend(): Promise<MonthlySubscriptionSpend> {
  return postJson<MonthlySubscriptionSpend>("/subscriptions/monthly-spend", {});
}

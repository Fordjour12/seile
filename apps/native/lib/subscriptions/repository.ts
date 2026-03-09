import { api, asId, asOptionalId } from "@/lib/backend-api";
import { useMutation, useQuery } from "convex/react";

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

export function useSubscriptions(
  includeInactive: boolean = false,
): Subscription[] | undefined {
  const rows = useQuery(api.subscriptions.queries.listSubscriptions, {
    includeInactive,
  });

  return rows?.map((item) => toSubscription(mapRecurring(item)));
}

export function useSubscription(id?: string): Subscription | null | undefined {
  const rows = useSubscriptions(true);
  if (rows === undefined) {
    return undefined;
  }

  return rows.find((item) => item.id === id) ?? null;
}

export function useSubscriptionsByStatus(
  status: "active" | "trial" | "paused" | "cancelled",
): Subscription[] | undefined {
  const rows = useQuery(api.subscriptions.queries.getByStatus, {
    status,
  });

  return rows?.map((item) => toSubscription(mapRecurring(item)));
}

export function useUpcomingRenewals(withinDays: number): Subscription[] | undefined {
  const rows = useQuery(api.subscriptions.queries.getUpcomingRenewals, {
    withinDays,
  });

  return rows?.map((item) => toSubscription(mapRecurring(item)));
}

export function useCreateSubscription(): (
  payload: CreateSubscriptionPayload,
) => Promise<void> {
  const createSubscription = useMutation(api.subscriptions.mutations.createSubscription);

  return async (payload) => {
    await createSubscription({
      serviceName: payload.serviceName,
      serviceUrl: payload.serviceUrl,
      logoUrl: payload.logoUrl,
      amount: payload.amount,
      currency: payload.currencyCode ?? "GHS",
      accountId: asId<"accounts">(payload.accountId),
      categoryId: asOptionalId<"categories">(payload.categoryId),
      scheduleType: payload.scheduleType,
      startAt: new Date(payload.startAt).getTime(),
      endAt: payload.endAt ? new Date(payload.endAt).getTime() : undefined,
      status: payload.status,
      trialEndsAt: payload.trialEndsAt ? new Date(payload.trialEndsAt).getTime() : undefined,
      billingProvider: payload.billingProvider,
      externalSubscriptionId: payload.externalSubscriptionId,
    });
  };
}

export function useCancelSubscription(): (id: string) => Promise<boolean> {
  const cancelSubscription = useMutation(api.subscriptions.mutations.cancelSubscription);

  return (id) =>
    cancelSubscription({
      id: asId<"recurringTransactions">(id),
    });
}

export function useMonthlySubscriptionSpend(): MonthlySubscriptionSpend | undefined {
  return useQuery(api.subscriptions.queries.getMonthlySubscriptionSpend, {});
}

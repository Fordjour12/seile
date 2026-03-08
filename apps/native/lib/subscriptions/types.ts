import type { RecurringTransaction, SubscriptionMeta } from "@/lib/recurring";

export type Subscription = RecurringTransaction & {
  isSubscription: true;
  subscriptionMeta: SubscriptionMeta;
};

export interface CreateSubscriptionPayload {
  serviceName: string;
  serviceUrl?: string;
  logoUrl?: string;
  amount: number;
  currencyCode?: string;
  accountId: string;
  categoryId?: string;
  scheduleType: "weekly" | "monthly" | "yearly";
  startAt: string;
  endAt?: string;
  status: "active" | "trial" | "paused" | "cancelled";
  trialEndsAt?: string;
  billingProvider?: string;
  externalSubscriptionId?: string;
}

export interface MonthlySubscriptionSpend {
  monthlyTotal: number;
  count: number;
}

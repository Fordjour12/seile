export type RecurringKind = "expense" | "income" | "transfer";
export type ScheduleType = "daily" | "weekly" | "monthly" | "yearly";

export interface SubscriptionMeta {
  serviceName: string;
  serviceUrl?: string;
  logoUrl?: string;
  status: "active" | "trial" | "paused" | "cancelled";
  trialEndsAt?: string;
  cancelledAt?: string;
  billingProvider?: string;
  externalSubscriptionId?: string;
}

export interface RecurringTransaction {
  id: string;
  kind: RecurringKind;
  amount: number;
  currencyCode: string;
  scheduleType: ScheduleType;
  interval: number;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startAt: string;
  endAt?: string;
  accountId?: string;
  fromAccountId?: string;
  toAccountId?: string;
  categoryId?: string;
  note?: string;
  isActive: boolean;
  isSubscription: boolean;
  nextRunAt: string;
  lastGeneratedAt?: string;
  subscriptionMeta?: SubscriptionMeta;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringPayload {
  kind: RecurringKind;
  amount: number;
  currencyCode?: string;
  scheduleType: ScheduleType;
  interval: number;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startAt: string;
  endAt?: string;
  accountId?: string;
  fromAccountId?: string;
  toAccountId?: string;
  categoryId?: string;
  note?: string;
  isSubscription?: boolean;
  subscriptionMeta?: SubscriptionMeta;
}

export interface UpdateRecurringPayload {
  amount?: number;
  categoryId?: string;
  note?: string;
  endAt?: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
  interval?: number;
  subscriptionMeta?: SubscriptionMeta;
}

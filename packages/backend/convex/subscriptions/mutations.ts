import { ConvexError, v } from "convex/values";

import type { Doc } from "../_generated/dataModel";
import { internalMutation, mutation } from "../_generated/server";
import { assertValidAmount, assertValidCurrency } from "../lib/money";
import { requireUserId } from "../lib/identity";
import { scheduleTypeValidator, subscriptionStatusValidator } from "../schema/recurring_transactions";

export const createSubscription = mutation({
  args: {
    serviceName: v.string(),
    serviceUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    accountId: v.id("accounts"),
    categoryId: v.optional(v.id("categories")),
    scheduleType: scheduleTypeValidator,
    startAt: v.number(),
    endAt: v.optional(v.number()),
    status: subscriptionStatusValidator,
    trialEndsAt: v.optional(v.number()),
    billingProvider: v.optional(v.string()),
    externalSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Doc<"recurringTransactions">> => {
    assertValidAmount(args.amount);
    const currency = assertValidCurrency(args.currency);

    if (args.scheduleType === "daily") {
      throw new ConvexError("Validation: subscriptions cannot be daily");
    }

    const now = Date.now();
    const id = await ctx.db.insert("recurringTransactions", {
      userId: await requireUserId(ctx),
      kind: "expense",
      amount: args.amount,
      currency,
      accountId: args.accountId,
      categoryId: args.categoryId,
      scheduleType: args.scheduleType,
      interval: 1,
      startAt: args.startAt,
      endAt: args.endAt,
      isActive: args.status === "active" || args.status === "trial",
      isSubscription: true,
      nextRunAt: args.startAt,
      subscriptionMeta: {
        serviceName: args.serviceName,
        serviceUrl: args.serviceUrl,
        logoUrl: args.logoUrl,
        status: args.status,
        trialEndsAt: args.trialEndsAt,
        billingProvider: args.billingProvider,
        externalSubscriptionId: args.externalSubscriptionId,
      },
      createdAt: now,
      updatedAt: now,
    });

    const created = await ctx.db.get(id);
    if (!created) {
      throw new ConvexError("Failed to create subscription");
    }

    return created;
  },
});

export const cancelSubscription = mutation({
  args: {
    id: v.id("recurringTransactions"),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const userId = await requireUserId(ctx);
    const recurring = await ctx.db.get(args.id);
    if (!recurring || recurring.userId !== userId || !recurring.isSubscription) {
      throw new ConvexError("Subscription not found");
    }

    await ctx.db.patch(args.id, {
      isActive: false,
      subscriptionMeta: {
        ...recurring.subscriptionMeta!,
        status: "cancelled",
        cancelledAt: Date.now(),
      },
      updatedAt: Date.now(),
    });

    return true;
  },
});

export const checkTrialExpirations = internalMutation({
  args: {},
  handler: async (ctx): Promise<{ updated: number }> => {
    const now = Date.now();
    const trials = await ctx.db
      .query("recurringTransactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("isSubscription"), true),
          q.eq(q.field("isActive"), true),
        ),
      )
      .collect();

    let updated = 0;
    for (const subscription of trials) {
      if (
        subscription.subscriptionMeta?.status === "trial" &&
        subscription.subscriptionMeta.trialEndsAt !== undefined &&
        subscription.subscriptionMeta.trialEndsAt <= now
      ) {
        await ctx.db.patch(subscription._id, {
          subscriptionMeta: {
            ...subscription.subscriptionMeta,
            status: "active",
          },
          updatedAt: now,
        });
        updated += 1;
      }
    }

    return { updated };
  },
});

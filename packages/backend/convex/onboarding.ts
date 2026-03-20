import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getOptionalUser, requireUserId } from "./lib/identity";
import {
   onboardingAiToneValidator,
   onboardingDomainValidator,
   onboardingNotificationSettingsValidator,
   onboardingPlanningStyleValidator,
   onboardingStageValidator,
} from "./schema/onboarding";

function normalizeDomains<T extends string>(values: T[]): T[] {
   const uniqueDomains = Array.from(new Set(values));
   return uniqueDomains.length > 0 ? uniqueDomains : (["faith"] as T[]);
}

function normalizePinnedDomainIds<T extends string>(values: T[], domains: T[]): T[] {
   const allowedDomains = new Set(domains);
   return Array.from(
      new Set(values.filter((value) => allowedDomains.has(value))),
   ).slice(0, 4);
}

export const getOnboardingState = query({
   args: {},
   returns: v.object({
      hasCompletedOnboarding: v.boolean(),
      currentStage: onboardingStageValidator,
      hasSavedPreferences: v.boolean(),
      completedAt: v.union(v.number(), v.null()),
   }),
   handler: async (ctx) => {
      const user = await getOptionalUser(ctx);
      const userId =
         typeof user?.userId === "string" && user.userId.length > 0
            ? user.userId
            : typeof user?._id === "string" && user._id.length > 0
               ? user._id
               : null;

      if (!userId) {
         return {
            hasCompletedOnboarding: true,
            currentStage: "complete" as const,
            hasSavedPreferences: false,
            completedAt: null,
         };
      }

      const row = await ctx.db
         .query("onboardingState")
         .withIndex("by_userId", (q) => q.eq("userId", userId))
         .first();

      return {
         hasCompletedOnboarding: row?.hasCompletedOnboarding ?? true,
         currentStage: row?.currentStage ?? "complete",
         hasSavedPreferences: Boolean(row?.preferences),
         completedAt: row?.completedAt ?? null,
      };
   },
});

export const markOnboardingIncomplete = mutation({
  args: {},
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query("onboardingState")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      if (
        existing.hasCompletedOnboarding === false &&
        existing.currentStage === "first-run-today"
      ) {
        return { ok: true };
      }

      await ctx.db.patch(existing._id, {
        hasCompletedOnboarding: false,
        currentStage: "first-run-today",
        updatedAt: now,
        completedAt: undefined,
      });
      return { ok: true };
    }

    await ctx.db.insert("onboardingState", {
      userId,
      hasCompletedOnboarding: false,
      currentStage: "first-run-today",
      createdAt: now,
      updatedAt: now,
      completedAt: undefined,
    });

    return { ok: true };
  },
});

export const advanceOnboardingStage = mutation({
   args: {
      stage: onboardingStageValidator,
   },
   returns: v.object({ ok: v.boolean() }),
   handler: async (ctx, args) => {
      const userId = await requireUserId(ctx);
      const now = Date.now();
      const existing = await ctx.db
         .query("onboardingState")
         .withIndex("by_userId", (q) => q.eq("userId", userId))
         .first();

      const hasCompletedOnboarding = args.stage === "complete";
      const patch = {
         hasCompletedOnboarding,
         currentStage: args.stage,
         updatedAt: now,
         completedAt: hasCompletedOnboarding ? now : undefined,
      } as const;

      if (existing) {
         await ctx.db.patch(existing._id, patch);
         return { ok: true };
      }

      await ctx.db.insert("onboardingState", {
         userId,
         createdAt: now,
         ...patch,
      });
      return { ok: true };
   },
});

export const saveOnboardingPreferences = mutation({
   args: {
      draft: v.object({
         name: v.string(),
         domains: v.array(onboardingDomainValidator),
         pinnedDomainIds: v.array(onboardingDomainValidator),
         planningStyle: onboardingPlanningStyleValidator,
         aiTone: onboardingAiToneValidator,
         notifications: onboardingNotificationSettingsValidator,
      }),
   },
   returns: v.object({ ok: v.boolean() }),
   handler: async (ctx, args) => {
      const userId = await requireUserId(ctx);
      const now = Date.now();
      const existing = await ctx.db
         .query("onboardingState")
         .withIndex("by_userId", (q) => q.eq("userId", userId))
         .first();

      const domains = normalizeDomains(args.draft.domains);
      const pinnedDomainIds = normalizePinnedDomainIds(
         args.draft.pinnedDomainIds,
         domains,
      );
      const preferences = {
         name: args.draft.name.trim(),
         domains,
         pinnedDomainIds,
         planningStyle: args.draft.planningStyle,
         aiTone: args.draft.aiTone,
         notifications: args.draft.notifications,
         submittedAt: now,
      };

      if (existing) {
         await ctx.db.patch(existing._id, {
            preferences,
            updatedAt: now,
         });
         return { ok: true };
      }

      await ctx.db.insert("onboardingState", {
         userId,
         hasCompletedOnboarding: false,
         currentStage: "first-run-today",
         preferences,
         createdAt: now,
         updatedAt: now,
         completedAt: undefined,
      });

      return { ok: true };
   },
});

export const completeOnboarding = mutation({
   args: {},
   returns: v.object({ ok: v.boolean() }),
   handler: async (ctx) => {
      const userId = await requireUserId(ctx);
      const now = Date.now();
      const existing = await ctx.db
         .query("onboardingState")
         .withIndex("by_userId", (q) => q.eq("userId", userId))
         .first();

      if (existing) {
         await ctx.db.patch(existing._id, {
            hasCompletedOnboarding: true,
            currentStage: "complete",
            updatedAt: now,
            completedAt: now,
         });
         return { ok: true };
      }

      await ctx.db.insert("onboardingState", {
         userId,
         hasCompletedOnboarding: true,
         currentStage: "complete",
         createdAt: now,
         updatedAt: now,
         completedAt: now,
      });
      return { ok: true };
   },
});

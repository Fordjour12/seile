import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getOptionalUser, requireUserId } from "./lib/identity";
import {
  onboardingBiggestBlockerValidator,
  onboardingCommitmentLevelValidator,
  onboardingEnergyPatternValidator,
  onboardingPhaseValidator,
  onboardingPreferredStyleValidator,
  onboardingPrimaryGoalValidator,
  onboardingStageValidator,
  userProfileNotificationsValidator,
} from "./schema/onboarding";

function resolveUserId(user: Awaited<ReturnType<typeof getOptionalUser>>) {
  if (typeof user?.userId === "string" && user.userId.length > 0) {
    return user.userId;
  }
  if (typeof user?._id === "string" && user._id.length > 0) {
    return user._id;
  }
  return null;
}

function dateKeyInTimezone(timestamp: number, timezone?: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date(timestamp));
}

function phaseForDay(dayNumber: number) {
  if (dayNumber <= 2) {
    return "seed" as const;
  }
  if (dayNumber <= 5) {
    return "learn" as const;
  }
  return "act" as const;
}

export const getOnboardingState = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    const userId = resolveUserId(user);

    if (!userId) {
      return {
        exists: false,
        hasCompletedOnboarding: true,
        currentStage: "complete" as const,
        currentPhase: "act" as const,
        dayNumber: 7,
        completedAt: null,
        startedAt: null,
        lastAdvancedAt: null,
        currentDateKey: null,
      };
    }

    const row = await ctx.db
      .query("onboardingState")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return {
      exists: row !== null,
      hasCompletedOnboarding: row?.hasCompletedOnboarding ?? true,
      currentStage: row?.currentStage ?? "complete",
      currentPhase: row?.currentPhase ?? phaseForDay(row?.dayNumber ?? 7),
      dayNumber: row?.dayNumber ?? 7,
      completedAt: row?.completedAt ?? null,
      startedAt: row?.startedAt ?? row?.createdAt ?? null,
      lastAdvancedAt: row?.lastAdvancedAt ?? row?.updatedAt ?? null,
      currentDateKey: row?.currentDateKey ?? null,
    };
  },
});

export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    const userId = resolveUserId(user);

    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("userProfile")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

export const upsertUserProfile = mutation({
  args: {
    name: v.string(),
    primaryGoal: onboardingPrimaryGoalValidator,
    energyPattern: onboardingEnergyPatternValidator,
    biggestBlocker: onboardingBiggestBlockerValidator,
    preferredStyle: onboardingPreferredStyleValidator,
    commitmentLevel: onboardingCommitmentLevelValidator,
    notifications: userProfileNotificationsValidator,
    timezone: v.string(),
    seedAnswers: v.optional(v.any()),
    draftCompletedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query("userProfile")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const patch = {
      name: args.name.trim(),
      primaryGoal: args.primaryGoal,
      energyPattern: args.energyPattern,
      biggestBlocker: args.biggestBlocker,
      preferredStyle: args.preferredStyle,
      commitmentLevel: args.commitmentLevel,
      notifications: args.notifications,
      timezone: args.timezone,
      seedAnswers: args.seedAnswers,
      draftCompletedAt: args.draftCompletedAt,
      syncedFromClientAt: now,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return await ctx.db.get(existing._id);
    }

    const id = await ctx.db.insert("userProfile", {
      userId,
      ...patch,
      createdAt: now,
    });

    return await ctx.db.get(id);
  },
});

export const initializeOnboardingState = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const profile = await ctx.db
      .query("userProfile")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    const currentDateKey = dateKeyInTimezone(now, profile?.timezone);
    const existing = await ctx.db
      .query("onboardingState")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const patch = {
      hasCompletedOnboarding: false,
      currentStage: "first-run-today" as const,
      currentPhase: "seed" as const,
      dayNumber: 1,
      startedAt: existing?.startedAt ?? existing?.createdAt ?? now,
      lastAdvancedAt: now,
      currentDateKey,
      updatedAt: now,
      completedAt: undefined,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return { ok: true };
    }

    await ctx.db.insert("onboardingState", {
      userId,
      ...patch,
      createdAt: now,
    });

    return { ok: true };
  },
});

export const markOnboardingIncomplete = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const profile = await ctx.db
      .query("userProfile")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    const currentDateKey = dateKeyInTimezone(now, profile?.timezone);
    const existing = await ctx.db
      .query("onboardingState")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const patch = {
      hasCompletedOnboarding: false,
      currentStage: "first-run-today" as const,
      currentPhase: "seed" as const,
      dayNumber: 1,
      startedAt: existing?.startedAt ?? existing?.createdAt ?? now,
      lastAdvancedAt: now,
      currentDateKey,
      updatedAt: now,
      completedAt: undefined,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return { ok: true };
    }

    await ctx.db.insert("onboardingState", {
      userId,
      ...patch,
      createdAt: now,
    });

    return { ok: true };
  },
});

export const advanceOnboardingStage = mutation({
  args: {
    stage: onboardingStageValidator,
    phase: v.optional(onboardingPhaseValidator),
    dayNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const profile = await ctx.db
      .query("userProfile")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    const currentDateKey = dateKeyInTimezone(now, profile?.timezone);
    const existing = await ctx.db
      .query("onboardingState")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const nextDayNumber = args.dayNumber ?? existing?.dayNumber ?? 1;
    const nextPhase = args.phase ?? phaseForDay(nextDayNumber);
    const hasCompletedOnboarding = args.stage === "complete";
    const patch = {
      hasCompletedOnboarding,
      currentStage: args.stage,
      currentPhase: nextPhase,
      dayNumber: nextDayNumber,
      startedAt: existing?.startedAt ?? existing?.createdAt ?? now,
      lastAdvancedAt: now,
      currentDateKey,
      updatedAt: now,
      completedAt: hasCompletedOnboarding ? now : undefined,
    } as const;

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return { ok: true };
    }

    await ctx.db.insert("onboardingState", {
      userId,
      ...patch,
      createdAt: now,
    });
    return { ok: true };
  },
});

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const profile = await ctx.db
      .query("userProfile")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    const currentDateKey = dateKeyInTimezone(now, profile?.timezone);
    const existing = await ctx.db
      .query("onboardingState")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const patch = {
      hasCompletedOnboarding: true,
      currentStage: "complete" as const,
      currentPhase: "act" as const,
      dayNumber: Math.max(existing?.dayNumber ?? 1, 7),
      startedAt: existing?.startedAt ?? existing?.createdAt ?? now,
      lastAdvancedAt: now,
      currentDateKey,
      updatedAt: now,
      completedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return { ok: true };
    }

    await ctx.db.insert("onboardingState", {
      userId,
      ...patch,
      createdAt: now,
    });
    return { ok: true };
  },
});

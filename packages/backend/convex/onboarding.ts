import { mutation, query } from "./_generated/server";
import { getOptionalUser, requireUserId } from "./lib/identity";
import { onboardingStageValidator } from "./schema/onboarding";

export const getOnboardingState = query({
  args: {},
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
      completedAt: row?.completedAt ?? null,
    };
  },
});

export const markOnboardingIncomplete = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query("onboardingState")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
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

export const completeOnboarding = mutation({
  args: {},
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

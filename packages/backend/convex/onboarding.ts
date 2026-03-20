import { ConvexError, v } from "convex/values";

import { mutation, query, internalMutation } from "./_generated/server";
import {
  activityCategoryValidator,
  onboardingBiggestBlockerValidator,
  onboardingCommitmentLevelValidator,
  onboardingEnergyPatternValidator,
  onboardingPreferredStyleValidator,
  onboardingPrimaryGoalValidator,
  onboardingStageValidator,
  signalActionValidator,
  suggestionVerdictValidator,
} from "./schema/onboarding";
import { getOptionalUser, requireUserId } from "./lib/identity";
import {
  asItemId,
  buildDateKey,
  buildDeterministicSuggestion,
  buildSuggestionReasoning,
  buildWeekTwoPlan,
  endOfLocalDay,
  getCommitmentActivityCount,
  getDecayedWeight,
  getPhaseFromSignals,
  getStageFromDay,
  HARD_CODED_TEMPLATES,
  matchesTemplateProfile,
  ONBOARDING_CATEGORIES,
} from "./lib/aiOnboarding";

export const getOnboardingState = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    const userId = getUserIdFromAuth(user);

    if (!userId) {
      return {
        exists: false,
        hasCompletedOnboarding: true,
        currentStage: "complete" as const,
        currentPhase: "act" as const,
        dayNumber: 7,
        completedAt: null,
        startedAt: null,
      };
    }

    const row = await getStateByUserId(ctx, userId);
    return {
      exists: row !== null,
      hasCompletedOnboarding: row?.hasCompletedOnboarding ?? true,
      currentStage: row?.currentStage ?? "complete",
      currentPhase: row?.currentPhase ?? "act",
      dayNumber: row?.dayNumber ?? 7,
      completedAt: row?.completedAt ?? null,
      startedAt: row?.startedAt ?? null,
    };
  },
});

export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    const userId = getUserIdFromAuth(user);
    if (!userId) {
      return null;
    }

    return await getProfileByUserId(ctx, userId);
  },
});

export const getDailyAIContext = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profile = await getRequiredProfile(ctx, userId);
    const state = await getRequiredState(ctx, userId);
    const [scores, recentSignals, recentAssignments] = await Promise.all([
      ctx.db
        .query("confidenceScores")
        .withIndex("by_userId", (q: any) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("signals")
        .withIndex("by_userId", (q: any) => q.eq("userId", userId))
        .order("desc")
        .take(30),
      ctx.db
        .query("activityAssignments")
        .withIndex("by_userId", (q: any) => q.eq("userId", userId))
        .order("desc")
        .take(15),
    ]);

    const assignments = await Promise.all(
      recentAssignments.map(async (assignment) => {
        const [template, reflection] = await Promise.all([
          ctx.db.get(assignment.templateId),
          ctx.db
            .query("activityReflections")
            .withIndex("by_assignmentId", (q: any) => q.eq("assignmentId", assignment._id))
            .first(),
        ]);

        return {
          ...assignment,
          template,
          reflection,
        };
      }),
    );

    const signalSummary = Object.fromEntries(
      ONBOARDING_CATEGORIES.map((category) => {
        const categorySignals = recentSignals.filter((signal: any) => signal.category === category);
        const score = scores.find((entry: any) => entry.category === category);
        const avgDuration =
          categorySignals.length > 0
            ? Math.round(
                categorySignals.reduce((sum, signal) => sum + (signal.durationMs ?? 0), 0) /
                  categorySignals.length,
              )
            : 0;

        return [
          category,
          {
            score: score?.score ?? 0,
            signalCount: score?.signalCount ?? 0,
            completions: categorySignals.filter((signal: any) => signal.action === "completed").length,
            skips: categorySignals.filter((signal: any) => signal.action === "skipped").length,
            avgDuration,
          },
        ];
      }),
    );

    const overallEngagement =
      scores.length > 0
        ? Math.round(scores.reduce((sum, score) => sum + score.score, 0) / scores.length)
        : 0;

    return {
      profile,
      state,
      signalSummary,
      rawSignals: recentSignals,
      assignments,
      readyForBoldSuggestions: scores.some((score) => score.score >= 80),
      overallEngagement,
    };
  },
});

export const getFirstRunDashboard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profile = await getRequiredProfile(ctx, userId);
    const state = await getRequiredState(ctx, userId);

    const [scores, dayAssignments, suggestions, recentSignals] = await Promise.all([
      ctx.db
        .query("confidenceScores")
        .withIndex("by_userId", (q: any) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("activityAssignments")
        .withIndex("by_userId_day", (q: any) =>
          q.eq("userId", userId).eq("dayNumber", state.dayNumber),
        )
        .collect(),
      ctx.db
        .query("suggestions")
        .withIndex("by_userId", (q: any) => q.eq("userId", userId))
        .order("desc")
        .take(8),
      ctx.db
        .query("signals")
        .withIndex("by_userId", (q: any) => q.eq("userId", userId))
        .order("desc")
        .take(20),
    ]);

    const assignments = await Promise.all(
      dayAssignments.map(async (assignment) => {
        const [template, reflection, events] = await Promise.all([
          ctx.db.get(assignment.templateId),
          ctx.db
            .query("activityReflections")
            .withIndex("by_assignmentId", (q: any) => q.eq("assignmentId", assignment._id))
            .first(),
          ctx.db
            .query("activityEvents")
            .withIndex("by_assignmentId", (q: any) => q.eq("assignmentId", assignment._id))
            .collect(),
        ]);

        if (!template) {
          throw new ConvexError("Activity template missing");
        }

        return {
          ...assignment,
          template,
          reflection,
          events,
        };
      }),
    );

    const categories = ONBOARDING_CATEGORIES.map((category) => {
      const score = scores.find((entry: any) => entry.category === category);
      const categorySignals = recentSignals.filter((signal: any) => signal.category === category);
      return {
        category,
        score: score?.score ?? 0,
        signalCount: score?.signalCount ?? 0,
        completions: categorySignals.filter((signal: any) => signal.action === "completed").length,
        skips: categorySignals.filter((signal: any) => signal.action === "skipped").length,
      };
    })
      .filter((entry) => entry.signalCount > 0 || entry.score > 0)
      .sort((a, b) => b.score - a.score);

    return {
      profile,
      state,
      assignments,
      suggestions,
      confidence: categories,
      recentSignals,
      weekTwoPlan: state.dayNumber >= 7 ? buildWeekTwoPlan({ profile, scores }) : null,
      readyToComplete: state.dayNumber >= 7,
    };
  },
});

export const completeSeedOnboarding = mutation({
  args: {
    primaryGoal: onboardingPrimaryGoalValidator,
    energyPattern: onboardingEnergyPatternValidator,
    biggestBlocker: onboardingBiggestBlockerValidator,
    preferredStyle: onboardingPreferredStyleValidator,
    commitmentLevel: onboardingCommitmentLevelValidator,
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const currentDateKey = buildDateKey(now, args.timezone);
    const existingProfile = await getProfileByUserId(ctx, userId);
    const existingState = await getStateByUserId(ctx, userId);

    const profilePatch = {
      primaryGoal: args.primaryGoal,
      energyPattern: args.energyPattern,
      biggestBlocker: args.biggestBlocker,
      preferredStyle: args.preferredStyle,
      commitmentLevel: args.commitmentLevel,
      timezone: args.timezone,
      seedAnswers: args,
      updatedAt: now,
    };

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, profilePatch);
    } else {
      await ctx.db.insert("userProfile", {
        userId,
        ...profilePatch,
        createdAt: now,
      });
    }

    if (existingState) {
      await ctx.db.patch(existingState._id, {
        hasCompletedOnboarding: false,
        currentStage: "first-run-today",
        currentPhase: "seed",
        dayNumber: 1,
        startedAt: now,
        lastAdvancedAt: now,
        currentDateKey,
        updatedAt: now,
        completedAt: undefined,
      });
    } else {
      await ctx.db.insert("onboardingState", {
        userId,
        hasCompletedOnboarding: false,
        currentStage: "first-run-today",
        currentPhase: "seed",
        dayNumber: 1,
        startedAt: now,
        lastAdvancedAt: now,
        currentDateKey,
        createdAt: now,
        updatedAt: now,
        completedAt: undefined,
      });
    }

    await ensureActivityTemplates(ctx);
    await ensureAssignmentsForDay(ctx, { userId, dayNumber: 1 });

    return { ok: true };
  },
});

export const initializeOnboardingState = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profile = await getProfileByUserId(ctx, userId);
    if (!profile) {
      return { ok: false };
    }

    await ensureActivityTemplates(ctx);
    await syncCurrentUserDay(ctx, { userId, now: Date.now() });
    return { ok: true };
  },
});

export const syncFirstRunDay = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    await ensureActivityTemplates(ctx);
    await syncCurrentUserDay(ctx, { userId, now: Date.now() });
    await ensureSuggestionsForUser(ctx, userId);
    return { ok: true };
  },
});

export const generateDailySuggestions = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    await ensureSuggestionsForUser(ctx, userId, true);
    return { ok: true };
  },
});

export const recordActivityEvent = mutation({
  args: {
    assignmentId: v.id("activityAssignments"),
    action: signalActionValidator,
    elapsedMs: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment || assignment.userId !== userId) {
      throw new ConvexError("Activity assignment not found");
    }

    const template = await ctx.db.get(assignment.templateId);
    if (!template) {
      throw new ConvexError("Activity template not found");
    }

    const now = Date.now();
    await ctx.db.insert("activityEvents", {
      assignmentId: assignment._id,
      userId,
      action: args.action,
      elapsedMs: args.elapsedMs,
      metadata: args.metadata,
      createdAt: now,
    });

    const signalDef = template.signalMap[args.action];
    if (signalDef) {
      await ctx.db.insert("signals", {
        userId,
        category: signalDef.category,
        action: signalDef.action,
        itemId: asItemId(assignment._id),
        weight: signalDef.weight,
        durationMs: args.elapsedMs,
        metadata: args.metadata,
        createdAt: now,
      });

      await updateConfidenceScore(ctx, {
        userId,
        category: signalDef.category,
        delta: signalDef.weight,
        verdict:
          args.action === "completed"
            ? "accepted"
            : args.action === "skipped"
              ? "dismissed"
              : null,
      });
    }

    if (args.action === "started" && assignment.status === "pending") {
      await ctx.db.patch(assignment._id, { status: "started" });
    }

    if (args.action === "completed" || args.action === "skipped") {
      await ctx.db.patch(assignment._id, { status: args.action });
    }

    return { ok: true };
  },
});

export const recordActivityReflection = mutation({
  args: {
    assignmentId: v.id("activityAssignments"),
    difficultyRating: v.optional(v.number()),
    usefulnessRating: v.optional(v.number()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment || assignment.userId !== userId) {
      throw new ConvexError("Activity assignment not found");
    }

    const existingReflection = await ctx.db
      .query("activityReflections")
      .withIndex("by_assignmentId", (q: any) => q.eq("assignmentId", assignment._id))
      .first();
    const now = Date.now();

    if (existingReflection) {
      await ctx.db.patch(existingReflection._id, {
        difficultyRating: args.difficultyRating,
        usefulnessRating: args.usefulnessRating,
        note: args.note,
      });
    } else {
      await ctx.db.insert("activityReflections", {
        assignmentId: assignment._id,
        userId,
        difficultyRating: args.difficultyRating,
        usefulnessRating: args.usefulnessRating,
        note: args.note,
        createdAt: now,
      });
    }

    await ctx.db.insert("signals", {
      userId,
      category: "reflection",
      action: "reflected",
      itemId: asItemId(assignment._id),
      metadata: {
        difficultyRating: args.difficultyRating,
        usefulnessRating: args.usefulnessRating,
      },
      createdAt: now,
    });

    await updateConfidenceScore(ctx, {
      userId,
      category: "reflection",
      delta: 10,
      verdict: "accepted",
    });

    return { ok: true };
  },
});

export const submitSuggestionFeedback = mutation({
  args: {
    suggestionId: v.id("suggestions"),
    verdict: suggestionVerdictValidator,
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const suggestion = await ctx.db.get(args.suggestionId);
    if (!suggestion || suggestion.userId !== userId) {
      throw new ConvexError("Suggestion not found");
    }

    const now = Date.now();
    await ctx.db.insert("feedback", {
      suggestionId: suggestion._id,
      userId,
      verdict: args.verdict,
      reason: args.reason,
      createdAt: now,
    });

    await ctx.db.patch(suggestion._id, {
      feedbackVerdict: args.verdict,
      feedbackReason: args.reason,
      feedbackAt: now,
    });

    await ctx.db.insert("signals", {
      userId,
      category: suggestion.category,
      action: args.verdict,
      itemId: asItemId(suggestion._id),
      metadata: args.reason ? { reason: args.reason } : undefined,
      createdAt: now,
    });

    await updateConfidenceScore(ctx, {
      userId,
      category: suggestion.category,
      delta: args.verdict === "accepted" ? 12 : args.verdict === "dismissed" ? -10 : -2,
      verdict:
        args.verdict === "accepted"
          ? "accepted"
          : args.verdict === "dismissed"
            ? "dismissed"
            : null,
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
    const state = await getRequiredState(ctx, userId);
    const now = Date.now();
    await ctx.db.patch(state._id, {
      currentStage: args.stage,
      currentPhase: args.stage === "complete" ? "act" : state.currentPhase,
      hasCompletedOnboarding: args.stage === "complete",
      completedAt: args.stage === "complete" ? now : undefined,
      updatedAt: now,
    });
    return { ok: true };
  },
});

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const state = await getRequiredState(ctx, userId);
    const now = Date.now();
    await ctx.db.patch(state._id, {
      hasCompletedOnboarding: true,
      currentStage: "complete",
      currentPhase: "act",
      completedAt: now,
      updatedAt: now,
    });
    return { ok: true };
  },
});

export const advanceEligibleFirstRunDays = internalMutation({
  args: {},
  handler: async (ctx) => {
    const states = await ctx.db
      .query("onboardingState")
      .collect();

    for (const state of states) {
      if (state.hasCompletedOnboarding) {
        continue;
      }

      await syncCurrentUserDay(ctx, {
        userId: state.userId,
        now: Date.now(),
      });
      await ensureSuggestionsForUser(ctx, state.userId);
    }

    return { ok: true };
  },
});

async function syncCurrentUserDay(
  ctx: any,
  args: {
    userId: string;
    now: number;
  },
) {
  const profile = await getProfileByUserId(ctx, args.userId);
  const state = await getStateByUserId(ctx, args.userId);
  if (!profile || !state || state.hasCompletedOnboarding) {
    return;
  }

  const nextDateKey = buildDateKey(args.now, profile.timezone);
  if (nextDateKey === state.currentDateKey) {
    await ensureAssignmentsForDay(ctx, { userId: args.userId, dayNumber: state.dayNumber });
    return;
  }

  const nextDayNumber = Math.min(7, state.dayNumber + 1);
  const scores = await ctx.db
    .query("confidenceScores")
    .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
    .collect();
  const nextPhase = getPhaseFromSignals({
    dayNumber: nextDayNumber,
    scores,
  });

  await ctx.db.patch(state._id, {
    dayNumber: nextDayNumber,
    currentStage: getStageFromDay(nextDayNumber),
    currentPhase: nextPhase,
    currentDateKey: nextDateKey,
    lastAdvancedAt: args.now,
    updatedAt: args.now,
  });

  await ensureAssignmentsForDay(ctx, { userId: args.userId, dayNumber: nextDayNumber });
}

async function ensureActivityTemplates(ctx: any) {
  for (const template of HARD_CODED_TEMPLATES) {
    const existing = await ctx.db
      .query("activityTemplates")
      .withIndex("by_slug", (q: any) => q.eq("slug", template.slug))
      .first();

    if (existing) {
      continue;
    }

    await ctx.db.insert("activityTemplates", template);
  }
}

async function ensureAssignmentsForDay(
  ctx: any,
  args: {
    userId: string;
    dayNumber: number;
  },
) {
  const profile = await getRequiredProfile(ctx, args.userId);
  const state = await getRequiredState(ctx, args.userId);
  const existingAssignments = await ctx.db
    .query("activityAssignments")
    .withIndex("by_userId_day", (q: any) =>
      q.eq("userId", args.userId).eq("dayNumber", args.dayNumber),
    )
    .collect();

  if (existingAssignments.length > 0) {
    return;
  }

  const templates = await Promise.all(
    HARD_CODED_TEMPLATES.map(async (template) =>
      ctx.db
        .query("activityTemplates")
        .withIndex("by_slug", (q: any) => q.eq("slug", template.slug))
        .first(),
    ),
  );

  const availableTemplates = templates.filter((template) => template !== null);
  const targetCount = getCommitmentActivityCount(profile.commitmentLevel);
  const chosenTemplates = availableTemplates
    .filter((template) => matchesTemplateProfile(template, profile, args.dayNumber))
    .slice(0, targetCount);

  const now = Date.now();
  const phase =
    args.dayNumber === state.dayNumber
      ? state.currentPhase
      : getPhaseFromSignals({
          dayNumber: args.dayNumber,
          scores: await ctx.db
            .query("confidenceScores")
            .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
            .collect(),
        });

  for (const template of chosenTemplates) {
    await ctx.db.insert("activityAssignments", {
      userId: args.userId,
      templateId: template._id,
      dayNumber: args.dayNumber,
      status: "pending",
      phase,
      assignedBy: "system",
      assignedAt: now,
      dueAt: endOfLocalDay(now, profile.timezone),
    });
  }
}

async function ensureSuggestionsForUser(
  ctx: any,
  userId: string,
  force = false,
) {
  const profile = await getProfileByUserId(ctx, userId);
  const state = await getStateByUserId(ctx, userId);
  if (!profile || !state || state.hasCompletedOnboarding || state.dayNumber < 3) {
    return;
  }

  const startOfDay = state.lastAdvancedAt;
  const existing = await ctx.db
    .query("suggestions")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .collect();
  const daySuggestions = existing.filter((suggestion: any) => suggestion.shownAt >= startOfDay);
  if (daySuggestions.length > 0 && !force) {
    return;
  }

  const [scores, signals] = await Promise.all([
    ctx.db
      .query("confidenceScores")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .collect(),
    ctx.db
      .query("signals")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .order("desc")
      .take(30),
  ]);

  const candidates = ONBOARDING_CATEGORIES.map((category) => {
    const score = scores.find((entry: any) => entry.category === category);
    const categorySignals = signals.filter((signal: any) => signal.category === category);
    return {
      category,
      score: score?.score ?? 0,
      completions: categorySignals.filter((signal: any) => signal.action === "completed").length,
      skips: categorySignals.filter((signal: any) => signal.action === "skipped").length,
    };
  })
    .filter((entry) => entry.score >= 31)
    .sort((a, b) => b.score - a.score)
    .slice(0, state.currentPhase === "learn" ? 2 : 3);

  const now = Date.now();
  for (const candidate of candidates) {
    const alreadyExists = daySuggestions.some(
      (suggestion: any) => suggestion.category === candidate.category,
    );
    if (alreadyExists && !force) {
      continue;
    }

    await ctx.db.insert("suggestions", {
      userId,
      category: candidate.category,
      content: buildDeterministicSuggestion({
        category: candidate.category,
        score: candidate.score,
        completions: candidate.completions,
        skips: candidate.skips,
        profile,
        dayNumber: state.dayNumber,
      }),
      reasoning: buildSuggestionReasoning({
        category: candidate.category,
        score: candidate.score,
        completions: candidate.completions,
        skips: candidate.skips,
        profile,
      }),
      confidenceAtTime: candidate.score,
      phase: state.currentPhase,
      shownAt: now,
    });
  }
}

async function updateConfidenceScore(
  ctx: any,
  args: {
    userId: string;
    category: InferCategory;
    delta: number;
    verdict: "accepted" | "dismissed" | null;
  },
) {
  const existing = await ctx.db
    .query("confidenceScores")
    .withIndex("by_userId_category", (q: any) =>
      q.eq("userId", args.userId).eq("category", args.category),
    )
    .first();

  const base = existing ?? {
    score: 0,
    signalCount: 0,
    acceptCount: 0,
    dismissCount: 0,
    updatedAt: 0,
  };

  const decayedDelta =
    existing === null
      ? args.delta
      : getDecayedWeight({ createdAt: existing.updatedAt }, args.delta);
  const signalCount = base.signalCount + 1;
  const acceptCount =
    args.verdict === "accepted" ? base.acceptCount + 1 : base.acceptCount;
  const dismissCount =
    args.verdict === "dismissed" ? base.dismissCount + 1 : base.dismissCount;
  const acceptRatio = signalCount > 0 ? acceptCount / signalCount : 0;
  const nextScore = Math.round(
    Math.max(0, Math.min(100, base.score + decayedDelta + acceptRatio * 5)),
  );

  if (existing) {
    await ctx.db.patch(existing._id, {
      score: nextScore,
      signalCount,
      acceptCount,
      dismissCount,
      updatedAt: Date.now(),
    });
    return;
  }

  await ctx.db.insert("confidenceScores", {
    userId: args.userId,
    category: args.category,
    score: Math.max(0, Math.round(args.delta)),
    signalCount: 1,
    acceptCount,
    dismissCount,
    updatedAt: Date.now(),
  });
}

async function getProfileByUserId(ctx: any, userId: string) {
  return await ctx.db
    .query("userProfile")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();
}

async function getStateByUserId(ctx: any, userId: string) {
  return await ctx.db
    .query("onboardingState")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();
}

async function getRequiredProfile(ctx: any, userId: string) {
  const profile = await getProfileByUserId(ctx, userId);
  if (!profile) {
    throw new ConvexError("Onboarding profile not found");
  }
  return profile;
}

async function getRequiredState(ctx: any, userId: string) {
  const state = await getStateByUserId(ctx, userId);
  if (!state) {
    throw new ConvexError("Onboarding state not found");
  }
  return state;
}

function getUserIdFromAuth(user: unknown) {
  if (!user || typeof user !== "object") {
    return null;
  }

  const value = user as Record<string, unknown>;
  if (typeof value.userId === "string" && value.userId.length > 0) {
    return value.userId;
  }
  if (typeof value._id === "string" && value._id.length > 0) {
    return value._id;
  }
  return null;
}

type InferCategory =
  | "focus"
  | "sleep"
  | "exercise"
  | "tasks"
  | "habits"
  | "reflection";

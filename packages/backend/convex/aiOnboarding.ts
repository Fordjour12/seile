import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import {
  AI_ONBOARDING_QUESTIONS,
  HARD_CODED_ACTIVITY_TEMPLATES,
  average,
  buildSystemPrompt,
  getAssignmentItemId,
  getCommitmentTargetCount,
  getDecayedWeight,
  getEndOfDayTimestamp,
  getPhaseForDay,
  getTier,
  matchesProfile,
} from "./lib/aiOnboarding";
import { requireUserId } from "./lib/identity";
import {
  aiOnboardingActivityActionValidator,
  aiOnboardingCategoryValidator,
  aiOnboardingFeedbackVerdictValidator,
  aiOnboardingPhaseValidator,
  aiOnboardingProfileAnswersValidator,
} from "./schema/aiOnboarding";

export const getQuestions = query({
  args: {},
  returns: v.array(
    v.object({
      key: v.string(),
      title: v.string(),
      hint: v.string(),
      options: v.array(
        v.object({
          label: v.string(),
          sub: v.optional(v.string()),
          value: v.string(),
        }),
      ),
    }),
  ),
  handler: async () => {
    return AI_ONBOARDING_QUESTIONS.map((question) => ({
      key: question.key,
      title: question.title,
      hint: question.hint,
      options: question.options.map((option) => ({
        label: option.label,
        sub: "sub" in option ? option.sub : undefined,
        value: option.value,
      })),
    }));
  },
});

export const getProfile = query({
  args: {},
  handler: async (ctx: any) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("aiOnboardingProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

export const seedHardcodedActivityTemplates = mutation({
  args: {},
  returns: v.object({ inserted: v.number(), updated: v.number() }),
  handler: async (ctx: any) => {
    const now = Date.now();
    let inserted = 0;
    let updated = 0;

    for (const template of HARD_CODED_ACTIVITY_TEMPLATES) {
      const existing = await ctx.db
        .query("aiOnboardingActivityTemplates")
        .withIndex("by_slug", (q) => q.eq("slug", template.slug))
        .first();

      const patch = {
        title: template.title,
        category: template.category,
        difficulty: template.difficulty,
        source: template.source,
        durationMinutes: template.durationMinutes,
        instructions: template.instructions,
        signalMap: template.signalMap,
        isHardcoded: template.isHardcoded,
        goalTargets: [...template.goalTargets],
        energyTargets: [...template.energyTargets],
        minDayNumber: template.minDayNumber,
        updatedAt: now,
      };

      if (existing) {
        await ctx.db.patch(existing._id, patch);
        updated += 1;
        continue;
      }

      await ctx.db.insert("aiOnboardingActivityTemplates", {
        slug: template.slug,
        ...patch,
        createdAt: now,
      });
      inserted += 1;
    }

    return { inserted, updated };
  },
});

export const completeAiOnboarding = mutation({
  args: {
    answers: aiOnboardingProfileAnswersValidator,
    timezone: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const timezone = args.timezone?.trim() || "UTC";
    const existing = await ctx.db
      .query("aiOnboardingProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const dayNumber = existing?.dayNumber ?? 1;
    const patch = {
      primaryGoal: args.answers.primaryGoal,
      energyPattern: args.answers.energyPattern,
      biggestBlocker: args.answers.biggestBlocker,
      preferredStyle: args.answers.preferredStyle,
      commitmentLevel: args.answers.commitmentLevel,
      timezone,
      dayNumber,
      seedAnswers: args.answers,
      updatedAt: now,
    };

    let profileId: Id<"aiOnboardingProfiles">;
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      profileId = existing._id;
    } else {
      profileId = await ctx.db.insert("aiOnboardingProfiles", {
        userId,
        ...patch,
        createdAt: now,
      });
    }

    await ensureHardcodedTemplates(ctx);
    const assigned = await assignDayActivities(ctx, {
      userId,
      dayNumber,
      phase: getPhaseForDay(dayNumber),
      now,
    });

    return {
      ok: true,
      profileId,
      dayNumber,
      assignedCount: assigned.length,
    };
  },
});

export const advanceDay = mutation({
  args: {
    dayNumber: v.optional(v.number()),
  },
  returns: v.object({ dayNumber: v.number(), assignedCount: v.number() }),
  handler: async (ctx: any, args: any) => {
    const userId = await requireUserId(ctx);
    const profile = await requireProfile(ctx, userId);
    const nextDayNumber = Math.max(args.dayNumber ?? profile.dayNumber + 1, 1);
    const now = Date.now();

    await ctx.db.patch(profile._id, {
      dayNumber: nextDayNumber,
      updatedAt: now,
    });

    await ensureHardcodedTemplates(ctx);
    const assignments = await assignDayActivities(ctx, {
      userId,
      dayNumber: nextDayNumber,
      phase: getPhaseForDay(nextDayNumber),
      now,
    });

    return {
      dayNumber: nextDayNumber,
      assignedCount: assignments.length,
    };
  },
});

export const getAssignmentsForDay = query({
  args: {
    dayNumber: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const userId = await requireUserId(ctx);
    const profile = await ctx.db
      .query("aiOnboardingProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      return [];
    }

    const dayNumber = args.dayNumber ?? profile.dayNumber;
    const assignments = await ctx.db
      .query("aiOnboardingActivityAssignments")
      .withIndex("by_userId_day", (q) => q.eq("userId", userId).eq("dayNumber", dayNumber))
      .collect();

    const templates = await Promise.all(
      assignments.map((assignment) => ctx.db.get(assignment.templateId)),
    );

    return assignments.map((assignment, index) => ({
      ...assignment,
      template: templates[index],
    }));
  },
});

export const createSuggestion = mutation({
  args: {
    category: aiOnboardingCategoryValidator,
    content: v.string(),
    reasoning: v.optional(v.string()),
    confidenceAtTime: v.number(),
    phase: aiOnboardingPhaseValidator,
  },
  handler: async (ctx: any, args: any) => {
    const userId = await requireUserId(ctx);
    return await ctx.db.insert("aiOnboardingSuggestions", {
      userId,
      category: args.category,
      content: args.content.trim(),
      reasoning: args.reasoning?.trim(),
      confidenceAtTime: Math.round(Math.max(0, Math.min(100, args.confidenceAtTime))),
      phase: args.phase,
      shownAt: Date.now(),
    });
  },
});

export const recordSuggestionFeedback = mutation({
  args: {
    suggestionId: v.id("aiOnboardingSuggestions"),
    verdict: aiOnboardingFeedbackVerdictValidator,
    reason: v.optional(v.string()),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx: any, args: any) => {
    const userId = await requireUserId(ctx);
    const suggestion = await ctx.db.get(args.suggestionId);

    if (!suggestion || suggestion.userId !== userId) {
      throw new ConvexError("Suggestion not found");
    }

    await ctx.db.insert("aiOnboardingFeedback", {
      suggestionId: args.suggestionId,
      userId,
      verdict: args.verdict,
      reason: args.reason?.trim(),
      createdAt: Date.now(),
    });

    const deltaByVerdict: Record<Doc<"aiOnboardingFeedback">["verdict"], number> = {
      accepted: 12,
      dismissed: -10,
      snoozed: -2,
    };

    await updateConfidenceScore(ctx, {
      userId,
      category: suggestion.category,
      delta: deltaByVerdict[args.verdict],
      verdict: args.verdict,
    });

    return { ok: true };
  },
});

export const recordActivityEvent = mutation({
  args: {
    assignmentId: v.id("aiOnboardingActivityAssignments"),
    action: aiOnboardingActivityActionValidator,
    elapsedMs: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx: any, args: any) => {
    const userId = await requireUserId(ctx);
    const assignment = await ctx.db.get(args.assignmentId);

    if (!assignment || assignment.userId !== userId) {
      throw new ConvexError("Assignment not found");
    }

    const template = await ctx.db.get(assignment.templateId);
    if (!template) {
      throw new ConvexError("Activity template not found");
    }

    const signalDef = template.signalMap[args.action];
    const now = Date.now();

    await ctx.db.insert("aiOnboardingActivityEvents", {
      assignmentId: args.assignmentId,
      userId,
      action: args.action,
      elapsedMs: args.elapsedMs ?? 0,
      metadata: args.metadata,
      createdAt: now,
    });

    if (signalDef) {
      await ctx.db.insert("aiOnboardingSignals", {
        userId,
        category: signalDef.category,
        action: signalDef.action,
        itemId: getAssignmentItemId(args.assignmentId),
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

    if (args.action === "completed" || args.action === "skipped") {
      await ctx.db.patch(assignment._id, {
        status: args.action,
        completedAt: args.action === "completed" ? now : assignment.completedAt,
        skippedAt: args.action === "skipped" ? now : assignment.skippedAt,
      });
    }

    return { ok: true };
  },
});

export const recordReflection = mutation({
  args: {
    assignmentId: v.id("aiOnboardingActivityAssignments"),
    difficultyRating: v.optional(v.number()),
    usefulnessRating: v.optional(v.number()),
    note: v.optional(v.string()),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx: any, args: any) => {
    const userId = await requireUserId(ctx);
    const assignment = await ctx.db.get(args.assignmentId);

    if (!assignment || assignment.userId !== userId) {
      throw new ConvexError("Assignment not found");
    }

    const now = Date.now();
    await ctx.db.insert("aiOnboardingActivityReflections", {
      assignmentId: args.assignmentId,
      userId,
      difficultyRating: args.difficultyRating,
      usefulnessRating: args.usefulnessRating,
      note: args.note?.trim(),
      createdAt: now,
    });

    await ctx.db.insert("aiOnboardingSignals", {
      userId,
      category: "habits",
      action: "reflected",
      itemId: getAssignmentItemId(args.assignmentId),
      metadata: {
        difficulty: args.difficultyRating,
        usefulness: args.usefulnessRating,
      },
      createdAt: now,
    });

    await updateConfidenceScore(ctx, {
      userId,
      category: "habits",
      delta: 10,
      verdict: "accepted",
    });

    return { ok: true };
  },
});

export const getDailyAIContext = query({
  args: {},
  handler: async (ctx: any) => {
    const userId = await requireUserId(ctx);
    const [profile, scores, recentSignals, recentAssignments] = await Promise.all([
      ctx.db
        .query("aiOnboardingProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first(),
      ctx.db
        .query("aiOnboardingConfidenceScores")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("aiOnboardingSignals")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .order("desc")
        .take(30),
      ctx.db
        .query("aiOnboardingActivityAssignments")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .order("desc")
        .take(15),
    ]);

    if (!profile) {
      return null;
    }

    const [reflections, templates] = await Promise.all([
      Promise.all(
        recentAssignments.map((assignment) =>
          ctx.db
            .query("aiOnboardingActivityReflections")
            .withIndex("by_assignmentId", (q) => q.eq("assignmentId", assignment._id))
            .first(),
        ),
      ),
      Promise.all(recentAssignments.map((assignment) => ctx.db.get(assignment.templateId))),
    ]);

    const categories: Doc<"aiOnboardingSignals">["category"][] = [
      "focus",
      "sleep",
      "exercise",
      "habits",
      "tasks",
    ];

    const signalSummary = Object.fromEntries(
      categories.map((category) => {
        const categorySignals = recentSignals.filter((signal) => signal.category === category);
        const score = scores.find((entry) => entry.category === category);
        return [
          category,
          {
            score: score?.score ?? 0,
            signalCount: score?.signalCount ?? 0,
            completions: categorySignals.filter((signal) => signal.action === "completed").length,
            skips: categorySignals.filter((signal) => signal.action === "skipped").length,
            avgDuration: average(categorySignals.map((signal) => signal.durationMs ?? 0)),
            tier: getTier(score?.score ?? 0).range,
          },
        ];
      }),
    );

    return {
      profile,
      signalSummary,
      rawSignals: recentSignals,
      assignments: recentAssignments.map((assignment, index) => ({
        ...assignment,
        template: templates[index],
        reflection: reflections[index],
      })),
      readyForBoldSuggestions: scores.some((entry) => entry.score >= 80),
      overallEngagement: average(scores.map((entry) => entry.score)),
      promptPreviewByCategory: Object.fromEntries(
        categories.map((category) => [
          category,
          buildSystemPrompt({
            profile,
            scores: scores.map((entry) => ({ category: entry.category, score: entry.score })),
            recentSignals: recentSignals.map((signal) => ({
              category: signal.category,
              action: signal.action,
              itemId: signal.itemId,
              durationMs: signal.durationMs,
            })),
            category,
          }),
        ]),
      ),
    };
  },
});

async function ensureHardcodedTemplates(ctx: Parameters<typeof seedHardcodedActivityTemplates.handler>[0]) {
  const now = Date.now();

  for (const template of HARD_CODED_ACTIVITY_TEMPLATES) {
    const existing = await ctx.db
      .query("aiOnboardingActivityTemplates")
      .withIndex("by_slug", (q) => q.eq("slug", template.slug))
      .first();

    if (existing) {
      continue;
    }

    await ctx.db.insert("aiOnboardingActivityTemplates", {
      slug: template.slug,
      title: template.title,
      category: template.category,
      difficulty: template.difficulty,
      source: template.source,
      durationMinutes: template.durationMinutes,
      instructions: template.instructions,
      signalMap: template.signalMap,
      isHardcoded: template.isHardcoded,
      goalTargets: [...template.goalTargets],
      energyTargets: [...template.energyTargets],
      minDayNumber: template.minDayNumber,
      createdAt: now,
      updatedAt: now,
    });
  }
}

async function assignDayActivities(
  ctx: Parameters<typeof completeAiOnboarding.handler>[0],
  args: {
    userId: string;
    dayNumber: number;
    phase: Doc<"aiOnboardingActivityAssignments">["phase"];
    now: number;
  },
) {
  const profile = await requireProfile(ctx, args.userId);
  const existing = await ctx.db
    .query("aiOnboardingActivityAssignments")
    .withIndex("by_userId_day", (q) => q.eq("userId", args.userId).eq("dayNumber", args.dayNumber))
    .collect();

  if (existing.length > 0) {
    return existing;
  }

  const templates = await ctx.db
    .query("aiOnboardingActivityTemplates")
    .withIndex("by_isHardcoded", (q) => q.eq("isHardcoded", true))
    .collect();

  const targetCount = getCommitmentTargetCount(profile.commitmentLevel);
  const filtered = templates
    .filter((template) => matchesProfile(template, profile))
    .sort((left, right) => left.durationMinutes - right.durationMinutes)
    .slice(0, targetCount);

  const assignmentIds = await Promise.all(
    filtered.map((template) =>
      ctx.db.insert("aiOnboardingActivityAssignments", {
        userId: args.userId,
        templateId: template._id,
        dayNumber: args.dayNumber,
        status: "pending",
        phase: args.phase,
        assignedBy: args.phase === "seed" ? "system" : "ai",
        assignedAt: args.now,
        dueAt: getEndOfDayTimestamp(args.now),
      }),
    ),
  );

  return await Promise.all(
    assignmentIds.map(async (assignmentId) => {
      const assignment = await ctx.db.get(assignmentId);
      if (!assignment) {
        throw new ConvexError("Failed to read assigned activity");
      }
      return assignment;
    }),
  );
}

async function requireProfile(
  ctx: Parameters<typeof completeAiOnboarding.handler>[0],
  userId: string,
) {
  const profile = await ctx.db
    .query("aiOnboardingProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();

  if (!profile) {
    throw new ConvexError("AI onboarding profile not found");
  }

  return profile;
}

async function updateConfidenceScore(
  ctx: Parameters<typeof completeAiOnboarding.handler>[0],
  args: {
    userId: string;
    category: Doc<"aiOnboardingConfidenceScores">["category"];
    delta: number;
    verdict: Doc<"aiOnboardingFeedback">["verdict"] | null;
  },
) {
  const existing = await ctx.db
    .query("aiOnboardingConfidenceScores")
    .withIndex("by_userId_category", (q) => q.eq("userId", args.userId).eq("category", args.category))
    .first();

  const profileSignals = await ctx.db
    .query("aiOnboardingSignals")
    .withIndex("by_userId_category", (q) => q.eq("userId", args.userId).eq("category", args.category))
    .collect();

  const weightedDelta = Math.round(
    profileSignals.reduce((sum, signal) => {
      const actionWeight = signal.action === "skipped" ? -5 : signal.action === "completed" ? 20 : 5;
      return sum + getDecayedWeight(signal.createdAt, actionWeight);
    }, 0) + args.delta,
  );

  const base = existing ?? {
    score: 0,
    signalCount: 0,
    acceptCount: 0,
    dismissCount: 0,
  };

  const nextSignalCount = base.signalCount + 1;
  const nextAcceptCount =
    args.verdict === "accepted" ? base.acceptCount + 1 : base.acceptCount;
  const nextDismissCount =
    args.verdict === "dismissed" ? base.dismissCount + 1 : base.dismissCount;
  const acceptRatio = nextSignalCount > 0 ? nextAcceptCount / nextSignalCount : 0;
  const rawScore = weightedDelta + acceptRatio * 5;
  const score = Math.round(Math.max(0, Math.min(100, rawScore)));
  const payload = {
    score,
    signalCount: nextSignalCount,
    acceptCount: nextAcceptCount,
    dismissCount: nextDismissCount,
    updatedAt: Date.now(),
  };

  if (existing) {
    await ctx.db.patch(existing._id, payload);
    return;
  }

  await ctx.db.insert("aiOnboardingConfidenceScores", {
    userId: args.userId,
    category: args.category,
    ...payload,
  });
}

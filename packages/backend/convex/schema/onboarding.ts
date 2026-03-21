import { defineTable } from "convex/server";
import { v } from "convex/values";

export const onboardingPreferredStyleValidator = v.union(
  v.literal("gentle"),
  v.literal("direct"),
  v.literal("structured"),
);

export const onboardingCommitmentLevelValidator = v.union(
  v.literal("light"),
  v.literal("moderate"),
  v.literal("committed"),
);

export const onboardingPrimaryGoalValidator = v.union(
  v.literal("productivity"),
  v.literal("wellbeing"),
  v.literal("habits"),
  v.literal("health"),
);

export const onboardingEnergyPatternValidator = v.union(
  v.literal("morning"),
  v.literal("afternoon"),
  v.literal("evening"),
  v.literal("variable"),
);

export const onboardingBiggestBlockerValidator = v.union(
  v.literal("follow_through"),
  v.literal("distraction"),
  v.literal("overwhelm"),
  v.literal("energy"),
);

export const userProfileNotificationsValidator = v.object({
  morningBriefing: v.boolean(),
  approvalAlerts: v.boolean(),
  eveningCheckin: v.boolean(),
  weeklyReview: v.boolean(),
  habitReminders: v.boolean(),
});

export const onboardingStageValidator = v.union(
  v.literal("first-run-today"),
  v.literal("week-1"),
  v.literal("complete"),
);

export const onboardingPhaseValidator = v.union(
  v.literal("seed"),
  v.literal("learn"),
  v.literal("act"),
);

export const activityCategoryValidator = v.union(
  v.literal("focus"),
  v.literal("sleep"),
  v.literal("exercise"),
  v.literal("tasks"),
  v.literal("habits"),
  v.literal("reflection"),
);

export const signalActionValidator = v.union(
  v.literal("viewed"),
  v.literal("started"),
  v.literal("completed"),
  v.literal("skipped"),
  v.literal("reflected"),
  v.literal("accepted"),
  v.literal("dismissed"),
  v.literal("snoozed"),
);

export const activityDifficultyValidator = v.union(
  v.literal("easy"),
  v.literal("medium"),
  v.literal("hard"),
);

export const activitySourceValidator = v.union(
  v.literal("hardcoded"),
  v.literal("ai_generated"),
);

export const activityAssignmentStatusValidator = v.union(
  v.literal("pending"),
  v.literal("started"),
  v.literal("completed"),
  v.literal("skipped"),
);

export const activityAssignedByValidator = v.union(
  v.literal("system"),
  v.literal("ai"),
);

export const suggestionVerdictValidator = v.union(
  v.literal("accepted"),
  v.literal("dismissed"),
  v.literal("snoozed"),
);

export const activitySignalMapEntryValidator = v.object({
  category: activityCategoryValidator,
  action: signalActionValidator,
  weight: v.number(),
});

// Migration-safe: keep both new and legacy fields optional on the first deploy.
export const userProfileTable = defineTable({
  userId: v.string(),
  name: v.string(),
  primaryGoal: v.optional(onboardingPrimaryGoalValidator),
  energyPattern: v.optional(onboardingEnergyPatternValidator),
  biggestBlocker: v.optional(onboardingBiggestBlockerValidator),
  preferredStyle: v.optional(onboardingPreferredStyleValidator),
  commitmentLevel: v.optional(onboardingCommitmentLevelValidator),
  notifications: userProfileNotificationsValidator,
  timezone: v.optional(v.string()),
  seedAnswers: v.optional(v.any()),
  draftCompletedAt: v.optional(v.number()),
  syncedFromClientAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
  // Deprecated legacy fields kept during migration.
  planningStyle: v.optional(
    v.union(v.literal("light"), v.literal("balanced"), v.literal("intensive")),
  ),
  aiTone: v.optional(
    v.union(v.literal("direct"), v.literal("coaching"), v.literal("minimal")),
  ),
  selectedDomains: v.optional(v.array(v.string())),
  pinnedDomainIds: v.optional(v.array(v.string())),
}).index("by_userId", ["userId"]);

export const onboardingStateTable = defineTable({
  userId: v.string(),
  hasCompletedOnboarding: v.boolean(),
  currentStage: onboardingStageValidator,
  currentPhase: v.optional(onboardingPhaseValidator),
  dayNumber: v.optional(v.number()),
  startedAt: v.optional(v.number()),
  lastAdvancedAt: v.optional(v.number()),
  currentDateKey: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  completedAt: v.optional(v.number()),
}).index("by_userId", ["userId"]);

export const activityTemplatesTable = defineTable({
  slug: v.string(),
  title: v.string(),
  category: activityCategoryValidator,
  difficulty: activityDifficultyValidator,
  source: activitySourceValidator,
  durationMinutes: v.number(),
  instructions: v.string(),
  signalMap: v.record(v.string(), activitySignalMapEntryValidator),
  isHardcoded: v.boolean(),
}).index("by_slug", ["slug"]);

export const activityAssignmentsTable = defineTable({
  userId: v.string(),
  templateId: v.id("activityTemplates"),
  dayNumber: v.number(),
  status: activityAssignmentStatusValidator,
  phase: onboardingPhaseValidator,
  assignedBy: activityAssignedByValidator,
  assignedAt: v.number(),
  dueAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_day", ["userId", "dayNumber"]);

export const activityEventsTable = defineTable({
  assignmentId: v.id("activityAssignments"),
  userId: v.string(),
  action: signalActionValidator,
  elapsedMs: v.optional(v.number()),
  metadata: v.optional(v.any()),
  createdAt: v.number(),
})
  .index("by_assignmentId", ["assignmentId"])
  .index("by_userId", ["userId"]);

export const activityReflectionsTable = defineTable({
  assignmentId: v.id("activityAssignments"),
  userId: v.string(),
  difficultyRating: v.optional(v.number()),
  usefulnessRating: v.optional(v.number()),
  note: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_assignmentId", ["assignmentId"])
  .index("by_userId", ["userId"]);

export const signalsTable = defineTable({
  userId: v.string(),
  category: activityCategoryValidator,
  action: signalActionValidator,
  itemId: v.string(),
  weight: v.optional(v.number()),
  durationMs: v.optional(v.number()),
  metadata: v.optional(v.any()),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_category", ["userId", "category"]);

export const suggestionsTable = defineTable({
  userId: v.string(),
  category: activityCategoryValidator,
  content: v.string(),
  reasoning: v.optional(v.string()),
  confidenceAtTime: v.number(),
  phase: onboardingPhaseValidator,
  shownAt: v.number(),
  feedbackVerdict: v.optional(suggestionVerdictValidator),
  feedbackReason: v.optional(v.string()),
  feedbackAt: v.optional(v.number()),
})
  .index("by_userId", ["userId"])
  .index("by_userId_shownAt", ["userId", "shownAt"]);

export const feedbackTable = defineTable({
  suggestionId: v.id("suggestions"),
  userId: v.string(),
  verdict: suggestionVerdictValidator,
  reason: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_suggestionId", ["suggestionId"])
  .index("by_userId", ["userId"]);

export const confidenceScoresTable = defineTable({
  userId: v.string(),
  category: activityCategoryValidator,
  score: v.number(),
  signalCount: v.number(),
  acceptCount: v.number(),
  dismissCount: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_category", ["userId", "category"]);

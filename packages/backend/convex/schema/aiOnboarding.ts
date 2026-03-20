import { defineTable } from "convex/server";
import { v } from "convex/values";

export const aiOnboardingPrimaryGoalValidator = v.union(
  v.literal("productivity"),
  v.literal("wellbeing"),
  v.literal("habits"),
  v.literal("health"),
);

export const aiOnboardingEnergyPatternValidator = v.union(
  v.literal("morning"),
  v.literal("afternoon"),
  v.literal("evening"),
  v.literal("variable"),
);

export const aiOnboardingBiggestBlockerValidator = v.union(
  v.literal("follow_through"),
  v.literal("distraction"),
  v.literal("overwhelm"),
  v.literal("energy"),
);

export const aiOnboardingPreferredStyleValidator = v.union(
  v.literal("gentle"),
  v.literal("direct"),
  v.literal("structured"),
);

export const aiOnboardingCommitmentLevelValidator = v.union(
  v.literal("light"),
  v.literal("moderate"),
  v.literal("committed"),
);

export const aiOnboardingCategoryValidator = v.union(
  v.literal("focus"),
  v.literal("sleep"),
  v.literal("exercise"),
  v.literal("tasks"),
  v.literal("habits"),
  v.literal("reflection"),
);

export const aiOnboardingPhaseValidator = v.union(
  v.literal("seed"),
  v.literal("learn"),
  v.literal("act"),
);

export const aiOnboardingActivityDifficultyValidator = v.union(
  v.literal("easy"),
  v.literal("medium"),
  v.literal("hard"),
);

export const aiOnboardingActivityStatusValidator = v.union(
  v.literal("pending"),
  v.literal("completed"),
  v.literal("skipped"),
);

export const aiOnboardingActivitySourceValidator = v.union(
  v.literal("hardcoded"),
  v.literal("ai_generated"),
);

export const aiOnboardingAssignmentSourceValidator = v.union(
  v.literal("system"),
  v.literal("ai"),
);

export const aiOnboardingActivityActionValidator = v.union(
  v.literal("viewed"),
  v.literal("started"),
  v.literal("completed"),
  v.literal("skipped"),
  v.literal("reflected"),
);

export const aiOnboardingFeedbackVerdictValidator = v.union(
  v.literal("accepted"),
  v.literal("dismissed"),
  v.literal("snoozed"),
);

export const aiOnboardingProfileAnswersValidator = v.object({
  primaryGoal: aiOnboardingPrimaryGoalValidator,
  energyPattern: aiOnboardingEnergyPatternValidator,
  biggestBlocker: aiOnboardingBiggestBlockerValidator,
  preferredStyle: aiOnboardingPreferredStyleValidator,
  commitmentLevel: aiOnboardingCommitmentLevelValidator,
});

export const aiOnboardingSignalDefinitionValidator = v.object({
  category: aiOnboardingCategoryValidator,
  action: aiOnboardingActivityActionValidator,
  weight: v.number(),
});

export const aiOnboardingProfileTable = defineTable({
  userId: v.string(),
  primaryGoal: aiOnboardingPrimaryGoalValidator,
  energyPattern: aiOnboardingEnergyPatternValidator,
  biggestBlocker: aiOnboardingBiggestBlockerValidator,
  preferredStyle: aiOnboardingPreferredStyleValidator,
  commitmentLevel: aiOnboardingCommitmentLevelValidator,
  timezone: v.string(),
  dayNumber: v.number(),
  seedAnswers: aiOnboardingProfileAnswersValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_userId", ["userId"]);

export const aiOnboardingSignalTable = defineTable({
  userId: v.string(),
  category: aiOnboardingCategoryValidator,
  action: aiOnboardingActivityActionValidator,
  itemId: v.string(),
  durationMs: v.optional(v.number()),
  metadata: v.optional(v.any()),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_category", ["userId", "category"]);

export const aiOnboardingSuggestionTable = defineTable({
  userId: v.string(),
  category: aiOnboardingCategoryValidator,
  content: v.string(),
  reasoning: v.optional(v.string()),
  confidenceAtTime: v.number(),
  phase: aiOnboardingPhaseValidator,
  shownAt: v.number(),
}).index("by_userId", ["userId"]);

export const aiOnboardingFeedbackTable = defineTable({
  suggestionId: v.id("aiOnboardingSuggestions"),
  userId: v.string(),
  verdict: aiOnboardingFeedbackVerdictValidator,
  reason: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_suggestionId", ["suggestionId"])
  .index("by_userId", ["userId"]);

export const aiOnboardingConfidenceScoreTable = defineTable({
  userId: v.string(),
  category: aiOnboardingCategoryValidator,
  score: v.number(),
  signalCount: v.number(),
  acceptCount: v.number(),
  dismissCount: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_category", ["userId", "category"]);

export const aiOnboardingActivityTemplateTable = defineTable({
  slug: v.string(),
  title: v.string(),
  category: aiOnboardingCategoryValidator,
  difficulty: aiOnboardingActivityDifficultyValidator,
  source: aiOnboardingActivitySourceValidator,
  durationMinutes: v.number(),
  instructions: v.string(),
  signalMap: v.record(v.string(), aiOnboardingSignalDefinitionValidator),
  isHardcoded: v.boolean(),
  goalTargets: v.array(aiOnboardingPrimaryGoalValidator),
  energyTargets: v.array(aiOnboardingEnergyPatternValidator),
  minDayNumber: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_isHardcoded", ["isHardcoded"]);

export const aiOnboardingActivityAssignmentTable = defineTable({
  userId: v.string(),
  templateId: v.id("aiOnboardingActivityTemplates"),
  dayNumber: v.number(),
  status: aiOnboardingActivityStatusValidator,
  phase: aiOnboardingPhaseValidator,
  assignedBy: aiOnboardingAssignmentSourceValidator,
  assignedAt: v.number(),
  dueAt: v.number(),
  completedAt: v.optional(v.number()),
  skippedAt: v.optional(v.number()),
})
  .index("by_userId", ["userId"])
  .index("by_userId_day", ["userId", "dayNumber"]);

export const aiOnboardingActivityEventTable = defineTable({
  assignmentId: v.id("aiOnboardingActivityAssignments"),
  userId: v.string(),
  action: aiOnboardingActivityActionValidator,
  elapsedMs: v.number(),
  metadata: v.optional(v.any()),
  createdAt: v.number(),
})
  .index("by_assignmentId", ["assignmentId"])
  .index("by_userId", ["userId"]);

export const aiOnboardingActivityReflectionTable = defineTable({
  assignmentId: v.id("aiOnboardingActivityAssignments"),
  userId: v.string(),
  difficultyRating: v.optional(v.number()),
  usefulnessRating: v.optional(v.number()),
  note: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_assignmentId", ["assignmentId"])
  .index("by_userId", ["userId"]);

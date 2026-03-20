import { defineTable } from "convex/server";
import { v } from "convex/values";

export const onboardingStageValidator = v.union(
  v.literal("first-run-today"),
  v.literal("week-1"),
  v.literal("complete"),
);

export const onboardingDomainValidator = v.union(
  v.literal("faith"),
  v.literal("career"),
  v.literal("finance"),
  v.literal("health"),
  v.literal("wellness"),
  v.literal("tasks"),
  v.literal("relationships"),
  v.literal("space"),
);

export const onboardingPlanningStyleValidator = v.union(
  v.literal("balanced"),
  v.literal("light"),
  v.literal("intensive"),
);

export const onboardingAiToneValidator = v.union(
  v.literal("direct"),
  v.literal("coaching"),
  v.literal("minimal"),
);

export const onboardingNotificationSettingsValidator = v.object({
  morningBriefing: v.boolean(),
  approvalAlerts: v.boolean(),
  eveningCheckin: v.boolean(),
  weeklyReview: v.boolean(),
  habitReminders: v.boolean(),
});

export const onboardingPreferencesValidator = v.object({
  name: v.string(),
  domains: v.array(onboardingDomainValidator),
  pinnedDomainIds: v.array(onboardingDomainValidator),
  planningStyle: onboardingPlanningStyleValidator,
  aiTone: onboardingAiToneValidator,
  notifications: onboardingNotificationSettingsValidator,
  submittedAt: v.number(),
});

export const onboardingStateTable = defineTable({
  userId: v.string(),
  hasCompletedOnboarding: v.boolean(),
  currentStage: onboardingStageValidator,
  preferences: v.optional(onboardingPreferencesValidator),
  createdAt: v.number(),
  updatedAt: v.number(),
  completedAt: v.optional(v.number()),
}).index("by_userId", ["userId"]);

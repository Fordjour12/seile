import { defineTable } from "convex/server";
import { v } from "convex/values";

export const userProfilePlanningStyleValidator = v.union(
  v.literal("light"),
  v.literal("balanced"),
  v.literal("intensive"),
);

export const userProfileAiToneValidator = v.union(
  v.literal("direct"),
  v.literal("coaching"),
  v.literal("minimal"),
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

export const userProfileTable = defineTable({
  userId: v.string(),
  name: v.string(),
  selectedDomains: v.array(v.string()),
  pinnedDomainIds: v.array(v.string()),
  planningStyle: userProfilePlanningStyleValidator,
  aiTone: userProfileAiToneValidator,
  notifications: userProfileNotificationsValidator,
  draftCompletedAt: v.optional(v.number()),
  syncedFromClientAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_userId", ["userId"]);

export const onboardingStateTable = defineTable({
  userId: v.string(),
  hasCompletedOnboarding: v.boolean(),
  currentStage: onboardingStageValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
  completedAt: v.optional(v.number()),
}).index("by_userId", ["userId"]);

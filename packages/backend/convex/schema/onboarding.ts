import { defineTable } from "convex/server";
import { v } from "convex/values";

export const onboardingStageValidator = v.union(
  v.literal("first-run-today"),
  v.literal("week-1"),
  v.literal("complete"),
);

export const onboardingStateTable = defineTable({
  userId: v.string(),
  hasCompletedOnboarding: v.boolean(),
  currentStage: onboardingStageValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
  completedAt: v.optional(v.number()),
}).index("by_userId", ["userId"]);

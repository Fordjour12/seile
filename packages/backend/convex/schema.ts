import { defineSchema } from "convex/server";

import {
  aiOnboardingActivityAssignmentTable,
  aiOnboardingActivityEventTable,
  aiOnboardingActivityReflectionTable,
  aiOnboardingActivityTemplateTable,
  aiOnboardingActivityActionValidator,
  aiOnboardingBiggestBlockerValidator,
  aiOnboardingCategoryValidator,
  aiOnboardingCommitmentLevelValidator,
  aiOnboardingConfidenceScoreTable,
  aiOnboardingEnergyPatternValidator,
  aiOnboardingFeedbackTable,
  aiOnboardingFeedbackVerdictValidator,
  aiOnboardingPhaseValidator,
  aiOnboardingPreferredStyleValidator,
  aiOnboardingPrimaryGoalValidator,
  aiOnboardingProfileTable,
  aiOnboardingSignalTable,
  aiOnboardingSuggestionTable,
} from "./schema/aiOnboarding";
import {
  aiDomainValidator,
  aiMemoryConfidenceValidator,
  aiMemoryTable,
  approvalModeValidator,
  approvalRequestsTable,
  approvalRequestStatusValidator,
} from "./schema/ai";
import {
  onboardingStageValidator,
  onboardingStateTable,
  userProfileAiToneValidator,
  userProfileNotificationsValidator,
  userProfilePlanningStyleValidator,
  userProfileTable,
} from "./schema/onboarding";
export {
  aiOnboardingActivityActionValidator,
  aiOnboardingBiggestBlockerValidator,
  aiOnboardingCategoryValidator,
  aiOnboardingCommitmentLevelValidator,
  aiOnboardingEnergyPatternValidator,
  aiOnboardingFeedbackVerdictValidator,
  aiOnboardingPhaseValidator,
  aiOnboardingPreferredStyleValidator,
  aiOnboardingPrimaryGoalValidator,
} from "./schema/aiOnboarding";
export {
  aiDomainValidator,
  aiMemoryConfidenceValidator,
  approvalModeValidator,
  approvalRequestStatusValidator,
} from "./schema/ai";
export {
  onboardingStageValidator,
  userProfileAiToneValidator,
  userProfileNotificationsValidator,
  userProfilePlanningStyleValidator,
};

export default defineSchema({
  aiMemory: aiMemoryTable,
  approvalRequests: approvalRequestsTable,
  userProfile: userProfileTable,
  onboardingState: onboardingStateTable,
  aiOnboardingProfiles: aiOnboardingProfileTable,
  aiOnboardingSignals: aiOnboardingSignalTable,
  aiOnboardingSuggestions: aiOnboardingSuggestionTable,
  aiOnboardingFeedback: aiOnboardingFeedbackTable,
  aiOnboardingConfidenceScores: aiOnboardingConfidenceScoreTable,
  aiOnboardingActivityTemplates: aiOnboardingActivityTemplateTable,
  aiOnboardingActivityAssignments: aiOnboardingActivityAssignmentTable,
  aiOnboardingActivityEvents: aiOnboardingActivityEventTable,
  aiOnboardingActivityReflections: aiOnboardingActivityReflectionTable,
});

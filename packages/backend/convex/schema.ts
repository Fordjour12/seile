import { defineSchema } from "convex/server";

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
  });

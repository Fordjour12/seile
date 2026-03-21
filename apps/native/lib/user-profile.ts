export type UserNotificationPreferences = {
  morningBriefing: boolean;
  approvalAlerts: boolean;
  eveningCheckin: boolean;
  weeklyReview: boolean;
  habitReminders: boolean;
};

export type UserProfilePreferredStyle = "gentle" | "direct" | "structured";
export type UserProfileCommitmentLevel = "light" | "moderate" | "committed";
export type UserProfilePrimaryGoal =
  | "productivity"
  | "wellbeing"
  | "habits"
  | "health";
export type UserProfileEnergyPattern =
  | "morning"
  | "afternoon"
  | "evening"
  | "variable";
export type UserProfileBiggestBlocker =
  | "follow_through"
  | "distraction"
  | "overwhelm"
  | "energy";

export type UserProfileInput = {
  name: string;
  primaryGoal: UserProfilePrimaryGoal;
  energyPattern: UserProfileEnergyPattern;
  biggestBlocker: UserProfileBiggestBlocker;
  preferredStyle: UserProfilePreferredStyle;
  commitmentLevel: UserProfileCommitmentLevel;
  notifications: UserNotificationPreferences;
  timezone: string;
  seedAnswers?: unknown;
  draftCompletedAt?: number;
};

export function isCompleteUserProfileInput(
  value: Partial<UserProfileInput>,
): value is UserProfileInput {
  return (
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    typeof value.primaryGoal === "string" &&
    typeof value.energyPattern === "string" &&
    typeof value.biggestBlocker === "string" &&
    typeof value.preferredStyle === "string" &&
    typeof value.commitmentLevel === "string" &&
    value.notifications !== undefined
  );
}

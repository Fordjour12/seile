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

export type UserProfilePreferredStyle = "gentle" | "direct" | "structured";
export type UserProfileCommitmentLevel = "light" | "moderate" | "committed";

export type UserProfileInput = {
  primaryGoal: UserProfilePrimaryGoal;
  energyPattern: UserProfileEnergyPattern;
  biggestBlocker: UserProfileBiggestBlocker;
  preferredStyle: UserProfilePreferredStyle;
  commitmentLevel: UserProfileCommitmentLevel;
  timezone: string;
};

export function isCompleteUserProfileInput(
  value: Partial<UserProfileInput>,
): value is UserProfileInput {
  return (
    typeof value.primaryGoal === "string" &&
    typeof value.energyPattern === "string" &&
    typeof value.biggestBlocker === "string" &&
    typeof value.preferredStyle === "string" &&
    typeof value.commitmentLevel === "string" &&
    typeof value.timezone === "string" &&
    value.timezone.length > 0
  );
}

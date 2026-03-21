import { NAV_THEME } from "@/lib/constants";

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type PrimaryGoal = "productivity" | "wellbeing" | "habits" | "health";
export type EnergyPattern = "morning" | "afternoon" | "evening" | "variable";
export type BiggestBlocker =
  | "follow_through"
  | "distraction"
  | "overwhelm"
  | "energy";
export type PreferredStyle = "gentle" | "direct" | "structured";
export type CommitmentLevel = "light" | "moderate" | "committed";
export type OnboardingNotificationKey =
  | "morningBriefing"
  | "approvalAlerts"
  | "eveningCheckin"
  | "weeklyReview"
  | "habitReminders";

export type OnboardingNotifications = Record<
  OnboardingNotificationKey,
  boolean
>;

export type OnboardingTheme = (typeof NAV_THEME)[keyof typeof NAV_THEME];

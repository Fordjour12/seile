import { NAV_THEME } from "@/lib/constants";

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type PlanningStyle = "balanced" | "light" | "intensive";
export type AiTone = "direct" | "coaching" | "minimal";
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

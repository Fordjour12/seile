export type UserNotificationPreferences = {
  morningBriefing: boolean;
  approvalAlerts: boolean;
  eveningCheckin: boolean;
  weeklyReview: boolean;
  habitReminders: boolean;
};

export type UserProfilePlanningStyle = "light" | "balanced" | "intensive";
export type UserProfileAiTone = "direct" | "coaching" | "minimal";

export type UserProfileInput = {
  name: string;
  selectedDomains: string[];
  pinnedDomainIds: string[];
  planningStyle: UserProfilePlanningStyle;
  aiTone: UserProfileAiTone;
  notifications: UserNotificationPreferences;
  draftCompletedAt?: number;
};

export function isCompleteUserProfileInput(
  value: Partial<UserProfileInput>,
): value is UserProfileInput {
  return (
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    Array.isArray(value.selectedDomains) &&
    value.selectedDomains.length > 0 &&
    Array.isArray(value.pinnedDomainIds) &&
    typeof value.planningStyle === "string" &&
    typeof value.aiTone === "string" &&
    value.notifications !== undefined
  );
}

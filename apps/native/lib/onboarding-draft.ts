import * as SecureStore from "expo-secure-store";

export const ONBOARDING_DOMAIN_IDS = [
  "faith",
  "career",
  "finance",
  "health",
  "wellness",
  "tasks",
  "relationships",
  "space",
] as const;

export const ONBOARDING_PLANNING_STYLES = ["balanced", "light", "intensive"] as const;

export const ONBOARDING_AI_TONES = ["direct", "coaching", "minimal"] as const;

export const ONBOARDING_NOTIFICATION_KEYS = [
  "morningBriefing",
  "approvalAlerts",
  "eveningCheckin",
  "weeklyReview",
  "habitReminders",
] as const;

export type OnboardingDomainId = (typeof ONBOARDING_DOMAIN_IDS)[number];
export type OnboardingPlanningStyle = (typeof ONBOARDING_PLANNING_STYLES)[number];
export type OnboardingAiTone = (typeof ONBOARDING_AI_TONES)[number];
export type OnboardingNotificationKey = (typeof ONBOARDING_NOTIFICATION_KEYS)[number];
export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type OnboardingNotificationSettings = Record<OnboardingNotificationKey, boolean>;

export type OnboardingDraftSubmission = {
  name: string;
  domains: OnboardingDomainId[];
  pinnedDomainIds: OnboardingDomainId[];
  planningStyle: OnboardingPlanningStyle;
  aiTone: OnboardingAiTone;
  notifications: OnboardingNotificationSettings;
};

export type OnboardingDraft = OnboardingDraftSubmission & {
  step: OnboardingStep;
  updatedAt: number;
};

const STORAGE_KEY = "onboarding-draft:v1";
const DEFAULT_DOMAINS: OnboardingDomainId[] = ["faith", "career", "finance", "health"];

function isDomainId(value: string): value is OnboardingDomainId {
  return ONBOARDING_DOMAIN_IDS.includes(value as OnboardingDomainId);
}

function sanitizeDomains(value: unknown): OnboardingDomainId[] {
  if (!Array.isArray(value)) {
    return [...DEFAULT_DOMAINS];
  }

  const nextDomains = value.filter(
    (item): item is OnboardingDomainId => typeof item === "string" && isDomainId(item),
  );
  const uniqueDomains = Array.from(new Set(nextDomains));
  return uniqueDomains.length > 0 ? uniqueDomains : [...DEFAULT_DOMAINS];
}

function sanitizePinnedDomainIds(
  value: unknown,
  domains: OnboardingDomainId[],
): OnboardingDomainId[] {
  if (!Array.isArray(value)) {
    return domains.includes("faith") ? ["faith"] : [];
  }

  const nextPinnedDomains = value.filter(
    (item): item is OnboardingDomainId =>
      typeof item === "string" && isDomainId(item) && domains.includes(item as OnboardingDomainId),
  );

  return Array.from(new Set(nextPinnedDomains)).slice(0, 4);
}

function sanitizePlanningStyle(value: unknown): OnboardingPlanningStyle {
  return ONBOARDING_PLANNING_STYLES.includes(value as OnboardingPlanningStyle)
    ? (value as OnboardingPlanningStyle)
    : "balanced";
}

function sanitizeAiTone(value: unknown): OnboardingAiTone {
  return ONBOARDING_AI_TONES.includes(value as OnboardingAiTone)
    ? (value as OnboardingAiTone)
    : "direct";
}

function sanitizeNotifications(value: unknown): OnboardingNotificationSettings {
  const input =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    morningBriefing: input.morningBriefing !== false,
    approvalAlerts: input.approvalAlerts !== false,
    eveningCheckin: input.eveningCheckin !== false,
    weeklyReview: input.weeklyReview !== false,
    habitReminders: input.habitReminders === true,
  };
}

function sanitizeStep(value: unknown): OnboardingStep {
  if (typeof value !== "number") {
    return 1;
  }

  return Math.max(1, Math.min(7, Math.round(value))) as OnboardingStep;
}

export function createDefaultOnboardingDraft(): OnboardingDraft {
  return {
    step: 1,
    name: "",
    domains: [...DEFAULT_DOMAINS],
    pinnedDomainIds: ["faith"],
    planningStyle: "balanced",
    aiTone: "direct",
    notifications: {
      morningBriefing: true,
      approvalAlerts: true,
      eveningCheckin: true,
      weeklyReview: true,
      habitReminders: false,
    },
    updatedAt: Date.now(),
  };
}

export function sanitizeOnboardingDraft(value: unknown): OnboardingDraft {
  const defaults = createDefaultOnboardingDraft();
  const input =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const domains = sanitizeDomains(input.domains);

  return {
    step: sanitizeStep(input.step),
    name: typeof input.name === "string" ? input.name : defaults.name,
    domains,
    pinnedDomainIds: sanitizePinnedDomainIds(input.pinnedDomainIds, domains),
    planningStyle: sanitizePlanningStyle(input.planningStyle),
    aiTone: sanitizeAiTone(input.aiTone),
    notifications: sanitizeNotifications(input.notifications),
    updatedAt: typeof input.updatedAt === "number" ? input.updatedAt : defaults.updatedAt,
  };
}

export async function loadOnboardingDraft(): Promise<OnboardingDraft> {
  try {
    const rawDraft = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!rawDraft) {
      return createDefaultOnboardingDraft();
    }

    return sanitizeOnboardingDraft(JSON.parse(rawDraft));
  } catch {
    return createDefaultOnboardingDraft();
  }
}

export async function persistOnboardingDraft(draft: OnboardingDraft): Promise<OnboardingDraft> {
  const nextDraft = {
    ...sanitizeOnboardingDraft(draft),
    updatedAt: Date.now(),
  };

  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(nextDraft));
  } catch {
    // Ignore persistence failures so onboarding can continue in-memory.
  }

  return nextDraft;
}

export async function clearOnboardingDraft(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
}

export function toOnboardingDraftSubmission(
  draft: Pick<
    OnboardingDraft,
    "name" | "domains" | "pinnedDomainIds" | "planningStyle" | "aiTone" | "notifications"
  >,
): OnboardingDraftSubmission {
  const sanitized = sanitizeOnboardingDraft({
    ...createDefaultOnboardingDraft(),
    ...draft,
  });

  return {
    name: sanitized.name.trim(),
    domains: sanitized.domains,
    pinnedDomainIds: sanitized.pinnedDomainIds,
    planningStyle: sanitized.planningStyle,
    aiTone: sanitized.aiTone,
    notifications: sanitized.notifications,
  };
}

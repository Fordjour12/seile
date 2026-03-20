import type {
  AiTone,
  OnboardingNotificationKey,
  PlanningStyle,
  Step,
} from "@/components/auth/onboarding/types";

export const STEP_PROGRESS: Record<Step, number> = {
  1: 14,
  2: 28,
  3: 43,
  4: 57,
  5: 71,
  6: 86,
  7: 100,
};

export const MAX_PINNED_DOMAINS = 4;

export const DOMAIN_OPTIONS = [
  {
    id: "faith",
    label: "Faith",
    subtitle: "Prayer, fasting, devotionals",
    color: "#534AB7",
    background: "#2a2040",
    icon: "bullseye",
  },
  {
    id: "career",
    label: "Career",
    subtitle: "Projects, skills, goals",
    color: "#185FA5",
    background: "#1a1e2a",
    icon: "briefcase",
  },
  {
    id: "finance",
    label: "Finance",
    subtitle: "Budget, savings, spending",
    color: "#0F6E56",
    background: "#1a2a1e",
    icon: "money",
  },
  {
    id: "health",
    label: "Health",
    subtitle: "Training, sleep, energy",
    color: "#993C1D",
    background: "#2a1510",
    icon: "heartbeat",
  },
  {
    id: "wellness",
    label: "Wellness",
    subtitle: "Mood, stress, rest",
    color: "#993556",
    background: "#2a1020",
    icon: "moon-o",
  },
  {
    id: "tasks",
    label: "Tasks",
    subtitle: "To-dos, projects, inbox",
    color: "#5F5E5A",
    background: "#252525",
    icon: "check-square-o",
  },
  {
    id: "relationships",
    label: "Relationships",
    subtitle: "Connections, family, friends",
    color: "#185FA5",
    background: "#0e1420",
    icon: "users",
  },
  {
    id: "space",
    label: "Space",
    subtitle: "Home, zones, decor",
    color: "#854F0B",
    background: "#1a1408",
    icon: "home",
  },
] as const;

export const STYLE_OPTIONS: ReadonlyArray<{
  id: PlanningStyle;
  label: string;
  description: string;
  color: string;
}> = [
  {
    id: "balanced",
    label: "Balanced",
    description:
      "3-4 priorities per day. Full habits. One deep work block. Sustainable and steady.",
    color: "#ba7517",
  },
  {
    id: "light",
    label: "Light",
    description:
      "2-3 priorities per day. Habits only. Space for the unexpected and recovery.",
    color: "#1d9e75",
  },
  {
    id: "intensive",
    label: "Intensive",
    description:
      "4-5 priorities per day. Multiple deep work blocks. Stretch goals included.",
    color: "#e24b4a",
  },
];

export const TONE_OPTIONS: ReadonlyArray<{
  id: AiTone;
  label: string;
  example: string;
}> = [
  {
    id: "direct",
    label: "Direct",
    example: '"Finance review is 4 days overdue. Do it today."',
  },
  {
    id: "coaching",
    label: "Coaching",
    example:
      '"The finance review has been waiting - finishing it today would close the week cleanly."',
  },
  {
    id: "minimal",
    label: "Minimal",
    example: '"Finance: review due. 4 days elapsed."',
  },
];

export const TONE_MESSAGES: Record<AiTone, string> = {
  direct:
    "I don't know much about you yet - and that's fine. I'll start light. Check-ins, habits, completions - I'll read them all. Nothing changes without your approval.",
  coaching:
    "I'm starting without much context, and that's okay. The best way I learn is by watching what you actually do. I'll offer gentle suggestions early on and sharpen them as the picture fills in.",
  minimal:
    "No data yet. Will build context from check-ins and completions. Approval required for all changes.",
};

export const NOTIFICATION_OPTIONS: ReadonlyArray<{
  key: OnboardingNotificationKey;
  title: string;
  subtitle: string;
}> = [
  {
    key: "morningBriefing",
    title: "Morning briefing",
    subtitle: "Today screen summary - 8:00 AM",
  },
  {
    key: "approvalAlerts",
    title: "Approval alerts",
    subtitle: "Notify when AI has a change to propose",
  },
  {
    key: "eveningCheckin",
    title: "Evening check-in",
    subtitle: "Quick mood + day rating - 9:00 PM",
  },
  {
    key: "weeklyReview",
    title: "Weekly review reminder",
    subtitle: "Friday evening - review unlocks",
  },
  {
    key: "habitReminders",
    title: "Habit reminders",
    subtitle: "Nudge for unchecked habits - evening",
  },
];

export type DomainOption = (typeof DOMAIN_OPTIONS)[number];

import type {
  BiggestBlocker,
  CommitmentLevel,
  EnergyPattern,
  OnboardingNotificationKey,
  PreferredStyle,
  PrimaryGoal,
  Step,
} from "@/components/auth/onboarding/types";

export const STEP_PROGRESS: Record<Step, number> = {
  1: 11,
  2: 22,
  3: 33,
  4: 44,
  5: 55,
  6: 66,
  7: 77,
  8: 88,
  9: 100,
};

export const PRIMARY_GOAL_OPTIONS: ReadonlyArray<{
  id: PrimaryGoal;
  label: string;
  description: string;
  color: string;
}> = [
  {
    id: "productivity",
    label: "Productivity",
    description: "Sharpen focus, follow through, and turn good intentions into finished work.",
    color: "#185FA5",
  },
  {
    id: "wellbeing",
    label: "Wellbeing",
    description: "Build calmer days, steadier mood, and routines that feel sustainable.",
    color: "#993556",
  },
  {
    id: "habits",
    label: "Habits",
    description: "Create repeatable rhythms and daily consistency you can actually maintain.",
    color: "#534AB7",
  },
  {
    id: "health",
    label: "Health",
    description: "Prioritize sleep, movement, recovery, and energy that lasts all day.",
    color: "#993C1D",
  },
];

export const ENERGY_PATTERN_OPTIONS: ReadonlyArray<{
  id: EnergyPattern;
  label: string;
  description: string;
}> = [
  {
    id: "morning",
    label: "Morning",
    description: "My best focus and discipline usually happen early.",
  },
  {
    id: "afternoon",
    label: "Afternoon",
    description: "I warm up slowly, then hit my stride later in the day.",
  },
  {
    id: "evening",
    label: "Evening",
    description: "My clearest work and motivation usually show up at night.",
  },
  {
    id: "variable",
    label: "Variable",
    description: "My energy shifts a lot, so I need flexible planning.",
  },
];

export const BIGGEST_BLOCKER_OPTIONS: ReadonlyArray<{
  id: BiggestBlocker;
  label: string;
  description: string;
}> = [
  {
    id: "follow_through",
    label: "Follow-through",
    description: "I know what matters, but I struggle to actually complete it.",
  },
  {
    id: "distraction",
    label: "Distraction",
    description: "My attention gets pulled away before I can settle into the right work.",
  },
  {
    id: "overwhelm",
    label: "Overwhelm",
    description: "Everything feels important at once, so I stall or avoid starting.",
  },
  {
    id: "energy",
    label: "Energy",
    description: "My capacity drops fast, even when I know what I want to do.",
  },
];

export const PREFERRED_STYLE_OPTIONS: ReadonlyArray<{
  id: PreferredStyle;
  label: string;
  description: string;
  example: string;
}> = [
  {
    id: "gentle",
    label: "Gentle",
    description: "Encouraging tone with low pressure and supportive framing.",
    example:
      '"You have a lot on your plate. Let’s pick the one thing that will make the rest of the day feel lighter."',
  },
  {
    id: "direct",
    label: "Direct",
    description: "Straight to the point with clear calls to action.",
    example: '"Your most important task is still untouched. Start there before anything else."',
  },
  {
    id: "structured",
    label: "Structured",
    description: "Organized and methodical with explicit priorities and steps.",
    example: '"Priority 1: review plan. Priority 2: complete focus block. Priority 3: check in tonight."',
  },
];

export const COMMITMENT_LEVEL_OPTIONS: ReadonlyArray<{
  id: CommitmentLevel;
  label: string;
  description: string;
  color: string;
}> = [
  {
    id: "light",
    label: "Light",
    description: "Keep it small and realistic. Protect energy first.",
    color: "#1d9e75",
  },
  {
    id: "moderate",
    label: "Moderate",
    description: "Steady pressure with enough room for real life.",
    color: "#ba7517",
  },
  {
    id: "committed",
    label: "Committed",
    description: "Push harder, stack momentum, and let the AI challenge me more.",
    color: "#e24b4a",
  },
];

export const STYLE_MESSAGES: Record<PreferredStyle, string> = {
  gentle:
    "I’ll start soft, keep the plan clear, and push only when your patterns show you can carry more.",
  direct:
    "I’ll be concise, specific, and honest when something important is slipping.",
  structured:
    "I’ll organize your days clearly, break work into steps, and keep the system crisp.",
};

export const NOTIFICATION_OPTIONS: ReadonlyArray<{
  key: OnboardingNotificationKey;
  title: string;
  subtitle: string;
}> = [
  {
    key: "morningBriefing",
    title: "Morning briefing",
    subtitle: "Today summary and first priorities - 8:00 AM",
  },
  {
    key: "approvalAlerts",
    title: "Approval alerts",
    subtitle: "When the AI wants to change something that needs your approval",
  },
  {
    key: "eveningCheckin",
    title: "Evening check-in",
    subtitle: "Short reflection on mood, energy, and how the day went - 9:00 PM",
  },
  {
    key: "weeklyReview",
    title: "Weekly review reminder",
    subtitle: "Prompt to close the week and prepare the next one",
  },
  {
    key: "habitReminders",
    title: "Habit reminders",
    subtitle: "A nudge when a habit looks likely to slip",
  },
];

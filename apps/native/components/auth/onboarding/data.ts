import type {
  CommitmentLevel,
  OnboardingQuestionKey,
  OnboardingDraftAnswers,
  PreferredStyle,
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

export const DEFAULT_ONBOARDING_ANSWERS: OnboardingDraftAnswers = {
  primaryGoal: "productivity",
  energyPattern: "morning",
  biggestBlocker: "follow_through",
  preferredStyle: "gentle",
  commitmentLevel: "moderate",
};

export const ONBOARDING_QUESTIONS: Array<{
  key: OnboardingQuestionKey;
  title: string;
  hint: string;
  options: Array<{
    label: string;
    sub?: string;
    value: string;
  }>;
}> = [
  {
    key: "primaryGoal",
    title: "What brings you here?",
    hint: "Pick the one that feels most urgent right now.",
    options: [
      {
        label: "Get more done each day",
        sub: "Focus, tasks, deep work",
        value: "productivity",
      },
      {
        label: "Feel less overwhelmed",
        sub: "Stress, clarity, calm",
        value: "wellbeing",
      },
      {
        label: "Build better habits",
        sub: "Consistency, routines",
        value: "habits",
      },
      {
        label: "Improve my health",
        sub: "Sleep, movement, energy",
        value: "health",
      },
    ],
  },
  {
    key: "energyPattern",
    title: "When do you feel sharpest?",
    hint: "This shapes when we suggest your hardest tasks.",
    options: [
      { label: "Morning", sub: "I peak before noon", value: "morning" },
      { label: "Afternoon", sub: "I warm up slowly", value: "afternoon" },
      { label: "Evening", sub: "I come alive late", value: "evening" },
      { label: "It varies a lot", value: "variable" },
    ],
  },
  {
    key: "biggestBlocker",
    title: "What usually gets in the way?",
    hint: "Be honest. This is just for you.",
    options: [
      {
        label: "I start things but do not finish",
        value: "follow_through",
      },
      {
        label: "I get distracted easily",
        value: "distraction",
      },
      {
        label: "I do not know where to start",
        value: "overwhelm",
      },
      {
        label: "I run out of energy",
        value: "energy",
      },
    ],
  },
  {
    key: "preferredStyle",
    title: "How do you want to be coached?",
    hint: "This shapes the AI tone across your first seven days.",
    options: [
      {
        label: "Gentle nudges",
        sub: "Low pressure, optional",
        value: "gentle",
      },
      {
        label: "Clear and direct",
        sub: "Tell me what to do",
        value: "direct",
      },
      {
        label: "Structured plans",
        sub: "Steps, schedules, systems",
        value: "structured",
      },
    ],
  },
  {
    key: "commitmentLevel",
    title: "How much time can you give this?",
    hint: "Honest beats ambitious. The daily activity count adapts to this.",
    options: [
      { label: "5-10 min/day", value: "light" },
      { label: "15-20 min/day", value: "moderate" },
      { label: "30+ min/day", value: "committed" },
    ],
  },
];

export const COMMITMENT_SUMMARIES: Record<CommitmentLevel, string> = {
  light: "You will start with two small activities a day.",
  moderate: "You will start with a balanced stack of three activities a day.",
  committed: "You will start with four stronger activities a day.",
};

export const STYLE_SUMMARIES: Record<PreferredStyle, string> = {
  gentle: "Suggestions stay soft until the AI earns confidence.",
  direct: "Suggestions become blunt and specific as confidence rises.",
  structured: "The AI will prefer sequences, systems, and clear next actions.",
};

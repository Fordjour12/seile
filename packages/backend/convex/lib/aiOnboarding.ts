import type { Doc, Id } from "../_generated/dataModel";

type AiOnboardingQuestionOption = {
  label: string;
  value: string;
  sub?: string;
};

type AiOnboardingQuestion = {
  key: string;
  title: string;
  hint: string;
  options: AiOnboardingQuestionOption[];
};

type HardcodedActivityTemplate = {
  slug: string;
  title: string;
  category: Doc<"aiOnboardingActivityTemplates">["category"];
  difficulty: Doc<"aiOnboardingActivityTemplates">["difficulty"];
  source: Doc<"aiOnboardingActivityTemplates">["source"];
  durationMinutes: number;
  instructions: string;
  signalMap: Doc<"aiOnboardingActivityTemplates">["signalMap"];
  isHardcoded: boolean;
  goalTargets: Doc<"aiOnboardingActivityTemplates">["goalTargets"];
  energyTargets: Doc<"aiOnboardingActivityTemplates">["energyTargets"];
  minDayNumber?: number;
};


export const AI_ONBOARDING_QUESTIONS: readonly AiOnboardingQuestion[] = [
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
      { label: "Morning — I peak before noon", value: "morning" },
      { label: "Afternoon — I warm up slowly", value: "afternoon" },
      { label: "Evening — I come alive late", value: "evening" },
      { label: "It varies a lot", value: "variable" },
    ],
  },
  {
    key: "biggestBlocker",
    title: "What usually gets in the way?",
    hint: "Be honest — this is just for you.",
    options: [
      {
        label: "I start things but don't finish",
        value: "follow_through",
      },
      { label: "I get distracted easily", value: "distraction" },
      { label: "I don't know where to start", value: "overwhelm" },
      { label: "I run out of energy", value: "energy" },
    ],
  },
  {
    key: "preferredStyle",
    title: "How do you want to be coached?",
    hint: "This changes how we talk to you as you progress.",
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
    hint: "Honest beats ambitious — we'll adapt either way.",
    options: [
      { label: "5–10 min/day", value: "light" },
      { label: "15–20 min/day", value: "moderate" },
      { label: "30+ min/day", value: "committed" },
    ],
  },
] as const;

const TIERS = {
  observe: {
    range: [0, 30] as const,
    promptFragment: `
Confidence level: LOW (score: {score})
You have very limited data about this user.
Do not make personal suggestions yet.
Instead, offer 1 gentle, universally applicable habit
framed as a question: "Many people find X helpful —
would this be relevant to you?"
Never reference their past behaviour.
`.trim(),
  },
  suggest: {
    range: [31, 55] as const,
    promptFragment: `
Confidence level: MODERATE (score: {score})
You have some behavioural signals. Make 1–2 soft,
tentative suggestions tied to observed patterns.
Frame as: "I noticed you tend to... so you might try..."
Always offer an opt-out: "Does this feel relevant?"
Avoid absolute language like "you should" or "you must".
`.trim(),
  },
  recommend: {
    range: [56, 79] as const,
    promptFragment: `
Confidence level: HIGH (score: {score})
You have consistent signal across multiple days.
Make clear, direct recommendations grounded in
specific observations. Explain your reasoning briefly:
"Based on how you've been engaging with X, I think Y
would work well for you because Z."
You can suggest 2–3 changes at once if they're related.
`.trim(),
  },
  act: {
    range: [80, 100] as const,
    promptFragment: `
Confidence level: VERY HIGH (score: {score})
You know this user's patterns well. Be proactive and
assertive. Suggest bold changes — restructuring
routines, dropping habits that aren't working,
introducing new challenges. Reference specific patterns:
"You've consistently done X — it's time to level up to Y."
Propose, don't just suggest. The user trusts you.
`.trim(),
  },
} as const;

export const HARD_CODED_ACTIVITY_TEMPLATES: readonly HardcodedActivityTemplate[] = [
  {
    slug: "morning-check-in",
    title: "Morning check-in",
    category: "habits",
    difficulty: "easy",
    source: "hardcoded",
    durationMinutes: 2,
    instructions: "Take a quick pulse check before the day starts and name what matters most.",
    signalMap: {
      viewed: { category: "habits", action: "viewed", weight: 1 },
      started: { category: "habits", action: "started", weight: 5 },
      completed: { category: "habits", action: "completed", weight: 15 },
      skipped: { category: "habits", action: "skipped", weight: -5 },
      reflected: { category: "habits", action: "reflected", weight: 10 },
    },
    isHardcoded: true,
    goalTargets: ["productivity", "wellbeing", "habits", "health"],
    energyTargets: ["morning", "afternoon", "evening", "variable"],
  },
  {
    slug: "write-three-priorities",
    title: "Write 3 priorities",
    category: "focus",
    difficulty: "easy",
    source: "hardcoded",
    durationMinutes: 5,
    instructions: "Choose the three most important outcomes for today before you open every app.",
    signalMap: {
      viewed: { category: "focus", action: "viewed", weight: 1 },
      started: { category: "focus", action: "started", weight: 5 },
      completed: { category: "focus", action: "completed", weight: 20 },
      skipped: { category: "focus", action: "skipped", weight: -5 },
      reflected: { category: "habits", action: "reflected", weight: 10 },
    },
    isHardcoded: true,
    goalTargets: ["productivity", "habits"],
    energyTargets: ["morning", "afternoon", "evening", "variable"],
  },
  {
    slug: "evening-wind-down",
    title: "Evening wind-down",
    category: "sleep",
    difficulty: "easy",
    source: "hardcoded",
    durationMinutes: 5,
    instructions: "Close the day with a short reset so tomorrow feels lighter.",
    signalMap: {
      viewed: { category: "sleep", action: "viewed", weight: 1 },
      started: { category: "sleep", action: "started", weight: 5 },
      completed: { category: "sleep", action: "completed", weight: 15 },
      skipped: { category: "sleep", action: "skipped", weight: -5 },
      reflected: { category: "habits", action: "reflected", weight: 10 },
    },
    isHardcoded: true,
    goalTargets: ["productivity", "wellbeing", "habits", "health"],
    energyTargets: ["morning", "afternoon", "evening", "variable"],
  },
  {
    slug: "focus-block-25",
    title: "Focus block (25 min)",
    category: "focus",
    difficulty: "medium",
    source: "hardcoded",
    durationMinutes: 25,
    instructions: "Protect a 25 minute block for one meaningful task and ignore everything else.",
    signalMap: {
      viewed: { category: "focus", action: "viewed", weight: 1 },
      started: { category: "focus", action: "started", weight: 5 },
      completed: { category: "focus", action: "completed", weight: 20 },
      skipped: { category: "focus", action: "skipped", weight: -5 },
      reflected: { category: "habits", action: "reflected", weight: 10 },
    },
    isHardcoded: true,
    goalTargets: ["productivity", "habits"],
    energyTargets: ["morning", "afternoon"],
  },
  {
    slug: "reflect-on-blocker",
    title: "Reflect on blocker",
    category: "habits",
    difficulty: "easy",
    source: "hardcoded",
    durationMinutes: 5,
    instructions: "Name the friction point that showed up today and write one way to make it easier tomorrow.",
    signalMap: {
      viewed: { category: "habits", action: "viewed", weight: 1 },
      started: { category: "habits", action: "started", weight: 5 },
      completed: { category: "habits", action: "completed", weight: 15 },
      skipped: { category: "habits", action: "skipped", weight: -5 },
      reflected: { category: "habits", action: "reflected", weight: 10 },
    },
    isHardcoded: true,
    goalTargets: ["productivity", "wellbeing", "habits", "health"],
    energyTargets: ["morning", "afternoon", "evening", "variable"],
    minDayNumber: 2,
  },
  {
    slug: "walk-after-lunch",
    title: "Walk after lunch",
    category: "exercise",
    difficulty: "easy",
    source: "hardcoded",
    durationMinutes: 15,
    instructions: "Take a short walk after lunch to reset your energy and attention.",
    signalMap: {
      viewed: { category: "exercise", action: "viewed", weight: 1 },
      started: { category: "exercise", action: "started", weight: 5 },
      completed: { category: "exercise", action: "completed", weight: 20 },
      skipped: { category: "exercise", action: "skipped", weight: -5 },
      reflected: { category: "habits", action: "reflected", weight: 10 },
    },
    isHardcoded: true,
    goalTargets: ["health", "wellbeing"],
    energyTargets: ["morning", "afternoon", "evening", "variable"],
  },
] as const;

export function getTier(score: number) {
  if (score >= 80) {
    return TIERS.act;
  }
  if (score >= 56) {
    return TIERS.recommend;
  }
  if (score >= 31) {
    return TIERS.suggest;
  }
  return TIERS.observe;
}

export function getPhaseForDay(dayNumber: number) {
  if (dayNumber <= 2) {
    return "seed" as const;
  }
  if (dayNumber <= 5) {
    return "learn" as const;
  }
  return "act" as const;
}

export function getCommitmentTargetCount(commitmentLevel: string) {
  const commitmentToCount: Record<string, number> = {
    light: 2,
    moderate: 3,
    committed: 4,
  };
  return commitmentToCount[commitmentLevel] ?? 3;
}

export function matchesProfile(
  template: Pick<
    Doc<"aiOnboardingActivityTemplates">,
    "category" | "goalTargets" | "energyTargets" | "minDayNumber"
  >,
  profile: Pick<
    Doc<"aiOnboardingProfiles">,
    "primaryGoal" | "energyPattern" | "dayNumber"
  >,
) {
  if (template.minDayNumber && profile.dayNumber < template.minDayNumber) {
    return false;
  }

  if (!template.goalTargets.includes(profile.primaryGoal)) {
    return false;
  }

  if (!template.energyTargets.includes(profile.energyPattern)) {
    return false;
  }

  if (template.category === "habits" || template.category === "sleep") {
    return true;
  }

  const goalMap: Record<string, string[]> = {
    productivity: ["focus", "tasks", "habits"],
    health: ["exercise", "sleep", "habits"],
    wellbeing: ["exercise", "habits", "sleep"],
    habits: ["habits", "focus", "sleep"],
  };

  return (goalMap[profile.primaryGoal] ?? []).includes(template.category);
}

export function getEndOfDayTimestamp(now = Date.now()) {
  const date = new Date(now);
  date.setUTCHours(23, 59, 59, 999);
  return date.getTime();
}

export function average(numbers: number[]) {
  if (numbers.length === 0) {
    return 0;
  }
  return Math.round(numbers.reduce((sum, value) => sum + value, 0) / numbers.length);
}

export function getDecayedWeight(createdAt: number, baseWeight: number, now = Date.now()) {
  const ageDays = (now - createdAt) / (1000 * 60 * 60 * 24);
  const decay = ageDays > 3 ? Math.pow(0.85, ageDays - 3) : 1;
  return baseWeight * decay;
}

export function buildSystemPrompt(args: {
  profile: Pick<
    Doc<"aiOnboardingProfiles">,
    | "primaryGoal"
    | "energyPattern"
    | "biggestBlocker"
    | "preferredStyle"
    | "commitmentLevel"
    | "dayNumber"
  >;
  scores: Array<Pick<Doc<"aiOnboardingConfidenceScores">, "category" | "score">>;
  recentSignals: Array<
    Pick<Doc<"aiOnboardingSignals">, "category" | "action" | "itemId" | "durationMs">
  >;
  category: Doc<"aiOnboardingSignals">["category"];
}) {
  const score = args.scores.find((entry) => entry.category === args.category)?.score ?? 0;
  const tier = getTier(score);
  const signals = args.recentSignals.filter((entry) => entry.category === args.category);

  return `
You are a personal coach helping the user achieve: ${args.profile.primaryGoal}.

USER CONTEXT:
- Energy pattern: ${args.profile.energyPattern}
- Biggest blocker: ${args.profile.biggestBlocker}
- Preferred coaching style: ${args.profile.preferredStyle}
- Commitment level: ${args.profile.commitmentLevel}
- Day ${args.profile.dayNumber} of onboarding

CATEGORY: ${args.category}
${tier.promptFragment.replace("{score}", String(score))}

RECENT SIGNALS (last 5 in this category):
${signals
  .slice(-5)
  .map((signal) => `- ${signal.action} "${signal.itemId}" (${signal.durationMs ?? 0}ms elapsed)`)
  .join("\n")}

Respond with exactly one JSON object, nothing else:
{
  "content": "The suggestion text shown to the user",
  "reasoning": "Internal reasoning — not shown to user",
  "confidence": <number 0-100>
}
  `.trim();
}

export function getAssignmentItemId(assignmentId: Id<"aiOnboardingActivityAssignments">) {
  return assignmentId as string;
}

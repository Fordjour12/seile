import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { requireUserId } from "./lib/identity";
import { DOMAIN_MAP } from "./schema/domains";
import type { DomainKey } from "./schema/domains";
import {
  activityCategoryValidator,
  onboardingPhaseValidator,
  signalActionValidator,
  suggestionVerdictValidator,
} from "./schema/onboarding";

type ActivitySheetType =
  | "checkin"
  | "priorities"
  | "focus"
  | "reflect"
  | "walk";

type ActivityIconType = "habits" | "focus" | "sleep" | "reflection";

type ConfidenceTier = "observe" | "suggest" | "recommend" | "act";

type SuggestionVariant = "purple" | "teal" | "amber";

type DayActivityItem = {
  id: string;
  icon: string;
  iconType: ActivityIconType;
  title: string;
  meta?: string;
  body?: string;
  done?: boolean;
  started?: boolean;
  startedAt?: number;
  durationMinutes?: number;
  assignmentId?: string;
  sheetType?: ActivitySheetType;
};

type AISuggestionItem = {
  suggestionId?: string;
  variant: SuggestionVariant;
  confidence: number;
  eyebrow: string;
  text: string;
  acceptLabel: string;
  dismissLabel: string;
  snoozeLabel?: string;
};

type DomainUnlockItem = {
  icon: string;
  title: string;
  subtitle: string;
  domainKey: string;
};

type ConfidenceItem = {
  label: string;
  score: number;
  tier: ConfidenceTier;
};

type RecapSummaryItem = {
  kind: "check" | "arrow";
  text: string;
  sub: string;
};

type CompleteDay = {
  day: number;
  phase: "seed" | "learn" | "act";
  eyebrow: string;
  title: string;
  titleItalic: string;
  insightEyebrow: string;
  insightText: string;
  insightSub: string;
  progressPercent: number;
  dotsDone: number;
  hasCheckin?: boolean;
  activities?: DayActivityItem[];
  suggestion?: AISuggestionItem;
  unlock?: DomainUnlockItem;
  confidence?: ConfidenceItem[];
  confidenceLabel?: string;
  recap?: {
    title: string;
    items: RecapSummaryItem[];
    ctaLabel: string;
  };
  /** Number of uncompleted activities from previous days. */
  incompletePreviousDayCount?: number;
};

type ActivityTemplateSeed = {
  slug: string;
  title: string;
  category: Doc<"activityTemplates">["category"];
  difficulty: Doc<"activityTemplates">["difficulty"];
  source: Doc<"activityTemplates">["source"];
  durationMinutes: number;
  instructions: string;
  signalMap: Doc<"activityTemplates">["signalMap"];
  isHardcoded: boolean;
};

const DAY_TEMPLATES: CompleteDay[] = [
  {
    day: 1,
    phase: "seed",
    eyebrow: "Day 1 of 7",
    title: "Let's",
    titleItalic: "begin",
    insightEyebrow: "Welcome message",
    insightText: "You've shared your context with us. Today, we observe.",
    insightSub: "Focus on what feels natural. We're learning your rhythms.",
    progressPercent: 14,
    dotsDone: 0,
    activities: [
      {
        id: "d1-checkin",
        icon: "📋",
        iconType: "reflection",
        title: "Morning check-in",
        meta: "5 min · reflection",
        body: "Rate your mood, energy, and readiness. Sets the AI baseline for today.",
        sheetType: "checkin",
      },
      {
        id: "d1-priorities",
        icon: "✏️",
        iconType: "habits",
        title: "Write 3 priorities",
        meta: "10 min · tasks",
        body: "Name the three things that would make today feel like a win.",
        sheetType: "priorities",
      },
      {
        id: "d1-focus",
        icon: "⚡",
        iconType: "focus",
        title: "Focus block (25 min)",
        meta: "25 min · focus",
        body: "One task, no interruptions. Phone face-down.",
        sheetType: "focus",
      },
      {
        id: "d1-reflect",
        icon: "🪞",
        iconType: "reflection",
        title: "Reflect on blocker",
        meta: "10 min · reflection",
        body: "Where did you get stuck today? One sentence is enough.",
        sheetType: "reflect",
      },
      {
        id: "d1-walk",
        icon: "🚶",
        iconType: "habits",
        title: "Walk after lunch",
        meta: "15 min · exercise",
        body: "A short walk resets focus for the afternoon.",
        sheetType: "walk",
      },
    ],
    unlock: {
      icon: "💼",
      title: "Add Career domain",
      subtitle: "Track goals and focus blocks",
      domainKey: "career",
    },
    confidence: [
      { label: "Focus", score: 35, tier: "suggest" },
      { label: "Sleep", score: 20, tier: "observe" },
      { label: "Exercise", score: 25, tier: "suggest" },
    ],
  },
  {
    day: 2,
    phase: "seed",
    eyebrow: "Day 2 of 7",
    title: "Building the",
    titleItalic: "baseline",
    insightEyebrow: "Today's focus",
    insightText: "We're still watching to understand your patterns.",
    insightSub: "How did yesterday feel? Let's build on that.",
    progressPercent: 28,
    dotsDone: 1,
    activities: [
      {
        id: "d2-checkin",
        icon: "📋",
        iconType: "reflection",
        title: "Morning check-in",
        meta: "5 min · reflection",
        body: "How are you feeling compared to yesterday? Track the shift.",
        sheetType: "checkin",
      },
      {
        id: "d2-focus",
        icon: "⚡",
        iconType: "focus",
        title: "Focus block (25 min)",
        meta: "25 min · focus",
        body: "Same as yesterday — one task, no distractions. Building the habit.",
        sheetType: "focus",
      },
      {
        id: "d2-reflect",
        icon: "🪞",
        iconType: "reflection",
        title: "Reflect on blocker",
        meta: "10 min · reflection",
        body: "What's the one thing blocking you most right now?",
        sheetType: "reflect",
      },
    ],
    confidence: [
      { label: "Focus", score: 42, tier: "suggest" },
      { label: "Sleep", score: 28, tier: "observe" },
      { label: "Habits", score: 38, tier: "suggest" },
    ],
  },
  {
    day: 3,
    phase: "learn",
    eyebrow: "Day 3 of 7",
    title: "We start",
    titleItalic: "suggesting",
    insightEyebrow: "Phase transition",
    insightText: "We've seen enough. Starting gentle suggestions today.",
    insightSub: "See something that doesn't fit? Just dismiss it.",
    progressPercent: 42,
    dotsDone: 2,
    activities: [
      {
        id: "d3-checkin",
        icon: "📋",
        iconType: "reflection",
        title: "Morning check-in",
        meta: "5 min · reflection",
        body: "Day 3 — patterns are emerging. How does today compare?",
        sheetType: "checkin",
      },
      {
        id: "d3-focus",
        icon: "⚡",
        iconType: "focus",
        title: "Focus block (25 min)",
        meta: "25 min · focus",
        body: "Third session builds real momentum. Pick your highest-value task.",
        sheetType: "focus",
      },
      {
        id: "d3-walk",
        icon: "🚶",
        iconType: "habits",
        title: "Walk after lunch",
        meta: "15 min · exercise",
        body: "Movement resets your afternoon. Notice how you feel after.",
        sheetType: "walk",
      },
    ],
    suggestion: {
      variant: "purple",
      confidence: 68,
      eyebrow: "AI Suggestion",
      text: "You've been focused the last two days. Try 35-minute blocks instead of 25?",
      acceptLabel: "Accept",
      dismissLabel: "Dismiss",
      snoozeLabel: "Snooze",
    },
    confidence: [
      { label: "Focus", score: 68, tier: "recommend" },
      { label: "Sleep", score: 45, tier: "suggest" },
      { label: "Habits", score: 62, tier: "recommend" },
    ],
  },
  {
    day: 4,
    phase: "learn",
    eyebrow: "Day 4 of 7",
    title: "Growth",
    titleItalic: "signals",
    insightEyebrow: "Pattern detected",
    insightText: "You're showing strong consistency. We're getting bolder.",
    insightSub: "More suggestions coming — and a new domain to explore.",
    progressPercent: 57,
    dotsDone: 3,
    activities: [
      {
        id: "d4-checkin",
        icon: "📋",
        iconType: "reflection",
        title: "Morning check-in",
        meta: "5 min · reflection",
        body: "Consistency is building. Log today's baseline — the AI is watching.",
        sheetType: "checkin",
      },
      {
        id: "d4-focus",
        icon: "⚡",
        iconType: "focus",
        title: "Focus block (35 min)",
        meta: "35 min · focus",
        body: "You've earned a longer block. 35 minutes of deep, uninterrupted work.",
        sheetType: "focus",
      },
      {
        id: "d4-walk",
        icon: "🚶",
        iconType: "habits",
        title: "Walk after lunch",
        meta: "15 min · exercise",
        body: "Movement supports your afternoon focus. Make it a ritual.",
        sheetType: "walk",
      },
      {
        id: "d4-reflect",
        icon: "🪞",
        iconType: "reflection",
        title: "Reflect on progress",
        meta: "10 min · reflection",
        body: "What's different about today compared to day 1? Write it down.",
        sheetType: "reflect",
      },
    ],
    suggestion: {
      variant: "teal",
      confidence: 71,
      eyebrow: "AI Suggestion",
      text: "Try a 10-min walk after lunch. Movement helps your afternoon focus.",
      acceptLabel: "Accept",
      dismissLabel: "Dismiss",
    },
    unlock: {
      icon: "💪",
      title: "Add Health domain",
      subtitle: "Track exercise and movement",
      domainKey: "health",
    },
    confidence: [
      { label: "Focus", score: 78, tier: "act" },
      { label: "Exercise", score: 71, tier: "recommend" },
      { label: "Habits", score: 75, tier: "act" },
    ],
  },
  {
    day: 5,
    phase: "learn",
    eyebrow: "Day 5 of 7",
    title: "Momentum",
    titleItalic: "building",
    insightEyebrow: "Midweek check",
    insightText: "You're showing strong patterns. Let's check in on energy.",
    insightSub: "Quick reflection helps us refine the rest of the week.",
    progressPercent: 71,
    dotsDone: 4,
    hasCheckin: true,
    activities: [
      {
        id: "d5-checkin",
        icon: "📋",
        iconType: "reflection",
        title: "Morning check-in",
        meta: "5 min · reflection",
        body: "Midweek energy check. How sustainable does this feel?",
        sheetType: "checkin",
      },
      {
        id: "d5-focus",
        icon: "⚡",
        iconType: "focus",
        title: "Focus block (35 min)",
        meta: "35 min · focus",
        body: "Stay with 35 minutes. Consistency beats intensity.",
        sheetType: "focus",
      },
      {
        id: "d5-priorities",
        icon: "✏️",
        iconType: "habits",
        title: "Reprioritize for the week",
        meta: "10 min · tasks",
        body: "Halfway through — what are your top 3 priorities for the rest of the week?",
        sheetType: "priorities",
      },
      {
        id: "d5-reflect",
        icon: "🪞",
        iconType: "reflection",
        title: "Reflect on energy",
        meta: "10 min · reflection",
        body: "When did your energy peak this week? When did it dip?",
        sheetType: "reflect",
      },
    ],
    suggestion: {
      variant: "amber",
      confidence: 64,
      eyebrow: "AI Suggestion",
      text: "Based on your mood tracking, try a 5-min breathing break before your next focus block.",
      acceptLabel: "Accept",
      dismissLabel: "Dismiss",
    },
  },
  {
    day: 6,
    phase: "act",
    eyebrow: "Day 6 of 7",
    title: "Final",
    titleItalic: "push",
    insightEyebrow: "Bold territory",
    insightText: "We know you well enough now. Time for bolder suggestions.",
    insightSub: "These are based on real patterns from your last 5 days.",
    progressPercent: 85,
    dotsDone: 5,
    activities: [
      {
        id: "d6-checkin",
        icon: "📋",
        iconType: "reflection",
        title: "Morning check-in",
        meta: "5 min · reflection",
        body: "Almost there. How ready do you feel for a bigger challenge today?",
        sheetType: "checkin",
      },
      {
        id: "d6-focus",
        icon: "⚡",
        iconType: "focus",
        title: "Focus block (45 min)",
        meta: "45 min · focus",
        body: "Your biggest block yet. 45 minutes, one important task. You've earned this.",
        sheetType: "focus",
      },
      {
        id: "d6-walk",
        icon: "🚶",
        iconType: "habits",
        title: "Walk after lunch",
        meta: "15 min · exercise",
        body: "Keep the movement habit alive. It powers your afternoon.",
        sheetType: "walk",
      },
      {
        id: "d6-reflect",
        icon: "🪞",
        iconType: "reflection",
        title: "Reflect on growth",
        meta: "10 min · reflection",
        body: "Compare today's energy and focus to day 1. What's changed?",
        sheetType: "reflect",
      },
    ],
    suggestion: {
      variant: "teal",
      confidence: 82,
      eyebrow: "AI Challenge",
      text: "You've completed 5 focus blocks in 5 days. Try 45 minutes today. You can do it.",
      acceptLabel: "I'm in",
      dismissLabel: "Not today",
    },
    unlock: {
      icon: "👥",
      title: "Add Relationships domain",
      subtitle: "Track connection and community",
      domainKey: "relationships",
    },
    confidence: [
      { label: "Focus", score: 86, tier: "act" },
      { label: "Habits", score: 82, tier: "act" },
      { label: "Exercise", score: 73, tier: "recommend" },
    ],
  },
  {
    day: 7,
    phase: "act",
    eyebrow: "Day 7 of 7",
    title: "You made",
    titleItalic: "it",
    insightEyebrow: "Week complete",
    insightText: "You made it through the full first week.",
    insightSub: "Your personalized plan is ready.",
    progressPercent: 100,
    dotsDone: 6,
    activities: [
      {
        id: "d7-checkin",
        icon: "📋",
        iconType: "reflection",
        title: "Final check-in",
        meta: "5 min · reflection",
        body: "Last check-in of week 1. How do you feel right now?",
        sheetType: "checkin",
      },
      {
        id: "d7-priorities",
        icon: "✏️",
        iconType: "habits",
        title: "Set Week 2 priorities",
        meta: "10 min · tasks",
        body: "What are the three most important things for next week?",
        sheetType: "priorities",
      },
      {
        id: "d7-reflect",
        icon: "🪞",
        iconType: "reflection",
        title: "Week 1 reflection",
        meta: "10 min · reflection",
        body: "What did you learn about yourself this week? What will you carry forward?",
        sheetType: "reflect",
      },
    ],
    confidence: [
      { label: "Focus", score: 88, tier: "act" },
      { label: "Habits", score: 84, tier: "act" },
      { label: "Exercise", score: 76, tier: "recommend" },
      { label: "Sleep", score: 58, tier: "suggest" },
    ],
    confidenceLabel: "Final confidence scores",
    recap: {
      title: "Week 1 recap",
      items: [
        { kind: "check", text: "6 focus blocks completed", sub: "you're building momentum" },
        { kind: "check", text: "Consistent check-ins", sub: "great self-awareness" },
        { kind: "check", text: "3 domains unlocked", sub: "Health, Relationships ready" },
        { kind: "arrow", text: "Week 2 plan ready", sub: "personalized based on your patterns" },
      ],
      ctaLabel: "View Week 2 plan",
    },
  },
];

const ACTIVITY_TEMPLATE_SEEDS: ActivityTemplateSeed[] = [
  {
    slug: "morning-checkin",
    title: "Morning check-in",
    category: "reflection",
    difficulty: "easy",
    source: "hardcoded",
    durationMinutes: 5,
    instructions: "Rate your mood, energy, and readiness to set the baseline for today.",
    signalMap: {
      started: { category: "reflection", action: "started", weight: 1 },
      completed: { category: "reflection", action: "completed", weight: 4 },
    },
    isHardcoded: true,
  },
  {
    slug: "write-priorities",
    title: "Write 3 priorities",
    category: "tasks",
    difficulty: "easy",
    source: "hardcoded",
    durationMinutes: 10,
    instructions: "Write the three things that would make today feel like a win.",
    signalMap: {
      started: { category: "tasks", action: "started", weight: 1 },
      completed: { category: "tasks", action: "completed", weight: 5 },
    },
    isHardcoded: true,
  },
  {
    slug: "focus-block-25",
    title: "Focus block (25 min)",
    category: "focus",
    difficulty: "medium",
    source: "hardcoded",
    durationMinutes: 25,
    instructions: "Choose one task and work with no interruptions for 25 minutes.",
    signalMap: {
      started: { category: "focus", action: "started", weight: 2 },
      completed: { category: "focus", action: "completed", weight: 6 },
    },
    isHardcoded: true,
  },
  {
    slug: "focus-block-35",
    title: "Focus block 35 min",
    category: "focus",
    difficulty: "medium",
    source: "hardcoded",
    durationMinutes: 35,
    instructions: "Protect a deeper work block with one objective and no context switching.",
    signalMap: {
      started: { category: "focus", action: "started", weight: 2 },
      completed: { category: "focus", action: "completed", weight: 7 },
    },
    isHardcoded: true,
  },
  {
    slug: "focus-block-45",
    title: "Focus block 45 min",
    category: "focus",
    difficulty: "hard",
    source: "hardcoded",
    durationMinutes: 45,
    instructions: "Protect one high-value task for a full 45-minute deep work block.",
    signalMap: {
      started: { category: "focus", action: "started", weight: 3 },
      completed: { category: "focus", action: "completed", weight: 8 },
    },
    isHardcoded: true,
  },
  {
    slug: "reflect-blocker",
    title: "Reflect on blocker",
    category: "reflection",
    difficulty: "easy",
    source: "hardcoded",
    durationMinutes: 10,
    instructions: "Write one short note about where you got stuck today.",
    signalMap: {
      started: { category: "reflection", action: "started", weight: 1 },
      completed: { category: "reflection", action: "completed", weight: 4 },
      reflected: { category: "reflection", action: "reflected", weight: 4 },
    },
    isHardcoded: true,
  },
  {
    slug: "walk-after-lunch",
    title: "Walk after lunch",
    category: "exercise",
    difficulty: "easy",
    source: "hardcoded",
    durationMinutes: 15,
    instructions: "Take a short walk after lunch to reset your afternoon focus.",
    signalMap: {
      started: { category: "exercise", action: "started", weight: 1 },
      completed: { category: "exercise", action: "completed", weight: 5 },
    },
    isHardcoded: true,
  },
  {
    slug: "breathing-break",
    title: "Breathing reset",
    category: "sleep",
    difficulty: "easy",
    source: "hardcoded",
    durationMinutes: 5,
    instructions: "Take a five-minute breathing reset before your next focus block.",
    signalMap: {
      started: { category: "sleep", action: "started", weight: 1 },
      completed: { category: "sleep", action: "completed", weight: 3 },
    },
    isHardcoded: true,
  },
];

const ONBOARDING_CATEGORIES: Array<Doc<"confidenceScores">["category"]> = [
  "focus",
  "sleep",
  "exercise",
  "tasks",
  "habits",
  "reflection",
];

function phaseForDay(dayNumber: number): CompleteDay["phase"] {
  if (dayNumber <= 2) return "seed";
  if (dayNumber <= 5) return "learn";
  return "act";
}

function clampDayNumber(dayNumber: number) {
  return Math.max(1, Math.min(7, Math.floor(dayNumber)));
}

function confidenceTier(score: number): ConfidenceTier {
  if (score <= 30) return "observe";
  if (score <= 60) return "suggest";
  if (score <= 80) return "recommend";
  return "act";
}

function categoryLabel(category: Doc<"confidenceScores">["category"]) {
  return {
    focus: "Focus",
    sleep: "Sleep",
    exercise: "Exercise",
    tasks: "Tasks",
    habits: "Habits",
    reflection: "Reflection",
  }[category];
}

function suggestionVariantForCategory(
  category: Doc<"suggestions">["category"],
): SuggestionVariant {
  if (category === "focus" || category === "tasks") return "purple";
  if (category === "exercise" || category === "habits") return "teal";
  return "amber";
}

function activityIconForCategory(
  category: Doc<"activityTemplates">["category"],
): { icon: string; iconType: ActivityIconType } {
  switch (category) {
    case "focus":
      return { icon: "⚡", iconType: "focus" };
    case "sleep":
      return { icon: "🌙", iconType: "sleep" };
    case "exercise":
      return { icon: "🚶", iconType: "habits" };
    case "tasks":
      return { icon: "✏️", iconType: "habits" };
    case "habits":
      return { icon: "🌅", iconType: "habits" };
    case "reflection":
      return { icon: "🪞", iconType: "reflection" };
  }
}

function activitySheetTypeForSlug(slug: string): ActivitySheetType | undefined {
  if (slug === "morning-checkin") return "checkin";
  if (slug === "write-priorities") return "priorities";
  if (slug.startsWith("focus-block")) return "focus";
  if (slug === "reflect-blocker") return "reflect";
  if (slug === "walk-after-lunch") return "walk";
  return undefined;
}

function fallbackSuggestionForDay(day: CompleteDay) {
  if (!day.suggestion) return undefined;
  return { ...day.suggestion };
}

function getSuggestedActivitySlugs(
  dayNumber: number,
  profile: Doc<"userProfile"> | null,
  confidenceByCategory: Map<Doc<"confidenceScores">["category"], number>,
) {
  // Day 1: full starter set
  if (dayNumber === 1) {
    return [
      "morning-checkin",
      "write-priorities",
      "focus-block-25",
      "reflect-blocker",
      "walk-after-lunch",
    ];
  }

  // Day 2: repeat baseline
  if (dayNumber === 2) {
    return ["morning-checkin", "focus-block-25", "reflect-blocker"];
  }

  // Days 3–7: dynamic based on confidence + profile
  const slugs = ["morning-checkin"];
  const focusScore = confidenceByCategory.get("focus") ?? 20;

  // Escalate focus block duration based on day/score
  if (dayNumber >= 6 || focusScore >= 80) {
    slugs.push("focus-block-45");
  } else if (dayNumber >= 4 || focusScore >= 60) {
    slugs.push("focus-block-35");
  } else {
    slugs.push("focus-block-25");
  }

  // Day 3+: add a walk for movement
  if (dayNumber >= 3) {
    slugs.push("walk-after-lunch");
  }

  // Add blocker-specific or reflection activity
  if (profile?.biggestBlocker === "energy" || dayNumber === 5) {
    slugs.push("breathing-break");
  }

  // Day 4, 5, 7: include reflection
  if (dayNumber >= 4) {
    slugs.push("reflect-blocker");
  }

  // Day 5, 7: re-prioritize
  if (dayNumber === 5 || dayNumber === 7) {
    slugs.push("write-priorities");
  }

  return slugs;
}

function buildUnlockForDay(
  dayNumber: number,
  domains: Doc<"userDomains">[],
): DomainUnlockItem | undefined {
  const candidates: Array<{ domainKey: DomainKey; startDay: number }> = [
    { domainKey: "career", startDay: 1 },
    { domainKey: "health", startDay: 4 },
    { domainKey: "relationships", startDay: 6 },
  ];

  const domainStatus = new Map(domains.map((domain) => [domain.domain, domain.status]));
  const nextCandidate = candidates.find(
    (candidate) =>
      dayNumber >= candidate.startDay &&
      domainStatus.get(candidate.domainKey) !== "active" &&
      domainStatus.get(candidate.domainKey) !== "pinned",
  );

  if (!nextCandidate) {
    return undefined;
  }

  const meta = DOMAIN_MAP[nextCandidate.domainKey];
  return {
    icon: meta.emoji,
    title: `Add ${meta.label} domain`,
    subtitle: meta.description,
    domainKey: nextCandidate.domainKey,
  };
}

function buildRecap(
  template: CompleteDay,
  completedActivitiesCount: number,
  confidenceRows: Doc<"confidenceScores">[],
  activeDomains: Doc<"userDomains">[],
) {
  const topConfidence = [...confidenceRows]
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((row) => categoryLabel(row.category));
  const activeDomainLabels = activeDomains
    .slice(0, 3)
    .map((row) => DOMAIN_MAP[row.domain]?.label ?? row.domain);

  return {
    title: template.recap?.title ?? "Week 1 recap",
    items: [
      {
        kind: "check" as const,
        text: `${completedActivitiesCount} activities completed`,
        sub: "real completion data shaped the first week",
      },
      {
        kind: "check" as const,
        text:
          topConfidence.length > 0
            ? `Strongest confidence: ${topConfidence.join(", ")}`
            : "Confidence scores initialized",
        sub: "the system now has signal to personalize harder",
      },
      {
        kind: "check" as const,
        text: `${activeDomains.length} active domains`,
        sub:
          activeDomainLabels.length > 0
            ? activeDomainLabels.join(", ")
            : "activate more domains to expand suggestions",
      },
      {
        kind: "arrow" as const,
        text: "Week 2 plan ready",
        sub: "personalized from your first-run behavior",
      },
    ],
    ctaLabel: template.recap?.ctaLabel ?? "View Week 2 plan",
  };
}

async function ensureActivityTemplates(ctx: any) {
  const existing = (await ctx.db
    .query("activityTemplates")
    .collect()) as Doc<"activityTemplates">[];
  const bySlug = new Map(existing.map((row: Doc<"activityTemplates">) => [row.slug, row]));

  for (const seed of ACTIVITY_TEMPLATE_SEEDS) {
    const row = bySlug.get(seed.slug);
    if (row) {
      await ctx.db.patch(row._id, {
        title: seed.title,
        category: seed.category,
        difficulty: seed.difficulty,
        source: seed.source,
        durationMinutes: seed.durationMinutes,
        instructions: seed.instructions,
        signalMap: seed.signalMap,
        isHardcoded: seed.isHardcoded,
      });
      continue;
    }

    await ctx.db.insert("activityTemplates", seed);
  }

  const refreshed = (await ctx.db
    .query("activityTemplates")
    .collect()) as Doc<"activityTemplates">[];
  return new Map(refreshed.map((row) => [row.slug, row]));
}

async function getConfidenceByCategory(
  ctx: any,
  userId: string,
) {
  const rows = (await ctx.db
    .query("confidenceScores")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .collect()) as Doc<"confidenceScores">[];

  return new Map(rows.map((row: Doc<"confidenceScores">) => [row.category, row.score]));
}

async function seedAssignmentsForUser(
  ctx: any,
  userId: string,
  dayNumber: number,
) {
  const safeDayNumber = clampDayNumber(dayNumber);
  const existingAssignments = await ctx.db
    .query("activityAssignments")
    .withIndex("by_userId_day", (q: any) =>
      q.eq("userId", userId).eq("dayNumber", safeDayNumber),
    )
    .collect();

  if (existingAssignments.length > 0) {
    return { created: 0, skipped: true };
  }

  const templateMap = await ensureActivityTemplates(ctx);
  const profile = await ctx.db
    .query("userProfile")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();
  const confidenceByCategory = await getConfidenceByCategory(ctx, userId);
  const slugs = getSuggestedActivitySlugs(
    safeDayNumber,
    profile ?? null,
    confidenceByCategory,
  );
  const assignedAt = Date.now();
  const dueAt = assignedAt + 24 * 60 * 60 * 1000;
  const phase = phaseForDay(safeDayNumber);
  let created = 0;

  for (const slug of slugs) {
    const template = templateMap.get(slug);
    if (!template) {
      continue;
    }

    await ctx.db.insert("activityAssignments", {
      userId,
      templateId: template._id,
      dayNumber: safeDayNumber,
      status: "pending",
      phase,
      assignedBy: safeDayNumber <= 2 ? "system" : "ai",
      assignedAt,
      dueAt,
    });
    created += 1;
  }

  return { created, skipped: false };
}

export const getCompleteDays = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const [assignments, suggestions, confidenceRows, domains, activityEvents] =
      await Promise.all([
        ctx.db
          .query("activityAssignments")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .collect(),
        ctx.db
          .query("suggestions")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .collect(),
        ctx.db
          .query("confidenceScores")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .collect(),
        ctx.db
          .query("userDomains")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .collect(),
        ctx.db
          .query("activityEvents")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .collect(),
      ]);

    const templateIds = [...new Set(assignments.map((assignment) => assignment.templateId))];
    const templates = await Promise.all(
      templateIds.map((templateId) => ctx.db.get(templateId)),
    );
    const templateMap = new Map(
      templates
        .filter((template): template is NonNullable<typeof template> => template !== null)
        .map((template) => [template._id, template]),
    );

    const assignmentsByDay = new Map<number, Doc<"activityAssignments">[]>();
    for (const assignment of assignments) {
      const list = assignmentsByDay.get(assignment.dayNumber) ?? [];
      list.push(assignment);
      assignmentsByDay.set(assignment.dayNumber, list);
    }

    const completedAssignmentIds = new Set(
      activityEvents
        .filter((event) => event.action === "completed")
        .map((event) => event.assignmentId),
    );
    const startedAssignmentIds = new Set(
      activityEvents
        .filter((event) => event.action === "started")
        .map((event) => event.assignmentId),
    );
    const latestStartedAtByAssignment = new Map<string, number>();
    for (const event of activityEvents) {
      if (event.action !== "started") {
        continue;
      }
      const startedAt =
        typeof event.metadata?.startedAt === "number"
          ? event.metadata.startedAt
          : event.createdAt;
      latestStartedAtByAssignment.set(event.assignmentId, startedAt);
    }

    const confidenceByCategory = new Map(
      confidenceRows.map((row) => [row.category, row]),
    );
    const activeDomains = domains.filter(
      (domain) => domain.status === "active" || domain.status === "pinned",
    );

    // Pre-compute incomplete counts per day for the banner
    const incompleteCountByDay = new Map<number, number>();
    for (const [dayNum, dayAssigns] of assignmentsByDay) {
      const incomplete = dayAssigns.filter(
        (a) =>
          a.status !== "completed" &&
          a.status !== "skipped" &&
          !completedAssignmentIds.has(a._id),
      ).length;
      incompleteCountByDay.set(dayNum, incomplete);
    }

    return DAY_TEMPLATES.map((template) => {
      // Sum up all incomplete activities from days before this one
      let incompletePreviousDayCount = 0;
      for (let d = 1; d < template.day; d++) {
        incompletePreviousDayCount += incompleteCountByDay.get(d) ?? 0;
      }

      const dayAssignments = assignmentsByDay.get(template.day) ?? [];
      const dayActivities =
        dayAssignments.length > 0
          ? dayAssignments.flatMap((assignment) => {
              const activityTemplate = templateMap.get(assignment.templateId);
              if (!activityTemplate) {
                return [];
              }
              const icon = activityIconForCategory(activityTemplate.category);
              return [
                {
                  id: `${template.day}-${activityTemplate.slug}`,
                  assignmentId: assignment._id,
                  icon: icon.icon,
                  iconType: icon.iconType,
                  title: activityTemplate.title,
                  meta: `${activityTemplate.durationMinutes} min · ${activityTemplate.category}`,
                  body: activityTemplate.instructions,
                  durationMinutes: activityTemplate.durationMinutes,
                  done:
                    assignment.status === "completed" ||
                    completedAssignmentIds.has(assignment._id),
                  started:
                    assignment.status === "started" ||
                    (startedAssignmentIds.has(assignment._id) &&
                      assignment.status !== "completed" &&
                      assignment.status !== "skipped"),
                  startedAt: latestStartedAtByAssignment.get(assignment._id),
                  sheetType: activitySheetTypeForSlug(activityTemplate.slug),
                } satisfies DayActivityItem,
              ];
            })
          : template.activities;

      const pendingSuggestion = suggestions
        .filter(
          (suggestion) =>
            suggestion.phase === template.phase &&
            suggestion.feedbackVerdict === undefined,
        )
        .sort((a, b) => b.shownAt - a.shownAt)[0];

      const confidence =
        confidenceRows.length > 0
          ? ONBOARDING_CATEGORIES.filter((category) => {
              if (template.day === 1) {
                return category === "focus" || category === "sleep" || category === "exercise";
              }
              if (template.day === 2 || template.day === 3 || template.day === 4 || template.day === 6) {
                return category === "focus" || category === "sleep" || category === "exercise" || category === "habits";
              }
              return confidenceByCategory.has(category);
            })
              .map((category) => confidenceByCategory.get(category))
              .filter((row): row is Doc<"confidenceScores"> => Boolean(row))
              .map((row) => ({
                label: categoryLabel(row.category),
                score: row.score,
                tier: confidenceTier(row.score),
              }))
          : template.confidence;

      return {
        ...template,
        activities: dayActivities,
        suggestion: pendingSuggestion
          ? {
              suggestionId: pendingSuggestion._id,
              variant: suggestionVariantForCategory(pendingSuggestion.category),
              confidence: pendingSuggestion.confidenceAtTime,
              eyebrow: template.suggestion?.eyebrow ?? "AI Suggestion",
              text: pendingSuggestion.content,
              acceptLabel: template.suggestion?.acceptLabel ?? "Accept",
              dismissLabel: template.suggestion?.dismissLabel ?? "Dismiss",
              snoozeLabel: template.suggestion?.snoozeLabel,
            }
          : fallbackSuggestionForDay(template),
        unlock: buildUnlockForDay(template.day, domains) ?? template.unlock,
        confidence,
        incompletePreviousDayCount:
          incompletePreviousDayCount > 0 ? incompletePreviousDayCount : undefined,
        recap:
          template.day === 7
            ? buildRecap(
                template,
                completedAssignmentIds.size,
                confidenceRows,
                activeDomains,
              )
            : template.recap,
      } satisfies CompleteDay;
    });
  },
});

export const seedDayActivities = mutation({
  args: {
    dayNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const safeDayNumber = clampDayNumber(args.dayNumber);
    const result = await seedAssignmentsForUser(ctx, userId, safeDayNumber);

    if (!result.skipped && safeDayNumber >= 3) {
      await ctx.scheduler.runAfter(0, internal.firstRunDaysActions.generateDaySuggestion, {
        userId,
        dayNumber: safeDayNumber,
      });
    }

    return { ok: true, ...result };
  },
});

export const seedDayActivitiesForUser = internalMutation({
  args: {
    userId: v.string(),
    dayNumber: v.number(),
  },
  handler: async (ctx, args) => {
    return await seedAssignmentsForUser(ctx, args.userId, args.dayNumber);
  },
});

export const recordActivityCompletion = mutation({
  args: {
    assignmentId: v.id("activityAssignments"),
    action: signalActionValidator,
    elapsedMs: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment || assignment.userId !== userId) {
      throw new ConvexError("Activity assignment not found.");
    }

    const template = await ctx.db.get(assignment.templateId);
    if (!template) {
      throw new ConvexError("Activity template not found.");
    }

    const now = Date.now();
    const eventId = await ctx.db.insert("activityEvents", {
      assignmentId: assignment._id,
      userId,
      action: args.action,
      elapsedMs: args.elapsedMs,
      metadata: args.metadata,
      createdAt: now,
    });

    const nextStatus =
      args.action === "completed"
        ? "completed"
        : args.action === "started"
          ? "started"
          : args.action === "skipped"
            ? "skipped"
            : assignment.status;
    if (nextStatus !== assignment.status) {
      await ctx.db.patch(assignment._id, { status: nextStatus });
    }

    const signalEntry = template.signalMap?.[args.action];
    if (signalEntry) {
      await ctx.db.insert("signals", {
        userId,
        category: signalEntry.category,
        action: signalEntry.action,
        itemId: assignment._id,
        weight: signalEntry.weight,
        durationMs: args.elapsedMs,
        metadata: args.metadata,
        createdAt: now,
      });
    }

    await ctx.scheduler.runAfter(0, internal.firstRunDays.recalculateConfidence, {
      userId,
    });

    return { ok: true, eventId };
  },
});

export const recordSuggestionFeedback = mutation({
  args: {
    suggestionId: v.id("suggestions"),
    verdict: suggestionVerdictValidator,
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const suggestion = await ctx.db.get(args.suggestionId);
    if (!suggestion || suggestion.userId !== userId) {
      throw new ConvexError("Suggestion not found.");
    }

    const now = Date.now();
    await ctx.db.patch(suggestion._id, {
      feedbackVerdict: args.verdict,
      feedbackReason: args.reason,
      feedbackAt: now,
    });

    const feedbackId = await ctx.db.insert("feedback", {
      suggestionId: suggestion._id,
      userId,
      verdict: args.verdict,
      reason: args.reason,
      createdAt: now,
    });

    await ctx.scheduler.runAfter(0, internal.firstRunDays.recalculateConfidence, {
      userId,
    });

    return { ok: true, feedbackId };
  },
});

export const recordActivityReflection = mutation({
  args: {
    assignmentId: v.id("activityAssignments"),
    useful: v.string(),
    difficulty: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment || assignment.userId !== userId) {
      throw new ConvexError("Activity assignment not found.");
    }

    const usefulnessMap: Record<string, number> = {
      "Useful": 3,
      "Meh": 2,
      "Not really": 1,
    };
    const difficultyMap: Record<string, number> = {
      "Easy": 1,
      "Medium": 2,
      "Hard": 3,
    };

    const now = Date.now();
    const reflectionId = await ctx.db.insert("activityReflections", {
      assignmentId: assignment._id,
      userId,
      usefulnessRating: usefulnessMap[args.useful] ?? 2,
      difficultyRating: difficultyMap[args.difficulty] ?? 2,
      createdAt: now,
    });

    return { ok: true, reflectionId };
  },
});

export const recalculateConfidence = internalMutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const [signalRows, suggestionRows, existingRows] = await Promise.all([
      ctx.db
        .query("signals")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect(),
      ctx.db
        .query("suggestions")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect(),
      ctx.db
        .query("confidenceScores")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect(),
    ]);

    const existingByCategory = new Map(existingRows.map((row) => [row.category, row]));
    const now = Date.now();

    for (const category of ONBOARDING_CATEGORIES) {
      const categorySignals = signalRows.filter(
        (signal) => signal.category === category && signal.action === "completed",
      );
      const acceptedCount = suggestionRows.filter(
        (suggestion) =>
          suggestion.category === category && suggestion.feedbackVerdict === "accepted",
      ).length;
      const dismissedCount = suggestionRows.filter(
        (suggestion) =>
          suggestion.category === category && suggestion.feedbackVerdict === "dismissed",
      ).length;
      const signalScore = categorySignals.reduce(
        (sum, signal) => sum + Math.max(3, Math.min(signal.weight ?? 3, 8)),
        0,
      );
      const score = Math.min(
        100,
        20 + signalScore + acceptedCount * 5 - dismissedCount * 2,
      );
      const patch = {
        userId: args.userId,
        category,
        score,
        signalCount: categorySignals.length,
        acceptCount: acceptedCount,
        dismissCount: dismissedCount,
        updatedAt: now,
      };

      const existing = existingByCategory.get(category);
      if (existing) {
        await ctx.db.patch(existing._id, patch);
      } else {
        await ctx.db.insert("confidenceScores", patch);
      }
    }

    return { ok: true };
  },
});

export const getPendingSuggestionForPhase = internalQuery({
  args: {
    userId: v.string(),
    phase: onboardingPhaseValidator,
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("suggestions")
      .withIndex("by_userId_phase", (q) =>
        q.eq("userId", args.userId).eq("phase", args.phase),
      )
      .collect();
    return (
      rows
        .filter((row) => row.feedbackVerdict === undefined)
        .sort((a, b) => b.shownAt - a.shownAt)[0] ?? null
    );
  },
});

export const getSuggestionGenerationContext = internalQuery({
  args: {
    userId: v.string(),
    dayNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const [profile, signals, confidenceScores] = await Promise.all([
      ctx.db
        .query("userProfile")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .first(),
      ctx.db
        .query("signals")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect(),
      ctx.db
        .query("confidenceScores")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect(),
    ]);

    const recentSignals = signals
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 12)
      .map((signal) => ({
        category: signal.category,
        action: signal.action,
        weight: signal.weight ?? 0,
        createdAt: signal.createdAt,
      }));

    return {
      profile: profile
        ? {
            goal: profile.primaryGoal,
            energyPattern: profile.energyPattern,
            blocker: profile.biggestBlocker,
            style: profile.preferredStyle,
          }
        : null,
      recentSignals,
      confidenceScores: confidenceScores.map((row) => ({
        category: row.category,
        score: row.score,
      })),
      dayNumber: args.dayNumber,
    };
  },
});

export const insertGeneratedSuggestion = internalMutation({
  args: {
    userId: v.string(),
    dayNumber: v.number(),
    phase: onboardingPhaseValidator,
    category: activityCategoryValidator,
    content: v.string(),
    reasoning: v.string(),
    confidenceAtTime: v.number(),
  },
  handler: async (ctx, args) => {
    const shownAt = Date.now();
    return await ctx.db.insert("suggestions", {
      userId: args.userId,
      category: args.category,
      content: args.content,
      reasoning: args.reasoning,
      confidenceAtTime: Math.max(0, Math.min(100, Math.round(args.confidenceAtTime))),
      phase: args.phase,
      shownAt,
    });
  },
});

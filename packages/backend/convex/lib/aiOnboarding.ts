import type { Doc, Id } from "../_generated/dataModel";

export const ONBOARDING_CATEGORIES = [
  "focus",
  "sleep",
  "exercise",
  "tasks",
  "habits",
  "reflection",
] as const;

export const HARD_CODED_TEMPLATES = [
  {
    slug: "morning-check-in",
    title: "Morning check-in",
    category: "habits" as const,
    difficulty: "easy" as const,
    source: "hardcoded" as const,
    durationMinutes: 2,
    instructions: "Capture your energy, mood, and one thing that matters today.",
    isHardcoded: true,
    signalMap: {
      viewed: { category: "habits" as const, action: "viewed" as const, weight: 2 },
      started: { category: "habits" as const, action: "started" as const, weight: 5 },
      completed: { category: "habits" as const, action: "completed" as const, weight: 12 },
      skipped: { category: "habits" as const, action: "skipped" as const, weight: -4 },
      reflected: { category: "reflection" as const, action: "reflected" as const, weight: 8 },
    },
  },
  {
    slug: "write-3-priorities",
    title: "Write 3 priorities",
    category: "focus" as const,
    difficulty: "easy" as const,
    source: "hardcoded" as const,
    durationMinutes: 5,
    instructions: "List the three outcomes that would make today feel meaningful.",
    isHardcoded: true,
    signalMap: {
      viewed: { category: "focus" as const, action: "viewed" as const, weight: 2 },
      started: { category: "focus" as const, action: "started" as const, weight: 5 },
      completed: { category: "focus" as const, action: "completed" as const, weight: 18 },
      skipped: { category: "focus" as const, action: "skipped" as const, weight: -5 },
      reflected: { category: "reflection" as const, action: "reflected" as const, weight: 8 },
    },
  },
  {
    slug: "evening-wind-down",
    title: "Evening wind-down",
    category: "sleep" as const,
    difficulty: "easy" as const,
    source: "hardcoded" as const,
    durationMinutes: 5,
    instructions: "Do one small shutdown ritual before bed and note how the day ended.",
    isHardcoded: true,
    signalMap: {
      viewed: { category: "sleep" as const, action: "viewed" as const, weight: 2 },
      started: { category: "sleep" as const, action: "started" as const, weight: 5 },
      completed: { category: "sleep" as const, action: "completed" as const, weight: 14 },
      skipped: { category: "sleep" as const, action: "skipped" as const, weight: -4 },
      reflected: { category: "reflection" as const, action: "reflected" as const, weight: 8 },
    },
  },
  {
    slug: "focus-block-25",
    title: "Focus block (25 min)",
    category: "focus" as const,
    difficulty: "medium" as const,
    source: "hardcoded" as const,
    durationMinutes: 25,
    instructions: "Protect one uninterrupted 25 minute block for your hardest task.",
    isHardcoded: true,
    signalMap: {
      viewed: { category: "focus" as const, action: "viewed" as const, weight: 2 },
      started: { category: "focus" as const, action: "started" as const, weight: 8 },
      completed: { category: "focus" as const, action: "completed" as const, weight: 20 },
      skipped: { category: "focus" as const, action: "skipped" as const, weight: -6 },
      reflected: { category: "reflection" as const, action: "reflected" as const, weight: 8 },
    },
  },
  {
    slug: "reflect-on-blocker",
    title: "Reflect on blocker",
    category: "habits" as const,
    difficulty: "easy" as const,
    source: "hardcoded" as const,
    durationMinutes: 5,
    instructions: "Name the biggest friction point from today and what might remove it tomorrow.",
    isHardcoded: true,
    signalMap: {
      viewed: { category: "habits" as const, action: "viewed" as const, weight: 2 },
      started: { category: "habits" as const, action: "started" as const, weight: 5 },
      completed: { category: "habits" as const, action: "completed" as const, weight: 15 },
      skipped: { category: "habits" as const, action: "skipped" as const, weight: -4 },
      reflected: { category: "reflection" as const, action: "reflected" as const, weight: 10 },
    },
  },
  {
    slug: "walk-after-lunch",
    title: "Walk after lunch",
    category: "exercise" as const,
    difficulty: "easy" as const,
    source: "hardcoded" as const,
    durationMinutes: 15,
    instructions: "Take a short walk after lunch to reset your energy and attention.",
    isHardcoded: true,
    signalMap: {
      viewed: { category: "exercise" as const, action: "viewed" as const, weight: 2 },
      started: { category: "exercise" as const, action: "started" as const, weight: 5 },
      completed: { category: "exercise" as const, action: "completed" as const, weight: 16 },
      skipped: { category: "exercise" as const, action: "skipped" as const, weight: -5 },
      reflected: { category: "reflection" as const, action: "reflected" as const, weight: 8 },
    },
  },
] as const;

export function getCommitmentActivityCount(commitmentLevel: Doc<"userProfile">["commitmentLevel"]) {
  switch (commitmentLevel) {
    case "light":
      return 2;
    case "committed":
      return 4;
    default:
      return 3;
  }
}

export function getPhaseFromSignals(args: {
  dayNumber: number;
  scores: Array<Doc<"confidenceScores">>;
}) {
  const maxScore = Math.max(0, ...args.scores.map((score) => score.score));

  if (maxScore >= 80 || args.dayNumber >= 6) {
    return "act" as const;
  }
  if (maxScore >= 31 || args.dayNumber >= 3) {
    return "learn" as const;
  }
  return "seed" as const;
}

export function getStageFromDay(dayNumber: number) {
  return dayNumber <= 1 ? ("first-run-today" as const) : ("week-1" as const);
}

export function buildDateKey(timestamp: number, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(timestamp);
}

export function endOfLocalDay(timestamp: number, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })
    .formatToParts(timestamp)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const utcEnd = Date.UTC(year, month - 1, day, 23, 59, 59, 999);
  return utcEnd;
}

export function getDecayedWeight(signal: Pick<Doc<"signals">, "createdAt">, baseWeight: number) {
  const ageDays = (Date.now() - signal.createdAt) / (1000 * 60 * 60 * 24);
  const decay = ageDays > 3 ? Math.pow(0.85, ageDays - 3) : 1;
  return baseWeight * decay;
}

export function getConfidenceTier(score: number) {
  if (score >= 80) {
    return "act" as const;
  }
  if (score >= 56) {
    return "recommend" as const;
  }
  if (score >= 31) {
    return "suggest" as const;
  }
  return "observe" as const;
}

export function matchesTemplateProfile(
  template: Pick<Doc<"activityTemplates">, "slug" | "category">,
  profile: Doc<"userProfile">,
  dayNumber: number,
) {
  if (template.slug === "morning-check-in" || template.slug === "evening-wind-down") {
    return true;
  }

  if (template.slug === "reflect-on-blocker") {
    return dayNumber >= 2;
  }

  if (template.slug === "write-3-priorities") {
    return profile.primaryGoal === "productivity" || profile.primaryGoal === "habits";
  }

  if (template.slug === "focus-block-25") {
    return (
      profile.energyPattern === "morning" ||
      profile.energyPattern === "afternoon" ||
      profile.primaryGoal === "productivity"
    );
  }

  if (template.slug === "walk-after-lunch") {
    return profile.primaryGoal === "health" || profile.primaryGoal === "wellbeing";
  }

  return template.category === "habits";
}

export function uniqueBySlug<T extends { slug: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.slug)) {
      return false;
    }
    seen.add(item.slug);
    return true;
  });
}

export function buildSuggestionReasoning(args: {
  category: Doc<"confidenceScores">["category"];
  score: number;
  completions: number;
  skips: number;
  profile: Doc<"userProfile">;
}) {
  return `Category ${args.category} is at ${args.score} confidence with ${args.completions} completions and ${args.skips} skips for a ${args.profile.preferredStyle} coaching style user.`;
}

export function buildDeterministicSuggestion(args: {
  category: Doc<"confidenceScores">["category"];
  score: number;
  completions: number;
  skips: number;
  profile: Doc<"userProfile">;
  dayNumber: number;
}) {
  const tier = getConfidenceTier(args.score);
  const intro =
    tier === "observe"
      ? "Many people find a small reset useful early on"
      : tier === "suggest"
        ? "I noticed a workable pattern forming"
        : tier === "recommend"
          ? "Your recent behavior is consistent enough to recommend a stronger move"
          : "You have earned a more assertive adjustment";

  const bodyByCategory: Record<typeof args.category, string> = {
    focus:
      args.score >= 56
        ? "Protect one deeper focus block tomorrow before lower-value work leaks in."
        : "Try locking your hardest task into the first clear window you get tomorrow.",
    sleep:
      args.score >= 56
        ? "Keep a short shutdown routine tonight so tomorrow starts with less friction."
        : "A two-minute wind-down tonight would give us a cleaner signal on your energy.",
    exercise:
      args.score >= 56
        ? "Repeat the movement slot that has been easiest to finish instead of adding variety."
        : "A short walk after lunch could be the safest next experiment.",
    tasks:
      args.score >= 56
        ? "Trim tomorrow to the few tasks that actually move the day."
        : "Write the first task you would finish even on a low-energy day.",
    habits:
      args.score >= 56
        ? "Keep the smallest habit you are already completing and ignore the rest for now."
        : "Anchor one tiny check-in around the part of the day you already remember reliably.",
    reflection:
      "Take one minute to note what made today's strongest moment easier than usual.",
  };

  const toneTail =
    args.profile.preferredStyle === "direct"
      ? "If this fits, do it tomorrow."
      : args.profile.preferredStyle === "structured"
        ? "Treat it as tomorrow's experiment and review the result after."
        : "Does that feel relevant for tomorrow?";

  return `${intro}. ${bodyByCategory[args.category]} ${toneTail}`.trim();
}

export function buildWeekTwoPlan(args: {
  profile: Doc<"userProfile">;
  scores: Array<Doc<"confidenceScores">>;
}) {
  const ranked = [...args.scores].sort((a, b) => b.score - a.score).slice(0, 2);
  const focus = ranked.map((item) => item.category).join(" and ") || "habits";
  return `Week 2 plan: keep your ${args.profile.commitmentLevel} pace, double down on ${focus}, and let ${args.profile.preferredStyle} coaching guide the next set of adjustments.`;
}

export type AssignmentWithTemplate = Doc<"activityAssignments"> & {
  template: Doc<"activityTemplates">;
  reflection: Doc<"activityReflections"> | null;
  events: Array<Doc<"activityEvents">>;
};

export type DailyContext = {
  profile: Doc<"userProfile">;
  state: Doc<"onboardingState">;
  scores: Array<Doc<"confidenceScores">>;
  signals: Array<Doc<"signals">>;
  assignments: AssignmentWithTemplate[];
};

export function asItemId(id: Id<"activityAssignments"> | Id<"suggestions">) {
  return id as unknown as string;
}

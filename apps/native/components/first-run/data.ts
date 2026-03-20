export type FirstRunPhase = "seed" | "learn" | "act";
export type FirstRunAssignmentStatus =
  | "pending"
  | "started"
  | "completed"
  | "skipped";
export type FirstRunSuggestionVerdict =
  | "accepted"
  | "dismissed"
  | "snoozed";

export type FirstRunHeaderViewModel = {
  eyebrow: string;
  title: string;
  subtitle: string;
  badge: string;
};

export type FirstRunProgressViewModel = {
  progress: number;
  label: string;
  subtitle: string;
};

export type FirstRunProfileItemViewModel = {
  label: string;
  value: string;
};

export type FirstRunProfileViewModel = {
  title: string;
  subtitle: string;
  items: FirstRunProfileItemViewModel[];
};

export type FirstRunActivityActionViewModel = {
  id: "start" | "done" | "skip";
  label: string;
  variant: "primary" | "outline" | "ghost";
  disabled: boolean;
};

export type FirstRunReflectionOptionViewModel = {
  id: "useful" | "easy" | "hard";
  label: string;
  usefulnessRating: number;
  difficultyRating: number;
};

export type FirstRunActivityViewModel = {
  id: string;
  title: string;
  instructions: string;
  durationLabel: string;
  statusLabel: string;
  phaseLabel: string;
  categoryLabel: string;
  categoryColor: string;
  categoryBackground: string;
  actions: FirstRunActivityActionViewModel[];
  showReflection: boolean;
  reflectionSummary: string | null;
  reflectionOptions: FirstRunReflectionOptionViewModel[];
};

export type FirstRunSuggestionActionViewModel = {
  id: FirstRunSuggestionVerdict;
  label: string;
  variant: "primary" | "outline" | "ghost";
  disabled: boolean;
};

export type FirstRunSuggestionViewModel = {
  id: string;
  categoryLabel: string;
  categoryColor: string;
  categoryBackground: string;
  confidenceLabel: string;
  content: string;
  feedbackLabel: string | null;
  actions: FirstRunSuggestionActionViewModel[];
};

export type FirstRunConfidenceViewModel = {
  id: string;
  label: string;
  score: number;
  signalCount: number;
  completions: number;
  skips: number;
  tierLabel: string;
  color: string;
};

export type FirstRunWeekTwoViewModel = {
  title: string;
  subtitle: string;
};

export type FirstRunInsightViewModel = {
  title: string;
  badge?: string;
  body: string;
};

export type FirstRunCheckInViewModel = {
  assignmentId: string;
  title: string;
  subtitle: string;
  badge: string;
  completed: boolean;
};

export type FirstRunSnapshotMetricViewModel = {
  id: string;
  value: string;
  label: string;
  color: string;
};

export type FirstRunSnapshotViewModel = {
  title: string;
  subtitle: string;
  metrics: FirstRunSnapshotMetricViewModel[];
};

export type FirstRunDomainSetupViewModel = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  statusLine: string;
  icon: "bullseye" | "briefcase" | "money" | "heartbeat" | "smile-o" | "check-square-o" | "users" | "home";
  accentColor: string;
  backgroundColor: string;
  href: "/(tabs)/domains";
};

export type FirstRunEmptyStateViewModel = {
  title: string;
  subtitle: string;
  ctaLabel?: string;
};

export type FirstRunScreenViewModel = {
  stageKey: string;
  header: FirstRunHeaderViewModel;
  progress: FirstRunProgressViewModel;
  insight: FirstRunInsightViewModel;
  profile: FirstRunProfileViewModel;
  checkIn: FirstRunCheckInViewModel | null;
  snapshot: FirstRunSnapshotViewModel;
  activities: FirstRunActivityViewModel[];
  activitiesEmpty: FirstRunEmptyStateViewModel | null;
  domains: FirstRunDomainSetupViewModel[];
  suggestions: FirstRunSuggestionViewModel[];
  suggestionsEmpty: FirstRunEmptyStateViewModel | null;
  confidence: FirstRunConfidenceViewModel[];
  confidenceEmpty: FirstRunEmptyStateViewModel | null;
  weekTwo: FirstRunWeekTwoViewModel | null;
  completeCtaLabel: string | null;
};

const CATEGORY_META: Record<
  string,
  { label: string; color: string; background: string }
> = {
  focus: {
    label: "Focus",
    color: "#ba7517",
    background: "#2f2210",
  },
  sleep: {
    label: "Sleep",
    color: "#9b8fff",
    background: "#1f1a2f",
  },
  exercise: {
    label: "Exercise",
    color: "#f0997b",
    background: "#2a1510",
  },
  tasks: {
    label: "Tasks",
    color: "#85b7eb",
    background: "#142033",
  },
  habits: {
    label: "Habits",
    color: "#6fcf97",
    background: "#16271d",
  },
  reflection: {
    label: "Reflection",
    color: "#ed93b1",
    background: "#2a1020",
  },
};

const STATUS_META: Record<
  FirstRunAssignmentStatus,
  { label: string; color: string }
> = {
  pending: { label: "Pending", color: "#ba7517" },
  started: { label: "Started", color: "#85b7eb" },
  completed: { label: "Completed", color: "#1d9e75" },
  skipped: { label: "Skipped", color: "#d4537e" },
};

const PHASE_COPY: Record<
  FirstRunPhase,
  { label: string; subtitle: string }
> = {
  seed: {
    label: "Seed",
    subtitle: "The AI is collecting clean baseline signal from your first actions.",
  },
  learn: {
    label: "Learn",
    subtitle: "The AI has enough signal to start making small, testable suggestions.",
  },
  act: {
    label: "Act",
    subtitle: "The AI has earned confidence in some categories and can go bolder there.",
  },
};

const DOMAIN_SETUP_MAP: Record<string, FirstRunDomainSetupViewModel[]> = {
  productivity: [
    {
      id: "career",
      title: "Career",
      subtitle: "Add a project or goal to activate",
      badge: "+ Setup",
      statusLine: "Projects, deep work, and outcome tracking start here",
      icon: "briefcase",
      accentColor: "#85b7eb",
      backgroundColor: "#1a1e2a",
      href: "/(tabs)/domains",
    },
    {
      id: "tasks",
      title: "Tasks",
      subtitle: "Capture your first actionable backlog item",
      badge: "+ Add",
      statusLine: "Use this domain to turn loose work into something schedulable",
      icon: "check-square-o",
      accentColor: "#b1b4bc",
      backgroundColor: "#252525",
      href: "/(tabs)/domains",
    },
  ],
  wellbeing: [
    {
      id: "wellness",
      title: "Wellness",
      subtitle: "Check-ins, mood, and rest patterns live here",
      badge: "+ Activate",
      statusLine: "This domain captures how your days actually feel",
      icon: "smile-o",
      accentColor: "#ed93b1",
      backgroundColor: "#2a1020",
      href: "/(tabs)/domains",
    },
    {
      id: "relationships",
      title: "Relationships",
      subtitle: "Add one person or touchpoint to make it active",
      badge: "+ Add",
      statusLine: "People, follow-ups, and care rhythms are tracked here",
      icon: "users",
      accentColor: "#85b7eb",
      backgroundColor: "#0e1420",
      href: "/(tabs)/domains",
    },
  ],
  habits: [
    {
      id: "faith",
      title: "Faith",
      subtitle: "Prayer, devotionals, and reflections can anchor your week",
      badge: "+ Setup",
      statusLine: "One early action here can become a strong anchor signal",
      icon: "bullseye",
      accentColor: "#b4adf5",
      backgroundColor: "#2a2040",
      href: "/(tabs)/domains",
    },
    {
      id: "wellness",
      title: "Wellness",
      subtitle: "Track how routines affect mood and energy",
      badge: "+ Activate",
      statusLine: "Check-ins connect your routines to your actual state",
      icon: "smile-o",
      accentColor: "#ed93b1",
      backgroundColor: "#2a1020",
      href: "/(tabs)/domains",
    },
  ],
  health: [
    {
      id: "health",
      title: "Health",
      subtitle: "Log a session to activate movement and sleep tracking",
      badge: "+ Activate",
      statusLine: "Training, energy, and recovery trends compound here",
      icon: "heartbeat",
      accentColor: "#f0997b",
      backgroundColor: "#2a1510",
      href: "/(tabs)/domains",
    },
    {
      id: "finance",
      title: "Finance",
      subtitle: "Budget caps and spending patterns feed future nudges",
      badge: "+ Setup",
      statusLine: "Money decisions become more useful once this domain has signal",
      icon: "money",
      accentColor: "#6fcf97",
      backgroundColor: "#1a2a1e",
      href: "/(tabs)/domains",
    },
  ],
};

export function buildFirstRunViewModel(dashboard: any, userName: string): FirstRunScreenViewModel {
  const dayNumber = dashboard.state.dayNumber;
  const phase = dashboard.state.currentPhase as FirstRunPhase;
  const phaseCopy = PHASE_COPY[phase] ?? PHASE_COPY.seed;
  const progress = Math.round((Math.min(dayNumber, 7) / 7) * 100);
  const checkInAssignment = (dashboard.assignments ?? []).find((assignment: any) =>
    assignment.template.title.toLowerCase().includes("check-in"),
  );

  const activities = (dashboard.assignments ?? [])
    .filter((assignment: any) => assignment._id !== checkInAssignment?._id)
    .map((assignment: any) => mapAssignmentToActivityCard(assignment));
  const suggestions = (dashboard.suggestions ?? []).map((suggestion: any) =>
    mapSuggestionToCard(suggestion),
  );
  const confidence = (dashboard.confidence ?? []).map((entry: any) =>
    mapConfidenceRow(entry),
  );
  const domains =
    DOMAIN_SETUP_MAP[dashboard.profile.primaryGoal] ?? DOMAIN_SETUP_MAP.productivity;

  return {
    stageKey: `day-${dayNumber}-${phase}`,
    header: {
      eyebrow: "First run",
      title: `Day ${dayNumber} of 7, ${userName}.`,
      subtitle: phaseCopy.subtitle,
      badge: phaseCopy.label,
    },
    progress: {
      progress,
      label: `${progress}% of first run`,
      subtitle: `Day-based progress stays tied to the seven-day arc. Phase: ${phaseCopy.label}.`,
    },
    insight: buildInsight(dashboard, dayNumber, phase),
    profile: {
      title: "Seed profile",
      subtitle: "These answers seeded the model. Behavior will override them over time.",
      items: [
        { label: "Goal", value: formatLabel(dashboard.profile.primaryGoal) },
        { label: "Energy", value: formatLabel(dashboard.profile.energyPattern) },
        { label: "Blocker", value: formatLabel(dashboard.profile.biggestBlocker) },
        { label: "Style", value: formatLabel(dashboard.profile.preferredStyle) },
        { label: "Commitment", value: formatLabel(dashboard.profile.commitmentLevel) },
      ],
    },
    checkIn: checkInAssignment
      ? {
          assignmentId: checkInAssignment._id,
          title:
            dayNumber <= 1 ? "Log your first check-in" : "Daily check-in",
          subtitle:
            dayNumber <= 1
              ? "Mood, energy, and readiness teach the AI how your days actually feel."
              : "A quick check-in keeps suggestions grounded in how today is actually going.",
          badge: dayNumber <= 1 ? "Day 1 signal" : "High-value signal",
          completed: checkInAssignment.status === "completed",
        }
      : null,
    snapshot: buildSnapshot(dashboard, dayNumber),
    activities,
    activitiesEmpty:
      activities.length === 0
        ? {
            title: "No activities assigned yet",
            subtitle: "Sync the day to seed the next batch of onboarding activities.",
            ctaLabel: "Sync first run",
          }
        : null,
    domains,
    suggestions,
    suggestionsEmpty:
      suggestions.length === 0
        ? dayNumber < 3
          ? {
              title: "Suggestions are still locked",
              subtitle: "The AI stays in observe mode first. Suggestions start after enough early signal is collected.",
            }
          : {
              title: "No suggestions yet",
              subtitle: "Confidence has not crossed the suggestion threshold yet, or no fresh suggestion has been generated for today.",
              ctaLabel: "Refresh suggestions",
            }
        : null,
    confidence,
    confidenceEmpty:
      confidence.length === 0
        ? {
            title: "Confidence starts at zero",
            subtitle: "Views, starts, completions, skips, and feedback will fill this section in.",
          }
        : null,
    weekTwo:
      typeof dashboard.weekTwoPlan === "string" && dashboard.weekTwoPlan.length > 0
        ? {
            title: "Week 2 preview",
            subtitle: dashboard.weekTwoPlan,
          }
        : null,
    completeCtaLabel: dashboard.readyToComplete ? "Finish first run" : null,
  };
}

export function mapAssignmentToActivityCard(assignment: any): FirstRunActivityViewModel {
  const category = CATEGORY_META[assignment.template.category] ?? CATEGORY_META.habits;
  const status = STATUS_META[assignment.status as FirstRunAssignmentStatus] ?? STATUS_META.pending;

  return {
    id: assignment._id,
    title: assignment.template.title,
    instructions: assignment.template.instructions,
    durationLabel: `${assignment.template.durationMinutes} min`,
    statusLabel: status.label,
    phaseLabel: formatLabel(assignment.phase),
    categoryLabel: category.label,
    categoryColor: category.color,
    categoryBackground: category.background,
    actions: buildActivityActions(assignment.status as FirstRunAssignmentStatus),
    showReflection: assignment.status === "completed" && !assignment.reflection,
    reflectionSummary: assignment.reflection
      ? buildReflectionSummary(assignment.reflection)
      : null,
    reflectionOptions: [
      {
        id: "useful",
        label: "Useful",
        usefulnessRating: 5,
        difficultyRating: 3,
      },
      {
        id: "easy",
        label: "Easy",
        usefulnessRating: 4,
        difficultyRating: 1,
      },
      {
        id: "hard",
        label: "Hard",
        usefulnessRating: 3,
        difficultyRating: 5,
      },
    ],
  };
}

export function mapSuggestionToCard(suggestion: any): FirstRunSuggestionViewModel {
  const category = CATEGORY_META[suggestion.category] ?? CATEGORY_META.habits;

  return {
    id: suggestion._id,
    categoryLabel: category.label,
    categoryColor: category.color,
    categoryBackground: category.background,
    confidenceLabel: `${suggestion.confidenceAtTime} confidence`,
    content: suggestion.content,
    feedbackLabel: suggestion.feedbackVerdict
      ? `Marked ${formatLabel(suggestion.feedbackVerdict)}`
      : null,
    actions: buildSuggestionActions(Boolean(suggestion.feedbackVerdict)),
  };
}

export function mapConfidenceRow(entry: any): FirstRunConfidenceViewModel {
  const category = CATEGORY_META[entry.category] ?? CATEGORY_META.habits;

  return {
    id: entry.category,
    label: category.label,
    score: entry.score,
    signalCount: entry.signalCount,
    completions: entry.completions,
    skips: entry.skips,
    tierLabel: getConfidenceTierLabel(entry.score),
    color: category.color,
  };
}

export function getConfidenceTierLabel(score: number) {
  if (score >= 80) {
    return "Act";
  }
  if (score >= 56) {
    return "Recommend";
  }
  if (score >= 31) {
    return "Suggest";
  }
  return "Observe";
}

function buildActivityActions(status: FirstRunAssignmentStatus): FirstRunActivityActionViewModel[] {
  switch (status) {
    case "pending":
      return [
        { id: "start", label: "Start", variant: "outline", disabled: false },
        { id: "done", label: "Done", variant: "primary", disabled: false },
        { id: "skip", label: "Skip", variant: "ghost", disabled: false },
      ];
    case "started":
      return [
        { id: "done", label: "Done", variant: "primary", disabled: false },
        { id: "skip", label: "Skip", variant: "ghost", disabled: false },
      ];
    default:
      return [];
  }
}

function buildSuggestionActions(
  hasFeedback: boolean,
): FirstRunSuggestionActionViewModel[] {
  return [
    {
      id: "accepted",
      label: "Accept",
      variant: "primary",
      disabled: hasFeedback,
    },
    {
      id: "dismissed",
      label: "Dismiss",
      variant: "outline",
      disabled: hasFeedback,
    },
    {
      id: "snoozed",
      label: "Snooze",
      variant: "ghost",
      disabled: hasFeedback,
    },
  ];
}

function buildReflectionSummary(reflection: any) {
  const parts = [
    typeof reflection.usefulnessRating === "number"
      ? `usefulness ${reflection.usefulnessRating}/5`
      : null,
    typeof reflection.difficultyRating === "number"
      ? `difficulty ${reflection.difficultyRating}/5`
      : null,
  ].filter(Boolean);

  return parts.length > 0 ? `Reflection saved: ${parts.join(" · ")}` : "Reflection saved";
}

function buildInsight(dashboard: any, dayNumber: number, phase: FirstRunPhase): FirstRunInsightViewModel {
  if (dayNumber <= 1) {
    return {
      title: "Your AI · first message",
      badge: "Day 1 of 7",
      body:
        "I don't know much about you yet, and that's the right place to start. Log your first check-in, complete one activity, and I'll begin building your picture without pretending to know more than I do.",
    };
  }

  if (phase === "learn") {
    return {
      title: "First patterns",
      badge: `Day ${dayNumber}`,
      body:
        "You are past the observation-only phase. I have enough signal to start making smaller suggestions, but I still need clean feedback before I go bold.",
    };
  }

  if (phase === "act") {
    return {
      title: "Confidence is earned",
      badge: `Day ${dayNumber}`,
      body:
        "The strongest categories now have enough signal for more assertive recommendations. Weak categories still stay cautious until the data says otherwise.",
    };
  }

  return {
    title: "Still learning you",
    badge: `Day ${dayNumber}`,
    body:
      "These first few days are a controlled experiment. The goal is not volume. It is learning what you actually follow through on.",
  };
}

function buildSnapshot(dashboard: any, dayNumber: number): FirstRunSnapshotViewModel {
  const assignments = dashboard.assignments ?? [];
  const completed = assignments.filter((assignment: any) => assignment.status === "completed").length;
  const started = assignments.filter((assignment: any) => assignment.status === "started").length;
  const signals = (dashboard.confidence ?? []).reduce(
    (sum: number, entry: any) => sum + (entry.signalCount ?? 0),
    0,
  );
  const suggestions = (dashboard.suggestions ?? []).length;

  return {
    title: dayNumber <= 1 ? "Suggested to start" : `Day ${dayNumber} snapshot`,
    subtitle:
      dayNumber <= 1
        ? "The app learns from mood, completions, and the domains you activate first."
        : "This first-run summary stays compact on purpose. It shows what the model can actually defend already.",
    metrics: [
      {
        id: "done",
        value: String(completed),
        label: "Done",
        color: "#1d9e75",
      },
      {
        id: "started",
        value: String(started),
        label: "Started",
        color: "#85b7eb",
      },
      {
        id: "signals",
        value: String(signals),
        label: "Signals",
        color: "#9b8fff",
      },
      {
        id: "suggestions",
        value: String(suggestions),
        label: "Suggestions",
        color: "#ba7517",
      },
    ],
  };
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

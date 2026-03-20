export type FirstRunTodayKey =
  | "day1-morning"
  | "day1-evening"
  | "day3-morning";

export type WeekOneDayKey =
  | "day2"
  | "day3"
  | "day4"
  | "day5"
  | "day6"
  | "day7";

export type DomainTone = {
  label: string;
  backgroundColor: string;
  color: string;
};

export type InsightAction = {
  label: string;
  message: string;
};

export type ActionItem = {
  title: string;
  note: string;
  tone: DomainTone;
  accentColor: string;
};

export type SetupItem = {
  title: string;
  subtitle: string;
  badge: string;
  accentColor: string;
  backgroundColor: string;
};

export type MetricItem = {
  label: string;
  value: string;
  color: string;
};

export type ContextItem = {
  label: string;
  color: string;
  isNew?: boolean;
};

export type FirstRunTodayState = {
  id: FirstRunTodayKey;
  pickerLabel: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  insightLabel: string;
  insightBadge?: string;
  insightBody: string;
  progress: number;
  progressLabel: string;
  progressSubtitle: string;
  insightActions: InsightAction[];
  actions?: ActionItem[];
  setupItems?: SetupItem[];
  metrics?: MetricItem[];
  habits?: string[];
  prompt?: {
    title: string;
    subtitle: string;
    accentColor: string;
  };
};

export type WeekOneState = {
  id: WeekOneDayKey;
  pickerLabel: string;
  badge: string;
  dateLabel: string;
  title: string;
  subtitle: string;
  insightLabel: string;
  insightBody: string;
  insightActions: InsightAction[];
  progress: number;
  progressLabel: string;
  progressSubtitle: string;
  actions?: ActionItem[];
  habits?: string[];
  setupItems?: SetupItem[];
  metrics?: MetricItem[];
  prompt?: {
    title: string;
    subtitle: string;
    accentColor: string;
  };
  contextItems?: ContextItem[];
  celebration?: {
    title: string;
    subtitle: string;
  };
  approval?: {
    title: string;
    subtitle: string;
    details: string[];
  };
};

export const DOMAIN_TONES = {
  faith: {
    label: "Faith",
    backgroundColor: "#2a2040",
    color: "#b4adf5",
  },
  wellness: {
    label: "Wellness",
    backgroundColor: "#2a1020",
    color: "#ed93b1",
  },
  career: {
    label: "Career",
    backgroundColor: "#1a1e2a",
    color: "#85b7eb",
  },
  finance: {
    label: "Finance",
    backgroundColor: "#1a2a1e",
    color: "#6fcf97",
  },
  health: {
    label: "Health",
    backgroundColor: "#2a1510",
    color: "#f0997b",
  },
  relationships: {
    label: "Relationships",
    backgroundColor: "#0e1420",
    color: "#85b7eb",
  },
} as const satisfies Record<string, DomainTone>;

export const FIRST_RUN_TODAY_STATES: FirstRunTodayState[] = [
  {
    id: "day1-morning",
    pickerLabel: "Day 1 AM",
    eyebrow: "State 1 · First open",
    title: "Good morning, Bobie.",
    subtitle: "Day 1. Let's start simply.",
    insightLabel: "Your AI · first message",
    insightBadge: "Day 1 of 7",
    insightBody:
      "I don't know much about you yet, and that's the right place to start. Log your first check-in, complete one priority, and I'll begin building your picture. I won't suggest anything I haven't earned the right to suggest.",
    progress: 2,
    progressLabel: "Day 1 of 7",
    progressSubtitle:
      "Complete your first check-in and one priority to start the learning loop. Full weekly planning unlocks after 7 days.",
    insightActions: [
      {
        label: "Start check-in",
        message:
          "This preview will later open the real first check-in flow.",
      },
      {
        label: "How you learn",
        message:
          "This preview explains the seven-day ramp into personalized context.",
      },
    ],
    actions: [
      {
        title: "Morning devotional + prayer",
        note: "Suggested · from your setup",
        tone: DOMAIN_TONES.faith,
        accentColor: "#534AB7",
      },
      {
        title: "Log your first check-in",
        note: "Teaches AI your patterns",
        tone: DOMAIN_TONES.wellness,
        accentColor: "#993556",
      },
      {
        title: "Set your first budget cap",
        note: "Unlocks Finance insights",
        tone: DOMAIN_TONES.finance,
        accentColor: "#0F6E56",
      },
    ],
    setupItems: [
      {
        title: "Career",
        subtitle: "Add a project or goal to activate",
        badge: "+ Setup",
        accentColor: "#85b7eb",
        backgroundColor: "#1a1e2a",
      },
      {
        title: "Health",
        subtitle: "Log a session to activate",
        badge: "+ Setup",
        accentColor: "#f0997b",
        backgroundColor: "#2a1510",
      },
    ],
    prompt: {
      title: "No habits yet",
      subtitle: "Add a habit and it will appear here every day.",
      accentColor: "#666a7a",
    },
  },
  {
    id: "day1-evening",
    pickerLabel: "Day 1 PM",
    eyebrow: "State 2 · End of day 1",
    title: "Good evening, Bobie.",
    subtitle: "Day 1 wrapping up. You made a start.",
    insightLabel: "End of day 1",
    insightBody:
      "You logged prayer, completed 2 priorities, and did your first check-in. That's enough for me to make my first small adjustment. I've shifted your default morning block earlier based on what you actually did.",
    progress: 14,
    progressLabel: "Day 1 complete",
    progressSubtitle:
      "Good start. Six more days of check-ins and the full picture comes together. Tomorrow the first pattern starts to emerge.",
    insightActions: [
      {
        label: "Looks right",
        message:
          "The AI would keep the updated morning timing if you approve it.",
      },
      {
        label: "Adjust timing",
        message:
          "This preview will later open the timing adjustment flow.",
      },
    ],
    metrics: [
      { label: "Done", value: "2", color: "#1d9e75" },
      { label: "Check-in", value: "1", color: "#9b8fff" },
      { label: "Prayer", value: "1", color: "#b4adf5" },
      { label: "Days left", value: "6", color: "#ba7517" },
    ],
    prompt: {
      title: "Evening check-in",
      subtitle:
        "How did day 1 end? Your answer shapes tomorrow's suggestions.",
      accentColor: "#d4537e",
    },
  },
  {
    id: "day3-morning",
    pickerLabel: "Day 3",
    eyebrow: "State 3 · Day 3 morning",
    title: "Good morning, Bobie.",
    subtitle: "Day 3. I noticed something.",
    insightLabel: "First pattern",
    insightBadge: "Day 3",
    insightBody:
      "Both mornings you logged prayer before 7 AM and your energy was above 7. Yesterday when prayer was later, energy dropped to 5. Want me to protect that morning slot?",
    progress: 36,
    progressLabel: "Day 3 of 7",
    progressSubtitle:
      "Four more days until your first personalized week plan. Faith is already emerging as your anchor.",
    insightActions: [
      {
        label: "Lock it in",
        message:
          "This preview would protect that morning slot as a recurring priority.",
      },
      {
        label: "Keep watching",
        message:
          "The AI would keep observing before turning the pattern into a routine.",
      },
    ],
    actions: [
      {
        title: "Morning prayer",
        note: "AI-suggested · energy pattern",
        tone: DOMAIN_TONES.faith,
        accentColor: "#534AB7",
      },
      {
        title: "Life OS · schema design",
        note: "9:00 AM · deep work",
        tone: DOMAIN_TONES.career,
        accentColor: "#185FA5",
      },
      {
        title: "Morning check-in",
        note: "Feeds AI learning · day 3",
        tone: DOMAIN_TONES.wellness,
        accentColor: "#993556",
      },
    ],
    habits: ["Prayer", "Water · 2L"],
  },
];

export const WEEK_ONE_STATES: WeekOneState[] = [
  {
    id: "day2",
    pickerLabel: "Day 2",
    badge: "Day 2",
    dateLabel: "Tuesday · Mar 3",
    title: "Morning, Bobie.",
    subtitle: "I'm still building your picture. Keep logging.",
    insightLabel: "From AI · day 2",
    insightBody:
      "Yesterday you logged prayer and completed 2 priorities. That's enough for me to know you're a morning person with a faith practice. I've set your deep work block to 9 AM until you tell me otherwise.",
    insightActions: [
      {
        label: "Adjust timing",
        message:
          "This preview would let you move the default deep work block.",
      },
      {
        label: "Looks right",
        message:
          "This preview would confirm the learned timing.",
      },
    ],
    progress: 14,
    progressLabel: "Day 2 of 7",
    progressSubtitle:
      "After 7 days the app can generate your first real weekly plan. For now it's working from setup plus yesterday's data.",
    actions: [
      {
        title: "Morning devotional + prayer",
        note: "6:00 AM · suggested",
        tone: DOMAIN_TONES.faith,
        accentColor: "#534AB7",
      },
      {
        title: "Log your morning check-in",
        note: "Helps AI learn",
        tone: DOMAIN_TONES.wellness,
        accentColor: "#993556",
      },
    ],
    prompt: {
      title: "Check-in · 30 seconds",
      subtitle: "Mood, energy, focus · feeds AI learning",
      accentColor: "#d4537e",
    },
  },
  {
    id: "day3",
    pickerLabel: "Day 3",
    badge: "Day 3",
    dateLabel: "Wednesday · Mar 4",
    title: "Two days down.",
    subtitle: "I noticed something already.",
    insightLabel: "First pattern",
    insightBody:
      "Both mornings you logged prayer before 7 AM and your energy check-in was 7 or above. That might be nothing, or it might be your first reliable pattern. I'll keep watching.",
    insightActions: [
      {
        label: "Tell me more",
        message:
          "This preview would explain the prayer and energy pattern in more detail.",
      },
    ],
    progress: 36,
    progressLabel: "Day 3 of 7",
    progressSubtitle:
      "Patterns are starting to show. Faith is becoming your anchor and your mornings are clearly stronger.",
    contextItems: [
      {
        label: "Prayer logged both mornings · streak started",
        color: "#534AB7",
      },
      {
        label: "Deep work active · 2 sessions logged",
        color: "#185FA5",
      },
      {
        label: "Energy avg 7.0 · mood avg 7.5",
        color: "#9b8fff",
        isNew: true,
      },
    ],
    habits: ["Prayer", "Water · 2L", "Gratitude log"],
  },
  {
    id: "day4",
    pickerLabel: "Day 4",
    badge: "Day 4",
    dateLabel: "Thursday · Mar 5",
    title: "Getting clearer.",
    subtitle: "I have enough to make a first real suggestion.",
    insightLabel: "First suggestion",
    insightBody:
      "Your energy on prayer mornings averages 7.2. On non-prayer mornings it drops. Want me to lock in morning prayer as a non-negotiable habit?",
    insightActions: [
      {
        label: "Yes · lock it in",
        message:
          "This preview would create the recurring habit suggestion.",
      },
      {
        label: "Not yet",
        message:
          "The AI would keep observing before making it permanent.",
      },
    ],
    progress: 43,
    progressLabel: "Day 4 of 7",
    progressSubtitle:
      "Three more days until your first personalized week plan. The app now understands your energy pattern and faith rhythm.",
    setupItems: [
      {
        title: "Set up Finance domain",
        subtitle: "Add a budget cap to unlock spending insights",
        badge: "+ Setup",
        accentColor: "#6fcf97",
        backgroundColor: "#1a2a1e",
      },
      {
        title: "Log first training session",
        subtitle: "Activate the Health domain",
        badge: "+ Activate",
        accentColor: "#f0997b",
        backgroundColor: "#2a1510",
      },
    ],
  },
  {
    id: "day5",
    pickerLabel: "Day 5",
    badge: "Day 5",
    dateLabel: "Friday · Mar 6",
    title: "Something new today.",
    subtitle: "I want to make a change, but only with your permission.",
    insightLabel: "Your first AI proposal",
    insightBody:
      "Based on 4 days of data, your morning spiritual routine is your strongest anchor. I want to add it to your weekly plan as a recurring block, but only if you approve it.",
    insightActions: [
      {
        label: "Approve",
        message:
          "This preview would accept the first AI schedule proposal.",
      },
      {
        label: "Not yet",
        message:
          "This preview would keep the proposal pending without applying it.",
      },
    ],
    progress: 57,
    progressLabel: "Day 5 of 7",
    progressSubtitle:
      "This is your first approval moment. The AI never changes your plan without surfacing the proposal first.",
    approval: {
      title: "What will be added",
      subtitle:
        "Prayer + devotional + Bible reading · recurring weekday block",
      details: [
        "6:00-6:45 AM · Mon-Fri",
        "Based on 4 days of check-in and faith log data",
      ],
    },
  },
  {
    id: "day6",
    pickerLabel: "Day 6",
    badge: "Day 6",
    dateLabel: "Saturday · Mar 7",
    title: "Five days straight.",
    subtitle: "That's a real streak, not a lucky start.",
    insightLabel: "What I now know",
    insightBody:
      "Morning faith practice is your anchor. Deep work is strongest between 9 and 11 AM. Energy dips after 2 PM. That's enough signal to start protecting your best hours.",
    insightActions: [
      {
        label: "Add relationship",
        message:
          "This preview would add the first person to your Relationships domain.",
      },
    ],
    progress: 71,
    progressLabel: "Day 6 of 7",
    progressSubtitle:
      "You now have real streaks, active domains, and enough signal for stronger suggestions.",
    celebration: {
      title: "5-day check-in streak",
      subtitle:
        "Every morning, every check-in. Your consistency is what makes the AI useful.",
    },
    contextItems: [
      {
        label: "Morning faith practice is your anchor",
        color: "#534AB7",
      },
      {
        label: "Deep work peaks between 9 and 11 AM",
        color: "#185FA5",
      },
      {
        label: "Energy dips after 2 PM",
        color: "#9b8fff",
        isNew: true,
      },
      {
        label: "Finance domain active · budget cap set",
        color: "#0F6E56",
        isNew: true,
      },
      {
        label: "Health domain active · first training session logged",
        color: "#993C1D",
        isNew: true,
      },
    ],
    setupItems: [
      {
        title: "Add to Relationships",
        subtitle: "Who matters most to you right now?",
        badge: "+ Add",
        accentColor: "#85b7eb",
        backgroundColor: "#0e1420",
      },
    ],
  },
  {
    id: "day7",
    pickerLabel: "Day 7",
    badge: "Day 7 ✓",
    dateLabel: "Sunday · Mar 8",
    title: "One week in, Bobie.",
    subtitle: "I know you well enough now. Here's what I found.",
    insightLabel: "Week 2 plan · ready",
    insightBody:
      "I've generated your first full personalized week plan. It's built around your real patterns, not defaults. Review it, adjust it, and approve what fits.",
    insightActions: [
      {
        label: "Open week plan",
        message:
          "This preview would open the first personalized week plan.",
      },
      {
        label: "What you learned",
        message:
          "This preview would summarize the first week of learning.",
      },
    ],
    progress: 100,
    progressLabel: "Complete ✓",
    progressSubtitle:
      "Full personalized context is now active. Suggestions and plans come from your actual behavior from here on.",
    metrics: [
      { label: "Check-ins", value: "7", color: "#1d9e75" },
      { label: "Prayer days", value: "6", color: "#9b8fff" },
      { label: "Tasks done", value: "14", color: "#85b7eb" },
      { label: "Approvals", value: "1", color: "#b4adf5" },
    ],
  },
];

export function getWeekOneDay(daysSinceFirstLogin: number | null): WeekOneDayKey {
  switch (daysSinceFirstLogin) {
    case 1:
      return "day2";
    case 2:
      return "day3";
    case 3:
      return "day4";
    case 4:
      return "day5";
    case 5:
      return "day6";
    default:
      return "day7";
  }
}

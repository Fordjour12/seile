import type { Doc, Id } from "../_generated/dataModel";

export const MAX_WEEKLY_PRIORITIES = 3;
export const MAX_MEANINGFUL_TASKS_PER_DAY = 5;
export const MAX_NEW_HABITS = 2;

const PRIORITY_SCORES = {
  low: 1,
  medium: 2,
  high: 3,
} as const;

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

type PlanningPriority = Doc<"planningGoals">["priority"];
type PlanningCadence = Doc<"planningHabits">["cadence"];
type EnergyPattern = Doc<"plannerProfiles">["energyPattern"];
type PlanningMode = Doc<"plans">["mode"];

export type PlannerProfileLike = Pick<
  Doc<"plannerProfiles">,
  "timezone" | "workHours" | "restDays" | "energyPattern" | "planningStyle" | "maxTasksPerDay" | "deepWorkPreference"
>;

export type WeeklyPlanInput = {
  weekStart: string;
  mode: PlanningMode;
  goals: Doc<"planningGoals">[];
  tasks: Doc<"planningTasks">[];
  habits: Doc<"planningHabits">[];
  latestReview: Doc<"planningReviews"> | null;
  agentState: Doc<"plannerAgentState"> | null;
  profile: PlannerProfileLike;
};

export type GeneratedTaskDraft = {
  title: string;
  priority: PlanningPriority;
  linkedGoalId?: Id<"planningGoals">;
  dueDate: string;
};

export type GeneratedHabitDraft = {
  name: string;
  cadence: PlanningCadence;
  targetValue: number;
  linkedGoalId?: Id<"planningGoals">;
  scheduleDays?: string[];
};

type TaskCandidate = {
  id?: Id<"planningTasks">;
  title: string;
  dueDate?: string;
  priority: PlanningPriority;
  linkedGoalId?: Id<"planningGoals">;
  draftTask?: GeneratedTaskDraft;
};

type HabitCandidate = {
  id?: Id<"planningHabits">;
  name: string;
  cadence: PlanningCadence;
  targetValue: number;
  linkedGoalId?: Id<"planningGoals">;
  scheduleDays?: string[];
  draftHabit?: GeneratedHabitDraft;
};

export type GeneratedPlanItemDraft = {
  itemType: Doc<"planItems">["itemType"];
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  priority: PlanningPriority;
  effort: Doc<"planItems">["effort"];
  linkedTaskId?: Id<"planningTasks">;
  linkedHabitId?: Id<"planningHabits">;
  draftTask?: GeneratedTaskDraft;
  draftHabit?: GeneratedHabitDraft;
  notes?: string;
  locked?: boolean;
};

export type WeeklyPlanDraft = {
  title: string;
  summary: string;
  priorityTitles: string[];
  warnings: string[];
  burnoutRiskScore: number;
  recoverySuggested: boolean;
  items: GeneratedPlanItemDraft[];
};

export type ReviewSummary = {
  completionRate: number;
  wins: string[];
  blockers: string[];
  misses: string[];
  overloadIndicators: string[];
  improvementSuggestions: string[];
};

export function isoDateFromTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function getWeekWindow(referenceDate = isoDateFromTimestamp(Date.now())) {
  const source = parseDateKey(referenceDate);
  const offset = (source.getUTCDay() + 6) % 7;
  source.setUTCDate(source.getUTCDate() - offset);
  const startDate = formatDateKey(source);
  const end = new Date(source);
  end.setUTCDate(end.getUTCDate() + 6);

  return {
    startDate,
    endDate: formatDateKey(end),
    dates: Array.from({ length: 7 }, (_, index) => addDays(startDate, index)),
  };
}

export function addDays(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateKey(date);
}

export function compareDateKeys(left: string, right: string): number {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

export function getDayName(dateKey: string) {
  return DAY_NAMES[parseDateKey(dateKey).getUTCDay()];
}

export function clampMaxTasksPerDay(value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return MAX_MEANINGFUL_TASKS_PER_DAY;
  }

  return Math.max(1, Math.min(MAX_MEANINGFUL_TASKS_PER_DAY, Math.round(value)));
}

export function calculateBurnoutRisk(input: {
  latestReview: Doc<"planningReviews"> | null;
  agentState: Doc<"plannerAgentState"> | null;
  openTasksCount: number;
  missedHabitsCount: number;
  mode: PlanningMode;
}) {
  if (input.mode === "recovery") {
    return 82;
  }

  let score = input.agentState?.burnoutScore ?? 20;

  if (input.latestReview) {
    score += Math.max(0, 65 - input.latestReview.completionRate) * 0.6;
    score += (input.latestReview.stressRating ?? 3) * 6;
    score -= (input.latestReview.satisfactionRating ?? 3) * 2;
    score += input.latestReview.overloadIndicators.length * 8;
  }

  score += Math.max(0, input.openTasksCount - 8) * 1.8;
  score += input.missedHabitsCount * 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function buildWeeklyPlanDraft(input: WeeklyPlanInput): WeeklyPlanDraft {
  const week = getWeekWindow(input.weekStart);
  const maxTasksPerDay = clampMaxTasksPerDay(input.profile.maxTasksPerDay);
  const workDates = week.dates.filter((date) => !input.profile.restDays.includes(getDayName(date)));
  const activeDates = workDates.length > 0 ? workDates : week.dates.slice(0, 5);
  const openTasks = input.tasks.filter((task) => task.status === "pending");
  const activeHabits = input.habits.filter((habit) => habit.active);
  const burnoutRiskScore = calculateBurnoutRisk({
    latestReview: input.latestReview,
    agentState: input.agentState,
    openTasksCount: openTasks.length,
    missedHabitsCount: input.latestReview?.misses.length ?? 0,
    mode: input.mode,
  });
  const recoverySuggested = input.mode === "recovery" || burnoutRiskScore >= 65;
  const priorityLimit = recoverySuggested ? 2 : MAX_WEEKLY_PRIORITIES;
  const selectedGoals = [...input.goals]
    .filter((goal) => goal.active)
    .sort(sortByPriorityThenDate)
    .slice(0, priorityLimit);
  const priorityTitles = selectedGoals.map((goal) => goal.title);
  const warnings: string[] = [];

  if (openTasks.length > activeDates.length * Math.max(1, maxTasksPerDay - 2)) {
    warnings.push("Open work exceeds this week's safe capacity. Expect move/drop decisions.");
  }

  if (recoverySuggested) {
    warnings.push("Recovery mode active: reduced scope, extra buffers, and fewer priorities.");
  }

  if (selectedGoals.length === 0) {
    warnings.push("No active goals found, so the plan leans on starter tasks and stabilizing habits.");
  }

  const items: GeneratedPlanItemDraft[] = [];
  const energyPattern = input.profile.energyPattern;
  const primaryDate = activeDates[0] ?? week.startDate;

  priorityTitles.forEach((title, index) => {
    items.push({
      itemType: "priority",
      title,
      date: primaryDate,
      startTime: timeForPriority(index, energyPattern),
      endTime: timeForPriority(index + 1, energyPattern),
      priority: "high",
      effort: "medium",
      notes: "Weekly priority",
      locked: index === 0,
    });
  });

  const taskCapacityPerDay = Math.max(1, Math.min(recoverySuggested ? 2 : 3, maxTasksPerDay - 2));
  const taskCapacity = activeDates.length * taskCapacityPerDay;
  const selectedTasks: TaskCandidate[] = [...openTasks]
    .sort(sortByPriorityThenDate)
    .slice(0, taskCapacity)
    .map((task) => ({
      id: task._id,
      title: task.title,
      dueDate: task.dueDate,
      priority: task.priority,
      linkedGoalId: task.linkedGoalId,
    }));

  if (selectedTasks.length < Math.max(selectedGoals.length * 2, 4)) {
    const generatedTasks = createGoalTasks({
      goals: selectedGoals,
      weekEnd: week.endDate,
      desiredCount: Math.max(selectedGoals.length * 2, 4) - selectedTasks.length,
    });

    for (const task of generatedTasks) {
      selectedTasks.push({
        title: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
        linkedGoalId: task.linkedGoalId,
        draftTask: task,
      });
    }
  }

  const dailyTaskCounts: Record<string, number> = {};
  for (const date of activeDates) {
    dailyTaskCounts[date] = 0;
  }

  for (const [index, task] of selectedTasks.entries()) {
    const targetDate = allocateDate({
      dates: activeDates,
      counts: dailyTaskCounts,
      maxPerDay: taskCapacityPerDay,
      preferredDate: task.dueDate,
    });

    dailyTaskCounts[targetDate] += 1;
    items.push({
      itemType: "task",
      title: task.title,
      date: targetDate,
      priority: task.priority,
      effort: task.priority === "high" ? "high" : "medium",
      linkedTaskId: task.id,
      draftTask: task.draftTask,
      notes: index < priorityTitles.length ? "Directly supports a weekly priority." : undefined,
    });
  }

  const selectedHabits = activeHabits.slice(0, MAX_NEW_HABITS);
  const habitsToSchedule: HabitCandidate[] =
    selectedHabits.length > 0
      ? selectedHabits.map((habit) => ({
          id: habit._id,
          name: habit.name,
          cadence: habit.cadence,
          targetValue: habit.targetValue,
          linkedGoalId: habit.linkedGoalId,
          scheduleDays: habit.scheduleDays,
        }))
      : createStarterHabits(selectedGoals).map((habit) => ({
          name: habit.name,
          cadence: habit.cadence,
          targetValue: habit.targetValue,
          linkedGoalId: habit.linkedGoalId,
          scheduleDays: habit.scheduleDays,
          draftHabit: habit,
        }));

  for (const habit of habitsToSchedule.slice(0, MAX_NEW_HABITS)) {
    for (const date of habitDates(habit.cadence, activeDates, habit.scheduleDays)) {
      const [startTime, endTime] = habitTimeRange(energyPattern, date);
      items.push({
        itemType: "habit",
        title: habit.name,
        date,
        startTime,
        endTime,
        priority: "medium",
        effort: "low",
        linkedHabitId: habit.id,
        draftHabit: habit.draftHabit,
        notes: `Target: ${habit.targetValue}`,
      });
    }
  }

  for (const date of activeDates) {
    const [startTime, endTime] = bufferTimeRange(input.profile.workHours.end);
    items.push({
      itemType: "buffer",
      title: recoverySuggested ? "Lighter buffer block" : "Buffer block",
      date,
      startTime,
      endTime,
      priority: "low",
      effort: "low",
      notes: "Reserved for spillover, admin, or recovery.",
    });
  }

  items.push({
    itemType: "review",
    title: "Weekly review",
    date: week.endDate,
    startTime: "18:00",
    endTime: "18:30",
    priority: "medium",
    effort: "low",
    notes: "Capture wins, blockers, and stress signals.",
    locked: true,
  });

  const titlePrefix = recoverySuggested ? "Recovery" : "Planner";
  const summary = recoverySuggested
    ? "A lighter week focused on stabilization, smaller outputs, and preserving recovery space."
    : `A grounded week built around ${Math.max(1, priorityTitles.length)} priorities, capped daily load, and protected buffer time.`;

  return {
    title: `${titlePrefix} Week of ${week.startDate}`,
    summary,
    priorityTitles,
    warnings,
    burnoutRiskScore,
    recoverySuggested,
    items: items.sort(sortPlanItems),
  };
}

export function buildReviewSummary(
  plan: Doc<"plans">,
  items: Doc<"planItems">[],
  stressRating?: number,
  satisfactionRating?: number,
): ReviewSummary {
  const actionableItems = items.filter((item) => item.itemType === "task" || item.itemType === "habit" || item.itemType === "priority");
  const doneItems = actionableItems.filter((item) => item.status === "done");
  const completionRate =
    actionableItems.length === 0 ? 100 : Math.round((doneItems.length / actionableItems.length) * 100);
  const wins = doneItems.slice(0, 5).map((item) => item.title);
  const misses = actionableItems
    .filter((item) => item.status !== "done")
    .slice(0, 5)
    .map((item) => item.title);
  const blockers =
    misses.length > 0
      ? [
          completionRate < 60 ? "Execution drift across the week." : "Some planned work rolled over.",
          ...(stressRating && stressRating >= 4 ? ["Stress stayed elevated."] : []),
        ]
      : stressRating && stressRating >= 4
        ? ["Stress stayed elevated despite completion."]
        : [];
  const overloadIndicators = [
    ...(completionRate < 60 ? ["Low completion rate"] : []),
    ...(countMeaningfulTasksPerDate(items) > MAX_MEANINGFUL_TASKS_PER_DAY ? ["Exceeded daily task guardrail"] : []),
    ...(stressRating && stressRating >= 4 ? ["High stress rating"] : []),
  ];
  const improvementSuggestions = [
    ...(completionRate < 60 ? ["Reduce next week to 1-2 priorities and trim task volume."] : []),
    ...(stressRating && stressRating >= 4 ? ["Add more recovery blocks and protect one lighter day."] : []),
    ...(completionRate >= 60 && (satisfactionRating ?? 0) >= 4 ? ["Keep the same weekly structure and repeat what worked."] : []),
  ];

  return {
    completionRate,
    wins,
    blockers,
    misses,
    overloadIndicators,
    improvementSuggestions,
  };
}

function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function sortByPriorityThenDate<
  T extends {
    priority: PlanningPriority;
    dueDate?: string;
    targetDate?: string;
    createdAt?: number;
  },
>(left: T, right: T) {
  const priorityDelta = priorityScore(right.priority) - priorityScore(left.priority);
  if (priorityDelta !== 0) return priorityDelta;

  const leftDate = left.dueDate ?? left.targetDate ?? "9999-12-31";
  const rightDate = right.dueDate ?? right.targetDate ?? "9999-12-31";
  if (leftDate !== rightDate) return compareDateKeys(leftDate, rightDate);

  return (left.createdAt ?? 0) - (right.createdAt ?? 0);
}

function allocateDate(input: {
  dates: string[];
  counts: Record<string, number>;
  maxPerDay: number;
  preferredDate?: string;
}) {
  const preferredDate =
    input.preferredDate && input.dates.includes(input.preferredDate) ? input.preferredDate : undefined;

  if (preferredDate && input.counts[preferredDate] < input.maxPerDay) {
    return preferredDate;
  }

  return (
    input.dates.find((date) => input.counts[date] < input.maxPerDay) ??
    input.dates[input.dates.length - 1]
  );
}

function createGoalTasks(input: {
  goals: Doc<"planningGoals">[];
  weekEnd: string;
  desiredCount: number;
}): GeneratedTaskDraft[] {
  if (input.goals.length === 0) {
    return [
      {
        title: "Run a life audit and capture top constraints",
        priority: "medium" as const,
        dueDate: input.weekEnd,
        linkedGoalId: undefined,
      },
      {
        title: "Choose one priority worth protecting this week",
        priority: "high" as const,
        dueDate: input.weekEnd,
        linkedGoalId: undefined,
      },
      {
        title: "Clear one admin task that reduces background stress",
        priority: "medium" as const,
        dueDate: input.weekEnd,
        linkedGoalId: undefined,
      },
    ].slice(0, Math.max(1, input.desiredCount));
  }

  const drafts: GeneratedTaskDraft[] = [];
  for (const goal of input.goals) {
    drafts.push({
      title: `Define the next concrete step for ${goal.title}`,
      priority: goal.priority,
      linkedGoalId: goal._id,
      dueDate: input.weekEnd,
    });
    drafts.push({
      title: `Ship one visible progress update for ${goal.title}`,
      priority: goal.priority,
      linkedGoalId: goal._id,
      dueDate: input.weekEnd,
    });
  }

  return drafts.slice(0, input.desiredCount);
}

function createStarterHabits(goals: Doc<"planningGoals">[]) {
  return [
    {
      name: "Five-minute daily reset",
      cadence: "daily" as const,
      targetValue: 5,
      linkedGoalId: goals[0]?._id,
      scheduleDays: undefined,
    },
    {
      name: "Three walks this week",
      cadence: "custom" as const,
      targetValue: 3,
      linkedGoalId: undefined,
      scheduleDays: ["monday", "wednesday", "friday"],
    },
  ];
}

function habitDates(cadence: PlanningCadence, dates: string[], scheduleDays?: string[]) {
  if (cadence === "daily") return dates;
  if (cadence === "weekdays") return dates.filter((date) => !["saturday", "sunday"].includes(getDayName(date)));
  if (cadence === "weekly") return dates.length > 0 ? [dates[0]] : [];
  if (cadence === "custom" && scheduleDays?.length) {
    return dates.filter((date) => scheduleDays.includes(getDayName(date)));
  }
  return dates.slice(0, 3);
}

function habitTimeRange(energyPattern: EnergyPattern, date: string): [string, string] {
  const day = getDayName(date);

  if (energyPattern === "morning") return ["07:30", "07:45"];
  if (energyPattern === "midday") return ["12:30", "12:45"];
  if (energyPattern === "evening") return ["19:00", "19:15"];

  return ["monday", "wednesday", "friday"].includes(day) ? ["07:30", "07:45"] : ["18:30", "18:45"];
}

function bufferTimeRange(workEnd: string): [string, string] {
  const hour = Number.parseInt(workEnd.slice(0, 2), 10);
  if (Number.isNaN(hour)) return ["16:30", "17:00"];

  const startHour = Math.max(14, Math.min(20, hour));
  const start = `${String(startHour).padStart(2, "0")}:00`;
  const end = `${String(Math.min(23, startHour + 1)).padStart(2, "0")}:00`;
  return [start, end];
}

function timeForPriority(index: number, energyPattern: EnergyPattern) {
  if (energyPattern === "morning") {
    return `${String(8 + index).padStart(2, "0")}:00`;
  }

  if (energyPattern === "midday") {
    return `${String(11 + index).padStart(2, "0")}:00`;
  }

  if (energyPattern === "evening") {
    return `${String(17 + index).padStart(2, "0")}:00`;
  }

  return `${String(9 + index).padStart(2, "0")}:00`;
}

function sortPlanItems(left: GeneratedPlanItemDraft, right: GeneratedPlanItemDraft) {
  if (left.date !== right.date) return compareDateKeys(left.date, right.date);
  const leftTime = left.startTime ?? "23:59";
  const rightTime = right.startTime ?? "23:59";
  if (leftTime !== rightTime) return leftTime.localeCompare(rightTime);
  return priorityScore(right.priority) - priorityScore(left.priority);
}

function countMeaningfulTasksPerDate(items: Doc<"planItems">[]) {
  const counts = new Map<string, number>();

  for (const item of items) {
    if (item.itemType !== "task") continue;
    counts.set(item.date, (counts.get(item.date) ?? 0) + 1);
  }

  return Math.max(0, ...counts.values());
}

function priorityScore(priority: PlanningPriority) {
  return PRIORITY_SCORES[priority];
}

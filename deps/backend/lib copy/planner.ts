import type { Doc, Id } from "../_generated/dataModel";
import type { PlannerHealthContext } from "./health";

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

type PlanningPriority = Doc<"sharedGoals">["priority"];
type PlanningCadence = Doc<"planningHabits">["cadence"];
type EnergyPattern = Doc<"plannerProfiles">["energyPattern"];
type PlanningMode = Doc<"plans">["mode"];
type GoalLike = Pick<
  Doc<"sharedGoals">,
  "_id" | "title" | "priority" | "targetDate" | "active"
>;

export type PlannerProfileLike = Pick<
  Doc<"plannerProfiles">,
  | "timezone"
  | "workHours"
  | "restDays"
  | "energyPattern"
  | "planningStyle"
  | "maxTasksPerDay"
  | "deepWorkPreference"
>;

export type WeeklyPlanInput = {
  weekStart: string;
  mode: PlanningMode;
  goals: GoalLike[];
  tasks: Doc<"planningTasks">[];
  habits: Doc<"planningHabits">[];
  latestReview: Doc<"planningReviews"> | null;
  agentState: Doc<"plannerAgentState"> | null;
  profile: PlannerProfileLike;
  health?: PlannerHealthContext | null;
};

export type GeneratedTaskDraft = {
  title: string;
  priority: PlanningPriority;
  sharedGoalId?: Id<"sharedGoals">;
  dueDate: string;
};

export type GeneratedHabitDraft = {
  name: string;
  cadence: PlanningCadence;
  targetValue: number;
  sharedGoalId?: Id<"sharedGoals">;
  scheduleDays?: string[];
};

type TaskCandidate = {
  id?: Id<"planningTasks">;
  title: string;
  dueDate?: string;
  priority: PlanningPriority;
  sharedGoalId?: Id<"sharedGoals">;
  draftTask?: GeneratedTaskDraft;
};

type HabitCandidate = {
  id?: Id<"planningHabits">;
  name: string;
  cadence: PlanningCadence;
  targetValue: number;
  sharedGoalId?: Id<"sharedGoals">;
  scheduleDays?: string[];
  draftHabit?: GeneratedHabitDraft;
};

type WorkoutCandidate = {
  title: string;
  workoutType: Doc<"workouts">["workoutType"];
  date: string;
  intensity: Doc<"workouts">["intensity"];
  durationMinutes: number;
  notes?: string;
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
  missedHabitsCount: number;
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
  health?: PlannerHealthContext | null;
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

  if (input.health) {
    score += Math.max(0, 60 - input.health.signals.recoveryScore) * 0.45;
    score += Math.max(0, input.health.signals.fatigueScore - 55) * 0.35;
    score += input.health.signals.recoveryRecommended ? 10 : 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function buildWeeklyPlanDraft(input: WeeklyPlanInput): WeeklyPlanDraft {
  const week = getWeekWindow(input.weekStart);
  const healthSignals = input.health?.signals ?? null;
  const maxTasksPerDay = adjustedMaxTasksPerDay(
    clampMaxTasksPerDay(input.profile.maxTasksPerDay),
    healthSignals?.capacityEstimate,
  );
  const workDates = week.dates.filter((date) => !input.profile.restDays.includes(getDayName(date)));
  const activeDates = workDates.length > 0 ? workDates : week.dates.slice(0, 5);
  const openTasks = input.tasks.filter((task) => task.status === "pending");
  const activeHabits = input.habits.filter((habit) => habit.active);
  const burnoutRiskScore = calculateBurnoutRisk({
    latestReview: input.latestReview,
    agentState: input.agentState,
    openTasksCount: openTasks.length,
    missedHabitsCount: input.latestReview?.missedHabitsCount ?? 0,
    mode: input.mode,
    health: input.health,
  });
  const recoverySuggested =
    input.mode === "recovery" ||
    burnoutRiskScore >= 65 ||
    healthSignals?.recoveryRecommended === true ||
    healthSignals?.capacityEstimate === "low";
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

  if (healthSignals && healthSignals.sleepScore < 60) {
    warnings.push("Sleep is below target, so the plan protects lighter work and earlier recovery.");
  }

  if (healthSignals && healthSignals.fatigueScore > 65) {
    warnings.push("Fatigue is elevated, so intense work and training are capped this week.");
  }

  if (recoverySuggested) {
    warnings.push("Recovery mode active: reduced scope, extra buffers, and fewer priorities.");
  }

  if (selectedGoals.length === 0) {
    warnings.push(
      "No active goals found, so the plan leans on starter tasks and stabilizing habits.",
    );
  }

  const items: GeneratedPlanItemDraft[] = [];
  const occupiedByDate = new Map<string, Array<{ start: string; end: string }>>();
  const energyPattern = input.profile.energyPattern;
  const primaryDate = activeDates[0] ?? week.startDate;

  priorityTitles.forEach((title, index) => {
    const reserved = reserveTimedSlot(
      occupiedByDate,
      primaryDate,
      timeForPriority(index, energyPattern),
      timeForPriority(index + 1, energyPattern),
    );
    if (!reserved) {
      return;
    }

    items.push({
      itemType: "priority",
      title,
      date: primaryDate,
      startTime: reserved.start,
      endTime: reserved.end,
      priority: "high",
      effort: "medium",
      notes: "Weekly priority",
      locked: index === 0,
    });
  });

  const workoutDrafts = buildWorkoutCandidates({
    weekDates: activeDates,
    health: input.health,
    recoverySuggested,
  });

  for (const workout of workoutDrafts) {
    const [startTime, endTime] = workoutTimeRange(
      energyPattern,
      workout.date,
      workout.durationMinutes,
      workout.intensity,
    );
    items.push({
      itemType: "workout",
      title: workout.title,
      date: workout.date,
      startTime,
      endTime,
      priority: workout.intensity === "high" ? "medium" : "low",
      effort:
        workout.intensity === "high" ? "high" : workout.intensity === "medium" ? "medium" : "low",
      notes: workout.notes,
    });
  }

  const taskCapacityPerDay = Math.max(
    1,
    Math.min(
      recoverySuggested ? 2 : healthSignals?.capacityEstimate === "high" ? 3 : 2,
      maxTasksPerDay - (workoutDrafts.length > 0 ? 2 : 1),
    ),
  );
  const taskCapacity = activeDates.length * taskCapacityPerDay;
  const selectedTasks: TaskCandidate[] = [...openTasks]
    .sort(sortByPriorityThenDate)
    .slice(0, taskCapacity)
    .map((task) => ({
      id: task._id,
      title: task.title,
      dueDate: task.dueDate,
      priority: task.priority,
      sharedGoalId: task.sharedGoalId,
    }));

  const remainingTaskCapacity = Math.max(0, taskCapacity - selectedTasks.length);
  const desiredGeneratedTaskCount = Math.max(
    0,
    Math.min(Math.max(selectedGoals.length * 2, 4) - selectedTasks.length, remainingTaskCapacity),
  );

  if (desiredGeneratedTaskCount > 0) {
    const generatedTasks = createGoalTasks({
      goals: selectedGoals,
      weekEnd: week.endDate,
      desiredCount: desiredGeneratedTaskCount,
    });

    for (const task of generatedTasks.slice(0, remainingTaskCapacity)) {
      selectedTasks.push({
        title: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
        sharedGoalId: task.sharedGoalId,
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

  const selectedHabits = activeHabits;
  const habitsToSchedule: HabitCandidate[] =
    selectedHabits.length > 0
      ? selectedHabits.map((habit) => ({
          id: habit._id,
          name: habit.name,
          cadence: habit.cadence,
          targetValue: habit.targetValue,
          sharedGoalId: habit.sharedGoalId,
          scheduleDays: habit.scheduleDays,
        }))
      : createStarterHabits(selectedGoals)
          .slice(0, MAX_NEW_HABITS)
          .map((habit) => ({
            name: habit.name,
            cadence: habit.cadence,
            targetValue: habit.targetValue,
            sharedGoalId: habit.sharedGoalId,
            scheduleDays: habit.scheduleDays,
            draftHabit: habit,
          }));

  for (const habit of habitsToSchedule) {
    for (const date of habitDates(habit.cadence, activeDates, habit.scheduleDays)) {
      const [startTime, endTime] = habitTimeRange(energyPattern, date);
      const reserved = reserveTimedSlot(occupiedByDate, date, startTime, endTime);
      if (!reserved) {
        continue;
      }

      items.push({
        itemType: "habit",
        title: habit.name,
        date,
        startTime: reserved.start,
        endTime: reserved.end,
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
    const reserved = reserveTimedSlot(occupiedByDate, date, startTime, endTime);
    if (!reserved) {
      continue;
    }

    items.push({
      itemType: "buffer",
      title: recoverySuggested ? "Lighter buffer block" : "Buffer block",
      date,
      startTime: reserved.start,
      endTime: reserved.end,
      priority: "low",
      effort: "low",
      notes: "Reserved for spillover, admin, or recovery.",
    });
  }

  const reviewSlot = reserveTimedSlot(occupiedByDate, week.endDate, "18:00", "18:30");
  if (reviewSlot) {
    items.push({
      itemType: "review",
      title: "Weekly review",
      date: week.endDate,
      startTime: reviewSlot.start,
      endTime: reviewSlot.end,
      priority: "medium",
      effort: "low",
      notes: "Capture wins, blockers, and stress signals.",
      locked: true,
    });
  }

  const titlePrefix = recoverySuggested ? "Recovery" : "Planner";
  const summary = recoverySuggested
    ? "A lighter week focused on stabilization, smaller outputs, protected recovery, and gentler movement."
    : `A grounded week built around ${Math.max(1, priorityTitles.length)} priorities, matched to current energy capacity, with protected buffer time and workout spacing.`;

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
  effectiveDailyCap = MAX_MEANINGFUL_TASKS_PER_DAY,
): ReviewSummary {
  const actionableItems = items.filter(
    (item) =>
      item.itemType === "task" ||
      item.itemType === "habit" ||
      item.itemType === "priority" ||
      item.itemType === "workout",
  );
  const doneItems = actionableItems.filter((item) => item.status === "done");
  const missedHabitsCount = actionableItems.filter(
    (item) => item.itemType === "habit" && item.status !== "done",
  ).length;
  const completionRate =
    actionableItems.length === 0
      ? 100
      : Math.round((doneItems.length / actionableItems.length) * 100);
  const wins = doneItems.slice(0, 5).map((item) => item.title);
  const misses = actionableItems
    .filter((item) => item.status !== "done")
    .slice(0, 5)
    .map((item) => item.title);
  const blockers =
    misses.length > 0
      ? [
          completionRate < 60
            ? "Execution drift across the week."
            : "Some planned work rolled over.",
          ...(stressRating && stressRating >= 4 ? ["Stress stayed elevated."] : []),
        ]
      : stressRating && stressRating >= 4
        ? ["Stress stayed elevated despite completion."]
        : [];
  const overloadIndicators = [
    ...(completionRate < 60 ? ["Low completion rate"] : []),
    ...(countMeaningfulTasksPerDate(items) > effectiveDailyCap
      ? ["Exceeded daily task guardrail"]
      : []),
    ...(stressRating && stressRating >= 4 ? ["High stress rating"] : []),
  ];
  const improvementSuggestions = [
    ...(completionRate < 60 ? ["Reduce next week to 1-2 priorities and trim task volume."] : []),
    ...(stressRating && stressRating >= 4
      ? ["Add more recovery blocks and protect one lighter day."]
      : []),
    ...(completionRate >= 60 && (satisfactionRating ?? 0) >= 4
      ? ["Keep the same weekly structure and repeat what worked."]
      : []),
  ];

  return {
    completionRate,
    wins,
    blockers,
    misses,
    missedHabitsCount,
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
    input.preferredDate && input.dates.includes(input.preferredDate)
      ? input.preferredDate
      : undefined;

  if (preferredDate && input.counts[preferredDate] < input.maxPerDay) {
    return preferredDate;
  }

  return (
    input.dates.find((date) => input.counts[date] < input.maxPerDay) ??
    input.dates[input.dates.length - 1]
  );
}

function createGoalTasks(input: {
  goals: GoalLike[];
  weekEnd: string;
  desiredCount: number;
}): GeneratedTaskDraft[] {
  if (input.goals.length === 0) {
    return [
      {
        title: "Run a life audit and capture top constraints",
        priority: "medium" as const,
        dueDate: input.weekEnd,
        sharedGoalId: undefined,
      },
      {
        title: "Choose one priority worth protecting this week",
        priority: "high" as const,
        dueDate: input.weekEnd,
        sharedGoalId: undefined,
      },
      {
        title: "Clear one admin task that reduces background stress",
        priority: "medium" as const,
        dueDate: input.weekEnd,
        sharedGoalId: undefined,
      },
    ].slice(0, Math.max(1, input.desiredCount));
  }

  const drafts: GeneratedTaskDraft[] = [];
  for (const goal of input.goals) {
    drafts.push({
      title: `Define the next concrete step for ${goal.title}`,
      priority: goal.priority,
      sharedGoalId: goal._id,
      dueDate: input.weekEnd,
    });
    drafts.push({
      title: `Ship one visible progress update for ${goal.title}`,
      priority: goal.priority,
      sharedGoalId: goal._id,
      dueDate: input.weekEnd,
    });
  }

  return drafts.slice(0, input.desiredCount);
}

function createStarterHabits(goals: GoalLike[]) {
  return [
    {
      name: "Five-minute daily reset",
      cadence: "daily" as const,
      targetValue: 5,
      sharedGoalId: goals[0]?._id,
      scheduleDays: undefined,
    },
    {
      name: "Three walks this week",
      cadence: "custom" as const,
      targetValue: 3,
      sharedGoalId: undefined,
      scheduleDays: ["monday", "wednesday", "friday"],
    },
  ];
}

function buildWorkoutCandidates(input: {
  weekDates: string[];
  health?: PlannerHealthContext | null;
  recoverySuggested: boolean;
}): WorkoutCandidate[] {
  if (!input.health || input.weekDates.length === 0) {
    return [];
  }

  const targetCount = input.recoverySuggested
    ? 2
    : Math.min(
        3,
        Math.max(
          1,
          input.health.activeHabits.reduce(
            (max, habit) => {
              if (habit.cadence === "daily" || habit.cadence === "weekdays")
                return Math.max(max, 3);
              if (habit.cadence === "weekly") return Math.max(max, 1);
              if (habit.cadence === "custom") return Math.max(max, Math.min(3, habit.targetValue));
              return max;
            },
            input.health.activeGoals.length > 0 ? 2 : 0,
          ),
        ),
      );

  if (targetCount === 0) {
    return [];
  }

  const preferredType =
    input.health.recentWorkouts[0]?.workoutType ??
    workoutTypeFromHealthGoal(input.health.activeGoals[0]?.goalType) ??
    "walking";
  const preferredIntensity = input.recoverySuggested
    ? "low"
    : input.health.signals.capacityEstimate === "high"
      ? "medium"
      : "low";
  const workoutDates = evenlySpreadDates(
    input.weekDates,
    targetCount,
    preferredIntensity === "medium",
  );

  return workoutDates.map((date, index) => {
    const workoutType =
      index === workoutDates.length - 1 && preferredIntensity === "low"
        ? "stretching"
        : preferredType;
    const durationMinutes =
      workoutType === "walking" || workoutType === "stretching"
        ? input.recoverySuggested
          ? 20
          : 30
        : input.recoverySuggested
          ? 30
          : 45;
    return {
      title: workoutTitle(workoutType, preferredIntensity),
      workoutType,
      date,
      intensity: workoutType === "stretching" ? "low" : preferredIntensity,
      durationMinutes,
      notes: input.recoverySuggested
        ? "Planner inserted light movement to support recovery."
        : "Planner scheduled this workout in a safer energy window.",
    };
  });
}

function habitDates(cadence: PlanningCadence, dates: string[], scheduleDays?: string[]) {
  if (cadence === "daily") return dates;
  if (cadence === "weekdays")
    return dates.filter((date) => !["saturday", "sunday"].includes(getDayName(date)));
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

function workoutTimeRange(
  energyPattern: EnergyPattern,
  date: string,
  durationMinutes: number,
  intensity: Doc<"workouts">["intensity"],
): [string, string] {
  const startTime =
    intensity === "high"
      ? energyPattern === "morning"
        ? "07:00"
        : energyPattern === "midday"
          ? "12:00"
          : "18:00"
      : habitTimeRange(energyPattern, date)[0];
  const totalMinutes = timeToMinutes(startTime) + Math.max(15, Math.min(90, durationMinutes));
  const endHour = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const endMinutes = (totalMinutes % 60).toString().padStart(2, "0");
  return [startTime, `${endHour}:${endMinutes}`];
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
    if (item.itemType !== "task" && item.itemType !== "workout") continue;
    counts.set(item.date, (counts.get(item.date) ?? 0) + 1);
  }

  return Math.max(0, ...counts.values());
}

function reserveTimedSlot(
  occupiedByDate: Map<string, Array<{ start: string; end: string }>>,
  date: string,
  start: string,
  end: string,
) {
  let startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  const duration = endMinutes - startMinutes;
  if (duration <= 0) {
    return null;
  }

  const occupied = occupiedByDate.get(date) ?? [];
  while (startMinutes + duration <= 24 * 60) {
    const nextStart = minutesToTime(startMinutes);
    const nextEnd = minutesToTime(startMinutes + duration);
    const collides = occupied.some((slot) => !(nextEnd <= slot.start || nextStart >= slot.end));

    if (!collides) {
      occupied.push({ start: nextStart, end: nextEnd });
      occupied.sort((left, right) => left.start.localeCompare(right.start));
      occupiedByDate.set(date, occupied);
      return { start: nextStart, end: nextEnd };
    }

    startMinutes += 15;
  }

  return null;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map((value) => Number.parseInt(value, 10));
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function adjustedMaxTasksPerDay(base: number, capacity?: "low" | "medium" | "high") {
  if (capacity === "low") return Math.min(base, 2);
  if (capacity === "high") return Math.min(MAX_MEANINGFUL_TASKS_PER_DAY, base + 1);
  return base;
}

function evenlySpreadDates(dates: string[], count: number, allowThree: boolean) {
  const cappedCount = Math.min(Math.max(count, 0), dates.length);
  if (cappedCount <= 0) return [];
  if (cappedCount === 1) return [dates[0]];

  const targetCount = allowThree ? cappedCount : Math.min(cappedCount, 3);
  const positions = Array.from({ length: targetCount }, (_, index) =>
    Math.round((index * (dates.length - 1)) / (targetCount - 1)),
  );
  const uniqueIndices = Array.from(new Set(positions));

  return uniqueIndices.map((index) => dates[index]);
}

function workoutTypeFromHealthGoal(goalType?: Doc<"healthGoals">["goalType"]) {
  if (goalType === "sleep" || goalType === "recovery") return "stretching";
  if (goalType === "distance") return "running";
  return "strength";
}

function workoutTitle(
  workoutType: Doc<"workouts">["workoutType"],
  intensity: Doc<"workouts">["intensity"],
) {
  const noun =
    workoutType === "strength"
      ? "Strength session"
      : workoutType === "running"
        ? "Run"
        : workoutType === "walking"
          ? "Walk"
          : workoutType === "cycling"
            ? "Ride"
            : workoutType === "yoga"
              ? "Yoga flow"
              : workoutType === "stretching"
                ? "Mobility reset"
                : workoutType === "sports"
                  ? "Sports block"
                  : workoutType === "recovery"
                    ? "Recovery session"
                    : "Workout";
  return intensity === "high" ? `Workout: ${noun}` : noun;
}

function priorityScore(priority: PlanningPriority) {
  return PRIORITY_SCORES[priority];
}

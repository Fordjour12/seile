import type { Doc } from "../_generated/dataModel";

type HealthSignalLevel = Doc<"energyLogs">["energyLevel"];
type DailyEnergyZone = "morning" | "afternoon" | "lateAfternoon" | "evening";
type WeeklyEnergyDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const DAILY_ZONES: Array<{ key: DailyEnergyZone; label: string }> = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "lateAfternoon", label: "Late afternoon" },
  { key: "evening", label: "Evening" },
];

const WEEK_DAYS: WeeklyEnergyDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export type DerivedEnergySignals = {
  currentEnergyLevel: HealthSignalLevel;
  sleepScore: number;
  recoveryScore: number;
  fatigueScore: number;
  workoutLoad: number;
  stressScore: number;
  capacityScore: number;
  capacityEstimate: "low" | "medium" | "high";
  recoveryRecommended: boolean;
  suggestedPlanningMode: "recovery" | "discovery" | "directed";
  workoutMinutesThisWeek: number;
  workoutsThisWeek: number;
  burnoutSignals: string[];
  dailyEnergyModel: Array<{
    zone: DailyEnergyZone;
    label: string;
    energyLevel: HealthSignalLevel;
    score: number;
  }>;
  weeklyEnergyModel: Array<{
    day: WeeklyEnergyDay;
    energyLevel: HealthSignalLevel;
    score: number;
  }>;
};

export type PlannerHealthContext = {
  activeGoals: Doc<"healthGoals">[];
  activeHabits: Doc<"healthHabits">[];
  recentWorkouts: Doc<"workouts">[];
  latestMetric: Doc<"healthMetrics"> | null;
  latestEnergyLog: Doc<"energyLogs"> | null;
  signals: DerivedEnergySignals;
};

export function derivePlannerHealthContext(input: {
  goals: Doc<"healthGoals">[];
  habits: Doc<"healthHabits">[];
  workouts: Doc<"workouts">[];
  metrics: Doc<"healthMetrics">[];
  energyLogs: Doc<"energyLogs">[];
  plannerEnergyPattern?: "morning" | "midday" | "evening" | "mixed";
}): PlannerHealthContext {
  const sortedGoals = [...input.goals].sort((left, right) => {
    const leftDeadline = left.deadline ?? "9999-12-31";
    const rightDeadline = right.deadline ?? "9999-12-31";
    if (leftDeadline !== rightDeadline) {
      return leftDeadline.localeCompare(rightDeadline);
    }
    return right.createdAt - left.createdAt;
  });
  const sortedHabits = [...input.habits].sort((left, right) => right.updatedAt - left.updatedAt);
  const sortedWorkouts = [...input.workouts].sort((left, right) => right.date.localeCompare(left.date));
  const sortedMetrics = [...input.metrics].sort((left, right) => right.date.localeCompare(left.date));
  const sortedEnergyLogs = [...input.energyLogs].sort((left, right) => right.timestamp - left.timestamp);

  return {
    activeGoals: sortedGoals.filter((goal) => goal.status === "active"),
    activeHabits: sortedHabits.filter((habit) => habit.active),
    recentWorkouts: sortedWorkouts.slice(0, 8),
    latestMetric: sortedMetrics[0] ?? null,
    latestEnergyLog: sortedEnergyLogs[0] ?? null,
    signals: deriveEnergySignals({
      workouts: sortedWorkouts,
      metrics: sortedMetrics,
      energyLogs: sortedEnergyLogs,
      plannerEnergyPattern: input.plannerEnergyPattern,
    }),
  };
}

export function deriveEnergySignals(input: {
  workouts: Doc<"workouts">[];
  metrics: Doc<"healthMetrics">[];
  energyLogs: Doc<"energyLogs">[];
  plannerEnergyPattern?: "morning" | "midday" | "evening" | "mixed";
}): DerivedEnergySignals {
  const today = isoDateFromTimestamp(Date.now());
  const weekStart = addDays(today, -6);
  const recentWorkouts = input.workouts.filter((workout) => workout.date >= weekStart);
  const recentMetrics = input.metrics.filter((metric) => metric.date >= weekStart);
  const recentLogs = input.energyLogs.filter((log) => log.timestamp >= Date.now() - 1000 * 60 * 60 * 24 * 21);

  const latestMetric = input.metrics[0] ?? null;
  const latestEnergyLog = input.energyLogs[0] ?? null;
  const fallbackEnergyLevel = latestMetric?.energyLevel ?? preferredPatternFallback(input.plannerEnergyPattern);
  const currentEnergyLevel = latestEnergyLog?.energyLevel ?? fallbackEnergyLevel;

  const sleepHoursValues = recentMetrics
    .map((metric) => metric.sleepHours)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const baselineSleepHours =
    latestMetric?.sleepHours ??
    average(sleepHoursValues) ??
    (currentEnergyLevel === "high" ? 7.5 : currentEnergyLevel === "medium" ? 7 : 6.5);

  const sleepScore = clamp(Math.round((baselineSleepHours / 8) * 100), 20, 100);
  const workoutLoadRaw = recentWorkouts.reduce(
    (total, workout) => total + workout.durationMinutes * intensityMultiplier(workout.intensity),
    0,
  );
  const workoutLoad = clamp(Math.round(workoutLoadRaw), 0, 100);

  const stressLevel = latestEnergyLog?.stressLevel ?? "medium";
  const fatigueLevel = latestEnergyLog?.fatigueLevel ?? "medium";
  const stressScore = levelToRiskScore(stressLevel);
  const fatigueSignalScore = levelToRiskScore(fatigueLevel);
  const fatigueScore = clamp(
    Math.round(fatigueSignalScore * 0.45 + workoutLoad * 0.3 + (100 - sleepScore) * 0.25),
    0,
    100,
  );

  const recoveryScore = clamp(
    Math.round(sleepScore * 0.45 + (100 - fatigueScore) * 0.35 + (100 - stressScore) * 0.2),
    0,
    100,
  );

  const capacityScore = clamp(
    Math.round(levelToEnergyScore(currentEnergyLevel) * 0.4 + recoveryScore * 0.4 + (100 - fatigueScore) * 0.2),
    0,
    100,
  );

  const capacityEstimate = scoreToCapacity(capacityScore);
  const recoveryRecommended = recoveryScore < 55 || fatigueScore > 65 || sleepScore < 60;
  const burnoutSignals = [
    ...(sleepScore < 60 ? ["Sleep debt is reducing daily capacity."] : []),
    ...(fatigueScore > 65 ? ["Fatigue is elevated relative to recent recovery."] : []),
    ...(stressScore > 65 ? ["Stress remains high in the latest check-in."] : []),
    ...(workoutLoad > 75 ? ["Recent training load is heavy enough to justify extra recovery."] : []),
  ].slice(0, 4);

  return {
    currentEnergyLevel,
    sleepScore,
    recoveryScore,
    fatigueScore,
    workoutLoad,
    stressScore,
    capacityScore,
    capacityEstimate,
    recoveryRecommended,
    suggestedPlanningMode: recoveryRecommended ? "recovery" : capacityEstimate === "high" ? "directed" : "discovery",
    workoutMinutesThisWeek: recentWorkouts.reduce((total, workout) => total + workout.durationMinutes, 0),
    workoutsThisWeek: recentWorkouts.length,
    burnoutSignals,
    dailyEnergyModel: buildDailyEnergyModel(recentLogs, currentEnergyLevel, input.plannerEnergyPattern),
    weeklyEnergyModel: buildWeeklyEnergyModel(recentLogs, recentMetrics, currentEnergyLevel),
  };
}

export function inferWorkoutTypeFromTitle(title: string): Doc<"workouts">["workoutType"] {
  const value = title.toLowerCase();
  if (value.includes("strength") || value.includes("lift")) return "strength";
  if (value.includes("run")) return "running";
  if (value.includes("walk")) return "walking";
  if (value.includes("cycle") || value.includes("bike")) return "cycling";
  if (value.includes("yoga")) return "yoga";
  if (value.includes("stretch") || value.includes("mobility")) return "stretching";
  if (value.includes("sport")) return "sports";
  if (value.includes("recovery")) return "recovery";
  return "other";
}

export function inferWorkoutIntensityFromTitle(title: string): Doc<"workouts">["intensity"] {
  const value = title.toLowerCase();
  if (value.includes("recovery") || value.includes("walk") || value.includes("stretch")) return "low";
  if (value.includes("tempo") || value.includes("interval") || value.includes("strength")) return "high";
  return "medium";
}

function buildDailyEnergyModel(
  logs: Doc<"energyLogs">[],
  fallbackLevel: HealthSignalLevel,
  plannerEnergyPattern?: "morning" | "midday" | "evening" | "mixed",
) {
  const grouped = new Map<DailyEnergyZone, number[]>();

  for (const zone of DAILY_ZONES) {
    grouped.set(zone.key, []);
  }

  for (const log of logs) {
    grouped.get(zoneFromTimestamp(log.timestamp))?.push(levelToOrdinal(log.energyLevel));
  }

  return DAILY_ZONES.map((zone) => {
    const values = grouped.get(zone.key) ?? [];
    const score =
      values.length > 0
        ? Math.round((average(values) ?? 2) * 33.33)
        : fallbackZoneScore(zone.key, fallbackLevel, plannerEnergyPattern);

    return {
      zone: zone.key,
      label: zone.label,
      energyLevel: ordinalToLevel(score / 33.33),
      score: clamp(score, 25, 100),
    };
  });
}

function buildWeeklyEnergyModel(
  logs: Doc<"energyLogs">[],
  metrics: Doc<"healthMetrics">[],
  fallbackLevel: HealthSignalLevel,
) {
  const grouped = new Map<WeeklyEnergyDay, number[]>();

  for (const day of WEEK_DAYS) {
    grouped.set(day, []);
  }

  for (const log of logs) {
    const day = weekdayFromTimestamp(log.timestamp);
    grouped.get(day)?.push(levelToOrdinal(log.energyLevel));
  }

  for (const metric of metrics) {
    if (!metric.energyLevel) continue;
    const day = weekdayFromDateKey(metric.date);
    grouped.get(day)?.push(levelToOrdinal(metric.energyLevel));
  }

  return WEEK_DAYS.map((day) => {
    const values = grouped.get(day) ?? [];
    const score = values.length > 0 ? Math.round((average(values) ?? 2) * 33.33) : levelToEnergyScore(fallbackLevel);
    return {
      day,
      energyLevel: ordinalToLevel(score / 33.33),
      score: clamp(score, 25, 100),
    };
  });
}

function preferredPatternFallback(pattern?: "morning" | "midday" | "evening" | "mixed"): HealthSignalLevel {
  if (pattern === "morning" || pattern === "midday") return "high";
  if (pattern === "evening") return "medium";
  return "medium";
}

function fallbackZoneScore(
  zone: DailyEnergyZone,
  fallbackLevel: HealthSignalLevel,
  pattern?: "morning" | "midday" | "evening" | "mixed",
) {
  const base = levelToEnergyScore(fallbackLevel);
  if (pattern === "morning") {
    if (zone === "morning") return base;
    if (zone === "afternoon") return base - 10;
    return base - 18;
  }
  if (pattern === "midday") {
    if (zone === "afternoon") return base;
    return base - 8;
  }
  if (pattern === "evening") {
    if (zone === "evening") return base;
    return base - 10;
  }
  if (zone === "lateAfternoon") return base - 8;
  return base;
}

function zoneFromTimestamp(timestamp: number): DailyEnergyZone {
  const hour = new Date(timestamp).getUTCHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 16) return "afternoon";
  if (hour >= 16 && hour < 19) return "lateAfternoon";
  return "evening";
}

function weekdayFromTimestamp(timestamp: number): WeeklyEnergyDay {
  return WEEK_DAYS[(new Date(timestamp).getUTCDay() + 6) % 7] ?? "monday";
}

function weekdayFromDateKey(dateKey: string): WeeklyEnergyDay {
  return weekdayFromTimestamp(new Date(`${dateKey}T12:00:00.000Z`).getTime());
}

function scoreToCapacity(score: number): "low" | "medium" | "high" {
  if (score < 45) return "low";
  if (score < 70) return "medium";
  return "high";
}

function intensityMultiplier(intensity: Doc<"workouts">["intensity"]) {
  if (intensity === "high") return 1.8;
  if (intensity === "medium") return 1.25;
  return 0.8;
}

function levelToOrdinal(level: HealthSignalLevel) {
  if (level === "high") return 3;
  if (level === "medium") return 2;
  return 1;
}

function ordinalToLevel(value: number): HealthSignalLevel {
  if (value >= 2.5) return "high";
  if (value >= 1.75) return "medium";
  return "low";
}

function levelToEnergyScore(level: HealthSignalLevel) {
  if (level === "high") return 85;
  if (level === "medium") return 60;
  return 35;
}

function levelToRiskScore(level: HealthSignalLevel) {
  if (level === "high") return 80;
  if (level === "medium") return 55;
  return 25;
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function isoDateFromTimestamp(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

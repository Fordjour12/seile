import { useMutation, useQuery } from "convex/react";

import { api, asId } from "@/lib/backend-api";

import type {
  CreatePrayerPayload,
  CreateSpiritualGoalPayload,
  CreateSpiritualPracticePayload,
  CreateSpiritualReadingPayload,
  CreateSpiritualReflectionPayload,
  PrayerEntry,
  PrayerStatus,
  SpiritualDashboard,
  SpiritualGoal,
  SpiritualGoalStatus,
  SpiritualPractice,
  SpiritualReading,
  SpiritualReflection,
} from "./types";

const spiritualApi = api as unknown as Record<string, Record<string, any>>;

function toIsoString(value: number) {
  return new Date(value).toISOString();
}

function mapGoal(row: any): SpiritualGoal {
  return {
    id: row._id,
    title: row.title,
    description: row.description,
    goalType: row.goalType,
    targetValue: row.targetValue,
    unit: row.unit,
    deadline: row.deadline,
    progress: row.progress,
    status: row.status,
    plannerGoalId: row.plannerGoalId ?? null,
  };
}

function mapPractice(row: any): SpiritualPractice {
  return {
    id: row._id,
    title: row.title,
    description: row.description,
    practiceType: row.practiceType,
    cadence: row.cadence,
    targetValue: row.targetValue,
    unit: row.unit,
    timeOfDay: row.timeOfDay,
    scheduleDays: row.scheduleDays,
    active: row.active,
    plannerHabitId: row.plannerHabitId ?? null,
  };
}

function mapPrayer(row: any): PrayerEntry {
  return {
    id: row._id,
    title: row.title,
    description: row.description,
    category: row.category,
    status: row.status,
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
  };
}

function mapReading(row: any): SpiritualReading {
  return {
    id: row._id,
    title: row.title,
    source: row.source,
    passage: row.passage,
    date: row.date,
    notes: row.notes,
    createdAt: toIsoString(row.createdAt),
  };
}

function mapReflection(row: any): SpiritualReflection {
  return {
    id: row._id,
    date: row.date,
    reflectionType: row.reflectionType,
    content: row.content,
    mood: row.mood,
    insights: row.insights,
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
  };
}

export function useSpiritualDashboard(): SpiritualDashboard | undefined {
  const row = useQuery(spiritualApi["spiritual/queries"].getSpiritualDashboard, {});
  if (!row) return undefined;

  return {
    summary: row.summary,
    goals: row.goals.map(mapGoal),
    practices: row.practices.map(mapPractice),
    prayers: row.prayers.map(mapPrayer),
    readings: row.readings.map(mapReading),
    reflections: row.reflections.map(mapReflection),
    planner: row.planner,
  };
}

export function useSpiritualGoals(status?: SpiritualGoalStatus): SpiritualGoal[] | undefined {
  const rows = useQuery(spiritualApi["spiritual/queries"].listSpiritualGoals, { status });
  return rows?.map(mapGoal);
}

export function useSpiritualPractices(active?: boolean): SpiritualPractice[] | undefined {
  const rows = useQuery(spiritualApi["spiritual/queries"].listSpiritualPractices, { active });
  return rows?.map(mapPractice);
}

export function usePrayerEntries(status?: PrayerStatus): PrayerEntry[] | undefined {
  const rows = useQuery(spiritualApi["spiritual/queries"].listPrayers, { status });
  return rows?.map(mapPrayer);
}

export function usePrayers(status?: PrayerStatus): PrayerEntry[] | undefined {
  return usePrayerEntries(status);
}

export function useSpiritualReadings(limit?: number): SpiritualReading[] | undefined {
  const rows = useQuery(spiritualApi["spiritual/queries"].listSpiritualReadings, { limit });
  return rows?.map(mapReading);
}

export function useSpiritualReflections(limit?: number): SpiritualReflection[] | undefined {
  const rows = useQuery(spiritualApi["spiritual/queries"].listSpiritualReflections, { limit });
  return rows?.map(mapReflection);
}

export function useCreateSpiritualGoal() {
  const createGoal = useMutation(spiritualApi["spiritual/mutations"].createSpiritualGoal);
  return (payload: CreateSpiritualGoalPayload) => createGoal(payload);
}

export function useUpdateSpiritualGoalProgress() {
  const updateGoal = useMutation(spiritualApi["spiritual/mutations"].updateSpiritualGoalProgress);
  return (id: string, progress: number, status?: SpiritualGoalStatus) =>
    updateGoal({ id: asId<"spiritualGoals">(id), progress, status });
}

export function useCreateSpiritualPractice() {
  const createPractice = useMutation(spiritualApi["spiritual/mutations"].createSpiritualPractice);
  return (payload: CreateSpiritualPracticePayload) => createPractice(payload);
}

export function useToggleSpiritualPracticeActive() {
  const togglePractice = useMutation(spiritualApi["spiritual/mutations"].toggleSpiritualPracticeActive);
  return (id: string, active: boolean) => togglePractice({ id: asId<"spiritualPractices">(id), active });
}

export function useCreatePrayer() {
  const createPrayer = useMutation(spiritualApi["spiritual/mutations"].createPrayer);
  return (payload: CreatePrayerPayload) => createPrayer(payload);
}

export function useUpdatePrayerStatus() {
  const updatePrayer = useMutation(spiritualApi["spiritual/mutations"].updatePrayerStatus);
  return (id: string, status: PrayerStatus) => updatePrayer({ id: asId<"prayers">(id), status });
}

export function useCreateSpiritualReading() {
  const createReading = useMutation(spiritualApi["spiritual/mutations"].createSpiritualReading);
  return (payload: CreateSpiritualReadingPayload) => createReading(payload);
}

export function useCreateSpiritualReflection() {
  const createReflection = useMutation(spiritualApi["spiritual/mutations"].createSpiritualReflection);
  return (payload: CreateSpiritualReflectionPayload) => createReflection(payload);
}

export function formatGoalTarget(goal: SpiritualGoal) {
  if (goal.targetValue && goal.unit) {
    return `${goal.progress}% of ${goal.targetValue} ${goal.unit}`;
  }
  if (goal.targetValue) {
    return `${goal.progress}% of ${goal.targetValue}`;
  }
  return `${goal.progress}% complete`;
}

export function formatPracticeCadence(practice: SpiritualPractice) {
  if (practice.cadence !== "custom") {
    return practice.cadence;
  }
  return practice.scheduleDays?.length ? `custom · ${practice.scheduleDays.join(", ")}` : "custom cadence";
}

export function formatPrayerStatus(status: PrayerStatus) {
  if (status === "answered") return "Answered";
  if (status === "archived") return "Archived";
  return "Active";
}

export function formatSpiritualDate(date: string) {
  const parsed = Date.parse(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed)) {
    return date;
  }
  return new Date(parsed).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatGoalTarget(goal: Pick<SpiritualGoal, "targetValue" | "unit" | "progress">) {
  if (!goal.targetValue) {
    return `${goal.progress}% complete`;
  }

  return `${goal.progress}% of ${goal.targetValue}${goal.unit ? ` ${goal.unit}` : ""}`;
}

export function formatPracticeCadence(
  practice: Pick<SpiritualPractice, "cadence" | "scheduleDays">,
) {
  if (practice.cadence !== "custom") {
    return capitalizeLabel(practice.cadence);
  }

  return practice.scheduleDays?.length
    ? practice.scheduleDays.map(capitalizeLabel).join(", ")
    : "Custom";
}

export function formatPrayerStatus(status: PrayerStatus) {
  return capitalizeLabel(status);
}

export function formatSpiritualDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function todayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function capitalizeLabel(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

export type SpiritualGoalStatus = "active" | "completed" | "archived";
export type SpiritualPracticeCadence = "daily" | "weekdays" | "weekly" | "custom";
export type SpiritualCadence = SpiritualPracticeCadence;
export type PrayerStatus = "active" | "answered" | "archived";

export interface SpiritualGoal {
  id: string;
  title: string;
  description?: string;
  goalType: string;
  targetValue?: number;
  unit?: string;
  deadline?: string;
  progress: number;
  status: SpiritualGoalStatus;
  plannerGoalId?: string | null;
}

export interface SpiritualPractice {
  id: string;
  title: string;
  description?: string;
  practiceType: string;
  cadence: SpiritualPracticeCadence;
  targetValue: number;
  unit: string;
  timeOfDay?: string;
  scheduleDays?: string[];
  active: boolean;
  plannerHabitId?: string | null;
}

export interface PrayerEntry {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: PrayerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SpiritualReading {
  id: string;
  title: string;
  source?: string;
  passage?: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface SpiritualReflection {
  id: string;
  date: string;
  reflectionType: string;
  content: string;
  mood?: string;
  insights?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpiritualDashboardSummary {
  activeGoals: number;
  completedGoals: number;
  activePractices: number;
  plannerLinkedPractices: number;
  activePrayers: number;
  answeredPrayers: number;
  reflectionsThisWeek: number;
  gratitudeEntriesThisWeek: number;
  readingsThisWeek: number;
}

export interface SpiritualPlannerSummary {
  spiritualGoals: number;
  spiritualHabits: number;
  latestWeekPlanId?: string | null;
  latestWeekPlanTitle?: string | null;
}

export interface SpiritualDashboard {
  summary: SpiritualDashboardSummary;
  goals: SpiritualGoal[];
  practices: SpiritualPractice[];
  prayers: PrayerEntry[];
  readings: SpiritualReading[];
  reflections: SpiritualReflection[];
  planner: SpiritualPlannerSummary;
}

export interface CreateSpiritualGoalPayload {
  title: string;
  description?: string;
  goalType: string;
  targetValue?: number;
  unit?: string;
  deadline?: string;
}

export interface CreateSpiritualPracticePayload {
  title: string;
  description?: string;
  practiceType: string;
  cadence: SpiritualPracticeCadence;
  targetValue: number;
  unit: string;
  timeOfDay?: string;
  scheduleDays?: string[];
  syncToPlanner?: boolean;
}

export interface CreatePrayerPayload {
  title: string;
  description?: string;
  category?: string;
}

export interface CreateSpiritualReadingPayload {
  title: string;
  source?: string;
  passage?: string;
  date: string;
  notes?: string;
}

export interface CreateSpiritualReflectionPayload {
  date: string;
  reflectionType: string;
  content: string;
  mood?: string;
  insights?: string;
}

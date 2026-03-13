import { z } from "zod";

export { weeklyPlanItemSchema, weeklyPlanSchema, type WeeklyPlan } from "./types";

const planningPrioritySchema = z.enum(["low", "medium", "high"]);
const planningEffortSchema = z.enum(["low", "medium", "high"]);
const planItemTypeSchema = z.enum([
  "priority",
  "task",
  "habit",
  "workout",
  "buffer",
  "review",
  "milestone",
]);
const planningCadenceSchema = z.enum(["daily", "weekdays", "weekly", "custom"]);
const burnoutStateSchema = z.enum(["stable", "watch", "recovery"]);
const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD date");
const isoTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Expected HH:MM time");

const draftTaskSchema = z.object({
  title: z.string(),
  priority: planningPrioritySchema,
  dueDate: z.string(),
});

const draftHabitSchema = z.object({
  name: z.string(),
  cadence: planningCadenceSchema,
  targetValue: z.number(),
  scheduleDays: z.array(z.string()).optional(),
});

export const planningModeSchema = z.enum([
  "directed",
  "discovery",
  "zero_input",
  "recovery",
]);

export const plannerWeeklyPlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  priorityTitles: z.array(z.string()).max(3),
  warnings: z.array(z.string()).max(6),
  burnoutRiskScore: z.number().min(0).max(100),
  recoverySuggested: z.boolean(),
  items: z.array(
    z.object({
      itemType: planItemTypeSchema,
      title: z.string(),
      date: isoDateSchema,
      startTime: isoTimeSchema.optional(),
      endTime: isoTimeSchema.optional(),
      priority: planningPrioritySchema,
      effort: planningEffortSchema,
      notes: z.string().optional(),
      draftTask: draftTaskSchema.optional(),
      draftHabit: draftHabitSchema.optional(),
    }),
  ),
});

export const weeklyReviewSchema = z.object({
  completionRate: z.number().min(0).max(100),
  wins: z.array(z.string()).max(6),
  blockers: z.array(z.string()).max(6),
  misses: z.array(z.string()).max(6),
  overloadIndicators: z.array(z.string()).max(6),
  improvementSuggestions: z.array(z.string()).max(6),
  stressRating: z.number().min(1).max(5).optional(),
  satisfactionRating: z.number().min(1).max(5).optional(),
  burnoutScore: z.number().min(0).max(100),
  burnoutState: burnoutStateSchema,
});

export const burnoutAssessmentSchema = z.object({
  burnoutScore: z.number().min(0).max(100),
  burnoutState: burnoutStateSchema,
  recoveryRecommended: z.boolean(),
  signals: z.array(z.string()).max(6),
  suggestions: z.array(z.string()).max(6),
});

export const replanningAssessmentSchema = z.object({
  shouldAdjust: z.boolean(),
  reason: z.string(),
  preserveLockedItems: z.boolean(),
  pressureLevel: z.enum(["low", "medium", "high"]),
});

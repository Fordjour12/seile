import { Agent, createThread } from "@convex-dev/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

import type { ActionCtx } from "../../_generated/server";
import { components } from "../../_generated/api";
import { env } from "@seile/env/backend";

const componentsAny = components as any;
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4o-mini";
// google/gemini-2.5-flash

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
const planningModeSchema = z.enum([
  "directed",
  "discovery",
  "zero_input",
  "recovery",
]);
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

export const weeklyPlanSchema = z.object({
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

ensurePlannerAgentConfigured();

const plannerProvider = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
  ...(env.PLANNER_AGENT_BASE_URL ? { baseURL: env.PLANNER_AGENT_BASE_URL } : {}),
  headers: {
    "HTTP-Referer": env.SITE_URL,
    "X-OpenRouter-Title": env.OPENROUTER_APP_NAME ?? "Seile Planner",
  },
});

export const plannerAgent = new Agent(componentsAny.agent, {
  name: "Planner Agent",
  languageModel: plannerProvider.chat(env.PLANNER_AGENT_MODEL ?? DEFAULT_OPENROUTER_MODEL),
  instructions: [
    "You are the AI Planner Orchestrator for a life planning application.",
    "Generate structured, realistic plans grounded in goals, tasks, habits, health signals, constraints, and execution data.",
    "Do not generate inspirational advice. Reduce overload before adding work.",
    "Hard rules: maximum 3 weekly priorities, maximum 5 meaningful tasks per day, maximum 2 new habits, include recovery days, avoid consecutive intense workouts, always include buffers, always include a review item.",
    "Prefer consistency over intensity, recovery over collapse, and sustainability over ambition.",
  ].join(" "),
});

export async function createPlannerThread(
  ctx: ActionCtx,
  input: {
    userId: string;
    title: string;
    summary: string;
  },
) {
  ensurePlannerAgentConfigured();
  return await createThread(ctx, componentsAny.agent, input);
}

export function ensurePlannerAgentConfigured() {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error(
      "Planner agent is not configured. Set OPENROUTER_API_KEY in the backend environment.",
    );
  }
}

export function isPlannerAgentConfigured() {
  return Boolean(env.OPENROUTER_API_KEY);
}

export { plannerAgent as masterPlannerAgent, planningModeSchema };

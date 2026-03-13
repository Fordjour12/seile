"use node";

import { Agent, createThread } from "@convex-dev/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import type { ActionCtx } from "../../_generated/server";
import { components } from "../../_generated/api";
import { env } from "@seile/env/backend";

const componentsAny = components as any;
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4o-mini";
const plannerProvider = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
  ...(env.PLANNER_AGENT_BASE_URL ? { baseURL: env.PLANNER_AGENT_BASE_URL } : {}),
  headers: {
    "HTTP-Referer": env.SITE_URL,
    "X-OpenRouter-Title": env.OPENROUTER_APP_NAME ?? "Seile Planner",
  },
});

ensurePlannerAgentConfigured();

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

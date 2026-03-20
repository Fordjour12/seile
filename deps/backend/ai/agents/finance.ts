"use node";

import { Agent } from "@convex-dev/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import type { ActionCtx } from "../../_generated/server";
import { env } from "@seile/env/backend";
import { componentsAny, ensureAiConfigured, createAiThread } from "../runtime";

const DEFAULT_FINANCE_MODEL = "openai/gpt-4o-mini";

const financeProvider = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
  ...(env.FINANCE_AGENT_BASE_URL
    ? { baseURL: env.FINANCE_AGENT_BASE_URL }
    : {}),
  headers: {
    "HTTP-Referer": env.SITE_URL,
    "X-OpenRouter-Title": env.OPENROUTER_APP_NAME ?? "Seile Finance",
  },
});

export const financeCoachAgent = new Agent(componentsAny.agent, {
  name: "Finance Agent",
  languageModel: financeProvider.chat(
    env.FINANCE_AGENT_MODEL ?? DEFAULT_FINANCE_MODEL,
  ),
  instructions: [
    "You are the Finance Agent for a personal finance application.",
    "You can analyze accounts, transactions, budgets, debt, savings, recurring payments, subscriptions, and shared goals.",
    "Never claim to execute changes directly from free-form chat.",
    "If a user wants a finance change, return a proposed action with a clear preview and require explicit confirmation.",
    "Do not mention planner data or planner state.",
    "Be direct, practical, and precise with money-related reasoning.",
  ].join(" "),
});

export async function createFinanceAgentThread(
  ctx: ActionCtx,
  input: {
    userId: string;
    title: string;
    summary: string;
  },
) {
  ensureFinanceAgentConfigured();
  return await createAiThread(ctx, input);
}

export function ensureFinanceAgentConfigured() {
  ensureAiConfigured();
}

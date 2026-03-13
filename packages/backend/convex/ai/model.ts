import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { env } from "@seile/env/backend";
import type { AIDomain } from "./types";

const DEFAULT_MODEL = "openai/gpt-4o-mini";

export type ModelTier = "fast" | "reasoning" | "creative";

const provider = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": env.SITE_URL,
    "X-OpenRouter-Title": env.OPENROUTER_APP_NAME ?? "Seile AI Layer",
  },
});

export function ensureAIConfigured() {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error(
      "AI layer is not configured. Set OPENROUTER_API_KEY in the backend environment.",
    );
  }
}

export function getModel(input: { tier: ModelTier; task?: string; domain?: AIDomain }) {
  ensureAIConfigured();
  return provider.chat(resolveModelId(input));
}

export function resolveModelId(input: {
  tier: ModelTier;
  task?: string;
  domain?: AIDomain;
}) {
  if (input.domain === "planner" || input.task === "planning") {
    return env.PLANNER_AGENT_MODEL ?? DEFAULT_MODEL;
  }

  if (input.domain === "finance" || input.task === "finance") {
    return env.FINANCE_AGENT_MODEL ?? env.PLANNER_AGENT_MODEL ?? DEFAULT_MODEL;
  }

  if (input.tier === "reasoning") {
    return env.PLANNER_AGENT_MODEL ?? env.FINANCE_AGENT_MODEL ?? DEFAULT_MODEL;
  }

  if (input.tier === "creative") {
    return env.PLANNER_AGENT_MODEL ?? env.FINANCE_AGENT_MODEL ?? DEFAULT_MODEL;
  }

  return env.FINANCE_AGENT_MODEL ?? env.PLANNER_AGENT_MODEL ?? DEFAULT_MODEL;
}


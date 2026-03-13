"use node";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { env } from "@seile/env/backend";
import { ensureAiConfigured } from "./runtime";

export type ModelTier = "fast" | "reasoning" | "creative";

const DEFAULT_MODELS: Record<ModelTier, string> = {
  fast: "openai/gpt-4o-mini",
  reasoning: "openai/gpt-4o-mini",
  creative: "openai/gpt-4o-mini",
};

function createProvider() {
  ensureAiConfigured();
  return createOpenRouter({
    apiKey: env.OPENROUTER_API_KEY,
    headers: {
      "HTTP-Referer": env.SITE_URL,
      "X-OpenRouter-Title": env.OPENROUTER_APP_NAME ?? "Seile AI",
    },
  });
}

export function getModel(tier: ModelTier) {
  const provider = createProvider();
  const modelId =
    tier === "fast"
      ? env.AI_MODEL_FAST
      : tier === "reasoning"
        ? env.AI_MODEL_REASONING
        : env.AI_MODEL_CREATIVE;

  return provider.chat(modelId ?? DEFAULT_MODELS[tier]);
}

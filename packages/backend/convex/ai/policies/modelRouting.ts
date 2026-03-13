import type { AIDomain, AIIntent } from "../types";
import type { ModelTier } from "../model";

export function chooseModelTier(input: { intent: AIIntent; domains: AIDomain[] }): ModelTier {
  if (input.intent === "plan" || input.intent === "review") {
    return "reasoning";
  }

  if (input.domains.includes("space")) {
    return "creative";
  }

  return "fast";
}


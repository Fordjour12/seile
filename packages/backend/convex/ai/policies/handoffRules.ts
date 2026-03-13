import type { AIDomain, AIIntent } from "../types";

type ClassifiedRoute = {
  domains: AIDomain[];
  intent: AIIntent;
  specialist: "planner" | "finance" | "health" | "wellness" | "faith";
};

const MULTI_DOMAIN_HINTS = [
  "week",
  "schedule",
  "plan my week",
  "balance",
  "around work",
  "stay on budget",
];

export function classifyRoute(input: {
  text: string;
  preferredDomains?: AIDomain[];
  preferredIntent?: AIIntent;
}): ClassifiedRoute {
  const normalized = input.text.toLowerCase();
  const detectedDomains = new Set<AIDomain>(input.preferredDomains ?? []);

  if (
    /budget|spend|spending|expense|debt|savings|account|transaction|money|finance/.test(normalized)
  ) {
    detectedDomains.add("finance");
  }
  if (/workout|exercise|fitness|sleep|steps|health|routine/.test(normalized)) {
    detectedDomains.add("health");
  }
  if (/burnout|overwhelmed|exhausted|tired|stress|reset|mental/.test(normalized)) {
    detectedDomains.add("wellness");
  }
  if (/task|todo|deadline|focus|productivity|schedule/.test(normalized)) {
    detectedDomains.add("productivity");
  }
  if (/prayer|faith|spiritual|devotional|scripture|church/.test(normalized)) {
    detectedDomains.add("faith");
  }

  const multiDomainHint =
    MULTI_DOMAIN_HINTS.some((hint) => normalized.includes(hint)) || detectedDomains.size > 1;
  const wantsPlan =
    normalized.includes("plan") ||
    normalized.includes("draft") ||
    normalized.includes("organize") ||
    normalized.includes("replan");
  const wantsReview =
    normalized.includes("review") ||
    normalized.includes("reflect") ||
    normalized.includes("look back");
  const wantsAction =
    /\bset\b|\bcreate\b|\bupdate\b|\bchange\b|\badjust\b|\bmove\b|\badd\b/.test(normalized);

  const intent =
    input.preferredIntent ??
    (wantsReview
      ? "review"
      : wantsPlan
        ? "plan"
        : wantsAction
          ? "act"
          : normalized.includes("suggest")
            ? "suggest"
            : "chat");

  if (multiDomainHint || intent === "plan" || intent === "review") {
    if (detectedDomains.size === 0) {
      detectedDomains.add("planner");
    }
    return {
      domains: Array.from(detectedDomains.size ? detectedDomains : new Set<AIDomain>(["planner"])),
      intent,
      specialist: "planner",
    };
  }

  if (detectedDomains.has("finance")) {
    return { domains: ["finance"], intent, specialist: "finance" };
  }
  if (detectedDomains.has("health")) {
    return { domains: ["health"], intent, specialist: "health" };
  }
  if (detectedDomains.has("wellness")) {
    return { domains: ["wellness"], intent, specialist: "wellness" };
  }
  if (detectedDomains.has("faith")) {
    return { domains: ["faith"], intent, specialist: "faith" };
  }

  return { domains: ["planner"], intent: input.preferredIntent ?? "chat", specialist: "planner" };
}


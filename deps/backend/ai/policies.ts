import type { AIDomain, ApprovalMode, DomainAvailability, RouteIntent } from "./types";

const FINANCE_DOMAIN_PATTERN =
  /\b(budget|money|spend|saving|debt|account|finance|income|expense|subscription)\b/;
const HEALTH_DOMAIN_PATTERN =
  /\b(workout|exercise|gym|fitness|meal|health|energy|sleep|steps|calories|nutrition)\b/;
const WELLNESS_DOMAIN_PATTERN =
  /\b(stress|mood|anxious|burnout|mental|wellness|overwhelmed|therapy|journal|breathe)\b/;
const PRODUCTIVITY_DOMAIN_PATTERN =
  /\b(task|todo|plan|focus|week|schedule|deadline|priority|planner|productivity)\b/;
const CAREER_DOMAIN_PATTERN =
  /\b(career|job|work|promotion|learn|skill|resume|interview|salary|freelance)\b/;
const RELATIONSHIPS_DOMAIN_PATTERN =
  /\b(relationship|friend|family|partner|connection|date|social|love|boundaries)\b/;
const FAITH_DOMAIN_PATTERN =
  /\b(prayer|faith|devotion|spiritual|church|scripture|fast|worship|gratitude|bible)\b/;
const SPACE_DOMAIN_PATTERN =
  /\b(room|space|decor|design|clean|desk|home|furniture|organize|environment)\b/;

const AUTO_TOOLS = new Set([
  "shared.getWeekSnapshot",
  "shared.getAllDomainSnapshots",
  "shared.createTaskDraft",
  "shared.createHabitDraft",
  "memory.getUserMemory",
  "memory.setUserMemory",
  "wellness.createJournalPrompt",
]);

const CONFIRM_TOOLS = new Set([
  "finance.proposal",
  "health.logWorkout",
  "faith.createPrayer",
  "faith.createDevotionalEntry",
]);

export function getToolApprovalMode(toolName: string): ApprovalMode {
  if (AUTO_TOOLS.has(toolName)) return "auto";
  if (CONFIRM_TOOLS.has(toolName)) return "confirm";
  return "restricted";
}

export function pickDomainsFromIntent(input: string): AIDomain[] {
  const text = input.toLowerCase();
  const domains = new Set<AIDomain>();

  if (FINANCE_DOMAIN_PATTERN.test(text)) {
    domains.add("finance");
  }

  if (HEALTH_DOMAIN_PATTERN.test(text)) {
    domains.add("health");
  }

  if (WELLNESS_DOMAIN_PATTERN.test(text)) {
    domains.add("wellness");
  }

  if (PRODUCTIVITY_DOMAIN_PATTERN.test(text)) {
    domains.add("productivity");
  }

  if (CAREER_DOMAIN_PATTERN.test(text)) {
    domains.add("career");
  }

  if (RELATIONSHIPS_DOMAIN_PATTERN.test(text)) {
    domains.add("relationships");
  }

  if (FAITH_DOMAIN_PATTERN.test(text)) {
    domains.add("faith");
  }

  if (SPACE_DOMAIN_PATTERN.test(text)) {
    domains.add("space");
  }

  if (domains.size === 0) {
    domains.add("productivity");
  }

  return [...domains];
}

export function naiveRouteIntent(input: string): RouteIntent {
  const domains = pickDomainsFromIntent(input);
  const lower = input.toLowerCase();

  const intent =
    /plan|organize|schedule|map out|lay out/.test(lower)
      ? "plan"
      : /review|reflect|check in|how am i/.test(lower)
        ? "review"
        : domains.length > 2
          ? "cross_domain"
          : domains.length > 1
            ? "handoff"
            : "answer";

  const urgency =
    /urgent|asap|emergency|crisis|right now/.test(lower)
      ? "high"
      : /this week|soon|next/.test(lower)
        ? "medium"
        : "low";

  return { domains, intent, urgency };
}

export const CROSS_DOMAIN_AFFINITIES: Partial<Record<AIDomain, AIDomain[]>> = {
  health: ["wellness", "productivity", "faith"],
  wellness: ["health", "productivity", "relationships"],
  finance: ["wellness", "career", "space"],
  faith: ["wellness", "relationships", "productivity", "health"],
  space: ["wellness", "productivity", "health"],
  career: ["finance", "wellness", "productivity"],
  relationships: ["wellness", "faith", "productivity"],
  productivity: ["health", "wellness", "career"],
};

export function getDomainAvailability(domain: AIDomain): DomainAvailability {
  if (
    domain === "finance" ||
    domain === "health" ||
    domain === "wellness" ||
    domain === "productivity" ||
    domain === "faith"
  ) {
    return { domain, available: true, liveAgent: true };
  }

  return { domain, available: false, liveAgent: false };
}

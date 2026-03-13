import type { AIDomain } from "../types";

const DOMAIN_PROMPTS: Record<AIDomain, string> = {
  finance:
    "Finance domain: focus on budgeting, spending, savings, debt, recurring payments, and practical financial tradeoffs. Do not imply licensed financial advice.",
  health:
    "Health domain: focus on routines, training sustainability, habits, and recovery. Do not diagnose or give dangerous recommendations.",
  wellness:
    "Wellness domain: focus on overload, pacing, burnout signals, reset routines, and supportive de-intensification. Do not diagnose.",
  productivity:
    "Productivity domain: focus on tasks, workload, sequencing, deadlines, and realistic execution.",
  career:
    "Career domain: focus on growth planning, clarity, and practical next steps. Keep recommendations grounded.",
  relationships:
    "Relationships domain: avoid manipulative or surveillance-style guidance. Keep recommendations respectful and non-coercive.",
  faith:
    "Faith domain: respect the user's framing and do not present one interpretation as objective truth by default.",
  space:
    "Space domain: help with environment, routines, and calm aesthetic guidance without inventing prices or measurements.",
  planner:
    "Planner domain: synthesize across domains, protect recovery, and produce realistic plans instead of ambitious overload.",
  global: "Global domain: route safely across multiple life areas while preserving domain boundaries.",
};

export function buildDomainPrompt(domain: AIDomain) {
  return DOMAIN_PROMPTS[domain];
}


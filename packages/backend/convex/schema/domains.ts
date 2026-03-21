import { defineTable } from "convex/server";
import { v } from "convex/values";

import { aiDomainValidator } from "./ai";

// ─── All domains ────────────────────────────────────────────────────────────

export type DomainKey =
  | "finance"
  | "health"
  | "wellness"
  | "productivity"
  | "career"
  | "relationships"
  | "faith"
  | "space";

export type DomainMeta = {
  key: DomainKey;
  label: string;
  emoji: string;
  accent: string;
  description: string;
};

/**
 * Canonical list of every domain the system knows about.
 * Used by back-end seed scripts, front-end configs, and validators alike.
 */
export const ALL_DOMAINS: DomainMeta[] = [
  {
    key: "finance",
    label: "Finance",
    emoji: "💰",
    accent: "#6fcf97",
    description:
      "Track your money, set savings targets, and build better financial habits over time.",
  },
  {
    key: "health",
    label: "Health",
    emoji: "💪",
    accent: "#f0997b",
    description:
      "Build sustainable movement, sleep, and nutrition habits that compound over time.",
  },
  {
    key: "wellness",
    label: "Wellness",
    emoji: "🌿",
    accent: "#40d4c0",
    description:
      "Track energy, mood, and mental well-being to build resilience over time.",
  },
  {
    key: "productivity",
    label: "Tasks",
    emoji: "✅",
    accent: "#A8A5A0",
    description:
      "Capture, prioritise, and complete tasks that move the needle on what matters.",
  },
  {
    key: "career",
    label: "Career",
    emoji: "💼",
    accent: "#85b7eb",
    description:
      "Set professional goals, track projects, and build skills that move you forward.",
  },
  {
    key: "relationships",
    label: "Relationships",
    emoji: "🤝",
    accent: "#ed93b1",
    description:
      "Stay intentional with the people who matter — family, friends, community.",
  },
  {
    key: "faith",
    label: "Faith",
    emoji: "✦",
    accent: "#b4adf5",
    description:
      "Build a consistent prayer and devotional rhythm that fits your daily life.",
  },
  {
    key: "space",
    label: "Space",
    emoji: "🏠",
    accent: "#999999",
    description:
      "Organise your physical environment — rooms, zones, and recurring resets.",
  },
];

/** Quick lookup map: domain key → metadata */
export const DOMAIN_MAP: Record<DomainKey, DomainMeta> = Object.fromEntries(
  ALL_DOMAINS.map((d) => [d.key, d]),
) as Record<DomainKey, DomainMeta>;

/** Just the keys, typed as a const tuple for iteration */
export const DOMAIN_KEYS: DomainKey[] = ALL_DOMAINS.map((d) => d.key);

// ─── Table ──────────────────────────────────────────────────────────────────

export const domainStatusValidator = v.union(
  v.literal("active"),
  v.literal("inactive"),
  v.literal("pinned"),
);

export const userDomainsTable = defineTable({
  userId: v.string(),
  domain: aiDomainValidator,
  status: domainStatusValidator,
  activatedAt: v.optional(v.number()),
  pinnedAt: v.optional(v.number()),
  deactivatedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_domain", ["userId", "domain"]);

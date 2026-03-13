# Life OS — AI Layer Architecture

> Full cross-domain AI layer with router, specialist agents, memory, approval flow, streaming, and inter-domain suggestion engine.

---

## Table of Contents

1. [Package Installation](#1-package-installation)
2. [convex/convex.config.ts](#2-convexconvexconfigts)
3. [convex/ai/types.ts](#3-convexaitypests)
4. [convex/ai/model.ts](#4-convexaimodelts)
5. [convex/ai/policies.ts](#5-convexaipolicysts)
6. [convex/ai/prompts.ts](#6-convexaipromptsts)
7. [convex/ai/memory.ts](#7-convexaimemorysts)
8. [convex/ai/tools/shared.ts](#8-convexaitoolssharedts)
9. [convex/ai/tools/finance.ts](#9-convexaitoolsfinancets)
10. [convex/ai/tools/health.ts](#10-convexaitoolshealthts)
11. [convex/ai/tools/wellness.ts](#11-convexaitoolswellnessts)
12. [convex/ai/tools/faith.ts](#12-convexaitoolsfaithts)
13. [convex/ai/tools/space.ts](#13-convexaitoolsspacets)
14. [convex/ai/tools/career.ts](#14-convexaitoolscareerts)
15. [convex/ai/tools/relationships.ts](#15-convexaitoolsrelationshipsts)
16. [convex/ai/agents/router.ts](#16-convexaiagentsrouterts)
17. [convex/ai/agents/finance.ts](#17-convexaiagentsfinancets)
18. [convex/ai/agents/health.ts](#18-convexaiagentshealthts)
19. [convex/ai/agents/wellness.ts](#19-convexaiagentswellnessts)
20. [convex/ai/agents/planner.ts](#20-convexaiagentsplannerts)
21. [convex/ai/agents/faith.ts](#21-convexaiagentsfaithts)
22. [convex/ai/agents/space.ts](#22-convexaiagentsspacets)
23. [convex/ai/agents/career.ts](#23-convexaiagentscareerts)
24. [convex/ai/agents/relationships.ts](#24-convexaiagentsrelationshipsts)
25. [convex/ai/crossDomain.ts](#25-convexaicrossdomaints)
26. [convex/ai/approval.ts](#26-convexaiapprovalts)
27. [convex/ai/streaming.ts](#27-convexaistreaminsts)
28. [convex/ai/runRouter.ts](#28-convexairunrouterts)
29. [convex/ai/workflows/weeklyPlanner.ts](#29-convexaiworkflowsweeklyplannerts)
30. [convex/ai/workflows/monthlyReview.ts](#30-convexaiworkflowsmonthlyreviewts)
31. [convex/finance/ai.ts](#31-convexfinanceaits)
32. [convex/health/ai.ts](#32-convexhealthaits)
33. [convex/wellness/ai.ts](#33-convexwellnessaits)
34. [convex/faith/ai.ts](#34-convexfaithaits)
35. [convex/space/ai.ts](#35-convexspaceaits)
36. [convex/productivity/tasks.ts](#36-convexproductivitytasksts)
37. [convex/productivity/planner.ts](#37-convexproductivityplannerts)
38. [Schema additions for AI layer](#38-schema-additions-for-ai-layer)
39. [Cross-domain suggestion engine — how it works](#39-cross-domain-suggestion-engine--how-it-works)

---

## 1) Package Installation

```bash
npm i @convex-dev/agent ai @openrouter/ai-sdk-provider zod
```

---

## 2) `convex/convex.config.ts`

```ts
import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config.js";

const app = defineApp();
app.use(agent);

export default app;
```

---

## 3) `convex/ai/types.ts`

All shared contracts for the entire AI layer.

```ts
export type AIDomain =
  | "finance"
  | "health"
  | "wellness"
  | "productivity"
  | "career"
  | "relationships"
  | "faith"
  | "space";

export const ALL_DOMAINS: AIDomain[] = [
  "finance", "health", "wellness", "productivity",
  "career", "relationships", "faith", "space",
];

export type GoalHorizon = "day" | "week" | "month" | "year";
export type ApprovalMode = "auto" | "confirm" | "restricted";
export type Priority = "low" | "medium" | "high";

export type PlanItem = {
  id: string;
  title: string;
  domain: AIDomain;
  reason?: string;
  horizon: GoalHorizon;
  priority: Priority;
  suggestedAt: number;
  crossDomainLinks?: AIDomain[]; // domains this item also affects
};

export type CrossDomainSignal = {
  sourceDomain: AIDomain;
  targetDomain: AIDomain;
  signal: string;         // human-readable: "Low sleep affecting focus score"
  severity: "low" | "medium" | "high";
  suggestedAction?: string;
};

export type PendingAction = {
  toolName: string;
  approvalMode: ApprovalMode;
  args: Record<string, unknown>;
  domain: AIDomain;
  previewText: string;    // shown to user before confirmation
};

export type ApprovalRequest = {
  requestId: string;
  createdAt: number;
  actions: PendingAction[];
  expiresAt: number;
};

export type MemoryEntry = {
  domain: AIDomain;
  key: string;
  value: string;
  confidence: "low" | "medium" | "high";
  updatedAt: number;
};

export type AIResponse =
  | {
      type: "message";
      content: string;
      domains: AIDomain[];
      crossDomainSignals?: CrossDomainSignal[];
    }
  | {
      type: "plan";
      title: string;
      domains: AIDomain[];
      items: PlanItem[];
      crossDomainSignals?: CrossDomainSignal[];
    }
  | {
      type: "approval_request";
      title: string;
      actions: PendingAction[];
      requestId: string;
    }
  | {
      type: "suggestion_batch";
      suggestions: PlanItem[];
      generatedFor: AIDomain[];
      rationale: string;
    };

export type DomainSnapshot = {
  domain: AIDomain;
  generatedAt: number;
  summary: Record<string, unknown>;
  raw: Record<string, unknown>;
};
```

---

## 4) `convex/ai/model.ts`

```ts
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export type ModelTier = "fast" | "reasoning" | "creative";

// Replace openrouter/auto with specific models after benchmarking:
// fast      → google/gemini-flash-1.5
// reasoning → anthropic/claude-3.5-sonnet
// creative  → anthropic/claude-3-opus
export function getModel(tier: ModelTier): LanguageModel {
  switch (tier) {
    case "fast":      return openrouter.chat("openrouter/auto");
    case "reasoning": return openrouter.chat("openrouter/auto");
    case "creative":  return openrouter.chat("openrouter/auto");
    default:          return openrouter.chat("openrouter/auto");
  }
}
```

---

## 5) `convex/ai/policies.ts`

```ts
import type { AIDomain, ApprovalMode } from "./types";

// Tools the AI can call without user confirmation
const AUTO_TOOLS = new Set([
  "getFinanceSnapshot",
  "getHealthSnapshot",
  "getWellnessSnapshot",
  "getFaithSnapshot",
  "getSpaceSnapshot",
  "getCareerSnapshot",
  "getRelationshipsSnapshot",
  "getWeekSnapshot",
  "createTaskDraft",
  "createHabitDraft",
  "getUserMemory",
  "setUserMemory",
]);

// Tools that need one-tap confirmation
const CONFIRM_TOOLS = new Set([
  "createSavingsGoal",
  "scheduleWeeklyPlan",
  "updateBudgetCap",
  "logWorkout",
  "scheduleFastingWindow",
  "createPrayerReminder",
  "createDevotionalEntry",
  "createCareerMilestone",
  "createRelationshipRitual",
  "createSpaceUpgradePlan",
]);

export function getToolApprovalMode(toolName: string): ApprovalMode {
  if (AUTO_TOOLS.has(toolName)) return "auto";
  if (CONFIRM_TOOLS.has(toolName)) return "confirm";
  return "restricted";
}

export function pickDomainsFromIntent(input: string): AIDomain[] {
  const text = input.toLowerCase();
  const domains = new Set<AIDomain>();

  if (/budget|money|spend|saving|debt|account|finance|income|expense|subscription/.test(text))
    domains.add("finance");

  if (/workout|exercise|gym|fitness|meal|health|energy|sleep|steps|calories|nutrition/.test(text))
    domains.add("health");

  if (/stress|mood|anxious|burnout|mental|wellness|overwhelmed|therapy|journal|breathe/.test(text))
    domains.add("wellness");

  if (/task|todo|plan|focus|week|schedule|productivity|project|deadline|priority/.test(text))
    domains.add("productivity");

  if (/career|job|work|promotion|learn|skill|resume|interview|salary|freelance/.test(text))
    domains.add("career");

  if (/relationship|friend|family|partner|connection|date|social|love|boundaries/.test(text))
    domains.add("relationships");

  if (/prayer|faith|devotion|spiritual|church|scripture|fast|worship|gratitude|bible/.test(text))
    domains.add("faith");

  if (/room|space|decor|design|clean|desk|home|furniture|organize|environment/.test(text))
    domains.add("space");

  if (domains.size === 0) domains.add("productivity");

  return [...domains];
}

// Domains that commonly signal into other domains
export const CROSS_DOMAIN_AFFINITIES: Partial<Record<AIDomain, AIDomain[]>> = {
  health:    ["wellness", "productivity", "faith"],
  wellness:  ["health", "productivity", "relationships"],
  finance:   ["wellness", "career", "space"],
  faith:     ["wellness", "relationships", "productivity"],
  space:     ["wellness", "productivity", "health"],
  career:    ["finance", "wellness", "productivity"],
  relationships: ["wellness", "faith", "productivity"],
  productivity:  ["health", "wellness", "career"],
};
```

---

## 6) `convex/ai/prompts.ts`

```ts
import type { AIDomain } from "./types";

export const GLOBAL_SYSTEM_PROMPT = `
You are the AI layer of a personal Life OS application.
You help users plan, reflect, and take action across eight life domains:
finance, health, wellness, productivity, career, relationships, faith, and space.

Rules:
- Never invent user data. Use snapshot tools to read real state.
- Avoid irreversible writes unless explicitly approved.
- When you notice signals that cross domains, name them clearly.
- Return structured, calm, practical outputs.
- Respect the user's faith framing and personal values.
- You are not a licensed advisor in finance, medicine, or therapy.
`.trim();

export function getDomainPrompt(domain: AIDomain): string {
  const prompts: Record<AIDomain, string> = {
    finance: `
You are a personal finance coach agent.
Focus on budgeting, cash flow, savings discipline, subscription audits, and debt recovery.
Surface cross-domain signals: e.g. stress spending linked to wellness, career income gaps.
Do not present yourself as a licensed financial advisor.
`.trim(),

    health: `
You are a health and fitness coach agent.
Focus on workout consistency, sleep, nutrition, recovery, and realistic progression.
Surface cross-domain signals: e.g. poor sleep affecting mood and productivity scores.
Do not diagnose or give dangerous medical advice.
`.trim(),

    wellness: `
You are a mental wellness support agent.
Focus on stress patterns, burnout indicators, self-reflection, journaling, and sustainable routines.
Surface cross-domain signals: e.g. financial stress compounding anxiety, space disorder affecting mood.
Do not diagnose mental illness.
`.trim(),

    productivity: `
You are a productivity and planning agent.
Focus on weekly/daily prioritization, deep work, task batching, and realistic goal setting.
Surface cross-domain signals: e.g. overcommitment driven by career anxiety, energy dips from poor health.
`.trim(),

    career: `
You are a career growth agent.
Focus on skill development, momentum, networking cadence, project execution, and professional clarity.
Surface cross-domain signals: e.g. burnout risking career output, financial pressure driving poor decisions.
`.trim(),

    relationships: `
You are a relationships support agent.
Focus on connection rituals, healthy communication, quality time, and thoughtful reflection.
Do not encourage manipulation, surveillance, or unhealthy attachment.
Surface cross-domain signals: e.g. overwork isolating relationships, faith community as connection source.
`.trim(),

    faith: `
You are a faith and spiritual life support agent.
Focus on spiritual discipline, prayer routines, fasting, scripture engagement, and intentional living.
Respect the user's framing and tradition.
Surface cross-domain signals: e.g. gratitude practice improving wellness scores, fasting linked to health.
`.trim(),

    space: `
You are a space and environment planning agent.
Focus on room function, design clarity, comfort, organization, and upgrade prioritization.
Do not invent measurements, prices, or product availability.
Surface cross-domain signals: e.g. cluttered desk degrading focus, lighting affecting mood and sleep.
`.trim(),
  };

  return prompts[domain];
}

export function getCrossDomainPrompt(domains: AIDomain[]): string {
  return `
You are synthesizing insights across these life domains: ${domains.join(", ")}.
Look for compounding effects — where one domain is creating drag or momentum in another.
Name these signals explicitly and propose integrated actions that address root causes, not just symptoms.
`.trim();
}
```

---

## 7) `convex/ai/memory.ts`

Lightweight semantic memory layer stored in Convex.

```ts
import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import type { MemoryEntry } from "./types";

// ── Schema (add to convex/schema.ts) ──────────────────────────────────────────
// aiMemory: defineTable({
//   userId: v.string(),
//   domain: v.string(),
//   key: v.string(),
//   value: v.string(),
//   confidence: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
//   updatedAt: v.number(),
// }).index("by_user_domain", ["userId", "domain"])
//   .index("by_user_key", ["userId", "key"]),

export const getMemoryForDomain = query({
  args: { userId: v.string(), domain: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiMemory")
      .withIndex("by_user_domain", (q) =>
        q.eq("userId", args.userId).eq("domain", args.domain)
      )
      .collect();
  },
});

export const getAllMemory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiMemory")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

export const upsertMemory = mutation({
  args: {
    userId: v.string(),
    domain: v.string(),
    key: v.string(),
    value: v.string(),
    confidence: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("aiMemory")
      .withIndex("by_user_key", (q) =>
        q.eq("userId", args.userId).eq("key", args.key)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        confidence: args.confidence,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("aiMemory", {
      userId: args.userId,
      domain: args.domain,
      key: args.key,
      value: args.value,
      confidence: args.confidence,
      updatedAt: Date.now(),
    });
  },
});

export const deleteMemoryKey = mutation({
  args: { userId: v.string(), key: v.string() },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("aiMemory")
      .withIndex("by_user_key", (q) =>
        q.eq("userId", args.userId).eq("key", args.key)
      )
      .first();
    if (entry) await ctx.db.delete(entry._id);
  },
});

// ── Tool wrappers (used inside agents) ───────────────────────────────────────

import { z } from "zod";
import { createTool } from "@convex-dev/agent";
import { api } from "../_generated/api";

export const getUserMemory = createTool({
  description: "Retrieve AI memory entries for a domain to personalize responses",
  args: z.object({
    domain: z.string(),
    userId: z.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.runQuery(api.ai.memory.getMemoryForDomain, {
      userId: args.userId,
      domain: args.domain,
    });
  },
});

export const setUserMemory = createTool({
  description: "Store a memory entry for the user in a domain",
  args: z.object({
    userId: z.string(),
    domain: z.string(),
    key: z.string(),
    value: z.string(),
    confidence: z.enum(["low", "medium", "high"]),
  }),
  handler: async (ctx, args) => {
    await ctx.runMutation(api.ai.memory.upsertMemory, args);
    return { ok: true };
  },
});
```

---

## 8) `convex/ai/tools/shared.ts`

```ts
import { z } from "zod";
import { createTool } from "@convex-dev/agent";
import { api } from "../_generated/api";

export const createTaskDraft = createTool({
  description: "Create a draft task suggestion for the user across any domain",
  args: z.object({
    title: z.string().min(1),
    reason: z.string().optional(),
    domain: z.enum(["finance","health","wellness","productivity","career","relationships","faith","space"]),
    priority: z.enum(["low","medium","high"]).default("medium"),
    horizon: z.enum(["day","week","month","year"]).default("week"),
    crossDomainLinks: z.array(z.string()).optional(),
  }),
  handler: async (ctx, args) => {
    const id = await ctx.runMutation(api.productivity.tasks.createDraft, {
      title: args.title,
      reason: args.reason,
      domain: args.domain,
      priority: args.priority,
      horizon: args.horizon,
    });
    return { ok: true, draftTaskId: id };
  },
});

export const createHabitDraft = createTool({
  description: "Create a habit suggestion for the user",
  args: z.object({
    title: z.string().min(1),
    domain: z.enum(["finance","health","wellness","productivity","career","relationships","faith","space"]),
    frequency: z.enum(["daily","weekly"]).default("daily"),
    reason: z.string().optional(),
  }),
  handler: async (ctx, args) => {
    const id = await ctx.runMutation(api.productivity.habits.createDraft, {
      title: args.title,
      domain: args.domain,
      frequency: args.frequency,
      reason: args.reason,
    });
    return { ok: true, draftHabitId: id };
  },
});

export const getWeekSnapshot = createTool({
  description: "Get the user's current week snapshot across all planning domains",
  args: z.object({}),
  handler: async (ctx) => {
    return await ctx.runQuery(api.productivity.planner.getWeekSnapshotForAI, {});
  },
});

export const getAllDomainSnapshots = createTool({
  description: "Get a lightweight snapshot across all 8 domains for cross-domain analysis",
  args: z.object({ userId: z.string() }),
  handler: async (ctx, args) => {
    const [finance, health, wellness, faith, space, career] = await Promise.all([
      ctx.runQuery(api.finance.ai.getFinanceSnapshotForAI, {}),
      ctx.runQuery(api.health.ai.getHealthSnapshotForAI, {}),
      ctx.runQuery(api.wellness.ai.getWellnessSnapshotForAI, {}),
      ctx.runQuery(api.faith.ai.getFaithSnapshotForAI, {}),
      ctx.runQuery(api.space.ai.getSpaceSnapshotForAI, {}),
      ctx.runQuery(api.career.ai.getCareerSnapshotForAI, {}),
    ]);
    return { finance, health, wellness, faith, space, career, generatedAt: Date.now() };
  },
});
```

---

## 9) `convex/ai/tools/finance.ts`

```ts
import { z } from "zod";
import { createTool } from "@convex-dev/agent";
import { api } from "../_generated/api";

export const getFinanceSnapshot = createTool({
  description: "Get structured snapshot of the user's finance state",
  args: z.object({}),
  handler: async (ctx) => ctx.runQuery(api.finance.ai.getFinanceSnapshotForAI, {}),
});

export const createSavingsGoal = createTool({
  description: "Create a savings goal — requires confirmation",
  args: z.object({
    name: z.string().min(1),
    targetAmount: z.number().positive(),
    targetDate: z.string().optional(),
    confirmed: z.boolean().default(false),
  }),
  handler: async (ctx, args) => {
    if (!args.confirmed) return {
      ok: false,
      requiresConfirmation: true,
      preview: { name: args.name, targetAmount: args.targetAmount, targetDate: args.targetDate ?? null },
    };
    const goalId = await ctx.runMutation(api.finance.goals.create, {
      name: args.name, targetAmount: args.targetAmount, targetDate: args.targetDate,
    });
    return { ok: true, goalId };
  },
});

export const updateBudgetCap = createTool({
  description: "Update a monthly budget cap for a category — requires confirmation",
  args: z.object({
    categoryId: z.string(),
    monthlyCap: z.number().nonnegative(),
    confirmed: z.boolean().default(false),
  }),
  handler: async (ctx, args) => {
    if (!args.confirmed) return { ok: false, requiresConfirmation: true, preview: args };
    await ctx.runMutation(api.finance.budgets.updateCap, {
      categoryId: args.categoryId, monthlyCap: args.monthlyCap,
    });
    return { ok: true };
  },
});
```

---

## 10) `convex/ai/tools/health.ts`

```ts
import { z } from "zod";
import { createTool } from "@convex-dev/agent";
import { api } from "../_generated/api";

export const getHealthSnapshot = createTool({
  description: "Get structured snapshot of the user's health and fitness state",
  args: z.object({}),
  handler: async (ctx) => ctx.runQuery(api.health.ai.getHealthSnapshotForAI, {}),
});

export const logWorkout = createTool({
  description: "Log a workout entry — requires confirmation",
  args: z.object({
    type: z.string(),
    durationMinutes: z.number().positive(),
    notes: z.string().optional(),
    confirmed: z.boolean().default(false),
  }),
  handler: async (ctx, args) => {
    if (!args.confirmed) return {
      ok: false, requiresConfirmation: true,
      preview: { type: args.type, durationMinutes: args.durationMinutes },
    };
    const id = await ctx.runMutation(api.health.workouts.log, {
      type: args.type, durationMinutes: args.durationMinutes, notes: args.notes,
    });
    return { ok: true, workoutId: id };
  },
});

export const scheduleFastingWindow = createTool({
  description: "Schedule a fasting window — links to faith domain if spiritual fast",
  args: z.object({
    startHour: z.number().min(0).max(23),
    endHour: z.number().min(0).max(23),
    isSpiritualFast: z.boolean().default(false),
    notes: z.string().optional(),
    confirmed: z.boolean().default(false),
  }),
  handler: async (ctx, args) => {
    if (!args.confirmed) return {
      ok: false, requiresConfirmation: true,
      preview: { startHour: args.startHour, endHour: args.endHour, isSpiritualFast: args.isSpiritualFast },
    };
    const id = await ctx.runMutation(api.health.fasting.schedule, {
      startHour: args.startHour, endHour: args.endHour,
      isSpiritualFast: args.isSpiritualFast, notes: args.notes,
    });
    return { ok: true, fastId: id };
  },
});
```

---

## 11) `convex/ai/tools/wellness.ts`

```ts
import { z } from "zod";
import { createTool } from "@convex-dev/agent";
import { api } from "../_generated/api";

export const getWellnessSnapshot = createTool({
  description: "Get structured snapshot of the user's mental wellness state",
  args: z.object({}),
  handler: async (ctx) => ctx.runQuery(api.wellness.ai.getWellnessSnapshotForAI, {}),
});

export const createJournalPrompt = createTool({
  description: "Generate a reflective journal prompt for the user based on their state",
  args: z.object({
    focus: z.string().optional(),
    domain: z.string().optional(),
  }),
  handler: async (_ctx, args) => {
    // Returns a prompt string for the client to surface as a journaling entry
    const focusText = args.focus ? ` focused on ${args.focus}` : "";
    return {
      prompt: `Take 5 minutes to write about how you're feeling today${focusText}. What's one thing creating pressure, and one thing giving you energy?`,
      suggestedDomain: args.domain ?? "wellness",
    };
  },
});

export const logMoodEntry = createTool({
  description: "Log a mood/energy check-in",
  args: z.object({
    mood: z.number().min(1).max(10),
    energy: z.number().min(1).max(10),
    notes: z.string().optional(),
  }),
  handler: async (ctx, args) => {
    const id = await ctx.runMutation(api.wellness.mood.log, {
      mood: args.mood, energy: args.energy, notes: args.notes,
    });
    return { ok: true, entryId: id };
  },
});
```

---

## 12) `convex/ai/tools/faith.ts`

```ts
import { z } from "zod";
import { createTool } from "@convex-dev/agent";
import { api } from "../_generated/api";

export const getFaithSnapshot = createTool({
  description: "Get structured snapshot of the user's faith and spiritual life state",
  args: z.object({}),
  handler: async (ctx) => ctx.runQuery(api.faith.ai.getFaithSnapshotForAI, {}),
});

export const createPrayerReminder = createTool({
  description: "Create a prayer or devotional reminder — requires confirmation",
  args: z.object({
    title: z.string(),
    timeOfDay: z.enum(["morning", "midday", "evening", "night"]),
    frequency: z.enum(["daily", "weekly"]),
    confirmed: z.boolean().default(false),
  }),
  handler: async (ctx, args) => {
    if (!args.confirmed) return {
      ok: false, requiresConfirmation: true,
      preview: { title: args.title, timeOfDay: args.timeOfDay, frequency: args.frequency },
    };
    const id = await ctx.runMutation(api.faith.reminders.create, {
      title: args.title, timeOfDay: args.timeOfDay, frequency: args.frequency,
    });
    return { ok: true, reminderId: id };
  },
});

export const createDevotionalEntry = createTool({
  description: "Create a devotional or Bible reading entry",
  args: z.object({
    passage: z.string(),
    reflection: z.string().optional(),
    confirmed: z.boolean().default(false),
  }),
  handler: async (ctx, args) => {
    if (!args.confirmed) return {
      ok: false, requiresConfirmation: true, preview: { passage: args.passage },
    };
    const id = await ctx.runMutation(api.faith.devotionals.create, {
      passage: args.passage, reflection: args.reflection,
    });
    return { ok: true, devotionalId: id };
  },
});
```

---

## 13) `convex/ai/tools/space.ts`

```ts
import { z } from "zod";
import { createTool } from "@convex-dev/agent";
import { api } from "../_generated/api";

export const getSpaceSnapshot = createTool({
  description: "Get structured snapshot of the user's space and environment state",
  args: z.object({}),
  handler: async (ctx) => ctx.runQuery(api.space.ai.getSpaceSnapshotForAI, {}),
});

export const createSpaceUpgradePlan = createTool({
  description: "Create a space upgrade or organization plan item",
  args: z.object({
    title: z.string(),
    zone: z.string(),    // e.g. "desk", "sleep area", "kitchen corner"
    estimatedCost: z.number().optional(),
    priority: z.enum(["low","medium","high"]).default("medium"),
    confirmed: z.boolean().default(false),
  }),
  handler: async (ctx, args) => {
    if (!args.confirmed) return {
      ok: false, requiresConfirmation: true,
      preview: { title: args.title, zone: args.zone, estimatedCost: args.estimatedCost },
    };
    const id = await ctx.runMutation(api.space.upgrades.create, {
      title: args.title, zone: args.zone,
      estimatedCost: args.estimatedCost, priority: args.priority,
    });
    return { ok: true, upgradeId: id };
  },
});
```

---

## 14) `convex/ai/tools/career.ts`

```ts
import { z } from "zod";
import { createTool } from "@convex-dev/agent";
import { api } from "../_generated/api";

export const getCareerSnapshot = createTool({
  description: "Get structured snapshot of the user's career and professional state",
  args: z.object({}),
  handler: async (ctx) => ctx.runQuery(api.career.ai.getCareerSnapshotForAI, {}),
});

export const createCareerMilestone = createTool({
  description: "Create a career milestone or learning goal",
  args: z.object({
    title: z.string(),
    category: z.enum(["skill","project","networking","financial","other"]),
    targetDate: z.string().optional(),
    confirmed: z.boolean().default(false),
  }),
  handler: async (ctx, args) => {
    if (!args.confirmed) return {
      ok: false, requiresConfirmation: true,
      preview: { title: args.title, category: args.category },
    };
    const id = await ctx.runMutation(api.career.milestones.create, {
      title: args.title, category: args.category, targetDate: args.targetDate,
    });
    return { ok: true, milestoneId: id };
  },
});
```

---

## 15) `convex/ai/tools/relationships.ts`

```ts
import { z } from "zod";
import { createTool } from "@convex-dev/agent";
import { api } from "../_generated/api";

export const getRelationshipsSnapshot = createTool({
  description: "Get structured snapshot of the user's relationships state",
  args: z.object({}),
  handler: async (ctx) => ctx.runQuery(api.relationships.ai.getRelationshipsSnapshotForAI, {}),
});

export const createRelationshipRitual = createTool({
  description: "Create a connection ritual or relationship intention",
  args: z.object({
    title: z.string(),
    contactName: z.string().optional(),
    frequency: z.enum(["daily","weekly","monthly"]),
    confirmed: z.boolean().default(false),
  }),
  handler: async (ctx, args) => {
    if (!args.confirmed) return {
      ok: false, requiresConfirmation: true,
      preview: { title: args.title, frequency: args.frequency },
    };
    const id = await ctx.runMutation(api.relationships.rituals.create, {
      title: args.title, contactName: args.contactName, frequency: args.frequency,
    });
    return { ok: true, ritualId: id };
  },
});
```

---

## 16) `convex/ai/agents/router.ts`

```ts
import { Agent } from "@convex-dev/agent";
import { z } from "zod";
import { getModel } from "../model";
import { GLOBAL_SYSTEM_PROMPT } from "../prompts";
import { pickDomainsFromIntent } from "../policies";
import { getAllDomainSnapshots, getWeekSnapshot, createTaskDraft } from "../tools/shared";
import { getUserMemory, setUserMemory } from "../memory";

export const plannerRouterAgent = new Agent({
  name: "plannerRouter",
  chat: getModel("fast"),
  instructions: GLOBAL_SYSTEM_PROMPT,
  tools: {
    getAllDomainSnapshots,
    getWeekSnapshot,
    createTaskDraft,
    getUserMemory,
    setUserMemory,
  },
});

export const routeIntentSchema = z.object({
  domains: z.array(z.enum(["finance","health","wellness","productivity","career","relationships","faith","space"])),
  intent: z.enum(["answer","plan","review","handoff","cross_domain"]),
  urgency: z.enum(["low","medium","high"]),
});

export type RouteIntent = z.infer<typeof routeIntentSchema>;

export function naiveRouteIntent(input: string): RouteIntent {
  const domains = pickDomainsFromIntent(input);
  const lower = input.toLowerCase();

  const intent =
    /plan|organize|schedule|map out|lay out/.test(lower) ? "plan" :
    /review|reflect|check in|how am i/.test(lower)        ? "review" :
    domains.length > 2                                     ? "cross_domain" :
    domains.length > 1                                     ? "handoff" :
    "answer";

  const urgency =
    /urgent|asap|emergency|crisis|right now/.test(lower) ? "high" :
    /this week|soon|next/.test(lower)                     ? "medium" :
    "low";

  return { domains, intent, urgency };
}
```

---

## 17) `convex/ai/agents/finance.ts`

```ts
import { Agent } from "@convex-dev/agent";
import { getModel } from "../model";
import { GLOBAL_SYSTEM_PROMPT, getDomainPrompt } from "../prompts";
import { getFinanceSnapshot, createSavingsGoal, updateBudgetCap } from "../tools/finance";
import { createTaskDraft } from "../tools/shared";
import { getUserMemory, setUserMemory } from "../memory";

export const financeCoachAgent = new Agent({
  name: "financeCoach",
  chat: getModel("reasoning"),
  instructions: `${GLOBAL_SYSTEM_PROMPT}\n\n${getDomainPrompt("finance")}`,
  tools: { getFinanceSnapshot, createSavingsGoal, updateBudgetCap, createTaskDraft, getUserMemory, setUserMemory },
});
```

---

## 18) `convex/ai/agents/health.ts`

```ts
import { Agent } from "@convex-dev/agent";
import { getModel } from "../model";
import { GLOBAL_SYSTEM_PROMPT, getDomainPrompt } from "../prompts";
import { getHealthSnapshot, logWorkout, scheduleFastingWindow } from "../tools/health";
import { createTaskDraft, createHabitDraft } from "../tools/shared";
import { getUserMemory, setUserMemory } from "../memory";

export const healthCoachAgent = new Agent({
  name: "healthCoach",
  chat: getModel("reasoning"),
  instructions: `${GLOBAL_SYSTEM_PROMPT}\n\n${getDomainPrompt("health")}

When reviewing health:
- Identify consistency gaps across sleep, workouts, and nutrition
- Surface energy patterns that connect to wellness or productivity
- Suggest habits before goals — small anchors beat big commitments
- Flag fasting windows that may overlap with faith intentions
`.trim(),
  tools: { getHealthSnapshot, logWorkout, scheduleFastingWindow, createTaskDraft, createHabitDraft, getUserMemory, setUserMemory },
});
```

---

## 19) `convex/ai/agents/wellness.ts`

```ts
import { Agent } from "@convex-dev/agent";
import { getModel } from "../model";
import { GLOBAL_SYSTEM_PROMPT, getDomainPrompt } from "../prompts";
import { getWellnessSnapshot, createJournalPrompt, logMoodEntry } from "../tools/wellness";
import { createTaskDraft, createHabitDraft } from "../tools/shared";
import { getUserMemory, setUserMemory } from "../memory";

export const wellnessCoachAgent = new Agent({
  name: "wellnessCoach",
  chat: getModel("reasoning"),
  instructions: `${GLOBAL_SYSTEM_PROMPT}\n\n${getDomainPrompt("wellness")}

When reviewing wellness:
- Look for burnout signals: consistent low energy + high task load
- Surface financial stress or isolation as upstream causes
- Recommend journaling or breathing over willpower as first tools
- Validate feelings before pivoting to solutions
`.trim(),
  tools: { getWellnessSnapshot, createJournalPrompt, logMoodEntry, createTaskDraft, createHabitDraft, getUserMemory, setUserMemory },
});
```

---

## 20) `convex/ai/agents/planner.ts`

The master planning agent — used for weekly/monthly synthesis.

```ts
import { Agent } from "@convex-dev/agent";
import { getModel } from "../model";
import { GLOBAL_SYSTEM_PROMPT, getDomainPrompt, getCrossDomainPrompt } from "../prompts";
import { getAllDomainSnapshots, getWeekSnapshot, createTaskDraft, createHabitDraft } from "../tools/shared";
import { getUserMemory, setUserMemory } from "../memory";

export const masterPlannerAgent = new Agent({
  name: "masterPlanner",
  chat: getModel("reasoning"),
  instructions: `
${GLOBAL_SYSTEM_PROMPT}

${getCrossDomainPrompt(["finance","health","wellness","productivity","career","relationships","faith","space"])}

You are the weekly and monthly planning synthesizer.
Your role:
- Gather all domain snapshots
- Find conflicts and compounding effects across domains
- Build realistic, prioritized weekly plans
- Identify 1–3 high-leverage cross-domain actions that unlock multiple areas at once
- Flag risks: overcommitment, financial pressure on wellness, isolation patterns
- Always anchor plans in the user's faith values and space constraints
`.trim(),
  tools: { getAllDomainSnapshots, getWeekSnapshot, createTaskDraft, createHabitDraft, getUserMemory, setUserMemory },
});
```

---

## 21) `convex/ai/agents/faith.ts`

```ts
import { Agent } from "@convex-dev/agent";
import { getModel } from "../model";
import { GLOBAL_SYSTEM_PROMPT, getDomainPrompt } from "../prompts";
import { getFaithSnapshot, createPrayerReminder, createDevotionalEntry } from "../tools/faith";
import { createTaskDraft, createHabitDraft } from "../tools/shared";
import { getUserMemory, setUserMemory } from "../memory";

export const faithCoachAgent = new Agent({
  name: "faithCoach",
  chat: getModel("reasoning"),
  instructions: `${GLOBAL_SYSTEM_PROMPT}\n\n${getDomainPrompt("faith")}

When reviewing faith:
- Treat spiritual disciplines as first-class priorities, not optional
- Surface gratitude practice as a wellness bridge
- Connect fasting to health domain data where relevant
- Honor the user's tradition without imposing external frameworks
`.trim(),
  tools: { getFaithSnapshot, createPrayerReminder, createDevotionalEntry, createTaskDraft, createHabitDraft, getUserMemory, setUserMemory },
});
```

---

## 22) `convex/ai/agents/space.ts`

```ts
import { Agent } from "@convex-dev/agent";
import { getModel } from "../model";
import { GLOBAL_SYSTEM_PROMPT, getDomainPrompt } from "../prompts";
import { getSpaceSnapshot, createSpaceUpgradePlan } from "../tools/space";
import { createTaskDraft } from "../tools/shared";
import { getUserMemory, setUserMemory } from "../memory";

export const spaceCoachAgent = new Agent({
  name: "spaceCoach",
  chat: getModel("fast"),
  instructions: `${GLOBAL_SYSTEM_PROMPT}\n\n${getDomainPrompt("space")}

When reviewing space:
- Treat the single-room environment as a multi-function zone
- Prioritize changes that affect sleep, focus, and mood first
- Link upgrade costs to finance domain budget capacity
- Small, low-cost interventions often unlock wellness gains
`.trim(),
  tools: { getSpaceSnapshot, createSpaceUpgradePlan, createTaskDraft, getUserMemory, setUserMemory },
});
```

---

## 23) `convex/ai/agents/career.ts`

```ts
import { Agent } from "@convex-dev/agent";
import { getModel } from "../model";
import { GLOBAL_SYSTEM_PROMPT, getDomainPrompt } from "../prompts";
import { getCareerSnapshot, createCareerMilestone } from "../tools/career";
import { createTaskDraft } from "../tools/shared";
import { getUserMemory, setUserMemory } from "../memory";

export const careerCoachAgent = new Agent({
  name: "careerCoach",
  chat: getModel("reasoning"),
  instructions: `${GLOBAL_SYSTEM_PROMPT}\n\n${getDomainPrompt("career")}

When reviewing career:
- Connect income trajectory to finance domain pressure
- Flag burnout risk from overwork affecting wellness scores
- Identify skill gaps that compound over quarters, not weeks
- Suggest one focused project over many scattered efforts
`.trim(),
  tools: { getCareerSnapshot, createCareerMilestone, createTaskDraft, getUserMemory, setUserMemory },
});
```

---

## 24) `convex/ai/agents/relationships.ts`

```ts
import { Agent } from "@convex-dev/agent";
import { getModel } from "../model";
import { GLOBAL_SYSTEM_PROMPT, getDomainPrompt } from "../prompts";
import { getRelationshipsSnapshot, createRelationshipRitual } from "../tools/relationships";
import { createTaskDraft } from "../tools/shared";
import { getUserMemory, setUserMemory } from "../memory";

export const relationshipsCoachAgent = new Agent({
  name: "relationshipsCoach",
  chat: getModel("reasoning"),
  instructions: `${GLOBAL_SYSTEM_PROMPT}\n\n${getDomainPrompt("relationships")}

When reviewing relationships:
- Treat isolation as a wellness signal, not just a social fact
- Faith community connections count as relationship anchors
- Overwork and financial stress are the top isolators — name them
- Suggest low-friction rituals before ambitious social goals
`.trim(),
  tools: { getRelationshipsSnapshot, createRelationshipRitual, createTaskDraft, getUserMemory, setUserMemory },
});
```

---

## 25) `convex/ai/crossDomain.ts`

The cross-domain suggestion engine — identifies signals and generates integrated suggestions.

```ts
import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import type { CrossDomainSignal, DomainSnapshot, PlanItem } from "./types";
import { CROSS_DOMAIN_AFFINITIES } from "./policies";
import { masterPlannerAgent } from "./agents/planner";

// ── Signal detection ─────────────────────────────────────────────────────────

export function detectCrossDomainSignals(snapshots: Record<string, DomainSnapshot>): CrossDomainSignal[] {
  const signals: CrossDomainSignal[] = [];

  // Health → Wellness
  const health = snapshots.health?.summary as any;
  const wellness = snapshots.wellness?.summary as any;
  if (health?.avgSleepHours < 6 && wellness?.avgMoodScore < 6) {
    signals.push({
      sourceDomain: "health",
      targetDomain: "wellness",
      signal: "Consistent low sleep (< 6h) correlating with low mood scores",
      severity: "high",
      suggestedAction: "Prioritize a fixed sleep window before adding any new tasks",
    });
  }

  // Finance → Wellness
  const finance = snapshots.finance?.summary as any;
  if (finance?.budgetOverruns > 2 && wellness?.avgStressScore > 7) {
    signals.push({
      sourceDomain: "finance",
      targetDomain: "wellness",
      signal: "Multiple budget overruns coinciding with elevated stress scores",
      severity: "high",
      suggestedAction: "Address one spending category this week to reduce financial anxiety",
    });
  }

  // Health/Faith fasting overlap
  const faith = snapshots.faith?.summary as any;
  const healthFasting = health?.activeFastingWindow;
  if (faith?.fastingFrequency > 0 && healthFasting) {
    signals.push({
      sourceDomain: "faith",
      targetDomain: "health",
      signal: "Spiritual fasting active — opportunity to align with health fasting protocol",
      severity: "low",
      suggestedAction: "Log spiritual fast in health domain to track combined benefits",
    });
  }

  // Career → Finance
  const career = snapshots.career?.summary as any;
  if (career?.incomeGrowthStalled && finance?.savingsRate < 0.1) {
    signals.push({
      sourceDomain: "career",
      targetDomain: "finance",
      signal: "Stalled income growth combined with low savings rate",
      severity: "medium",
      suggestedAction: "Identify one income-growth action this week (skill, project, or outreach)",
    });
  }

  // Space → Wellness/Productivity
  const space = snapshots.space?.summary as any;
  if (space?.disorderScore > 7) {
    signals.push({
      sourceDomain: "space",
      targetDomain: "wellness",
      signal: "High environment disorder score — associated with elevated stress",
      severity: "medium",
      suggestedAction: "15-minute desk reset as a daily anchor task",
    });
    signals.push({
      sourceDomain: "space",
      targetDomain: "productivity",
      signal: "Cluttered workspace linked to lower focus session completion",
      severity: "medium",
      suggestedAction: "Clear primary work surface before deep work sessions",
    });
  }

  // Relationships → Wellness
  const relationships = snapshots.relationships?.summary as any;
  if (relationships?.connectionScore < 4) {
    signals.push({
      sourceDomain: "relationships",
      targetDomain: "wellness",
      signal: "Low connection score — social isolation is a key wellness risk factor",
      severity: "high",
      suggestedAction: "Schedule one meaningful interaction this week",
    });
  }

  return signals;
}

// ── Cross-domain suggestion action ───────────────────────────────────────────

export const generateCrossDomainSuggestions = action({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<{ signals: CrossDomainSignal[]; suggestions: PlanItem[] }> => {
    // Gather all snapshots
    const snapshots = await ctx.runQuery(api.ai.aggregates.getAllSnapshotsForUser, {
      userId: args.userId,
    });

    // Run rule-based signal detection
    const signals = detectCrossDomainSignals(snapshots);

    if (signals.length === 0) {
      return { signals: [], suggestions: [] };
    }

    // Feed signals to master planner for integrated suggestions
    const thread = await masterPlannerAgent.createThread(ctx, { userId: args.userId });

    const signalText = signals
      .map((s) => `[${s.sourceDomain} → ${s.targetDomain}] ${s.signal}. Suggested: ${s.suggestedAction ?? "none"}`)
      .join("\n");

    const result = await masterPlannerAgent.generateText(ctx, thread, {
      prompt: `
The following cross-domain signals were detected for this user:

${signalText}

Based on these signals, generate 3–5 integrated action suggestions.
Each suggestion should address at least two domains simultaneously.
Return a JSON array of PlanItems with: id, title, domain, reason, horizon, priority, crossDomainLinks.
`,
    });

    let suggestions: PlanItem[] = [];
    try {
      const jsonMatch = result.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) suggestions = JSON.parse(jsonMatch[0]);
    } catch {
      suggestions = [];
    }

    return { signals, suggestions };
  },
});
```

---

## 26) `convex/ai/approval.ts`

Approval flow for `confirm` and `restricted` tools.

```ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { ApprovalRequest } from "./types";

// ── Schema (add to convex/schema.ts) ─────────────────────────────────────────
// approvalRequests: defineTable({
//   userId: v.string(),
//   requestId: v.string(),
//   actions: v.array(v.object({
//     toolName: v.string(),
//     approvalMode: v.string(),
//     args: v.any(),
//     domain: v.string(),
//     previewText: v.string(),
//   })),
//   status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("expired")),
//   createdAt: v.number(),
//   expiresAt: v.number(),
//   resolvedAt: v.optional(v.number()),
// }).index("by_user_status", ["userId", "status"]),

export const createApprovalRequest = mutation({
  args: {
    userId: v.string(),
    requestId: v.string(),
    actions: v.array(v.object({
      toolName: v.string(),
      approvalMode: v.string(),
      args: v.any(),
      domain: v.string(),
      previewText: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const expiresAt = Date.now() + 1000 * 60 * 30; // 30 min TTL
    return await ctx.db.insert("approvalRequests", {
      userId: args.userId,
      requestId: args.requestId,
      actions: args.actions,
      status: "pending",
      createdAt: Date.now(),
      expiresAt,
    });
  },
});

export const resolveApprovalRequest = mutation({
  args: {
    requestId: v.string(),
    approved: v.boolean(),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("approvalRequests")
      .filter((q) => q.eq(q.field("requestId"), args.requestId))
      .first();

    if (!request) throw new Error("Approval request not found");
    if (request.status !== "pending") throw new Error("Request already resolved");
    if (Date.now() > request.expiresAt) {
      await ctx.db.patch(request._id, { status: "expired" });
      throw new Error("Approval request expired");
    }

    await ctx.db.patch(request._id, {
      status: args.approved ? "approved" : "rejected",
      resolvedAt: Date.now(),
    });

    return { approved: args.approved };
  },
});

export const getPendingApprovals = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("approvalRequests")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", "pending")
      )
      .collect();
  },
});
```

---

## 27) `convex/ai/streaming.ts`

HTTP streaming endpoint for live agent deltas.

```ts
import { httpRouter } from "convex/server";
import { httpAction } from "../_generated/server";
import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { tool } from "ai";
import { GLOBAL_SYSTEM_PROMPT, getDomainPrompt } from "./prompts";
import { pickDomainsFromIntent } from "./policies";

const http = httpRouter();
const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });

http.route({
  path: "/ai/stream",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    const body = await request.json();
    const { prompt, userId } = body;

    const domains = pickDomainsFromIntent(prompt);
    const domainContext = domains.map(getDomainPrompt).join("\n\n");

    const result = streamText({
      model: openrouter.chat("openrouter/auto"),
      system: `${GLOBAL_SYSTEM_PROMPT}\n\nActive domains: ${domains.join(", ")}\n\n${domainContext}`,
      prompt,
      tools: {
        classifyIntent: tool({
          description: "Classify the user's planning intent for routing",
          parameters: z.object({
            domains: z.array(z.string()),
            intent: z.enum(["answer","plan","review","cross_domain"]),
          }),
          execute: async ({ domains, intent }) => ({ domains, intent }),
        }),
        flagCrossDomainSignal: tool({
          description: "Flag a cross-domain insight in the response",
          parameters: z.object({
            sourceDomain: z.string(),
            targetDomain: z.string(),
            signal: z.string(),
          }),
          execute: async (args) => args,
        }),
      },
      maxSteps: 5,
    });

    return result.toDataStreamResponse();
  }),
});

export default http;
```

---

## 28) `convex/ai/runRouter.ts`

Main action entry point — dispatches to the right agent.

```ts
import { action } from "../_generated/server";
import { v } from "convex/values";
import { plannerRouterAgent, naiveRouteIntent } from "./agents/router";
import { financeCoachAgent } from "./agents/finance";
import { healthCoachAgent } from "./agents/health";
import { wellnessCoachAgent } from "./agents/wellness";
import { masterPlannerAgent } from "./agents/planner";
import { faithCoachAgent } from "./agents/faith";
import { spaceCoachAgent } from "./agents/space";
import { careerCoachAgent } from "./agents/career";
import { relationshipsCoachAgent } from "./agents/relationships";
import type { AIResponse, AIDomain } from "./types";

const domainAgentMap = {
  finance:       financeCoachAgent,
  health:        healthCoachAgent,
  wellness:      wellnessCoachAgent,
  faith:         faithCoachAgent,
  space:         spaceCoachAgent,
  career:        careerCoachAgent,
  relationships: relationshipsCoachAgent,
  productivity:  plannerRouterAgent,
};

export const runAI = action({
  args: {
    userMessage: v.string(),
    threadId: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<AIResponse> => {
    const route = naiveRouteIntent(args.userMessage);

    // Cross-domain or planning intent → master planner
    if (route.intent === "cross_domain" || route.intent === "plan") {
      const thread = args.threadId
        ? { threadId: args.threadId }
        : await masterPlannerAgent.createThread(ctx, {});

      const result = await masterPlannerAgent.generateText(ctx, thread, {
        prompt: `
User request: ${args.userMessage}
Detected domains: ${route.domains.join(", ")}
Provide an integrated response. Use tools to read current state before planning.
`,
      });

      return { type: "message", content: result.text, domains: route.domains };
    }

    // Single-domain → route to specialist agent
    if (route.domains.length === 1) {
      const domain = route.domains[0] as AIDomain;
      const agent = domainAgentMap[domain] ?? plannerRouterAgent;

      const thread = args.threadId
        ? { threadId: args.threadId }
        : await agent.createThread(ctx, {});

      const result = await agent.generateText(ctx, thread, { prompt: args.userMessage });

      return { type: "message", content: result.text, domains: [domain] };
    }

    // Multi-domain handoff → router agent
    const thread = args.threadId
      ? { threadId: args.threadId }
      : await plannerRouterAgent.createThread(ctx, {});

    const result = await plannerRouterAgent.generateText(ctx, thread, {
      prompt: `
User request: ${args.userMessage}
Domains involved: ${route.domains.join(", ")}
Help the user with an integrated response. Name any cross-domain signals you find.
`,
    });

    return { type: "message", content: result.text, domains: route.domains };
  },
});
```

---

## 29) `convex/ai/workflows/weeklyPlanner.ts`

Durable weekly planning workflow.

```ts
import { WorkflowManager } from "@convex-dev/workflow";
import { components } from "../_generated/api";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { masterPlannerAgent } from "../agents/planner";
import { financeCoachAgent } from "../agents/finance";
import { healthCoachAgent } from "../agents/health";
import { wellnessCoachAgent } from "../agents/wellness";
import { faithCoachAgent } from "../agents/faith";
import { v } from "convex/values";

export const workflow = new WorkflowManager(components.workflow);

export const weeklyPlannerWorkflow = workflow.define({
  args: { userId: v.string(), weekGoal: v.string() },
  handler: async (step, args) => {

    // Step 1: Gather domain reviews in parallel
    const [financeReview, healthReview, wellnessReview, faithReview] = await Promise.all([
      step.runAction(internal.ai.workflows.weeklyPlanner.domainReview, {
        userId: args.userId, domain: "finance",
        prompt: "Review finance state. What are constraints and priorities for the next 7 days?",
      }),
      step.runAction(internal.ai.workflows.weeklyPlanner.domainReview, {
        userId: args.userId, domain: "health",
        prompt: "Review health and energy state. What should the user protect or improve this week?",
      }),
      step.runAction(internal.ai.workflows.weeklyPlanner.domainReview, {
        userId: args.userId, domain: "wellness",
        prompt: "Review stress and mood patterns. What is the emotional bandwidth for this week?",
      }),
      step.runAction(internal.ai.workflows.weeklyPlanner.domainReview, {
        userId: args.userId, domain: "faith",
        prompt: "Review spiritual disciplines. What faith anchors should ground the week?",
      }),
    ]);

    // Step 2: Synthesize into a weekly plan
    const weeklyPlan = await step.runAction(
      internal.ai.workflows.weeklyPlanner.synthesizePlan,
      {
        userId: args.userId,
        weekGoal: args.weekGoal,
        financeReview,
        healthReview,
        wellnessReview,
        faithReview,
      }
    );

    return { ok: true, plan: weeklyPlan };
  },
});

export const domainReview = internalAction({
  args: { userId: v.string(), domain: v.string(), prompt: v.string() },
  handler: async (ctx, args) => {
    const agentMap: Record<string, any> = {
      finance: financeCoachAgent,
      health: healthCoachAgent,
      wellness: wellnessCoachAgent,
      faith: faithCoachAgent,
    };
    const agent = agentMap[args.domain] ?? masterPlannerAgent;
    const thread = await agent.createThread(ctx, { userId: args.userId });
    const result = await agent.generateText(ctx, thread, { prompt: args.prompt });
    return result.text;
  },
});

export const synthesizePlan = internalAction({
  args: {
    userId: v.string(),
    weekGoal: v.string(),
    financeReview: v.string(),
    healthReview: v.string(),
    wellnessReview: v.string(),
    faithReview: v.string(),
  },
  handler: async (ctx, args) => {
    const thread = await masterPlannerAgent.createThread(ctx, { userId: args.userId });
    const result = await masterPlannerAgent.generateText(ctx, thread, {
      prompt: `
Build a realistic weekly plan.

User's goal for the week: ${args.weekGoal}

Domain inputs:

FINANCE:
${args.financeReview}

HEALTH & ENERGY:
${args.healthReview}

WELLNESS & STRESS:
${args.wellnessReview}

FAITH & GROUNDING:
${args.faithReview}

Produce a day-by-day plan with:
- 1–3 priorities per day
- Energy pacing (no back-to-back heavy days)
- Faith anchors (prayer, gratitude, fasting if active)
- One cross-domain action that addresses multiple areas
- A realistic "minimum viable week" if energy is low
`,
    });
    return result.text;
  },
});
```

---

## 30) `convex/ai/workflows/monthlyReview.ts`

Monthly retrospective + next-month goal setting.

```ts
import { WorkflowManager } from "@convex-dev/workflow";
import { components, internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { masterPlannerAgent } from "../agents/planner";
import { v } from "convex/values";

export const workflow = new WorkflowManager(components.workflow);

export const monthlyReviewWorkflow = workflow.define({
  args: { userId: v.string(), month: v.string() },
  handler: async (step, args) => {

    const retrospective = await step.runAction(
      internal.ai.workflows.monthlyReview.buildRetrospective,
      { userId: args.userId, month: args.month }
    );

    const nextMonthPlan = await step.runAction(
      internal.ai.workflows.monthlyReview.buildNextMonthPlan,
      { userId: args.userId, retrospective }
    );

    return { ok: true, retrospective, nextMonthPlan };
  },
});

export const buildRetrospective = internalAction({
  args: { userId: v.string(), month: v.string() },
  handler: async (ctx, args) => {
    const thread = await masterPlannerAgent.createThread(ctx, { userId: args.userId });
    const result = await masterPlannerAgent.generateText(ctx, thread, {
      prompt: `
Gather all domain snapshots and reflect on the month of ${args.month}.

For each domain, answer:
1. What went well?
2. What struggled?
3. What cross-domain pattern was most significant?

Then identify the top 3 insights for next month.
`,
    });
    return result.text;
  },
});

export const buildNextMonthPlan = internalAction({
  args: { userId: v.string(), retrospective: v.string() },
  handler: async (ctx, args) => {
    const thread = await masterPlannerAgent.createThread(ctx, { userId: args.userId });
    const result = await masterPlannerAgent.generateText(ctx, thread, {
      prompt: `
Based on this retrospective, build a focused next-month plan:

${args.retrospective}

Produce:
- 1 primary theme for the month
- 3 domain priorities (not one per domain — pick what matters most)
- 2 cross-domain habits to anchor
- 1 thing to protect (not add to)
`,
    });
    return result.text;
  },
});
```

---

## 31) `convex/finance/ai.ts`

```ts
import { query } from "../_generated/server";

export const getFinanceSnapshotForAI = query({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("accounts").collect();
    const budgets = await ctx.db.query("budgets").collect();
    const recentTx = await ctx.db.query("transactions").order("desc").take(20);

    const totalBalance = accounts.reduce((s: number, a: any) => s + (a.balance ?? 0), 0);
    const budgetOverruns = budgets.filter((b: any) => (b.spent ?? 0) > (b.monthlyCap ?? 0)).length;
    const savingsRate = totalBalance > 0
      ? (accounts.filter((a: any) => a.type === "savings").reduce((s: number, a: any) => s + a.balance, 0)) / totalBalance
      : 0;

    return {
      domain: "finance",
      generatedAt: Date.now(),
      summary: {
        accountCount: accounts.length,
        totalBalance,
        budgetOverruns,
        savingsRate,
        recentTransactionCount: recentTx.length,
      },
      raw: { accounts, budgets, recentTransactions: recentTx },
    };
  },
});
```

---

## 32) `convex/health/ai.ts`

```ts
import { query } from "../_generated/server";

export const getHealthSnapshotForAI = query({
  args: {},
  handler: async (ctx) => {
    const recentWorkouts = await ctx.db.query("workouts").order("desc").take(14);
    const recentSleep = await ctx.db.query("sleepLogs").order("desc").take(14);
    const activeFast = await ctx.db.query("fastingWindows")
      .filter((q) => q.eq(q.field("active"), true)).first();

    const avgSleepHours = recentSleep.length > 0
      ? recentSleep.reduce((s: number, r: any) => s + (r.hours ?? 0), 0) / recentSleep.length
      : null;

    return {
      domain: "health",
      generatedAt: Date.now(),
      summary: {
        workoutsLast14Days: recentWorkouts.length,
        avgSleepHours,
        activeFastingWindow: activeFast ?? null,
      },
      raw: { recentWorkouts, recentSleep, activeFast },
    };
  },
});
```

---

## 33) `convex/wellness/ai.ts`

```ts
import { query } from "../_generated/server";

export const getWellnessSnapshotForAI = query({
  args: {},
  handler: async (ctx) => {
    const moodLogs = await ctx.db.query("moodLogs").order("desc").take(14);

    const avgMoodScore = moodLogs.length > 0
      ? moodLogs.reduce((s: number, m: any) => s + (m.mood ?? 0), 0) / moodLogs.length
      : null;
    const avgStressScore = moodLogs.length > 0
      ? moodLogs.reduce((s: number, m: any) => s + (m.stress ?? 0), 0) / moodLogs.length
      : null;

    return {
      domain: "wellness",
      generatedAt: Date.now(),
      summary: { avgMoodScore, avgStressScore, entryCount: moodLogs.length },
      raw: { moodLogs },
    };
  },
});
```

---

## 34) `convex/faith/ai.ts`

```ts
import { query } from "../_generated/server";

export const getFaithSnapshotForAI = query({
  args: {},
  handler: async (ctx) => {
    const prayers = await ctx.db.query("prayerLogs").order("desc").take(14);
    const devotionals = await ctx.db.query("devotionals").order("desc").take(7);
    const fasts = await ctx.db.query("faithFasts").order("desc").take(7);

    return {
      domain: "faith",
      generatedAt: Date.now(),
      summary: {
        prayersLast14Days: prayers.length,
        devotionalsLast7Days: devotionals.length,
        fastingFrequency: fasts.length,
      },
      raw: { prayers, devotionals, fasts },
    };
  },
});
```

---

## 35) `convex/space/ai.ts`

```ts
import { query } from "../_generated/server";

export const getSpaceSnapshotForAI = query({
  args: {},
  handler: async (ctx) => {
    const zone = await ctx.db.query("spaceZones").first(); // single-room model
    const upgrades = await ctx.db.query("spaceUpgrades")
      .filter((q) => q.eq(q.field("status"), "pending")).collect();

    return {
      domain: "space",
      generatedAt: Date.now(),
      summary: {
        disorderScore: zone?.disorderScore ?? null,
        pendingUpgrades: upgrades.length,
        lastResetAt: zone?.lastResetAt ?? null,
      },
      raw: { zone, pendingUpgrades: upgrades },
    };
  },
});
```

---

## 36) `convex/productivity/tasks.ts`

```ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createDraft = mutation({
  args: {
    title: v.string(),
    reason: v.optional(v.string()),
    domain: v.union(
      v.literal("finance"), v.literal("health"), v.literal("wellness"),
      v.literal("productivity"), v.literal("career"), v.literal("relationships"),
      v.literal("faith"), v.literal("space"),
    ),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    horizon: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"), v.literal("year"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      title: args.title,
      reason: args.reason,
      domain: args.domain,
      priority: args.priority ?? "medium",
      horizon: args.horizon ?? "week",
      status: "draft",
      createdAt: Date.now(),
    });
  },
});
```

---

## 37) `convex/productivity/planner.ts`

```ts
import { query } from "../_generated/server";

export const getWeekSnapshotForAI = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks")
      .filter((q) => q.neq(q.field("status"), "done")).take(30);
    const habits = await ctx.db.query("habits")
      .filter((q) => q.eq(q.field("active"), true)).collect();

    const tasksByDomain = tasks.reduce((acc: Record<string, number>, t: any) => {
      acc[t.domain] = (acc[t.domain] ?? 0) + 1;
      return acc;
    }, {});

    return {
      domain: "productivity",
      generatedAt: Date.now(),
      summary: {
        openTaskCount: tasks.length,
        activeHabitCount: habits.length,
        tasksByDomain,
      },
      raw: { tasks, habits },
    };
  },
});
```

---

## 38) Schema additions for AI layer

Add to `convex/schema.ts`:

```ts
// AI Memory
aiMemory: defineTable({
  userId: v.string(),
  domain: v.string(),
  key: v.string(),
  value: v.string(),
  confidence: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  updatedAt: v.number(),
})
  .index("by_user_domain", ["userId", "domain"])
  .index("by_user_key", ["userId", "key"]),

// Approval requests
approvalRequests: defineTable({
  userId: v.string(),
  requestId: v.string(),
  actions: v.array(v.object({
    toolName: v.string(),
    approvalMode: v.string(),
    args: v.any(),
    domain: v.string(),
    previewText: v.string(),
  })),
  status: v.union(
    v.literal("pending"), v.literal("approved"),
    v.literal("rejected"), v.literal("expired")
  ),
  createdAt: v.number(),
  expiresAt: v.number(),
  resolvedAt: v.optional(v.number()),
})
  .index("by_user_status", ["userId", "status"]),

// Mood logs (wellness)
moodLogs: defineTable({
  userId: v.string(),
  mood: v.number(),
  energy: v.number(),
  stress: v.optional(v.number()),
  notes: v.optional(v.string()),
  createdAt: v.number(),
}),

// Faith logs
prayerLogs: defineTable({
  userId: v.string(),
  type: v.string(),
  notes: v.optional(v.string()),
  createdAt: v.number(),
}),

faithFasts: defineTable({
  userId: v.string(),
  startAt: v.number(),
  endAt: v.optional(v.number()),
  isSpiritualFast: v.boolean(),
  notes: v.optional(v.string()),
}),

devotionals: defineTable({
  userId: v.string(),
  passage: v.string(),
  reflection: v.optional(v.string()),
  createdAt: v.number(),
}),

// Space
spaceZones: defineTable({
  userId: v.string(),
  name: v.string(),
  disorderScore: v.optional(v.number()),
  lastResetAt: v.optional(v.number()),
}),

spaceUpgrades: defineTable({
  userId: v.string(),
  title: v.string(),
  zone: v.string(),
  estimatedCost: v.optional(v.number()),
  priority: v.string(),
  status: v.union(v.literal("pending"), v.literal("done"), v.literal("deferred")),
  createdAt: v.number(),
}),
```

---

## 39) Cross-domain suggestion engine — how it works

```
┌─────────────────────────────────────────────────────────────┐
│                    CRON (daily / weekly)                    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              getAllSnapshotsForUser (parallel queries)       │
│  finance │ health │ wellness │ faith │ space │ career │ ...  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              detectCrossDomainSignals()  [rule-based]       │
│                                                             │
│  Low sleep + low mood    → health → wellness   [high]       │
│  Budget overruns + stress → finance → wellness [high]       │
│  Faith fast active        → faith → health     [low]        │
│  Stalled income + low savings → career → finance [medium]   │
│  High disorder score      → space → productivity [medium]   │
│  Low connection score     → relationships → wellness [high] │
└──────────────────────────────┬──────────────────────────────┘
                               │  signals[]
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              masterPlannerAgent.generateText()              │
│                                                             │
│  Input: signal list                                         │
│  Output: 3–5 PlanItems, each touching ≥ 2 domains          │
│  Stored in: userContext table for next AI read              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Client surfaces suggestion batch               │
│  User sees: card with title, domains, reason, approve/skip  │
└─────────────────────────────────────────────────────────────┘

Approval flow:
  auto      → applied immediately, no prompt
  confirm   → surfaces ApprovalRequest card, user taps confirm
  restricted → blocked, surfaced as "needs review" only
```

### Key cross-domain wiring

| Source domain | Target domain | Signal pattern | Bridge action |
|---|---|---|---|
| health (sleep) | wellness | avg sleep < 6h + low mood | Fixed sleep window before new tasks |
| finance | wellness | budget overruns + high stress | One-category spend audit |
| faith | health | active spiritual fast | Log as health fasting window |
| career | finance | stalled income + low savings | One income-growth action/week |
| space | wellness + productivity | high disorder score | 15-min daily desk reset |
| relationships | wellness | low connection score | One meaningful interaction/week |
| wellness | productivity | burnout pattern | Reduce task load, not add habits |
| faith | relationships | community engagement | Count faith community as connection |

---

*This document covers the complete AI layer for the Life OS. Next files to add: `convex/ai/aggregates.ts` (the unified snapshot query), `convex/crons.ts` additions for AI generation triggers, and client-side hooks for streaming and approval UI.*
```

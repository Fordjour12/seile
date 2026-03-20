# AI Onboarding System — Development Documentation

> 7-day first-run experience: the AI learns the user progressively and escalates from hardcoded defaults to bold, personalised suggestions.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [The 7-Day Arc](#2-the-7-day-arc)
3. [Convex Schema Design](#3-convex-schema-design)
4. [Activity System](#4-activity-system)
5. [Onboarding Questions](#5-onboarding-questions)
6. [Confidence Score Logic](#6-confidence-score-logic)
7. [Prompting Strategy by Confidence Level](#7-prompting-strategy-by-confidence-level)
8. [Signal Writing & Mutations](#8-signal-writing--mutations)
9. [Day-by-Day Activity Flow](#9-day-by-day-activity-flow)
10. [Building the AI Prompt Payload](#10-building-the-ai-prompt-payload)

---

## 1. System Overview

The first-run stage is a 7-day learning loop. The AI starts with almost no user context and uses a combination of hardcoded activities, onboarding answers, and passive behavioural signals to build a rich user profile. By Day 7, it has enough context to make proactive, bold suggestions and generate a personalised Week 2 plan.

### Core Principle

**Activities are the AI's controlled experiment.** On Days 1–2, every user gets the same activities and the AI watches what happens. On Day 3 it starts varying one activity per day, and the difference in engagement tells it far more than any onboarding question could.

### Three Phases

| Phase | Days | AI Behaviour | Data Source |
|-------|------|-------------|-------------|
| Seed | 1–2 | Hardcoded defaults, observe only | Onboarding answers + passive signals |
| Learn | 3–5 | Soft suggestions (1–2/day), tentative tone | Behaviour patterns + feedback |
| Act | 6–7 | Bold assignments, proactive restructuring | Full context, high confidence scores |

---

## 2. The 7-Day Arc

### Phase 1 — Days 1–2: Seed the model

Give the AI just enough to be useful. The onboarding form seeds a `userProfile` record immediately. Hardcoded activity templates are assigned based on `primaryGoal` and `energyPattern`. Passive signals start collecting right away — which items were tapped, how long was spent, what was skipped.

**Key rules:**
- No AI suggestions yet — only observation
- Every interaction writes a signal to the `signals` table
- `dayNumber` on the user record increments via a scheduled Convex action at midnight

### Phase 2 — Days 3–5: Small, safe suggestions

The AI frames suggestions as questions, not commands. Every accept/dismiss is a mutation to the `feedback` table and directly raises or lowers a `confidenceScore` per category.

**Key rules:**
- Suggestions framed as: "Would this be useful?" not "You should do this"
- Max 1–2 suggestions per day to keep signal clean
- `confidenceScore` rises per category independently — don't force uniform confidence

### Phase 3 — Days 6–7: Bold moves

Only make bold suggestions in categories where the confidence is earned. If the user barely engaged with fitness suggestions but heavily engaged with time-blocking ones, go bold only on the latter.

**Key rules:**
- Bold suggestions reference specific observed patterns
- AI proposes, doesn't just suggest: "Based on completing focus blocks 4/5 days — step up to 60 min"
- Day 7 generates a Week 2 plan from full context

---

## 3. Convex Schema Design

### Core User Tables

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  users: defineTable({
    clerkId: v.string(),
    createdAt: v.number(),
    dayNumber: v.number(),           // increments at midnight via scheduled action
  }).index("by_clerkId", ["clerkId"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    primaryGoal: v.string(),         // "productivity" | "wellbeing" | "habits" | "health"
    energyPattern: v.string(),       // "morning" | "afternoon" | "evening" | "variable"
    biggestBlocker: v.string(),      // "follow_through" | "distraction" | "overwhelm" | "energy"
    preferredStyle: v.string(),      // "gentle" | "direct" | "structured"
    commitmentLevel: v.string(),     // "light" | "moderate" | "committed"
    timezone: v.string(),
    seedAnswers: v.object({}),       // raw onboarding responses, flexible
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  signals: defineTable({
    userId: v.id("users"),
    category: v.string(),            // "focus" | "sleep" | "exercise" | "tasks" | "habits"
    action: v.string(),              // "viewed" | "started" | "completed" | "skipped" | "reflected"
    itemId: v.string(),              // activityAssignment ID or suggestion ID
    durationMs: v.optional(v.number()),
    metadata: v.optional(v.object({})),
    createdAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_userId_category", ["userId", "category"]),

  suggestions: defineTable({
    userId: v.id("users"),
    category: v.string(),
    content: v.string(),
    confidenceAtTime: v.number(),    // snapshot of score when generated
    phase: v.string(),               // "seed" | "learn" | "act"
    shownAt: v.number(),
  }).index("by_userId", ["userId"]),

  feedback: defineTable({
    suggestionId: v.id("suggestions"),
    userId: v.id("users"),
    verdict: v.string(),             // "accepted" | "dismissed" | "snoozed"
    reason: v.optional(v.string()), // optional free-text, e.g. "not relevant"
    createdAt: v.number(),
  }).index("by_suggestionId", ["suggestionId"])
    .index("by_userId", ["userId"]),

  confidenceScores: defineTable({
    userId: v.id("users"),
    category: v.string(),
    score: v.number(),               // 0–100
    signalCount: v.number(),
    acceptCount: v.number(),
    dismissCount: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_userId_category", ["userId", "category"]),

});
```

### Schema Design Decisions

- **`confidenceScores` is per-user per-category**, not a single score — the AI can be bold about time management while still cautious about sleep.
- **`signals.metadata` is a flexible object** — store anything from session time to scroll depth without schema migrations.
- **`suggestions.phase`** field lets you query which phase a suggestion was generated in — useful for later analytics.
- **`feedback.reason`** is optional but valuable — even a short "not relevant" teaches the model faster than a binary dismiss.

---

## 4. Activity System

Activities are the primary mechanism for data collection. They need their own tables because they are a first-class entity, not just a side effect of suggestions.

### Activity Tables

```typescript
// Add to convex/schema.ts

  activityTemplates: defineTable({
    title: v.string(),
    category: v.string(),            // "focus" | "sleep" | "exercise" | "reflection"
    difficulty: v.string(),          // "easy" | "medium" | "hard"
    source: v.string(),              // "hardcoded" | "ai_generated"
    durationMinutes: v.number(),
    instructions: v.string(),
    signalMap: v.object({}),         // maps action -> { category, action, weight }
    isHardcoded: v.boolean(),        // true = always available in seed phase
  }),

  activityAssignments: defineTable({
    userId: v.id("users"),
    templateId: v.id("activityTemplates"),
    dayNumber: v.number(),
    status: v.string(),              // "pending" | "completed" | "skipped"
    phase: v.string(),               // "seed" | "learn" | "act"
    assignedBy: v.string(),          // "system" | "ai"
    assignedAt: v.number(),
    dueAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_userId_day", ["userId", "dayNumber"]),

  activityEvents: defineTable({
    assignmentId: v.id("activityAssignments"),
    userId: v.id("users"),
    action: v.string(),              // "viewed" | "started" | "completed" | "skipped"
    elapsedMs: v.number(),
    metadata: v.optional(v.object({})),
    createdAt: v.number(),
  }).index("by_assignmentId", ["assignmentId"])
    .index("by_userId", ["userId"]),

  activityReflections: defineTable({
    assignmentId: v.id("activityAssignments"),
    userId: v.id("users"),
    difficultyRating: v.optional(v.number()),   // 1–5
    usefulnessRating: v.optional(v.number()),   // 1–5
    note: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_assignmentId", ["assignmentId"]),
```

### The `signalMap` Field

The `signalMap` on each template is the core of data-driven signal writing. It defines exactly which signals get written when a user interacts with an activity — no hardcoded logic per activity.

```typescript
// Example signalMap on a template
signalMap: {
  "started":    { category: "focus",   action: "started",   weight: 5  },
  "completed":  { category: "focus",   action: "completed", weight: 20 },
  "skipped":    { category: "focus",   action: "skipped",   weight: -5 },
  "reflected":  { category: "habits",  action: "reflected", weight: 10 },
}
```

When a user taps "done", the mutation looks up the template's `signalMap` and writes the right signal automatically.

### Hardcoded Template Pool (Days 1–2)

These templates are always available and assigned based on `primaryGoal` and `energyPattern`:

| Template | Category | Duration | Difficulty | Assigned When |
|----------|----------|----------|------------|---------------|
| Morning check-in | habits | 2 min | easy | Always |
| Write 3 priorities | focus | 5 min | easy | primaryGoal: productivity |
| Evening wind-down | sleep | 5 min | easy | Always |
| Focus block (25 min) | focus | 25 min | medium | energyPattern: morning/afternoon |
| Reflect on blocker | habits | 5 min | easy | Always (Day 2+) |
| Walk after lunch | exercise | 15 min | easy | primaryGoal: health/wellbeing |

---

## 5. Onboarding Questions

5 questions, each mapping to exactly one field in `userProfiles`. Options use conversational language on the front while storing clean enum values.

### Question Design

```typescript
const questions = [
  {
    key: "primaryGoal",
    title: "What brings you here?",
    hint: "Pick the one that feels most urgent right now.",
    options: [
      { label: "Get more done each day",   sub: "Focus, tasks, deep work", value: "productivity" },
      { label: "Feel less overwhelmed",     sub: "Stress, clarity, calm",   value: "wellbeing"    },
      { label: "Build better habits",       sub: "Consistency, routines",   value: "habits"       },
      { label: "Improve my health",         sub: "Sleep, movement, energy", value: "health"       },
    ]
  },
  {
    key: "energyPattern",
    title: "When do you feel sharpest?",
    hint: "This shapes when we suggest your hardest tasks.",
    options: [
      { label: "Morning — I peak before noon",  value: "morning"   },
      { label: "Afternoon — I warm up slowly",  value: "afternoon" },
      { label: "Evening — I come alive late",   value: "evening"   },
      { label: "It varies a lot",               value: "variable"  },
    ]
  },
  {
    key: "biggestBlocker",
    title: "What usually gets in the way?",
    hint: "Be honest — this is just for you.",
    options: [
      { label: "I start things but don't finish", value: "follow_through" },
      { label: "I get distracted easily",          value: "distraction"   },
      { label: "I don't know where to start",      value: "overwhelm"     },
      { label: "I run out of energy",              value: "energy"        },
    ]
  },
  {
    key: "preferredStyle",
    title: "How do you want to be coached?",
    hint: "This changes how we talk to you as you progress.",
    options: [
      { label: "Gentle nudges",      sub: "Low pressure, optional",     value: "gentle"     },
      { label: "Clear and direct",   sub: "Tell me what to do",         value: "direct"     },
      { label: "Structured plans",   sub: "Steps, schedules, systems",  value: "structured" },
    ]
  },
  {
    key: "commitmentLevel",
    title: "How much time can you give this?",
    hint: "Honest beats ambitious — we'll adapt either way.",
    options: [
      { label: "5–10 min/day",  value: "light"     },
      { label: "15–20 min/day", value: "moderate"  },
      { label: "30+ min/day",   value: "committed" },
    ]
  },
];
```

### Question Design Rules

- **Never ask about schedule or sleep time upfront** — that feels like a form. Let the AI infer it from signals.
- **`preferredStyle` is the highest-leverage field** — it shapes tone across every suggestion for 7 days. Put it last when the user is most invested.
- **`commitmentLevel`** drives how many activities are assigned per day and how long hardcoded defaults persist.
- **All options are single-select** — no multi-select in onboarding. Clean enums only.

### Writing to Convex on Completion

```typescript
// convex/mutations/completeOnboarding.ts
export const completeOnboarding = mutation({
  args: {
    userId: v.id("users"),
    answers: v.object({
      primaryGoal:      v.string(),
      energyPattern:    v.string(),
      biggestBlocker:   v.string(),
      preferredStyle:   v.string(),
      commitmentLevel:  v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("userProfiles", {
      userId: args.userId,
      ...args.answers,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      seedAnswers: args.answers,
      updatedAt: Date.now(),
    });

    // Assign Day 1 activities immediately
    await assignDayActivities(ctx, { userId: args.userId, dayNumber: 1, phase: "seed" });
  },
});
```

---

## 6. Confidence Score Logic

The confidence score is the gating mechanism for the entire system. It controls what kind of suggestion the AI makes and how assertive it should be.

### Score Formula

```typescript
// convex/lib/confidenceScore.ts

async function updateConfidenceScore(ctx, { userId, category, delta, verdict }) {
  const existing = await ctx.db
    .query("confidenceScores")
    .withIndex("by_userId_category", q =>
      q.eq("userId", userId).eq("category", category))
    .first();

  const base = existing ?? {
    score: 0, signalCount: 0, acceptCount: 0, dismissCount: 0
  };

  const newAccept  = verdict === "accepted"  ? base.acceptCount + 1  : base.acceptCount;
  const newDismiss = verdict === "dismissed" ? base.dismissCount + 1 : base.dismissCount;
  const newCount   = base.signalCount + 1;

  // Weighted score: raw delta + acceptance ratio bonus
  const acceptRatio = newCount > 0 ? newAccept / newCount : 0;
  const newScore = Math.min(100, Math.max(0,
    base.score + delta + (acceptRatio * 5)
  ));

  if (existing) {
    await ctx.db.patch(existing._id, {
      score: Math.round(newScore),
      signalCount: newCount,
      acceptCount: newAccept,
      dismissCount: newDismiss,
      updatedAt: Date.now(),
    });
  } else {
    await ctx.db.insert("confidenceScores", {
      userId, category,
      score: Math.round(Math.max(0, delta)),
      signalCount: 1,
      acceptCount: newAccept,
      dismissCount: newDismiss,
      updatedAt: Date.now(),
    });
  }
}
```

### Score Tiers

| Score Range | Tier | Behaviour |
|-------------|------|-----------|
| 0–30 | Observe | No personal suggestions. Universal framing only. |
| 31–55 | Suggest | 1–2 soft tentative suggestions. "I noticed… you might try…" |
| 56–79 | Recommend | Clear direct recommendations grounded in specific observations. |
| 80–100 | Act | Bold proactive changes. Propose, don't just suggest. |

### Recency Weighting

Early skips should not haunt the user forever. Apply a decay multiplier to signals older than 3 days:

```typescript
function getDecayedWeight(signal: Signal, baseWeight: number): number {
  const ageDays = (Date.now() - signal.createdAt) / (1000 * 60 * 60 * 24);
  const decay = ageDays > 3 ? Math.pow(0.85, ageDays - 3) : 1;
  return baseWeight * decay;
}
```

---

## 7. Prompting Strategy by Confidence Level

The confidence score is injected directly into the system prompt to modulate tone. The `buildSystemPrompt` function assembles context per category.

### Tier Prompt Fragments

```typescript
const TIERS = {
  observe: {
    range: [0, 30],
    promptFragment: `
Confidence level: LOW (score: {score})
You have very limited data about this user.
Do not make personal suggestions yet.
Instead, offer 1 gentle, universally applicable habit
framed as a question: "Many people find X helpful —
would this be relevant to you?"
Never reference their past behaviour.
    `.trim(),
  },

  suggest: {
    range: [31, 55],
    promptFragment: `
Confidence level: MODERATE (score: {score})
You have some behavioural signals. Make 1–2 soft,
tentative suggestions tied to observed patterns.
Frame as: "I noticed you tend to... so you might try..."
Always offer an opt-out: "Does this feel relevant?"
Avoid absolute language like "you should" or "you must".
    `.trim(),
  },

  recommend: {
    range: [56, 79],
    promptFragment: `
Confidence level: HIGH (score: {score})
You have consistent signal across multiple days.
Make clear, direct recommendations grounded in
specific observations. Explain your reasoning briefly:
"Based on how you've been engaging with X, I think Y
would work well for you because Z."
You can suggest 2–3 changes at once if they're related.
    `.trim(),
  },

  act: {
    range: [80, 100],
    promptFragment: `
Confidence level: VERY HIGH (score: {score})
You know this user's patterns well. Be proactive and
assertive. Suggest bold changes — restructuring
routines, dropping habits that aren't working,
introducing new challenges. Reference specific patterns:
"You've consistently done X — it's time to level up to Y."
Propose, don't just suggest. The user trusts you.
    `.trim(),
  },
};
```

### Building the Full System Prompt

```typescript
// convex/ai/buildPrompt.ts

export function buildSystemPrompt(
  profile: UserProfile,
  scores: ConfidenceScore[],
  recentSignals: Signal[],
  category: string
): string {
  const score   = scores.find(s => s.category === category)?.score ?? 0;
  const tier    = getTier(score);
  const signals = recentSignals.filter(s => s.category === category);

  return `
You are a personal coach helping the user achieve: ${profile.primaryGoal}.

USER CONTEXT:
- Energy pattern: ${profile.energyPattern}
- Biggest blocker: ${profile.biggestBlocker}
- Preferred coaching style: ${profile.preferredStyle}
- Commitment level: ${profile.commitmentLevel}
- Day ${profile.dayNumber} of onboarding

CATEGORY: ${category}
${tier.promptFragment.replace("{score}", String(score))}

RECENT SIGNALS (last 5 in this category):
${signals.slice(-5).map(s =>
  `- ${s.action} "${s.itemId}" (${s.durationMs ?? 0}ms elapsed)`
).join("\n")}

Respond with exactly one JSON object, nothing else:
{
  "content": "The suggestion text shown to the user",
  "reasoning": "Internal reasoning — not shown to user",
  "confidence": <number 0-100>
}
  `.trim();
}

function getTier(score: number) {
  if (score >= 80) return TIERS.act;
  if (score >= 56) return TIERS.recommend;
  if (score >= 31) return TIERS.suggest;
  return TIERS.observe;
}
```

---

## 8. Signal Writing & Mutations

### Recording an Activity Event

This mutation runs every time a user interacts with an activity. It is the engine that feeds confidence scores.

```typescript
// convex/mutations/recordActivityEvent.ts
export const recordActivityEvent = mutation({
  args: {
    assignmentId: v.id("activityAssignments"),
    action: v.string(),       // "started" | "completed" | "skipped" | "reflected"
    elapsedMs: v.optional(v.number()),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);
    const template   = await ctx.db.get(assignment.templateId);
    const signalDef  = template.signalMap[args.action];

    // 1. Write the raw event log
    await ctx.db.insert("activityEvents", {
      assignmentId: args.assignmentId,
      userId: assignment.userId,
      action: args.action,
      elapsedMs: args.elapsedMs ?? 0,
      metadata: args.metadata ?? {},
      createdAt: Date.now(),
    });

    // 2. Write the signal (the AI reads these)
    if (signalDef) {
      await ctx.db.insert("signals", {
        userId: assignment.userId,
        category: signalDef.category,
        action: signalDef.action,
        itemId: args.assignmentId,
        durationMs: args.elapsedMs,
        createdAt: Date.now(),
      });
    }

    // 3. Update confidence score for the relevant category
    if (signalDef) {
      await updateConfidenceScore(ctx, {
        userId: assignment.userId,
        category: signalDef.category,
        delta: signalDef.weight,
        verdict:
          args.action === "completed" ? "accepted"  :
          args.action === "skipped"   ? "dismissed" : null,
      });
    }

    // 4. Update assignment status
    if (args.action === "completed" || args.action === "skipped") {
      await ctx.db.patch(args.assignmentId, { status: args.action });
    }
  },
});
```

### Recording a Reflection

```typescript
// convex/mutations/recordReflection.ts
export const recordReflection = mutation({
  args: {
    assignmentId: v.id("activityAssignments"),
    difficultyRating: v.optional(v.number()),
    usefulnessRating: v.optional(v.number()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);

    await ctx.db.insert("activityReflections", {
      assignmentId: args.assignmentId,
      userId: assignment.userId,
      difficultyRating: args.difficultyRating,
      usefulnessRating: args.usefulnessRating,
      note: args.note,
      createdAt: Date.now(),
    });

    // A reflection event is high-value signal — write it explicitly
    await ctx.db.insert("signals", {
      userId: assignment.userId,
      category: "habits",
      action: "reflected",
      itemId: args.assignmentId,
      metadata: {
        difficulty:  args.difficultyRating,
        usefulness:  args.usefulnessRating,
      },
      createdAt: Date.now(),
    });

    // Boost confidence: reflection = high engagement
    await updateConfidenceScore(ctx, {
      userId: assignment.userId,
      category: "habits",
      delta: 10,
      verdict: "accepted",
    });
  },
});
```

---

## 9. Day-by-Day Activity Flow

### Overview

| Day | Phase | Activities | Source |
|-----|-------|------------|--------|
| 1 | Seed | Morning check-in, Write 3 priorities, Evening wind-down | Hardcoded |
| 2 | Seed | Morning check-in, Focus block, Reflect on blocker | Hardcoded, filtered by goal |
| 3 | Learn | Morning check-in, Write 3 priorities, + 1 soft AI pick | Mix |
| 4 | Learn | Morning check-in, + 2 soft AI picks (pattern-informed) | Mix |
| 5 | Learn | 3 soft AI picks — hardcoded fades out | Mostly AI |
| 6 | Act | Bold structured AI plan, 1–2 continuing habits | AI |
| 7 | Act | Full personalised stack + Week 2 plan | AI |

### Activity Assignment Logic

```typescript
// convex/lib/assignDayActivities.ts

export async function assignDayActivities(ctx, { userId, dayNumber, phase }) {
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_userId", q => q.eq("userId", userId))
    .first();

  const commitmentToCount = { light: 2, moderate: 3, committed: 4 };
  const targetCount = commitmentToCount[profile.commitmentLevel] ?? 3;

  if (phase === "seed") {
    // Pull hardcoded templates matching user's goal and energy
    const templates = await ctx.db
      .query("activityTemplates")
      .filter(q => q.eq(q.field("isHardcoded"), true))
      .collect();

    const filtered = templates
      .filter(t => matchesProfile(t, profile))
      .slice(0, targetCount);

    for (const template of filtered) {
      await ctx.db.insert("activityAssignments", {
        userId,
        templateId: template._id,
        dayNumber,
        status: "pending",
        phase: "seed",
        assignedBy: "system",
        assignedAt: Date.now(),
        dueAt: endOfDay(),
      });
    }
  }
  // For "learn" and "act" phases: call AI to generate assignments
  // using buildSystemPrompt() + current confidence scores
}

function matchesProfile(template, profile): boolean {
  // Always include universal templates
  if (template.category === "habits") return true;
  // Match by primary goal
  const goalMap = {
    productivity: ["focus", "tasks"],
    health:       ["exercise", "sleep"],
    wellbeing:    ["exercise", "habits"],
    habits:       ["habits", "focus"],
  };
  return (goalMap[profile.primaryGoal] ?? []).includes(template.category);
}
```

---

## 10. Building the AI Prompt Payload

This query assembles the full context object sent to the AI each day. It combines profile, scores, recent signals, and completed activities into a single payload.

```typescript
// convex/queries/getDailyAIContext.ts

export const getDailyAIContext = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const [profile, scores, recentSignals, recentAssignments] = await Promise.all([

      ctx.db.query("userProfiles")
        .withIndex("by_userId", q => q.eq("userId", args.userId))
        .first(),

      ctx.db.query("confidenceScores")
        .withIndex("by_userId", q => q.eq("userId", args.userId))
        .collect(),

      ctx.db.query("signals")
        .withIndex("by_userId", q => q.eq("userId", args.userId))
        .order("desc")
        .take(30),  // last 30 signals across all categories

      ctx.db.query("activityAssignments")
        .withIndex("by_userId", q => q.eq("userId", args.userId))
        .order("desc")
        .take(15),  // last 15 assignments
    ]);

    // Fetch reflections for recent assignments
    const reflections = await Promise.all(
      recentAssignments.map(a =>
        ctx.db.query("activityReflections")
          .withIndex("by_assignmentId", q => q.eq("assignmentId", a._id))
          .first()
      )
    );

    // Build per-category signal summary
    const categories = ["focus", "sleep", "exercise", "habits", "tasks"];
    const signalSummary = Object.fromEntries(
      categories.map(cat => {
        const catSignals = recentSignals.filter(s => s.category === cat);
        const score      = scores.find(s => s.category === cat);
        return [cat, {
          score:        score?.score ?? 0,
          signalCount:  score?.signalCount ?? 0,
          completions:  catSignals.filter(s => s.action === "completed").length,
          skips:        catSignals.filter(s => s.action === "skipped").length,
          avgDuration:  average(catSignals.map(s => s.durationMs ?? 0)),
        }];
      })
    );

    return {
      profile,
      signalSummary,
      rawSignals: recentSignals,
      assignments: recentAssignments.map((a, i) => ({
        ...a,
        reflection: reflections[i],
      })),
      readyForBoldSuggestions: scores.some(s => s.score >= 80),
      overallEngagement: average(scores.map(s => s.score)),
    };
  },
});

function average(nums: number[]): number {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}
```

### Using the Context in an Action

```typescript
// convex/actions/generateDailySuggestions.ts

export const generateDailySuggestions = action({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const context = await ctx.runQuery(api.queries.getDailyAIContext, {
      userId: args.userId
    });

    const suggestions = [];

    // Generate one suggestion per category where score >= 31
    for (const [category, summary] of Object.entries(context.signalSummary)) {
      if (summary.score < 31) continue;  // not enough signal yet

      const prompt = buildSystemPrompt(
        context.profile,
        Object.entries(context.signalSummary).map(([cat, s]) => ({
          category: cat, score: s.score
        })),
        context.rawSignals,
        category
      );

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content[0]?.text ?? "{}";

      try {
        const parsed = JSON.parse(text);
        suggestions.push({ category, ...parsed });

        // Store suggestion in Convex
        await ctx.runMutation(api.mutations.createSuggestion, {
          userId: args.userId,
          category,
          content: parsed.content,
          confidenceAtTime: summary.score,
          phase: context.profile.dayNumber <= 2 ? "seed" :
                 context.profile.dayNumber <= 5 ? "learn" : "act",
        });
      } catch (e) {
        console.error("Failed to parse suggestion for", category, e);
      }
    }

    return suggestions;
  },
});
```

---

## Appendix: Key Design Principles

1. **Activities are the AI's controlled experiment** — not just content for the user. Every activity is a probe that generates signal.

2. **Confidence is per-category** — avoid blending scores into a single number. The AI should be specific about where it's confident.

3. **Early skips don't define the user** — use recency decay so recent engagement outweighs old dismissals.

4. **Onboarding answers are a starting point, not ground truth** — the AI should update its model of the user based on behaviour, not just what they said on Day 1.

5. **`preferredStyle` drives tone, `commitmentLevel` drives volume** — keep these concerns separate.

6. **Reflections are worth double** — even a 1–5 rating after completing an activity doubles signal density for that category. Keep the reflection UI dead simple: three taps max.

7. **Phase gates are score-based, not day-based** — a highly engaged user might hit the "Act" phase by Day 5. A passive user might stay in "Learn" all week. Let confidence, not the calendar, decide.

---

*Document generated from design session — March 2026*

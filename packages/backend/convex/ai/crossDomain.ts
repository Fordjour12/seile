"use node";

import { z } from "zod";
import { v } from "convex/values";

import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import type { CrossDomainSignal, DomainSnapshot, PlanItem } from "./types";
import { masterPlannerAgent } from "./agents/planner";
import { createAiThread } from "./runtime";

export function detectCrossDomainSignals(
  snapshots: Record<string, DomainSnapshot>,
): CrossDomainSignal[] {
  const signals: CrossDomainSignal[] = [];
  const health = snapshots.health?.summary as any;
  const wellness = snapshots.wellness?.summary as any;
  const finance = snapshots.finance?.summary as any;
  const faith = snapshots.faith?.summary as any;
  const productivity = snapshots.productivity?.summary as any;

  if ((health?.sleepScore ?? 100) < 60 && (wellness?.avgStressScore ?? 0) >= 2.2) {
    signals.push({
      sourceDomain: "health",
      targetDomain: "wellness",
      signal: "Low sleep quality is showing up alongside elevated stress.",
      severity: "high",
      suggestedAction: "Protect sleep before adding new workload.",
    });
  }

  if ((finance?.activeDebtCount ?? 0) > 0 && (wellness?.latestBurnoutScore ?? 0) >= 60) {
    signals.push({
      sourceDomain: "finance",
      targetDomain: "wellness",
      signal: "Debt pressure is likely compounding burnout or stress load.",
      severity: "medium",
      suggestedAction: "Reduce one money stressor this week and lower total task load.",
    });
  }

  if ((faith?.activePracticeCount ?? 0) > 0 && (health?.recoveryRecommended ?? false)) {
    signals.push({
      sourceDomain: "faith",
      targetDomain: "health",
      signal: "Existing faith practices could be used as recovery anchors this week.",
      severity: "low",
      suggestedAction: "Pair prayer or scripture time with a lighter recovery block.",
    });
  }

  if ((health?.fatigueScore ?? 0) > 65 && (productivity?.openTaskCount ?? 0) > 8) {
    signals.push({
      sourceDomain: "health",
      targetDomain: "productivity",
      signal: "High fatigue is colliding with a heavy task backlog.",
      severity: "high",
      suggestedAction: "Cut scope before adding new tasks.",
    });
  }

  return signals;
}

const suggestionItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  domain: z.enum([
    "finance",
    "health",
    "wellness",
    "productivity",
    "career",
    "relationships",
    "faith",
    "space",
  ]),
  reason: z.string().optional(),
  horizon: z.enum(["day", "week", "month", "year"]),
  priority: z.enum(["low", "medium", "high"]),
  suggestedAt: z.number(),
  crossDomainLinks: z
    .array(
      z.enum([
        "finance",
        "health",
        "wellness",
        "productivity",
        "career",
        "relationships",
        "faith",
        "space",
      ]),
    )
    .optional(),
});

const suggestionBatchSchema = z.object({
  rationale: z.string().min(1),
  suggestions: z.array(suggestionItemSchema).min(0).max(5),
});

const internalApi = internal as unknown as Record<string, Record<string, any>>;

export const generateCrossDomainSuggestions = internalAction({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<{ signals: CrossDomainSignal[]; suggestions: PlanItem[] }> => {
    const snapshots = await ctx.runQuery(internalApi["ai/aggregates"].getAllSnapshotsForUser, {
      userId: args.userId,
    });
    const signals = detectCrossDomainSignals(snapshots);

    if (signals.length === 0) {
      return { signals: [], suggestions: [] };
    }

    const thread = await createAiThread(ctx, {
      userId: args.userId,
      title: "Cross-domain suggestions",
      summary: "Integrated Life OS suggestion batch",
    });

    const batch = await masterPlannerAgent.generateObject(ctx, { threadId: thread }, {
      prompt: [
        "Generate 3 to 5 integrated action suggestions.",
        "Each suggestion must touch at least two domains.",
        `Signals: ${JSON.stringify(signals)}`,
        `Snapshots: ${JSON.stringify(snapshots)}`,
      ].join("\n\n"),
      schema: suggestionBatchSchema,
    });

    return {
      signals,
      suggestions: batch.object.suggestions,
    };
  },
});

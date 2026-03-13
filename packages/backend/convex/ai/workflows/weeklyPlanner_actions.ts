"use node";

import { v } from "convex/values";

import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { faithCoachAgent } from "../agents/faith";
import { financeCoachAgent } from "../agents/finance";
import { healthCoachAgent } from "../agents/health";
import { masterPlannerAgent } from "../agents/planner";
import { wellnessCoachAgent } from "../agents/wellness";
import { createAiThread } from "../runtime";
import type { AIDomain } from "../types";

const internalApi = internal as unknown as Record<string, Record<string, any>>;

const weeklyReviewDomainValidator = v.union(
  v.literal("finance"),
  v.literal("health"),
  v.literal("wellness"),
  v.literal("faith"),
);

export const domainReview = internalAction({
  args: {
    userId: v.string(),
    domain: weeklyReviewDomainValidator,
    prompt: v.string(),
    snapshot: v.any(),
    crossDomainSignals: v.array(v.any()),
    weekStart: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const agent = getWeeklyReviewAgent(args.domain);
    const threadId = await createAiThread(ctx, {
      userId: args.userId,
      title: `${titleCase(args.domain)} weekly review ${args.weekStart}`,
      summary: `Weekly ${args.domain} review for Life OS planning.`,
    });

    const result = await agent.generateText(ctx, { threadId }, {
      prompt: [
        `Week starting: ${args.weekStart}`,
        args.prompt,
        `Domain snapshot: ${JSON.stringify(args.snapshot)}`,
        `Relevant cross-domain signals: ${JSON.stringify(args.crossDomainSignals)}`,
        "Respond with concrete constraints, risks, and one practical recommendation.",
        "Do not invent data that is missing from the snapshot.",
      ].join("\n\n"),
    });

    return result.text;
  },
});

export const synthesizePlan = internalAction({
  args: {
    userId: v.string(),
    weekGoal: v.string(),
    weekStart: v.string(),
    financeReview: v.string(),
    healthReview: v.string(),
    wellnessReview: v.string(),
    faithReview: v.string(),
    crossDomainSignals: v.array(v.any()),
    productivitySnapshot: v.any(),
  },
  handler: async (ctx, args): Promise<string> => {
    const threadId = await createAiThread(ctx, {
      userId: args.userId,
      title: `Integrated weekly plan ${args.weekStart}`,
      summary: "Cross-domain weekly planning workflow output.",
    });

    const result = await masterPlannerAgent.generateText(ctx, { threadId }, {
      prompt: [
        "Build a realistic weekly plan.",
        `Week starting: ${args.weekStart}`,
        `User goal for the week: ${args.weekGoal}`,
        `Productivity snapshot: ${JSON.stringify(args.productivitySnapshot)}`,
        `Cross-domain signals: ${JSON.stringify(args.crossDomainSignals)}`,
        "Finance review:",
        args.financeReview,
        "Health review:",
        args.healthReview,
        "Wellness review:",
        args.wellnessReview,
        "Faith review:",
        args.faithReview,
        [
          "Produce a practical week plan with:",
          "- 1 to 3 priorities per day",
          "- explicit pacing to avoid overload",
          "- one cross-domain action that solves more than one problem",
          "- one minimum viable week fallback if energy drops",
          "- a short note on what to avoid this week",
        ].join("\n"),
      ].join("\n\n"),
    });

    await ctx.runMutation(internalApi["ai/memory"].upsertMemoryForUserInternal, {
      userId: args.userId,
      domain: "productivity",
      key: buildWeeklyPlanMemoryKey(args.weekStart),
      value: result.text,
      confidence: "high",
    });

    return result.text;
  },
});

function getWeeklyReviewAgent(domain: "finance" | "health" | "wellness" | "faith") {
  switch (domain) {
    case "finance":
      return financeCoachAgent;
    case "health":
      return healthCoachAgent;
    case "wellness":
      return wellnessCoachAgent;
    case "faith":
      return faithCoachAgent;
  }
}

function buildWeeklyPlanMemoryKey(weekStart: string) {
  return `workflow/weekly-plan/${weekStart}`;
}

function titleCase(value: AIDomain) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

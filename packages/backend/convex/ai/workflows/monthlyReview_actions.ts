"use node";

import { v } from "convex/values";

import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { detectCrossDomainSignals } from "../crossDomain";
import { masterPlannerAgent } from "../agents/planner";
import { createAiThread } from "../runtime";

const internalApi = internal as unknown as Record<string, Record<string, any>>;

export const buildRetrospective = internalAction({
  args: {
    userId: v.string(),
    month: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const snapshots = await ctx.runQuery(internalApi["ai/aggregates"].getAllSnapshotsForUser, {
      userId: args.userId,
    });
    const crossDomainSignals = detectCrossDomainSignals(snapshots);
    const threadId = await createAiThread(ctx, {
      userId: args.userId,
      title: `Monthly retrospective ${args.month}`,
      summary: "Cross-domain monthly retrospective workflow output.",
    });

    const result = await masterPlannerAgent.generateText(ctx, { threadId }, {
      prompt: [
        `Build a monthly retrospective for ${args.month}.`,
        "Use the latest available domain snapshots as the current best view of the user's recent state.",
        "If the data does not support a claim, say that directly instead of inferring it as fact.",
        `Snapshots: ${JSON.stringify(snapshots)}`,
        `Cross-domain signals: ${JSON.stringify(crossDomainSignals)}`,
        [
          "Answer for each supported domain:",
          "1. What went well?",
          "2. What struggled?",
          "3. What cross-domain pattern mattered most?",
          "Then finish with the top 3 insights for next month.",
        ].join("\n"),
      ].join("\n\n"),
    });

    await ctx.runMutation(internalApi["ai/memory"].upsertMemoryForUserInternal, {
      userId: args.userId,
      domain: "productivity",
      key: buildMonthlyReviewMemoryKey(args.month),
      value: result.text,
      confidence: "medium",
    });

    return result.text;
  },
});

export const buildNextMonthPlan = internalAction({
  args: {
    userId: v.string(),
    retrospective: v.string(),
    planningMonth: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const snapshots = await ctx.runQuery(internalApi["ai/aggregates"].getAllSnapshotsForUser, {
      userId: args.userId,
    });
    const threadId = await createAiThread(ctx, {
      userId: args.userId,
      title: `Monthly plan ${args.planningMonth}`,
      summary: "Cross-domain next-month planning workflow output.",
    });

    const result = await masterPlannerAgent.generateText(ctx, { threadId }, {
      prompt: [
        `Based on this retrospective, build a focused plan for ${args.planningMonth}.`,
        args.retrospective,
        `Current snapshots: ${JSON.stringify(snapshots)}`,
        [
          "Produce:",
          "- 1 primary theme for the month",
          "- 3 domain priorities total",
          "- 2 cross-domain habits to anchor",
          "- 1 thing to protect instead of add to",
          "- a short warning about likely overload risk",
        ].join("\n"),
      ].join("\n\n"),
    });

    await ctx.runMutation(internalApi["ai/memory"].upsertMemoryForUserInternal, {
      userId: args.userId,
      domain: "productivity",
      key: buildMonthlyPlanMemoryKey(args.planningMonth),
      value: result.text,
      confidence: "medium",
    });

    return result.text;
  },
});

function buildMonthlyReviewMemoryKey(month: string) {
  return `workflow/monthly-review/${month}`;
}

function buildMonthlyPlanMemoryKey(month: string) {
  return `workflow/monthly-plan/${month}`;
}

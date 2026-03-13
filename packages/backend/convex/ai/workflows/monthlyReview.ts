import { v } from "convex/values";

import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { workflow } from "./manager";
import { env } from "@seile/env/backend";

const internalApi = internal as unknown as Record<string, Record<string, any>>;

export const monthlyReviewWorkflow = workflow.define({
  args: {
    userId: v.string(),
    month: v.string(),
    planningMonth: v.string(),
  },
  handler: async (
    step,
    args,
  ): Promise<{ ok: true; retrospective: string; nextMonthPlan: string }> => {
    const retrospective = await step.runAction(
      internalApi["ai/workflows/monthlyReview_actions"].buildRetrospective,
      { userId: args.userId, month: args.month },
    );

    const nextMonthPlan = await step.runAction(
      internalApi["ai/workflows/monthlyReview_actions"].buildNextMonthPlan,
      {
        userId: args.userId,
        retrospective,
        planningMonth: args.planningMonth,
      },
    );

    return { ok: true, retrospective, nextMonthPlan };
  },
});

export const startMonthlyReviewCycles = internalAction({
  args: {},
  handler: async (ctx) => {
    if (!env.OPENROUTER_API_KEY) {
      const keys = getMonthlyKeys();
      return { started: 0, skipped: 0, month: keys.reviewMonth, planningMonth: keys.planningMonth };
    }

    const states = await ctx.runQuery(internalApi["planner/queries"].listAgentEnabledStates, {});
    const { reviewMonth, planningMonth } = getMonthlyKeys();
    let started = 0;
    let skipped = 0;

    for (const state of states) {
      const existing = await ctx.runQuery(internalApi["ai/memory"].getMemoryEntryForUserKey, {
        userId: state.userId,
        key: buildMonthlyPlanMemoryKey(planningMonth),
      });
      if (existing) {
        skipped += 1;
        continue;
      }

      await workflow.start(ctx, internalApi["ai/workflows/monthlyReview"].monthlyReviewWorkflow, {
        userId: state.userId,
        month: reviewMonth,
        planningMonth,
      });
      started += 1;
    }

    return { started, skipped, month: reviewMonth, planningMonth };
  },
});

function buildMonthlyPlanMemoryKey(month: string) {
  return `workflow/monthly-plan/${month}`;
}

function getMonthlyKeys() {
  const now = new Date();
  const planningMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const previous = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const reviewMonth = `${previous.getUTCFullYear()}-${String(previous.getUTCMonth() + 1).padStart(2, "0")}`;

  return { reviewMonth, planningMonth };
}

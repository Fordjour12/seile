import { v } from "convex/values";

import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { workflow, workflowOnCompleteRef, workflowRef } from "./manager";
import { env } from "@seile/env/backend";

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
      internal.ai.workflows.monthlyReview_actions.buildRetrospective,
      { userId: args.userId, month: args.month },
    );

    const nextMonthPlan = await step.runAction(
      internal.ai.workflows.monthlyReview_actions.buildNextMonthPlan,
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
      return {
        started: 0,
        skipped: 0,
        failed: 0,
        month: keys.reviewMonth,
        planningMonth: keys.planningMonth,
      };
    }

    const states = await ctx.runQuery(
      internal.productivity.planner.queries.listAgentEnabledStates,
      {},
    );
    const { reviewMonth, planningMonth } = getMonthlyKeys();
    let started = 0;
    let skipped = 0;
    let failed = 0;

    for (const state of states) {
      const key = buildMonthlyPlanMemoryKey(planningMonth);
      const existing = await ctx.runQuery(internal.ai.memory.getMemoryEntryForUserKey, {
        userId: state.userId,
        key,
      });
      if (existing) {
        skipped += 1;
        continue;
      }

      const reservationValue = buildWorkflowReservationValue("monthly", key);
      const reservation = await ctx.runMutation(internal.ai.memory.reserveWorkflowMemoryKey, {
        userId: state.userId,
        domain: "productivity",
        key,
        reservationValue,
        confidence: "low",
      });

      if (!reservation.reserved) {
        skipped += 1;
        continue;
      }

      try {
        await workflow.start(ctx, workflowRef(monthlyReviewWorkflow), {
          userId: state.userId,
          month: reviewMonth,
          planningMonth,
        }, {
          onComplete: workflowOnCompleteRef(
            internal.ai.memory.finalizeWorkflowMemoryReservation,
          ),
          context: {
            userId: state.userId,
            key,
            reservationValue,
          },
        });
        started += 1;
      } catch (error) {
        failed += 1;
        console.error("Monthly review workflow start failed", {
          userId: state.userId,
          planningMonth,
          message: error instanceof Error ? error.message : String(error),
        });
        try {
          await ctx.runMutation(internal.ai.memory.releaseWorkflowMemoryReservation, {
            userId: state.userId,
            key,
            reservationValue,
          });
        } catch (releaseError) {
          console.error("Failed to release monthly review reservation", {
            userId: state.userId,
            planningMonth,
            message: releaseError instanceof Error ? releaseError.message : String(releaseError),
          });
        }
      }
    }

    return { started, skipped, failed, month: reviewMonth, planningMonth };
  },
});

function buildMonthlyPlanMemoryKey(month: string) {
  return `workflow/monthly-plan/${month}`;
}

function buildWorkflowReservationValue(kind: "weekly" | "monthly", key: string) {
  return `reservation:${kind}:${key}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}

function getMonthlyKeys() {
  const now = new Date();
  const planningMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const previous = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const reviewMonth = `${previous.getUTCFullYear()}-${String(previous.getUTCMonth() + 1).padStart(2, "0")}`;

  return { reviewMonth, planningMonth };
}

import { v } from "convex/values";

import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { getWeekWindow, isoDateFromTimestamp } from "../../lib/planner";
import { detectCrossDomainSignals } from "../crossDomain";
import { workflow, workflowOnCompleteRef, workflowRef } from "./manager";
import { env } from "@seile/env/backend";

export const weeklyPlannerWorkflow = workflow.define({
  args: {
    userId: v.string(),
    weekGoal: v.string(),
    weekStart: v.string(),
  },
  handler: async (
    step,
    args,
  ): Promise<{ ok: true; plan: string; startedForWeek: string }> => {
    const snapshots = await step.runQuery(internal.ai.aggregates.getAllSnapshotsForUser, {
      userId: args.userId,
    });
    const crossDomainSignals = detectCrossDomainSignals(snapshots);

    const [financeReview, healthReview, wellnessReview, faithReview] = await Promise.all([
      step.runAction(internal.ai.workflows.weeklyPlanner_actions.domainReview, {
        userId: args.userId,
        domain: "finance",
        prompt:
          "Review finance state. What constraints and priorities should shape the next 7 days?",
        snapshot: snapshots.finance,
        crossDomainSignals,
        weekStart: args.weekStart,
      }),
      step.runAction(internal.ai.workflows.weeklyPlanner_actions.domainReview, {
        userId: args.userId,
        domain: "health",
        prompt:
          "Review health and energy state. What should the user protect, reduce, or improve this week?",
        snapshot: snapshots.health,
        crossDomainSignals,
        weekStart: args.weekStart,
      }),
      step.runAction(internal.ai.workflows.weeklyPlanner_actions.domainReview, {
        userId: args.userId,
        domain: "wellness",
        prompt:
          "Review stress, burnout, and emotional bandwidth. What load is realistic this week?",
        snapshot: snapshots.wellness,
        crossDomainSignals,
        weekStart: args.weekStart,
      }),
      step.runAction(internal.ai.workflows.weeklyPlanner_actions.domainReview, {
        userId: args.userId,
        domain: "faith",
        prompt:
          "Review spiritual disciplines and anchors. What faith rhythms should stabilize this week?",
        snapshot: snapshots.faith,
        crossDomainSignals,
        weekStart: args.weekStart,
      }),
    ]);

    const weeklyPlan = await step.runAction(
      internal.ai.workflows.weeklyPlanner_actions.synthesizePlan,
      {
        userId: args.userId,
        weekGoal: args.weekGoal,
        weekStart: args.weekStart,
        financeReview,
        healthReview,
        wellnessReview,
        faithReview,
        crossDomainSignals,
        productivitySnapshot: snapshots.productivity,
      },
    );

    return { ok: true, plan: weeklyPlan, startedForWeek: args.weekStart };
  },
});

export const startWeeklyPlannerCycles = internalAction({
  args: {},
  handler: async (ctx) => {
    if (!env.OPENROUTER_API_KEY) {
      return { started: 0, skipped: 0, failed: 0, weekStart: getCurrentWeekStart() };
    }

    const states = await ctx.runQuery(
      internal.productivity.planner.queries.listAgentEnabledStates,
      {},
    );
    const weekStart = getCurrentWeekStart();
    let started = 0;
    let skipped = 0;
    let failed = 0;

    for (const state of states) {
      const key = buildWeeklyPlanMemoryKey(weekStart);
      const existing = await ctx.runQuery(internal.ai.memory.getMemoryEntryForUserKey, {
        userId: state.userId,
        key,
      });
      if (existing) {
        skipped += 1;
        continue;
      }

      const reservationValue = buildWorkflowReservationValue("weekly", key);
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
        const weekGoal = await buildWeeklyGoal(ctx, state.userId, weekStart);
        await workflow.start(ctx, workflowRef(weeklyPlannerWorkflow), {
          userId: state.userId,
          weekGoal,
          weekStart,
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
        console.error("Weekly planner workflow start failed", {
          userId: state.userId,
          weekStart,
          message: error instanceof Error ? error.message : String(error),
        });
        try {
          await ctx.runMutation(internal.ai.memory.releaseWorkflowMemoryReservation, {
            userId: state.userId,
            key,
            reservationValue,
          });
        } catch (releaseError) {
          console.error("Failed to release weekly planner reservation", {
            userId: state.userId,
            weekStart,
            message: releaseError instanceof Error ? releaseError.message : String(releaseError),
          });
        }
      }
    }

    return { started, skipped, failed, weekStart };
  },
});

async function buildWeeklyGoal(ctx: any, userId: string, weekStart: string) {
  const context = await ctx.runQuery(
    internal.productivity.planner.queries.getPlannerAgentContext,
    {
      userId,
      weekStart,
    },
  );
  const topGoals = (context.goals ?? [])
    .slice(0, 3)
    .map((goal: { title: string }) => goal.title)
    .filter(Boolean);

  if (topGoals.length > 0) {
    return `Keep the week realistic while advancing: ${topGoals.join(", ")}.`;
  }

  return "Build a stable and realistic week around current obligations, recovery, and consistency.";
}

function buildWeeklyPlanMemoryKey(weekStart: string) {
  return `workflow/weekly-plan/${weekStart}`;
}

function buildWorkflowReservationValue(kind: "weekly" | "monthly", key: string) {
  return `reservation:${kind}:${key}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}

function getCurrentWeekStart() {
  return getWeekWindow(isoDateFromTimestamp(Date.now())).startDate;
}

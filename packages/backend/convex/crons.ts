import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();
const plannerActions = internal.productivity.planner.actions;
const weeklyPlannerWorkflow = internal.ai.workflows.weeklyPlanner;
const monthlyReviewWorkflow = internal.ai.workflows.monthlyReview;

if (process.env.NODE_ENV !== "production") {
  const requiredPlannerActions = [
    "runWeeklyReviewCycle",
    "runWeeklyPlanningCycle",
    "runMidweekAdjustmentCycle",
    "runBurnoutMonitoringCycle",
  ] as const;

  for (const actionName of requiredPlannerActions) {
    if (!plannerActions?.[actionName]) {
      throw new Error(
        `Missing planner internal action: productivity/planner/actions.${actionName}`,
      );
    }
  }

  if (!weeklyPlannerWorkflow?.startWeeklyPlannerCycles) {
    throw new Error(
      "Missing AI workflow internal action: ai/workflows/weeklyPlanner.startWeeklyPlannerCycles",
    );
  }

  if (!monthlyReviewWorkflow?.startMonthlyReviewCycles) {
    throw new Error(
      "Missing AI workflow internal action: ai/workflows/monthlyReview.startMonthlyReviewCycles",
    );
  }
}

crons.interval(
  "generate-recurring-transactions",
  { hours: 1 },
  internal.finance.recurring.generate.generateDueRecurringTransactions,
  {},
);

crons.daily(
  "check-subscription-trials",
  { hourUTC: 8, minuteUTC: 0 },
  internal.finance.subscriptions.mutations.checkTrialExpirations,
  {},
);

crons.cron(
  "planner-weekly-review",
  "0 18 * * 0",
  plannerActions.runWeeklyReviewCycle,
  {},
);

crons.cron(
  "planner-next-week-draft",
  "0 7 * * 1",
  plannerActions.runWeeklyPlanningCycle,
  {},
);

crons.cron(
  "planner-midweek-adjustment",
  "0 12 * * 3",
  plannerActions.runMidweekAdjustmentCycle,
  {},
);

crons.interval(
  "planner-burnout-monitor",
  { hours: 6 },
  plannerActions.runBurnoutMonitoringCycle,
  {},
);

crons.cron(
  "ai-weekly-planner",
  "0 6 * * 1",
  weeklyPlannerWorkflow.startWeeklyPlannerCycles,
  {},
);

crons.cron(
  "ai-monthly-review",
  "15 6 1 * *",
  monthlyReviewWorkflow.startMonthlyReviewCycles,
  {},
);

export default crons;

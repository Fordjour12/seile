import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();
const plannerInternal = internal as unknown as Record<string, Record<string, any>>;

if (process.env.NODE_ENV !== "production") {
  const requiredPlannerActions = [
    "runWeeklyReviewCycle",
    "runWeeklyPlanningCycle",
    "runMidweekAdjustmentCycle",
    "runBurnoutMonitoringCycle",
  ] as const;
  const plannerActions = plannerInternal["planner/actions"];

  for (const actionName of requiredPlannerActions) {
    if (!plannerActions?.[actionName]) {
      throw new Error(`Missing planner internal action: planner/actions.${actionName}`);
    }
  }
}

crons.interval(
  "generate-recurring-transactions",
  { hours: 1 },
  internal.recurring.generate.generateDueRecurringTransactions,
  {},
);

crons.daily(
  "check-subscription-trials",
  { hourUTC: 8, minuteUTC: 0 },
  internal.subscriptions.mutations.checkTrialExpirations,
  {},
);

crons.cron(
  "planner-weekly-review",
  "0 18 * * 0",
  plannerInternal["planner/actions"].runWeeklyReviewCycle,
  {},
);

crons.cron(
  "planner-next-week-draft",
  "0 7 * * 1",
  plannerInternal["planner/actions"].runWeeklyPlanningCycle,
  {},
);

crons.cron(
  "planner-midweek-adjustment",
  "0 12 * * 3",
  plannerInternal["planner/actions"].runMidweekAdjustmentCycle,
  {},
);

crons.interval(
  "planner-burnout-monitor",
  { hours: 6 },
  plannerInternal["planner/actions"].runBurnoutMonitoringCycle,
  {},
);

export default crons;

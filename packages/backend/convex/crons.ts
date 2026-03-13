import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();
const internalApi = internal as unknown as Record<string, Record<string, any>>;
const plannerInternal = internalApi;
const aiWorkflowInternal = internalApi;

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

  const requiredAiWorkflowActions = [
    ["ai/workflows/weeklyPlanner", "startWeeklyPlannerCycles"],
    ["ai/workflows/monthlyReview", "startMonthlyReviewCycles"],
  ] as const;

  for (const [moduleName, actionName] of requiredAiWorkflowActions) {
    if (!aiWorkflowInternal[moduleName]?.[actionName]) {
      throw new Error(`Missing AI workflow internal action: ${moduleName}.${actionName}`);
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

crons.cron(
  "ai-weekly-planner",
  "0 6 * * 1",
  aiWorkflowInternal["ai/workflows/weeklyPlanner"].startWeeklyPlannerCycles,
  {},
);

crons.cron(
  "ai-monthly-review",
  "15 6 1 * *",
  aiWorkflowInternal["ai/workflows/monthlyReview"].startMonthlyReviewCycles,
  {},
);

export default crons;

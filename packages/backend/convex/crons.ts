import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

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

export default crons;

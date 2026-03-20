import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "advance ai onboarding days",
  { hours: 1 },
  internal.onboarding.advanceEligibleFirstRunDays,
  {},
);

export default crons;

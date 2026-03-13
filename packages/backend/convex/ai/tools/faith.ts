import { api } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";

const apiAny = api as any;

export async function getFaithSnapshot(ctx: ActionCtx) {
  const dashboard = await ctx.runQuery(apiAny["spiritual/queries"].getSpiritualDashboard, {});
  return {
    summary: dashboard.summary,
    planner: dashboard.planner,
    goals: dashboard.goals.slice(0, 6),
    practices: dashboard.practices.slice(0, 6),
    prayers: dashboard.prayers.slice(0, 6),
    reflections: dashboard.reflections.slice(0, 4),
  };
}


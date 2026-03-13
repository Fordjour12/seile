import { api } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";

const apiAny = api as any;

export async function getHealthSnapshot(ctx: ActionCtx) {
  return await ctx.runQuery(apiAny["health/queries"].getHealthDashboard, {});
}


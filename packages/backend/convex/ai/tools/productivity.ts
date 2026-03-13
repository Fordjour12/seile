import { api, internal } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";

const apiAny = api as any;
const internalApi = internal as unknown as Record<string, Record<string, any>>;

export async function getProductivitySnapshot(ctx: ActionCtx, userId: string) {
  const [summary, plannerContext] = await Promise.all([
    ctx.runQuery(apiAny["scheduler/queries"].getSchedulerSummary, {}),
    ctx.runQuery(internalApi["planner/queries"].getPlannerAgentContext, { userId }),
  ]);

  return {
    scheduler: summary,
    planning: {
      openTasks: plannerContext.openTasks.slice(0, 10),
      habits: plannerContext.habits.slice(0, 8),
      goals: plannerContext.goals.slice(0, 8),
    },
  };
}


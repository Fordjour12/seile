import type { ActionCtx } from "../../_generated/server";
import { getPlannerContext } from "./shared";

export async function getWellnessSnapshot(ctx: ActionCtx, userId: string) {
  const plannerContext = await getPlannerContext(ctx, { userId });
  return {
    burnout: plannerContext.agentState
      ? {
          score: plannerContext.agentState.burnoutScore,
          state: plannerContext.agentState.burnoutState,
        }
      : null,
    latestReview: plannerContext.latestReview,
    health: plannerContext.health,
    currentPlanWarnings: plannerContext.currentPlan?.warnings ?? [],
    openTasks: plannerContext.openTasks.length,
  };
}


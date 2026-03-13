import { internal } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";

const internalApi = internal as unknown as Record<string, Record<string, any>>;

export async function getFinanceSnapshot(ctx: ActionCtx, userId: string) {
  return await ctx.runQuery(internalApi["finance_agent/queries"].getFinanceAgentContext, {
    userId,
  });
}


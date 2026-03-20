import { query } from "../_generated/server";

import { buildFinanceSnapshot } from "../ai/aggregates";
import { requireUserId } from "../lib/identity";

export const getFinanceSnapshotForAI = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await buildFinanceSnapshot(ctx, userId);
  },
});

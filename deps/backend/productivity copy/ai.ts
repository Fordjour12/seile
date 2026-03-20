import { query } from "../_generated/server";

import { buildProductivitySnapshot } from "../ai/aggregates";
import { requireUserId } from "../lib/identity";

export const getWeekSnapshotForAI = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await buildProductivitySnapshot(ctx, userId);
  },
});

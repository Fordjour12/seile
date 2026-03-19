import { query } from "../_generated/server";

import { buildWellnessSnapshot } from "../ai/aggregates";
import { requireUserId } from "../lib/identity";

export const getWellnessSnapshotForAI = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await buildWellnessSnapshot(ctx, userId);
  },
});

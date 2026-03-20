import { query } from "../_generated/server";

import { buildFaithSnapshot } from "../ai/aggregates";
import { requireUserId } from "../lib/identity";

export const getFaithSnapshotForAI = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await buildFaithSnapshot(ctx, userId);
  },
});

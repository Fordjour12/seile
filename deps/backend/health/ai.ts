import { query } from "../_generated/server";

import { buildHealthSnapshot } from "../ai/aggregates";
import { requireUserId } from "../lib/identity";

export const getHealthSnapshotForAI = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await buildHealthSnapshot(ctx, userId);
  },
});

import { query } from "../_generated/server";

import { requireUserId } from "../lib/identity";

export const getRelationshipsSnapshotForAI = query({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);

    return {
      domain: "relationships" as const,
      generatedAt: Date.now(),
      summary: {
        available: false,
        reason:
          "Relationships is recognized in the AI layer but has no live backend model in this build.",
      },
      raw: {},
    };
  },
});

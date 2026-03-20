import { query } from "../_generated/server";

import { requireUserId } from "../lib/identity";

export const getSpaceSnapshotForAI = query({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);

    return {
      domain: "space" as const,
      generatedAt: Date.now(),
      summary: {
        available: false,
        reason: "Space is recognized in the AI layer but has no live backend model in this build.",
      },
      raw: {},
    };
  },
});

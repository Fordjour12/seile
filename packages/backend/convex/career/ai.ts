import { query } from "../_generated/server";

import { requireUserId } from "../lib/identity";

export const getCareerSnapshotForAI = query({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);

    return {
      domain: "career" as const,
      generatedAt: Date.now(),
      summary: {
        available: false,
        reason: "Career is recognized in the AI layer but has no live backend model in this build.",
      },
      raw: {},
    };
  },
});

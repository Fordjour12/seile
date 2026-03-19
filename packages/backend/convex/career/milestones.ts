import { ConvexError, v } from "convex/values";

import { mutation } from "../_generated/server";
import { requireUserId } from "../lib/identity";

export const create = mutation({
  args: {
    title: v.string(),
    category: v.union(
      v.literal("skill"),
      v.literal("project"),
      v.literal("networking"),
      v.literal("financial"),
      v.literal("other"),
    ),
    targetDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx);

    throw new ConvexError({
      code: "NOT_IMPLEMENTED",
      message:
        "Career milestones are documented but not yet backed by a live backend model.",
      args,
    });
  },
});

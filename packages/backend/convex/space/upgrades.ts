import { ConvexError, v } from "convex/values";

import { mutation } from "../_generated/server";
import { requireUserId } from "../lib/identity";

export const create = mutation({
  args: {
    title: v.string(),
    zone: v.string(),
    estimatedCost: v.optional(v.number()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx);

    throw new ConvexError({
      code: "NOT_IMPLEMENTED",
      message:
        "Space upgrades are documented but not yet backed by a live backend model.",
      args,
    });
  },
});

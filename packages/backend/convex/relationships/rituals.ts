import { ConvexError, v } from "convex/values";

import { mutation } from "../_generated/server";
import { requireUserId } from "../lib/identity";

export const create = mutation({
  args: {
    title: v.string(),
    contactName: v.optional(v.string()),
    frequency: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx);

    throw new ConvexError({
      code: "NOT_IMPLEMENTED",
      message:
        "Relationship rituals are documented but not yet backed by a live backend model.",
      args,
    });
  },
});

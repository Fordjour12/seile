import type { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { requireUserId } from "../lib/identity";

export const listCategories = query({
  args: {},
  handler: async (ctx): Promise<Doc<"categories">[]> => {
    const userId = await requireUserId(ctx);
    return ctx.db
      .query("categories")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
  },
});

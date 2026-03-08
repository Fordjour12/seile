import type { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { resolveSystemUserId } from "../lib/security";

export const listCategories = query({
  args: {},
  handler: async (ctx): Promise<Doc<"categories">[]> => {
    return ctx.db
      .query("categories")
      .withIndex("by_userId", (q) => q.eq("userId", resolveSystemUserId()))
      .order("asc")
      .collect();
  },
});

import { query } from "../_generated/server";
import { requireUserId } from "../lib/identity";

export const listSharedGoals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const goals = await ctx.db
      .query("sharedGoals")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return goals.sort((left, right) => {
      const priorityDelta = priorityScore(right.priority) - priorityScore(left.priority);
      if (priorityDelta !== 0) return priorityDelta;
      return right.updatedAt - left.updatedAt;
    });
  },
});

function priorityScore(priority: "low" | "medium" | "high") {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

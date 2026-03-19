import { ConvexError, v } from "convex/values";

import type { Doc } from "../_generated/dataModel";
import { mutation } from "../_generated/server";
import { requireUserId } from "../lib/identity";
import { aiDomainValidator } from "../schema/ai";
import {
  planningHorizonValidator,
  planningPriorityValidator,
} from "../schema/planner";
import { createPlannerSharedGoal } from "../shared_goals/helpers";

export const createDraft = mutation({
  args: {
    title: v.string(),
    reason: v.optional(v.string()),
    domain: v.optional(aiDomainValidator),
    priority: v.optional(planningPriorityValidator),
    horizon: v.optional(planningHorizonValidator),
  },
  handler: async (ctx, args): Promise<Doc<"planningTasks">> => {
    const userId = await requireUserId(ctx);
    const title = args.title.trim();
    if (!title) {
      throw new ConvexError("Validation: task title is required");
    }

    const priority = args.priority ?? "medium";
    const domain = args.domain ?? "productivity";
    const horizon = args.horizon ?? "week";
    const reason = args.reason?.trim();
    const shouldCreateLinkedGoal =
      Boolean(reason) || domain !== "productivity" || horizon !== "week";

    const sharedGoal = shouldCreateLinkedGoal
      ? await createPlannerSharedGoal(ctx, {
          userId,
          title,
          description: reason,
          domain,
          horizon,
          priority,
        })
      : null;

    const now = Date.now();
    const id = await ctx.db.insert("planningTasks", {
      userId,
      title,
      dueDate: undefined,
      priority,
      status: "pending",
      linkedGoalId: undefined,
      sharedGoalId: sharedGoal?._id,
      createdAt: now,
      updatedAt: now,
    });

    const created = await ctx.db.get(id);
    if (!created) {
      throw new ConvexError("Failed to create productivity draft task");
    }

    return created;
  },
});

import { ConvexError, v } from "convex/values";

import { mutation } from "../_generated/server";
import { requireUserId } from "../lib/identity";
import {
  createPlannerSharedGoal,
  requireOwnedSharedGoal,
  updateSharedGoalRecord,
} from "./helpers";

export const createSharedGoal = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    domain: v.optional(v.string()),
    horizon: v.union(
      v.literal("year"),
      v.literal("month"),
      v.literal("week"),
      v.literal("day"),
    ),
    targetDate: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await createPlannerSharedGoal(ctx, {
      userId,
      title: args.title,
      description: args.description,
      domain: args.domain ?? "general",
      horizon: args.horizon,
      targetDate: args.targetDate,
      priority: args.priority,
    });
  },
});

export const updateSharedGoal = mutation({
  args: {
    id: v.id("sharedGoals"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    domain: v.optional(v.string()),
    horizon: v.optional(
      v.union(
        v.literal("year"),
        v.literal("month"),
        v.literal("week"),
        v.literal("day"),
      ),
    ),
    targetDate: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("completed"),
        v.literal("archived"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await requireOwnedSharedGoal(ctx, userId, args.id);
    return await updateSharedGoalRecord(ctx, args.id, {
      title: args.title,
      description: args.description,
      domain: args.domain,
      horizon: args.horizon,
      targetDate: args.targetDate,
      priority: args.priority,
      status: args.status,
    });
  },
});

export const archiveSharedGoal = mutation({
  args: {
    id: v.id("sharedGoals"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const goal = await requireOwnedSharedGoal(ctx, userId, args.id);
    if (goal.status === "archived") {
      return goal;
    }

    return await updateSharedGoalRecord(ctx, args.id, {
      status: "archived",
    });
  },
});

export const createFinanceLinkedGoal = mutation({
  args: {},
  handler: async () => {
    throw new ConvexError(
      "NotImplemented: finance-linked goal creation is handled by finance domain mutations.",
    );
  },
});

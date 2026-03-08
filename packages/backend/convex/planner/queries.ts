import { v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import { query, type QueryCtx } from "../_generated/server";
import { getWeekWindow, isoDateFromTimestamp } from "../lib/planner";
import { requireUserId } from "../lib/identity";

export const getPlannerDashboard = query({
  args: {
    weekStart: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const week = getWeekWindow(args.weekStart ?? isoDateFromTimestamp(Date.now()));
    const [profile, agentState, goals, tasks, habits, plans, reviews] = await Promise.all([
      ctx.db.query("plannerProfiles").withIndex("by_userId", (q) => q.eq("userId", userId)).first(),
      ctx.db.query("plannerAgentState").withIndex("by_userId", (q) => q.eq("userId", userId)).first(),
      ctx.db
        .query("planningGoals")
        .withIndex("by_userId_active", (q) => q.eq("userId", userId).eq("active", true))
        .collect(),
      ctx.db
        .query("planningTasks")
        .withIndex("by_userId_status", (q) => q.eq("userId", userId).eq("status", "pending"))
        .collect(),
      ctx.db
        .query("planningHabits")
        .withIndex("by_userId_active", (q) => q.eq("userId", userId).eq("active", true))
        .collect(),
      ctx.db.query("plans").withIndex("by_userId_type", (q) => q.eq("userId", userId).eq("type", "week")).collect(),
      ctx.db.query("planningReviews").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
    ]);

    const currentPlan =
      plans
        .filter((plan) => plan.startDate === week.startDate)
        .sort((left, right) => right.createdAt - left.createdAt)[0] ?? null;
    const currentPlanItems = currentPlan
      ? await ctx.db.query("planItems").withIndex("by_planId_date", (q) => q.eq("planId", currentPlan._id)).collect()
      : [];
    const latestReview =
      reviews.sort((left, right) => right.createdAt - left.createdAt)[0] ?? null;

    return {
      week,
      profile,
      agentState,
      goals: goals.sort((left, right) => sortByPriority(left.priority, right.priority)),
      openTasks: tasks.sort((left, right) => sortTaskRows(left, right)),
      habits,
      currentPlan,
      currentPlanItems,
      latestReview,
    };
  },
});

export const listGoals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const goals = await ctx.db.query("planningGoals").withIndex("by_userId", (q) => q.eq("userId", userId)).collect();
    return goals.sort((left, right) => sortByPriority(left.priority, right.priority));
  },
});

export const listPlans = query({
  args: {
    type: v.optional(v.union(v.literal("year"), v.literal("month"), v.literal("week"), v.literal("day"))),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const rows = args.type
      ? await ctx.db.query("plans").withIndex("by_userId_type", (q) => q.eq("userId", userId).eq("type", args.type)).collect()
      : await ctx.db.query("plans").withIndex("by_userId", (q) => q.eq("userId", userId)).collect();
    return rows.sort((left, right) => right.startDate.localeCompare(left.startDate));
  },
});

export const getPlanById = query({
  args: {
    id: v.id("plans"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const plan = await requireOwnedPlan(ctx, userId, args.id);
    const items = await ctx.db.query("planItems").withIndex("by_planId_date", (q) => q.eq("planId", plan._id)).collect();
    const review = await ctx.db.query("planningReviews").withIndex("by_planId", (q) => q.eq("planId", plan._id)).first();

    return {
      plan,
      items,
      review,
    };
  },
});

async function requireOwnedPlan(ctx: QueryCtx, userId: string, planId: Id<"plans">) {
  const plan = (await ctx.db.get(planId)) as Doc<"plans"> | null;
  if (!plan || plan.userId !== userId) {
    throw new Error("Plan not found");
  }

  return plan;
}

function sortByPriority(left: Doc<"planningGoals">["priority"], right: Doc<"planningGoals">["priority"]) {
  return priorityScore(right) - priorityScore(left);
}

function sortTaskRows(left: Doc<"planningTasks">, right: Doc<"planningTasks">) {
  const priorityDelta = priorityScore(right.priority) - priorityScore(left.priority);
  if (priorityDelta !== 0) return priorityDelta;
  return (left.dueDate ?? "9999-12-31").localeCompare(right.dueDate ?? "9999-12-31");
}

function priorityScore(priority: "low" | "medium" | "high") {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

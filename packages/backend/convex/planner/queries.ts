import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import { internalQuery, query, type QueryCtx } from "../_generated/server";
import { components } from "../_generated/api";
import { getWeekWindow, isoDateFromTimestamp } from "../lib/planner";
import { requireUserId } from "../lib/identity";
import { env } from "@seile/env/backend";

const componentsAny = components as any;
const plannerMessagePaginationValidator = v.object({
  cursor: v.union(v.string(), v.null()),
  numItems: v.number(),
});

export const getPlannerDashboard = query({
  args: {
    weekStart: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await buildPlannerContext(ctx, userId, args.weekStart);
  },
});

export const getPlannerChatHome = query({
  args: {
    weekStart: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const context = await buildPlannerContext(ctx, userId, args.weekStart);

    return {
      week: context.week,
      currentPlan: context.currentPlan
        ? {
            _id: context.currentPlan._id,
            title: context.currentPlan.title,
            summary: context.currentPlan.summary,
            mode: context.currentPlan.mode,
            startDate: context.currentPlan.startDate,
            endDate: context.currentPlan.endDate,
            priorityTitles: context.currentPlan.priorityTitles,
            warnings: context.currentPlan.warnings,
            burnoutRiskScore: context.currentPlan.burnoutRiskScore ?? null,
            recoverySuggested: context.currentPlan.recoverySuggested ?? false,
          }
        : null,
      agentState: context.agentState
        ? {
            _id: context.agentState._id,
            agentEnabled: context.agentState.agentEnabled,
            burnoutScore: context.agentState.burnoutScore,
            burnoutState: context.agentState.burnoutState,
            activeThreadId: context.agentState.activeThreadId ?? null,
          }
        : null,
      activeThreadId: context.agentState?.activeThreadId ?? null,
      plannerModel: env.PLANNER_AGENT_MODEL ?? null,
    };
  },
});

export const getPlannerAgentContext = internalQuery({
  args: {
    userId: v.string(),
    weekStart: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await buildPlannerContext(ctx, args.userId, args.weekStart);
  },
});

export const listAgentEnabledStates = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("plannerAgentState")
      .withIndex("by_agentEnabled_userId", (q) => q.eq("agentEnabled", true))
      .collect();
  },
});

export const getLatestPastWeeklyPlanWithoutReview = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const today = isoDateFromTimestamp(Date.now());
    const plans = await ctx.db
      .query("plans")
      .withIndex("by_userId_type", (q) => q.eq("userId", args.userId).eq("type", "week"))
      .collect();
    const candidates = plans
      .filter((plan) => comparePlanEnd(plan.endDate, today) <= 0)
      .sort((left, right) => right.endDate.localeCompare(left.endDate));

    for (const latestPastPlan of candidates) {
      const review = await ctx.db
        .query("planningReviews")
        .withIndex("by_planId", (q) => q.eq("planId", latestPastPlan._id))
        .first();

      if (!review) {
        return latestPastPlan;
      }
    }

    return null;
  },
});

export const getPlanByIdForUser = internalQuery({
  args: {
    userId: v.string(),
    id: v.id("plans"),
  },
  handler: async (ctx, args) => {
    const plan = await requireOwnedPlan(ctx, args.userId, args.id);
    const items = await ctx.db.query("planItems").withIndex("by_planId_date", (q) => q.eq("planId", plan._id)).collect();
    const review = await ctx.db.query("planningReviews").withIndex("by_planId", (q) => q.eq("planId", plan._id)).first();

    return { plan, items, review };
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

export const listPlannerChatMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: v.optional(plannerMessagePaginationValidator),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const thread = await ctx.runQuery(componentsAny.agent.threads.getThread, {
      threadId: args.threadId,
    });

    if (!thread || thread.userId !== userId) {
      throw new ConvexError("Planner chat thread not found");
    }

    const page = await ctx.runQuery(componentsAny.agent.messages.listMessagesByThreadId, {
      threadId: args.threadId,
      order: "asc",
      excludeToolMessages: true,
      paginationOpts: args.paginationOpts ?? { cursor: null, numItems: 80 },
    });

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      page: page.page
        .map((entry: any) => normalizePlannerChatMessage(entry))
        .filter(Boolean),
    };
  },
});

export const listPlannerChatThreads = query({
  args: {
    paginationOpts: v.optional(plannerMessagePaginationValidator),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const activeThreadId = (
      await ctx.db.query("plannerAgentState").withIndex("by_userId", (q) => q.eq("userId", userId)).first()
    )?.activeThreadId;

    const page = await ctx.runQuery(componentsAny.agent.threads.listThreadsByUserId, {
      userId,
      order: "desc",
      paginationOpts: args.paginationOpts ?? { cursor: null, numItems: 40 },
    });

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      page: page.page.map((thread: any) => ({
        id: thread._id,
        title: thread.title ?? "Planner chat",
        summary: thread.summary ?? "",
        status: thread.status ?? "active",
        createdAt: thread._creationTime,
        isActive: thread._id === activeThreadId,
      })),
    };
  },
});

export const getPlannerChatThread = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const thread = await ctx.runQuery(componentsAny.agent.threads.getThread, {
      threadId: args.threadId,
    });

    if (!thread || thread.userId !== userId) {
      throw new ConvexError("Planner chat thread not found");
    }

    return {
      id: thread._id,
      title: thread.title ?? "Planner chat",
      summary: thread.summary ?? "",
      status: thread.status ?? "active",
      createdAt: thread._creationTime,
    };
  },
});

export const listPlans = query({
  args: {
    type: v.optional(v.union(v.literal("year"), v.literal("month"), v.literal("week"), v.literal("day"))),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    let rows;
    if (args.type !== undefined) {
      const planType = args.type;
      rows = await ctx.db
        .query("plans")
        .withIndex("by_userId_type", (q) => q.eq("userId", userId).eq("type", planType))
        .collect();
    } else {
      rows = await ctx.db.query("plans").withIndex("by_userId", (q) => q.eq("userId", userId)).collect();
    }
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
    throw new ConvexError("Plan not found");
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

async function buildPlannerContext(ctx: QueryCtx, userId: string, weekStart?: string) {
  const week = getWeekWindow(weekStart ?? isoDateFromTimestamp(Date.now()));
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
}

function comparePlanEnd(left: string, right: string) {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function normalizePlannerChatMessage(entry: any) {
  const role = entry?.message?.role;
  if (role !== "user" && role !== "assistant") {
    return null;
  }

  const text = extractPlannerChatText(entry);
  if (!text) {
    return null;
  }

  return {
    id: entry._id,
    role,
    text,
    status: entry.status ?? "success",
    createdAt: entry._creationTime,
    error: entry.error,
  };
}

function extractPlannerChatText(entry: { text?: string; message?: { content?: unknown } }) {
  if (entry.text?.trim()) {
    return entry.text.trim();
  }

  const content = entry.message?.content;
  if (typeof content === "string") {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .flatMap((part) => {
      if (!part || typeof part !== "object" || !("type" in part)) {
        return [];
      }

      if ((part.type === "text" || part.type === "reasoning") && "text" in part && typeof part.text === "string") {
        return [part.text];
      }

      return [];
    })
    .join("\n")
    .trim();
}

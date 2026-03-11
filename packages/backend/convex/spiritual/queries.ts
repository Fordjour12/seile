import { v } from "convex/values";

import { query } from "../_generated/server";
import { getWeekWindow, isoDateFromTimestamp } from "../lib/planner";
import { requireUserId } from "../lib/identity";
import { prayerStatusValidator, spiritualGoalStatusValidator } from "../schema/spiritual";

export const getSpiritualDashboard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const [goals, practices, prayers, readings, reflections, plannerGoals, weekPlans] = await Promise.all([
      ctx.db.query("spiritualGoals").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("spiritualPractices").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("prayers").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("spiritualReadings").withIndex("by_userId_date", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("spiritualReflections").withIndex("by_userId_date", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("planningGoals").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("plans").withIndex("by_userId_type", (q) => q.eq("userId", userId).eq("type", "week")).collect(),
    ]);

    const currentWeek = getWeekWindow(isoDateFromTimestamp(Date.now()));
    const currentWeekDates = new Set(currentWeek.dates);
    const plannerHabitIds = new Set(
      practices.map((practice) => practice.plannerHabitId).filter((value): value is NonNullable<typeof value> => value !== undefined),
    );
    const spiritualPlannerGoals = plannerGoals.filter((goal) => goal.domain === "spiritual");
    const latestWeekPlan = [...weekPlans].sort((left, right) => right.startDate.localeCompare(left.startDate))[0] ?? null;
    const sortedGoals = [...goals].sort(sortGoals);
    const sortedPractices = [...practices].sort((left, right) => Number(right.active) - Number(left.active) || left.title.localeCompare(right.title));
    const sortedPrayers = [...prayers].sort((left, right) => right.updatedAt - left.updatedAt);
    const sortedReadings = [...readings].sort((left, right) => right.date.localeCompare(left.date));
    const sortedReflections = [...reflections].sort((left, right) => right.date.localeCompare(left.date));

    return {
      summary: {
        activeGoals: goals.filter((goal) => goal.status === "active").length,
        completedGoals: goals.filter((goal) => goal.status === "completed").length,
        activePractices: practices.filter((practice) => practice.active).length,
        plannerLinkedPractices: practices.filter((practice) => practice.plannerHabitId !== undefined).length,
        activePrayers: prayers.filter((entry) => entry.status === "active").length,
        answeredPrayers: prayers.filter((entry) => entry.status === "answered").length,
        reflectionsThisWeek: reflections.filter((entry) => currentWeekDates.has(entry.date)).length,
        gratitudeEntriesThisWeek: reflections.filter(
          (entry) => currentWeekDates.has(entry.date) && entry.reflectionType.toLowerCase() === "gratitude",
        ).length,
        readingsThisWeek: readings.filter((entry) => currentWeekDates.has(entry.date)).length,
      },
      goals: sortedGoals,
      practices: sortedPractices,
      prayers: sortedPrayers,
      readings: sortedReadings,
      reflections: sortedReflections,
      planner: {
        spiritualGoals: spiritualPlannerGoals.length,
        spiritualHabits: practices.filter((practice) => practice.active && practice.plannerHabitId && plannerHabitIds.has(practice.plannerHabitId))
          .length,
        latestWeekPlanId: latestWeekPlan?._id ?? null,
        latestWeekPlanTitle: latestWeekPlan?.title ?? null,
      },
    };
  },
});

export const listSpiritualGoals = query({
  args: {
    status: v.optional(spiritualGoalStatusValidator),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db.query("spiritualGoals").withIndex("by_userId", (q) => q.eq("userId", userId)).collect();
    return rows
      .filter((row) => (args.status ? row.status === args.status : row.status !== "archived"))
      .sort(sortGoals);
  },
});

export const listSpiritualPractices = query({
  args: {
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db.query("spiritualPractices").withIndex("by_userId", (q) => q.eq("userId", userId)).collect();
    return rows
      .filter((row) => (args.active === undefined ? true : row.active === args.active))
      .sort((left, right) => Number(right.active) - Number(left.active) || left.title.localeCompare(right.title));
  },
});

export const listPrayers = query({
  args: {
    status: v.optional(prayerStatusValidator),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db.query("prayers").withIndex("by_userId", (q) => q.eq("userId", userId)).collect();
    return rows
      .filter((row) => (args.status ? row.status === args.status : row.status !== "archived"))
      .sort((left, right) => right.updatedAt - left.updatedAt);
  },
});

export const listSpiritualReadings = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db
      .query("spiritualReadings")
      .withIndex("by_userId_date", (q) => q.eq("userId", userId))
      .collect();
    return rows
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, Math.max(1, Math.min(args.limit ?? 100, 200)));
  },
});

export const listSpiritualReflections = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db
      .query("spiritualReflections")
      .withIndex("by_userId_date", (q) => q.eq("userId", userId))
      .collect();
    return rows
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, Math.max(1, Math.min(args.limit ?? 100, 200)));
  },
});

function sortGoals(
  left: {
    status: "active" | "completed" | "archived";
    deadline?: string;
    progress: number;
    title: string;
  },
  right: {
    status: "active" | "completed" | "archived";
    deadline?: string;
    progress: number;
    title: string;
  },
) {
  const statusOrder = { active: 0, completed: 1, archived: 2 } as const;
  const statusDelta = statusOrder[left.status] - statusOrder[right.status];
  if (statusDelta !== 0) return statusDelta;

  const leftDeadline = left.deadline ?? "9999-12-31";
  const rightDeadline = right.deadline ?? "9999-12-31";
  if (leftDeadline !== rightDeadline) return leftDeadline.localeCompare(rightDeadline);

  if (left.progress !== right.progress) return right.progress - left.progress;
  return left.title.localeCompare(right.title);
}

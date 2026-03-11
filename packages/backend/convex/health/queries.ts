import { v } from "convex/values";

import { query } from "../_generated/server";
import { derivePlannerHealthContext } from "../lib/health";
import { requireUserId } from "../lib/identity";

export const getHealthDashboard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const [goals, habits, workouts, metrics, energyLogs, profile] = await Promise.all([
      ctx.db.query("healthGoals").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("healthHabits").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("workouts").withIndex("by_userId_and_date", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("healthMetrics").withIndex("by_userId_and_date", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("energyLogs").withIndex("by_userId_and_timestamp", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("plannerProfiles").withIndex("by_userId", (q) => q.eq("userId", userId)).first(),
    ]);

    const health = derivePlannerHealthContext({
      goals,
      habits,
      workouts,
      metrics,
      energyLogs,
      plannerEnergyPattern: profile?.energyPattern,
    });

    return {
      goals: health.activeGoals,
      habits: health.activeHabits,
      recentWorkouts: health.recentWorkouts,
      latestMetric: health.latestMetric,
      latestEnergyLog: health.latestEnergyLog,
      signals: health.signals,
      totals: {
        workoutsThisWeek: health.signals.workoutsThisWeek,
        workoutMinutesThisWeek: health.signals.workoutMinutesThisWeek,
        activeGoalCount: health.activeGoals.length,
        activeHabitCount: health.activeHabits.length,
      },
    };
  },
});

export const listWorkouts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db
      .query("workouts")
      .withIndex("by_userId_and_date", (q) => q.eq("userId", userId))
      .collect();

    return rows
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, Math.max(1, Math.min(args.limit ?? 20, 50)));
  },
});

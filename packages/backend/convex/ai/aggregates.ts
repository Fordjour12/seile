import { internalQuery } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import { v } from "convex/values";

import type { AIDomain, DomainSnapshot } from "./types";
import { derivePlannerHealthContext } from "../lib/health";
import { getWeekWindow, isoDateFromTimestamp } from "../lib/planner";

export const getAllSnapshotsForUser = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await buildAllSnapshots(ctx, args.userId);
  },
});

export async function buildAllSnapshots(ctx: QueryCtx, userId: string) {
  const [
    finance,
    health,
    wellness,
    faith,
    productivity,
    career,
    relationships,
    space,
  ] = await Promise.all([
    buildFinanceSnapshot(ctx, userId),
    buildHealthSnapshot(ctx, userId),
    buildWellnessSnapshot(ctx, userId),
    buildFaithSnapshot(ctx, userId),
    buildProductivitySnapshot(ctx, userId),
    buildUnavailableSnapshot("career"),
    buildUnavailableSnapshot("relationships"),
    buildUnavailableSnapshot("space"),
  ]);

  return {
    finance,
    health,
    wellness,
    faith,
    productivity,
    career,
    relationships,
    space,
  } satisfies Record<AIDomain, DomainSnapshot>;
}

export async function buildFinanceSnapshot(
  ctx: QueryCtx,
  userId: string,
): Promise<DomainSnapshot> {
  const [
    accounts,
    transactions,
    budgetPeriods,
    envelopes,
    debtPlans,
    savingsGoals,
    recurringTransactions,
  ] = await Promise.all([
    ctx.db.query("accounts").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
    ctx.db
      .query("transactions")
      .withIndex("by_userId_occurredAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20),
    ctx.db.query("budgetPeriods").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("budgetEnvelopes").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("debtPlans").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("savingsGoals").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("recurringTransactions").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
  ]);

  const activeBudget =
    budgetPeriods.find((period) => period.status === "active") ?? null;
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const activeDebt = debtPlans.filter((row) => row.status !== "archived");
  const activeSavings = savingsGoals.filter((row) => row.status !== "archived");
  const subscriptions = recurringTransactions.filter(
    (row) => row.isSubscription && row.isActive,
  );

  return {
    domain: "finance",
    generatedAt: Date.now(),
    summary: {
      accountCount: accounts.length,
      totalBalance,
      activeBudgetId: activeBudget?._id ?? null,
      budgetEnvelopeCount: activeBudget
        ? envelopes.filter((row) => row.periodId === activeBudget._id).length
        : 0,
      activeDebtCount: activeDebt.length,
      activeSavingsCount: activeSavings.length,
      subscriptionCount: subscriptions.length,
    },
    raw: {
      accounts,
      budgetPeriods,
      recentTransactions: transactions,
      debtPlans: activeDebt,
      savingsGoals: activeSavings,
      subscriptions,
    },
  };
}

export async function buildHealthSnapshot(
  ctx: QueryCtx,
  userId: string,
): Promise<DomainSnapshot> {
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
    domain: "health",
    generatedAt: Date.now(),
    summary: {
      activeGoalCount: health.activeGoals.length,
      activeHabitCount: health.activeHabits.length,
      workoutsThisWeek: health.signals.workoutsThisWeek,
      workoutMinutesThisWeek: health.signals.workoutMinutesThisWeek,
      recoveryScore: health.signals.recoveryScore,
      fatigueScore: health.signals.fatigueScore,
      sleepScore: health.signals.sleepScore,
      recoveryRecommended: health.signals.recoveryRecommended,
    },
    raw: {
      goals: health.activeGoals,
      habits: health.activeHabits,
      recentWorkouts: health.recentWorkouts,
      latestMetric: health.latestMetric,
      latestEnergyLog: health.latestEnergyLog,
      signals: health.signals,
    },
  };
}

export async function buildWellnessSnapshot(
  ctx: QueryCtx,
  userId: string,
): Promise<DomainSnapshot> {
  const [energyLogs, reviews, plannerState] = await Promise.all([
    ctx.db
      .query("energyLogs")
      .withIndex("by_userId_and_timestamp", (q) => q.eq("userId", userId))
      .collect(),
    ctx.db
      .query("planningReviews")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(6),
    ctx.db
      .query("plannerAgentState")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first(),
  ]);

  const recentEnergy = energyLogs.slice(-10);
  const avgEnergy = averageLevel(recentEnergy.map((entry) => entry.energyLevel));
  const avgStress = averageLevel(recentEnergy.map((entry) => entry.stressLevel));
  const avgFatigue = averageLevel(recentEnergy.map((entry) => entry.fatigueLevel));
  const latestReview = reviews[0] ?? null;

  return {
    domain: "wellness",
    generatedAt: Date.now(),
    summary: {
      avgEnergyScore: avgEnergy,
      avgStressScore: avgStress,
      avgFatigueScore: avgFatigue,
      latestBurnoutScore: latestReview?.burnoutScore ?? plannerState?.burnoutScore ?? null,
      burnoutState: latestReview?.burnoutState ?? plannerState?.burnoutState ?? null,
      overloadIndicatorCount: latestReview?.overloadIndicators.length ?? 0,
      recoveryRecommended:
        latestReview?.burnoutState === "recovery" ||
        plannerState?.burnoutState === "recovery",
    },
    raw: {
      recentEnergy,
      recentReviews: reviews,
      plannerState,
    },
  };
}

export async function buildFaithSnapshot(
  ctx: QueryCtx,
  userId: string,
): Promise<DomainSnapshot> {
  const [goals, practices, prayers, readings, reflections] = await Promise.all([
    ctx.db.query("spiritualGoals").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("spiritualPractices").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("prayers").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
    ctx.db
      .query("spiritualReadings")
      .withIndex("by_userId_date", (q) => q.eq("userId", userId))
      .order("desc")
      .take(14),
    ctx.db
      .query("spiritualReflections")
      .withIndex("by_userId_date", (q) => q.eq("userId", userId))
      .order("desc")
      .take(14),
  ]);

  return {
    domain: "faith",
    generatedAt: Date.now(),
    summary: {
      activeGoalCount: goals.filter((goal) => goal.status === "active").length,
      activePracticeCount: practices.filter((practice) => practice.active).length,
      activePrayerCount: prayers.filter((prayer) => prayer.status === "active").length,
      answeredPrayerCount: prayers.filter((prayer) => prayer.status === "answered").length,
      recentReadingCount: readings.length,
      recentReflectionCount: reflections.length,
    },
    raw: {
      goals,
      practices,
      prayers,
      readings,
      reflections,
    },
  };
}

export async function buildProductivitySnapshot(
  ctx: QueryCtx,
  userId: string,
): Promise<DomainSnapshot> {
  const week = getWeekWindow(isoDateFromTimestamp(Date.now()));
  const [tasks, habits, plans, currentReview] = await Promise.all([
    ctx.db
      .query("planningTasks")
      .withIndex("by_userId_status", (q) => q.eq("userId", userId).eq("status", "pending"))
      .collect(),
    ctx.db
      .query("planningHabits")
      .withIndex("by_userId_active", (q) => q.eq("userId", userId).eq("active", true))
      .collect(),
    ctx.db
      .query("plans")
      .withIndex("by_userId_type", (q) => q.eq("userId", userId).eq("type", "week"))
      .collect(),
    ctx.db
      .query("planningReviews")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .first(),
  ]);

  const currentPlan =
    plans
      .filter((plan) => plan.startDate === week.startDate)
      .sort((left, right) => right.createdAt - left.createdAt)[0] ?? null;

  return {
    domain: "productivity",
    generatedAt: Date.now(),
    summary: {
      openTaskCount: tasks.length,
      activeHabitCount: habits.length,
      currentPlanId: currentPlan?._id ?? null,
      currentPlanTitle: currentPlan?.title ?? null,
      currentPlanBurnoutRisk: currentPlan?.burnoutRiskScore ?? null,
      latestReviewCompletionRate: currentReview?.completionRate ?? null,
    },
    raw: {
      tasks: tasks.slice(0, 20),
      habits,
      currentPlan,
      latestReview: currentReview,
    },
  };
}

async function buildUnavailableSnapshot(
  domain: Extract<AIDomain, "career" | "relationships" | "space">,
): Promise<DomainSnapshot> {
  return {
    domain,
    generatedAt: Date.now(),
    summary: {
      available: false,
    },
    raw: {},
  };
}

function averageLevel(values: Array<"low" | "medium" | "high">) {
  if (values.length === 0) {
    return null;
  }

  const score = values.reduce((sum, value) => {
    if (value === "low") return sum + 3;
    if (value === "medium") return sum + 2;
    return sum + 1;
  }, 0);

  return Number((score / values.length).toFixed(2));
}

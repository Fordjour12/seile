import { internalQuery } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
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
  const envelopesByPeriodId = new Map<string, number>();
  for (const envelope of envelopes) {
    const key = envelope.periodId.toString();
    envelopesByPeriodId.set(
      key,
      (envelopesByPeriodId.get(key) ?? 0) + envelope.allocatedAmount,
    );
  }

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
      accounts: accounts.map((account) => ({
        id: account._id,
        accountType: account.type,
        maskedIdentifier: maskAccountIdentifier(account.name, account.providerName),
        currentBalance: account.balance,
      })),
      budgetPeriods: budgetPeriods.map((period) => ({
        id: period._id,
        startDate: toMonthStartDate(period.year, period.month),
        endDate: toMonthEndDate(period.year, period.month),
        totalBudget: envelopesByPeriodId.get(period._id.toString()) ?? 0,
        status: period.status,
      })),
      recentTransactions: transactions.map((transaction) => ({
        id: transaction._id,
        date: isoDateFromTimestamp(transaction.occurredAt),
        amount: transaction.amount,
        merchant: null,
        category: transaction.categoryId ?? null,
        kind: transaction.kind,
      })),
      debtPlans: activeDebt.map((plan) => ({
        id: plan._id,
        remainingBalance: plan.currentBalance,
        minimumPayment: plan.monthlyDue,
        nextDueDate: plan.nextDueDate ?? null,
      })),
      savingsGoals: activeSavings.map((goal) => ({
        id: goal._id,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate ?? null,
      })),
      subscriptions: subscriptions.map((subscription) => ({
        id: subscription._id,
        name: subscription.subscriptionMeta?.serviceName ?? "Subscription",
        monthlyCost: normalizeSubscriptionMonthlyCost(subscription),
        nextBillingDate: isoDateFromTimestamp(subscription.nextRunAt),
      })),
    },
  };
}

export async function buildHealthSnapshot(
  ctx: QueryCtx,
  userId: string,
): Promise<DomainSnapshot> {
  const recentEnergyCutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const [goals, habits, workouts, metrics, energyLogs, profile] = await Promise.all([
    ctx.db.query("healthGoals").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("healthHabits").withIndex("by_userId", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("workouts").withIndex("by_userId_and_date", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("healthMetrics").withIndex("by_userId_and_date", (q) => q.eq("userId", userId)).collect(),
    ctx.db
      .query("energyLogs")
      .withIndex("by_userId_and_timestamp", (q) =>
        q.eq("userId", userId).gte("timestamp", recentEnergyCutoff),
      )
      .order("desc")
      .take(10),
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
      goals: health.activeGoals.map((goal) => ({
        id: goal._id,
        title: goal.title,
        goalType: goal.goalType,
        targetValue: goal.targetValue,
        progress: goal.progress,
        deadline: goal.deadline ?? null,
      })),
      habits: health.activeHabits.map((habit) => ({
        id: habit._id,
        name: habit.name,
        cadence: habit.cadence,
        targetValue: habit.targetValue,
        unit: habit.unit,
      })),
      recentWorkouts: health.recentWorkouts.map((workout) => ({
        id: workout._id,
        date: workout.date,
        workoutType: workout.workoutType,
        durationMinutes: workout.durationMinutes,
        intensity: workout.intensity,
      })),
      latestMetric: health.latestMetric
        ? {
            date: health.latestMetric.date,
            sleepHours: health.latestMetric.sleepHours ?? null,
            steps: health.latestMetric.steps ?? null,
            weight: health.latestMetric.weight ?? null,
            restingHeartRate: health.latestMetric.restingHeartRate ?? null,
            energyLevel: health.latestMetric.energyLevel ?? null,
          }
        : null,
      latestEnergyLog: health.latestEnergyLog
        ? {
            timestamp: health.latestEnergyLog.timestamp,
            energyLevel: health.latestEnergyLog.energyLevel,
            stressLevel: health.latestEnergyLog.stressLevel,
            fatigueLevel: health.latestEnergyLog.fatigueLevel,
          }
        : null,
      signals: health.signals,
    },
  };
}

export async function buildWellnessSnapshot(
  ctx: QueryCtx,
  userId: string,
): Promise<DomainSnapshot> {
  const recentEnergyCutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const [energyLogs, reviews, plannerState] = await Promise.all([
    ctx.db
      .query("energyLogs")
      .withIndex("by_userId_and_timestamp", (q) =>
        q.eq("userId", userId).gte("timestamp", recentEnergyCutoff),
      )
      .order("desc")
      .take(10),
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

  const recentEnergy = energyLogs;
  const avgEnergyScore = averageLevel(
    recentEnergy.map((entry) => entry.energyLevel),
    "positive",
  );
  const avgStress = averageLevel(recentEnergy.map((entry) => entry.stressLevel));
  const avgFatigue = averageLevel(recentEnergy.map((entry) => entry.fatigueLevel));
  const latestReview = reviews[0] ?? null;

  return {
    domain: "wellness",
    generatedAt: Date.now(),
    summary: {
      avgEnergyScore,
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
      recentEnergy: recentEnergy.map((entry) => ({
        timestamp: entry.timestamp,
        energyLevel: entry.energyLevel,
        stressLevel: entry.stressLevel,
        fatigueLevel: entry.fatigueLevel,
      })),
      recentReviews: reviews.map((review) => ({
        id: review._id,
        createdAt: review.createdAt,
        completionRate: review.completionRate,
        burnoutScore: review.burnoutScore ?? null,
        burnoutState: review.burnoutState ?? null,
        overloadIndicatorCount: review.overloadIndicators.length,
      })),
      plannerState: plannerState
        ? {
            burnoutScore: plannerState.burnoutScore,
            burnoutState: plannerState.burnoutState,
          }
        : null,
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
      goals: goals.map((goal) => ({
        id: goal._id,
        title: goal.title,
        goalType: goal.goalType,
        progress: goal.progress,
        status: goal.status,
        deadline: goal.deadline ?? null,
      })),
      practices: practices.map((practice) => ({
        id: practice._id,
        title: practice.title,
        practiceType: practice.practiceType,
        cadence: practice.cadence,
        targetValue: practice.targetValue,
        active: practice.active,
      })),
      prayers: prayers.map((prayer) => ({
        id: prayer._id,
        title: prayer.title,
        category: prayer.category ?? null,
        status: prayer.status,
      })),
      readings: readings.map((reading) => ({
        id: reading._id,
        title: reading.title,
        source: reading.source ?? null,
        passage: reading.passage ?? null,
        date: reading.date,
      })),
      reflections: reflections.map((reflection) => ({
        id: reflection._id,
        date: reflection.date,
        reflectionType: reflection.reflectionType,
        mood: reflection.mood ?? null,
      })),
    },
  };
}

export async function buildProductivitySnapshot(
  ctx: QueryCtx,
  userId: string,
): Promise<DomainSnapshot> {
  const week = getWeekWindow(isoDateFromTimestamp(Date.now()));
  const [tasks, habits, currentWeekPlans, currentReview] = await Promise.all([
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
      .withIndex("by_userId_startDate", (q) =>
        q.eq("userId", userId).eq("startDate", week.startDate),
      )
      .order("desc")
      .collect(),
    ctx.db
      .query("planningReviews")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .first(),
  ]);

  const currentPlan =
    currentWeekPlans
      .filter((plan) => plan.type === "week")
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
      tasks: tasks.slice(0, 20).map((task) => ({
        id: task._id,
        title: task.title,
        dueDate: task.dueDate ?? null,
        priority: task.priority,
        status: task.status,
      })),
      habits: habits.map((habit) => ({
        id: habit._id,
        name: habit.name,
        cadence: habit.cadence,
        targetValue: habit.targetValue,
        active: habit.active,
      })),
      currentPlan: currentPlan
        ? {
            id: currentPlan._id,
            title: currentPlan.title,
            mode: currentPlan.mode,
            startDate: currentPlan.startDate,
            endDate: currentPlan.endDate,
            priorityTitles: currentPlan.priorityTitles,
            burnoutRiskScore: currentPlan.burnoutRiskScore ?? null,
            recoverySuggested: currentPlan.recoverySuggested ?? false,
          }
        : null,
      latestReview: currentReview
        ? {
            id: currentReview._id,
            completionRate: currentReview.completionRate,
            burnoutScore: currentReview.burnoutScore ?? null,
            burnoutState: currentReview.burnoutState ?? null,
            missedHabitsCount: currentReview.missedHabitsCount ?? null,
            overloadIndicatorCount: currentReview.overloadIndicators.length,
          }
        : null,
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

function averageLevel(
  values: Array<"low" | "medium" | "high">,
  direction: "inverse" | "positive" = "inverse",
) {
  if (values.length === 0) {
    return null;
  }

  const score = values.reduce((sum, value) => {
    if (value === "low") {
      return sum + (direction === "positive" ? 1 : 3);
    }
    if (value === "medium") return sum + 2;
    return sum + (direction === "positive" ? 3 : 1);
  }, 0);

  return Number((score / values.length).toFixed(2));
}

function maskAccountIdentifier(name: string, providerName?: string) {
  const source = (providerName?.trim() || name.trim()).replace(/\s+/g, "");
  const suffix = source.slice(-4).padStart(4, "*");
  return `***${suffix}`;
}

function toMonthStartDate(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

function toMonthEndDate(year: number, month: number) {
  return isoDateFromTimestamp(Date.UTC(year, month, 0));
}

function normalizeSubscriptionMonthlyCost(
  subscription: Doc<"recurringTransactions">,
) {
  if (subscription.scheduleType === "monthly") {
    return subscription.amount;
  }
  if (subscription.scheduleType === "weekly") {
    return Number((subscription.amount * 4.33).toFixed(2));
  }
  if (subscription.scheduleType === "yearly") {
    return Number((subscription.amount / 12).toFixed(2));
  }
  return subscription.amount;
}

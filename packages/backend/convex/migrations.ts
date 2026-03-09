import { mutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  createSharedGoalRecord,
  syncDebtPlanSharedGoal,
  syncSavingsGoalSharedGoal,
} from "./shared_goals/helpers";

export const backfillAccountsV2 = mutation({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("accounts").collect();

    let updatedCount = 0;

    for (const account of accounts as Doc<"accounts">[]) {
      const nextStatus = account.status ?? (account.isArchived ? "archived" : "active");
      const nextType = account.type === "bank" ? "checking" : account.type;

      const patch: Record<string, unknown> = {};

      if (account.status !== nextStatus) {
        patch.status = nextStatus;
      }

      if (account.type !== nextType && nextType) {
        patch.type = nextType;
      }

      if (Object.keys(patch).length > 0) {
        patch.updatedAt = Date.now();
        await ctx.db.patch(account._id, patch);
        updatedCount += 1;
      }
    }

    return {
      scannedCount: accounts.length,
      updatedCount,
    };
  },
});

export const backfillPlannerGoalsToSharedGoals = mutation({
  args: {},
  handler: async (ctx) => {
    const planningGoals = await ctx.db.query("planningGoals").collect();
    const existingSharedGoals = await ctx.db.query("sharedGoals").collect();
    const legacyToShared = new Map<string, Id<"sharedGoals">>();
    let createdCount = 0;

    for (const goal of planningGoals as Doc<"planningGoals">[]) {
      const existing = existingSharedGoals.find(
        (sharedGoal) =>
          sharedGoal.userId === goal.userId &&
          sharedGoal.sourceDomain === "planner" &&
          sharedGoal.title === goal.title &&
          sharedGoal.horizon === goal.horizon &&
          sharedGoal.domain === goal.domain,
      );

      if (existing) {
        legacyToShared.set(goal._id, existing._id);
        continue;
      }

      const created = await createSharedGoalRecord(ctx, {
        userId: goal.userId,
        title: goal.title,
        description: goal.description,
        status: goal.active ? "active" : "archived",
        priority: goal.priority,
        horizon: goal.horizon,
        targetDate: goal.targetDate,
        goalKind: "general",
        sourceDomain: "planner",
        domain: goal.domain,
      });
      legacyToShared.set(goal._id, created._id);
      createdCount += 1;
    }

    return {
      scannedCount: planningGoals.length,
      createdCount,
      linkedCount: legacyToShared.size,
    };
  },
});

export const backfillPlannerTaskHabitSharedGoalIds = mutation({
  args: {},
  handler: async (ctx) => {
    const planningGoals = await ctx.db.query("planningGoals").collect();
    const sharedGoals = await ctx.db.query("sharedGoals").collect();
    const goalMap = new Map<string, Id<"sharedGoals">>();

    for (const goal of planningGoals as Doc<"planningGoals">[]) {
      const sharedGoal = sharedGoals.find(
        (entry) =>
          entry.userId === goal.userId &&
          entry.sourceDomain === "planner" &&
          entry.title === goal.title &&
          entry.horizon === goal.horizon &&
          entry.domain === goal.domain,
      );
      if (sharedGoal) {
        goalMap.set(goal._id, sharedGoal._id);
      }
    }

    const tasks = await ctx.db.query("planningTasks").collect();
    const habits = await ctx.db.query("planningHabits").collect();
    let updatedTasks = 0;
    let updatedHabits = 0;

    for (const task of tasks as Doc<"planningTasks">[]) {
      if (!task.linkedGoalId || task.sharedGoalId) continue;
      const sharedGoalId = goalMap.get(task.linkedGoalId);
      if (!sharedGoalId) continue;
      await ctx.db.patch(task._id, {
        sharedGoalId,
        updatedAt: Date.now(),
      });
      updatedTasks += 1;
    }

    for (const habit of habits as Doc<"planningHabits">[]) {
      if (!habit.linkedGoalId || habit.sharedGoalId) continue;
      const sharedGoalId = goalMap.get(habit.linkedGoalId);
      if (!sharedGoalId) continue;
      await ctx.db.patch(habit._id, {
        sharedGoalId,
        updatedAt: Date.now(),
      });
      updatedHabits += 1;
    }

    return {
      scannedTaskCount: tasks.length,
      scannedHabitCount: habits.length,
      updatedTasks,
      updatedHabits,
    };
  },
});

export const backfillFinanceGoalSharedGoals = mutation({
  args: {},
  handler: async (ctx) => {
    const savingsGoals = await ctx.db.query("savingsGoals").collect();
    const debtPlans = await ctx.db.query("debtPlans").collect();
    let updatedSavings = 0;
    let updatedDebt = 0;

    for (const goal of savingsGoals as Doc<"savingsGoals">[]) {
      const sharedGoal = await syncSavingsGoalSharedGoal(ctx, {
        userId: goal.userId,
        savingsGoalId: goal._id,
        sharedGoalId: goal.sharedGoalId,
        name: goal.name,
        status: goal.status,
        currency: goal.currency,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate,
        notes: goal.notes,
      });
      if (goal.sharedGoalId !== sharedGoal._id) {
        await ctx.db.patch(goal._id, {
          sharedGoalId: sharedGoal._id,
          updatedAt: Date.now(),
        });
        updatedSavings += 1;
      }
    }

    for (const debt of debtPlans as Doc<"debtPlans">[]) {
      const sharedGoal = await syncDebtPlanSharedGoal(ctx, {
        userId: debt.userId,
        debtPlanId: debt._id,
        sharedGoalId: debt.sharedGoalId,
        name: debt.name,
        status: debt.status,
        currency: debt.currency,
        originalBalance: debt.originalBalance,
        currentBalance: debt.currentBalance,
        nextDueDate: debt.nextDueDate,
        notes: debt.notes,
      });
      if (debt.sharedGoalId !== sharedGoal._id) {
        await ctx.db.patch(debt._id, {
          sharedGoalId: sharedGoal._id,
          updatedAt: Date.now(),
        });
        updatedDebt += 1;
      }
    }

    return {
      scannedSavingsCount: savingsGoals.length,
      scannedDebtCount: debtPlans.length,
      updatedSavings,
      updatedDebt,
    };
  },
});

import { defineSchema } from "convex/server";

import { accountsTable } from "./schema/accounts";
import { categoriesTable } from "./schema/categories";
import {
  energyLogsTable,
  healthCadenceValidator,
  healthDifficultyValidator,
  healthGoalStatusValidator,
  healthGoalTypeValidator,
  healthGoalsTable,
  healthHabitsTable,
  healthIntensityValidator,
  healthMetricsTable,
  healthSignalLevelValidator,
  healthWorkoutTypeValidator,
  workoutsTable,
} from "./schema/health";
import { budgetEnvelopesTable } from "./schema/budget_envelopes";
import { budgetPeriodStatusValidator, budgetPeriodsTable } from "./schema/budget_periods";
import {
  burnoutStateValidator,
  plannerChatCommandsTable,
  plannerAgentStateTable,
  plannerProfilesTable,
  planningCadenceValidator,
  planningEffortValidator,
  planningEnergyPatternValidator,
  planningGoalsTable,
  planningHabitsTable,
  planningHorizonValidator,
  planningModeValidator,
  planningPriorityValidator,
  planningReviewsTable,
  planningStyleValidator,
  planningTasksTable,
  planItemStatusValidator,
  planItemTypeValidator,
  planItemsTable,
  planStatusValidator,
  plansTable,
} from "./schema/planner";
import { recurringTransactionsTable } from "./schema/recurring_transactions";
import { debtPlansTable, debtStatusValidator, debtTypeValidator, payoffStrategyValidator } from "./schema/debt_plans";
import { savingsGoalsTable, savingsStatusValidator } from "./schema/savings_goals";
import {
  schedulerTaskPriorityValidator,
  schedulerTaskRecurrenceValidator,
  schedulerTaskStatusValidator,
  schedulerTasksTable,
} from "./schema/scheduler_tasks";
import { transactionsTable } from "./schema/transactions";

export {
  accountStatusValidator,
  accountTypeValidator,
} from "./schema/validators";
export {
  recurringKindValidator,
  scheduleTypeValidator,
  subscriptionStatusValidator,
} from "./schema/recurring_transactions";
export { transactionKindValidator } from "./schema/transactions";
export { budgetPeriodStatusValidator };
export { debtStatusValidator, debtTypeValidator, payoffStrategyValidator, savingsStatusValidator };
export {
  burnoutStateValidator,
  healthCadenceValidator,
  healthDifficultyValidator,
  healthGoalStatusValidator,
  healthGoalTypeValidator,
  healthIntensityValidator,
  healthSignalLevelValidator,
  healthWorkoutTypeValidator,
  planningCadenceValidator,
  planningEffortValidator,
  planningEnergyPatternValidator,
  planningHorizonValidator,
  planningModeValidator,
  planningPriorityValidator,
  planningStyleValidator,
  planItemStatusValidator,
  planItemTypeValidator,
  planStatusValidator,
  schedulerTaskPriorityValidator,
  schedulerTaskRecurrenceValidator,
  schedulerTaskStatusValidator,
};

export default defineSchema({
  accounts: accountsTable,
  budgetPeriods: budgetPeriodsTable,
  budgetEnvelopes: budgetEnvelopesTable,
  categories: categoriesTable,
  workouts: workoutsTable,
  healthHabits: healthHabitsTable,
  healthGoals: healthGoalsTable,
  healthMetrics: healthMetricsTable,
  energyLogs: energyLogsTable,
  transactions: transactionsTable,
  recurringTransactions: recurringTransactionsTable,
  debtPlans: debtPlansTable,
  savingsGoals: savingsGoalsTable,
  plannerProfiles: plannerProfilesTable,
  planningGoals: planningGoalsTable,
  planningTasks: planningTasksTable,
  planningHabits: planningHabitsTable,
  plans: plansTable,
  planItems: planItemsTable,
  planningReviews: planningReviewsTable,
  plannerAgentState: plannerAgentStateTable,
  plannerChatCommands: plannerChatCommandsTable,
  schedulerTasks: schedulerTasksTable,
});

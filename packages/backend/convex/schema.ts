import { defineSchema } from "convex/server";

import { aiApprovalsTable, aiApprovalStatusValidator } from "./schema/ai_approvals";
import { aiMemoryTable } from "./schema/ai_memory";
import { aiRunsTable, aiRunStatusValidator } from "./schema/ai_runs";
import { aiToolCallsTable, aiToolCallOutcomeValidator } from "./schema/ai_tool_calls";
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
  financeAgentAuditLogTable,
  financeAgentStateTable,
} from "./schema/finance_agent";
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
  sharedGoalsTable,
  sharedGoalKindValidator,
  sharedGoalSourceDomainValidator,
  sharedGoalStatusValidator,
} from "./schema/shared_goals";
import {
  schedulerTaskPriorityValidator,
  schedulerTaskRecurrenceValidator,
  schedulerTaskStatusValidator,
  schedulerTasksTable,
} from "./schema/scheduler_tasks";
import {
  prayerStatusValidator,
  prayersTable,
  spiritualGoalsTable,
  spiritualGoalStatusValidator,
  spiritualPracticesTable,
  spiritualReadingsTable,
  spiritualReflectionsTable,
} from "./schema/spiritual";
import { transactionsTable } from "./schema/transactions";

export { accountStatusValidator, accountTypeValidator } from "./schema/validators";
export {
  recurringKindValidator,
  scheduleTypeValidator,
  subscriptionStatusValidator,
} from "./schema/recurring_transactions";
export { transactionKindValidator } from "./schema/transactions";
export { budgetPeriodStatusValidator };
export { debtStatusValidator, debtTypeValidator, payoffStrategyValidator, savingsStatusValidator };
export { aiApprovalStatusValidator, aiRunStatusValidator, aiToolCallOutcomeValidator };
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
  sharedGoalKindValidator,
  sharedGoalSourceDomainValidator,
  sharedGoalStatusValidator,
  schedulerTaskPriorityValidator,
  schedulerTaskRecurrenceValidator,
  schedulerTaskStatusValidator,
  prayerStatusValidator,
  spiritualGoalStatusValidator,
};

export default defineSchema({
  aiMemory: aiMemoryTable,
  aiApprovals: aiApprovalsTable,
  aiRuns: aiRunsTable,
  aiToolCalls: aiToolCallsTable,
  accounts: accountsTable,
  budgetPeriods: budgetPeriodsTable,
  budgetEnvelopes: budgetEnvelopesTable,
  categories: categoriesTable,
  financeAgentState: financeAgentStateTable,
  financeAgentAuditLog: financeAgentAuditLogTable,
  workouts: workoutsTable,
  healthHabits: healthHabitsTable,
  healthGoals: healthGoalsTable,
  healthMetrics: healthMetricsTable,
  energyLogs: energyLogsTable,
  transactions: transactionsTable,
  recurringTransactions: recurringTransactionsTable,
  debtPlans: debtPlansTable,
  savingsGoals: savingsGoalsTable,
  sharedGoals: sharedGoalsTable,
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
  spiritualGoals: spiritualGoalsTable,
  spiritualPractices: spiritualPracticesTable,
  spiritualReadings: spiritualReadingsTable,
  prayers: prayersTable,
  spiritualReflections: spiritualReflectionsTable,
});

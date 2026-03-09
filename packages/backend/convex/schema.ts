import { defineSchema } from "convex/server";

import { accountsTable } from "./schema/accounts";
import { categoriesTable } from "./schema/categories";
import { budgetEnvelopesTable } from "./schema/budget_envelopes";
import { budgetPeriodStatusValidator, budgetPeriodsTable } from "./schema/budget_periods";
import {
  financeAgentAuditLogTable,
  financeAgentStateTable,
} from "./schema/finance_agent";
import {
  burnoutStateValidator,
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
  linkedFinanceEntityTypeValidator,
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
  linkedFinanceEntityTypeValidator,
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
};

export default defineSchema({
  accounts: accountsTable,
  budgetPeriods: budgetPeriodsTable,
  budgetEnvelopes: budgetEnvelopesTable,
  categories: categoriesTable,
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
  financeAgentState: financeAgentStateTable,
  financeAgentAuditLog: financeAgentAuditLogTable,
  schedulerTasks: schedulerTasksTable,
});

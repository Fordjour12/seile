export interface SavingsSummary {
  totalTarget: number;
  totalCurrent: number;
  percentComplete: number;
  totalMonthlyCommitment: number;
  countByStatus: Record<string, number>;
}

export type SavingsGoalStatus = "draft" | "active" | "completed" | "archived";

export interface SavingsGoal {
  id: string;
  name: string;
  status: SavingsGoalStatus;
  currencyCode: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution?: number;
  targetDate?: string;
  linkedAccountId?: string;
  linkedRecurringId?: string;
  categoryId?: string;
  color?: string;
  icon?: string;
  priorityRank?: string;
  notes?: string;
  monthsUntilTarget?: number;
  projectedCompletionDate?: string;
  monthlyLedgerImpact: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavingsGoalPayload {
  name: string;
  status?: SavingsGoalStatus;
  currencyCode?: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution?: number;
  targetDate?: string;
  linkedAccountId?: string;
  categoryId?: string;
  color?: string;
  icon?: string;
  notes?: string;
}

export interface UpdateSavingsGoalPayload extends Partial<CreateSavingsGoalPayload> {}

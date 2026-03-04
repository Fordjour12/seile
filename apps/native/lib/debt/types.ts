export type DebtPlanStatus = "draft" | "active" | "archived";

export interface DebtPlan {
  id: string;
  name: string;
  debtType: "installment" | "revolving";
  status: DebtPlanStatus;
  currencyCode: string;
  originalBalance: number;
  currentBalance: number;
  monthlyDue: number;
  apr?: number;
  nextDueDate?: string;
  balanceExceedsOriginal: boolean;
  monthlyLedgerImpact: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDebtPlanPayload {
  name: string;
  debtType: "installment" | "revolving";
  currencyCode?: string;
  originalBalance: number;
  currentBalance: number;
  monthlyDue: number;
  apr?: number;
}

export interface UpdateDebtPlanPayload extends Partial<CreateDebtPlanPayload> {
  status?: DebtPlanStatus;
}

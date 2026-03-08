export type BudgetPeriodStatus = "draft" | "active" | "closed" | "archived";

export interface BudgetPeriodWithComputed {
  id: string;
  year: number;
  month: number;
  status: BudgetPeriodStatus;
  currencyCode: string;
  incomeTarget: number;
  totalAllocated: number;
  totalActualSpend: number;
  unallocated: number;
  overallVariance: number;
}

export interface BudgetEnvelopeWithComputed {
  id: string;
  periodId: string;
  categoryId: string;
  name: string;
  allocatedAmount: number;
  rolloverAmount: number;
  rolloverEnabled: boolean;
  color?: string;
  icon?: string;
  notes?: string;
  actualSpend: number;
  effectiveAllocation: number;
  remaining: number;
  overspent: boolean;
  spendPercent: number;
}

export interface BudgetSummary {
  activePeriod: BudgetPeriodWithComputed | null;
  overspentCount: number;
  topEnvelopes: BudgetEnvelopeWithComputed[];
}

export interface BudgetPeriodDetail extends BudgetPeriodWithComputed {
  notes?: string;
  closedAt?: string;
  envelopeCount: number;
}

export interface CreateBudgetPeriodPayload {
  year: number;
  month: number;
  currencyCode?: string;
  incomeTarget: number;
  notes?: string;
}

export interface UpdateBudgetPeriodPayload {
  incomeTarget?: number;
  notes?: string;
}

export interface CreateBudgetEnvelopePayload {
  periodId: string;
  categoryId: string;
  allocatedAmount: number;
  rolloverEnabled?: boolean;
  color?: string;
  icon?: string;
  notes?: string;
}

export interface UpdateBudgetEnvelopePayload {
  allocatedAmount?: number;
  rolloverEnabled?: boolean;
  color?: string;
  icon?: string;
  notes?: string;
}

export interface BudgetEnvelopeHistoryItem {
  periodLabel: string;
  allocatedAmount: number;
  actualSpend: number;
}

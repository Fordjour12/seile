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

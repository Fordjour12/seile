export interface SavingsSummary {
  totalTarget: number;
  totalCurrent: number;
  percentComplete: number;
  totalMonthlyCommitment: number;
  countByStatus: Record<string, number>;
}

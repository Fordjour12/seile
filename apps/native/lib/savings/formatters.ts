import type { SavingsGoal, SavingsGoalStatus } from "./types";

const STATUS_LABELS: Record<SavingsGoalStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

function getCurrencySymbol(currencyCode: string): string {
  switch (currencyCode.toUpperCase()) {
    case "GHS":
      return "GH₵";
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    default:
      return `${currencyCode.toUpperCase()} `;
  }
}

export function formatSavingsAmount(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatSavingsStatus(status: SavingsGoalStatus): string {
  return STATUS_LABELS[status];
}

export function mapSavingsListItem(goal: SavingsGoal): {
  id: string;
  title: string;
  subtitle: string;
  balanceLabel: string;
} {
  const percent = goal.targetAmount === 0 ? 0 : Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  return {
    id: goal.id,
    title: goal.name,
    subtitle: `${formatSavingsStatus(goal.status)} · ${percent}% funded`,
    balanceLabel: formatSavingsAmount(goal.currentAmount, goal.currencyCode),
  };
}

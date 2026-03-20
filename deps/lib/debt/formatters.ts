import type { DebtPlan, DebtPlanStatus } from "./types";

const DEBT_TYPE_LABELS: Record<DebtPlan["debtType"], string> = {
  installment: "Installment",
  revolving: "Revolving",
};

const DEBT_STATUS_LABELS: Record<DebtPlanStatus, string> = {
  draft: "Draft",
  active: "Active",
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

export function formatDebtAmount(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDebtType(type: DebtPlan["debtType"]): string {
  return DEBT_TYPE_LABELS[type];
}

export function formatDebtStatus(status: DebtPlanStatus): string {
  return DEBT_STATUS_LABELS[status];
}

export function formatDebtApr(apr?: number): string {
  if (apr === undefined) {
    return "No APR";
  }

  return `${apr.toFixed(2)}% APR`;
}

export function mapDebtListItem(debt: DebtPlan): {
  id: string;
  title: string;
  subtitle: string;
  balanceLabel: string;
} {
  return {
    id: debt.id,
    title: debt.name,
    subtitle: `${formatDebtType(debt.debtType)} · ${formatDebtStatus(debt.status)}`,
    balanceLabel: formatDebtAmount(debt.currentBalance, debt.currencyCode),
  };
}

import type { BudgetEnvelopeWithComputed, BudgetPeriodStatus } from "./types";

const STATUS_LABELS: Record<BudgetPeriodStatus, string> = {
  draft: "Draft",
  active: "Active",
  closed: "Closed",
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

export function formatBudgetAmount(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatBudgetStatus(status: BudgetPeriodStatus): string {
  return STATUS_LABELS[status];
}

export function mapBudgetEnvelopeListItem(envelope: BudgetEnvelopeWithComputed, currencyCode: string): {
  id: string;
  title: string;
  subtitle: string;
  balanceLabel: string;
} {
  return {
    id: envelope.id,
    title: envelope.name,
    subtitle: envelope.overspent
      ? "Overspent"
      : `${Math.round(envelope.spendPercent)}% utilized`,
    balanceLabel: formatBudgetAmount(envelope.remaining, currencyCode),
  };
}

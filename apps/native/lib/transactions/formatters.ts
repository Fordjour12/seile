import type { TransactionDirection } from "./types";

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

export function formatTransactionAmount(
  amount: number,
  direction: TransactionDirection,
  currencyCode: string,
): string {
  const symbol = getCurrencySymbol(currencyCode);
  const sign = direction === "in" ? "+" : "-";

  return `${sign}${symbol}${Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatTransactionTime(createdAt: string): string {
  const parsedDate = new Date(createdAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown date";
  }

  return parsedDate.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

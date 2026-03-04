import type { Account, AccountStatus, AccountType } from "./types";

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: "Checking",
  savings: "Savings",
  credit: "Credit",
  cash: "Cash",
  investment: "Investment",
};

const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  active: "Active",
  archived: "Archived",
  closed: "Closed",
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

export function formatAccountBalance(balance: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${balance.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatAccountType(type: AccountType): string {
  return ACCOUNT_TYPE_LABELS[type];
}

export function formatAccountStatus(status: AccountStatus): string {
  return ACCOUNT_STATUS_LABELS[status];
}

export function mapAccountListItem(account: Account): {
  id: string;
  title: string;
  subtitle: string;
  balanceLabel: string;
} {
  const statusAndType = `${formatAccountType(account.type)} · ${formatAccountStatus(account.status)}`;
  return {
    id: account.id,
    title: account.name,
    subtitle: account.providerName ? `${account.providerName} · ${statusAndType}` : statusAndType,
    balanceLabel: formatAccountBalance(account.balance, account.currencyCode),
  };
}

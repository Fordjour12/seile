import type {
  Account,
  CreateAccountPayload,
  DeleteAccountPayload,
  UpdateAccountPayload,
} from "./types";

let accountsStore: Account[] = [
  {
    id: "acc-1",
    name: "Main Checking",
    type: "checking",
    status: "active",
    currencyCode: "GHS",
    balance: 12450.75,
    note: "Payroll and day-to-day spending",
    createdAt: "2026-03-01T08:00:00.000Z",
    updatedAt: "2026-03-01T08:00:00.000Z",
  },
  {
    id: "acc-2",
    name: "Emergency Savings",
    type: "savings",
    status: "active",
    currencyCode: "GHS",
    balance: 5895.04,
    note: "3-month reserve",
    createdAt: "2026-02-16T08:00:00.000Z",
    updatedAt: "2026-02-16T08:00:00.000Z",
  },
];

function nextAccountId(): string {
  return `acc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listAccounts(): Promise<Account[]> {
  return [...accountsStore];
}

export async function getAccount(accountId: string): Promise<Account | null> {
  return accountsStore.find((account) => account.id === accountId) ?? null;
}

export async function createAccount(payload: CreateAccountPayload): Promise<Account> {
  const now = new Date().toISOString();

  const account: Account = {
    id: nextAccountId(),
    name: payload.name,
    type: payload.type,
    status: "active",
    currencyCode: payload.currencyCode ?? "GHS",
    balance: payload.openingBalance ?? 0,
    note: payload.note,
    createdAt: now,
    updatedAt: now,
  };

  accountsStore = [account, ...accountsStore];

  return account;
}

export async function updateAccount(
  accountId: string,
  payload: UpdateAccountPayload
): Promise<Account | null> {
  const currentAccount = accountsStore.find((account) => account.id === accountId);
  if (!currentAccount) {
    return null;
  }

  const updatedAccount: Account = {
    ...currentAccount,
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  accountsStore = accountsStore.map((account) => (account.id === accountId ? updatedAccount : account));

  return updatedAccount;
}

export async function deleteAccount(payload: DeleteAccountPayload): Promise<boolean> {
  const index = accountsStore.findIndex((account) => account.id === payload.id);
  if (index < 0) {
    return false;
  }

  if (payload.hardDelete) {
    accountsStore = accountsStore.filter((account) => account.id !== payload.id);
    return true;
  }

  const account = accountsStore[index];
  accountsStore[index] = {
    ...account,
    status: "archived",
    updatedAt: new Date().toISOString(),
  };

  return true;
}

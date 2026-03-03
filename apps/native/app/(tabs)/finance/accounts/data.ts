export type AccountRecord = {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit";
  balance: number;
  currency: string;
  updatedAt: string;
};

let accounts: AccountRecord[] = [
  {
    id: "acc-1",
    name: "Everyday Checking",
    type: "checking",
    balance: 2480.12,
    currency: "USD",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "acc-2",
    name: "Rainy Day Savings",
    type: "savings",
    balance: 12940.54,
    currency: "USD",
    updatedAt: new Date().toISOString(),
  },
];

const wait = async (duration = 250) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });

export async function listAccounts() {
  await wait();
  return [...accounts];
}

export async function getAccountById(id: string) {
  await wait();
  return accounts.find((account) => account.id === id) ?? null;
}

export async function createAccount(input: Omit<AccountRecord, "id" | "updatedAt">) {
  await wait();

  const account: AccountRecord = {
    ...input,
    id: `acc-${Date.now()}`,
    updatedAt: new Date().toISOString(),
  };

  accounts = [account, ...accounts];
  return account;
}

export async function updateAccount(id: string, updates: Partial<Omit<AccountRecord, "id">>) {
  await wait();

  const current = accounts.find((account) => account.id === id);
  if (!current) {
    throw new Error("Account not found");
  }

  const updated: AccountRecord = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  accounts = accounts.map((account) => (account.id === id ? updated : account));
  return updated;
}

export async function deleteAccount(id: string) {
  await wait();

  const existing = accounts.find((account) => account.id === id);
  if (!existing) {
    throw new Error("Account not found");
  }

  accounts = accounts.filter((account) => account.id !== id);
  return existing;
}

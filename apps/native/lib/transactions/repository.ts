import type { ListTransactionsParams, TransactionRecord } from "./types";

let transactionsStore: TransactionRecord[] = [
  {
    id: "txn-1",
    accountId: "acc-1",
    accountName: "Main Checking",
    title: "Salary Deposit",
    category: "Income",
    direction: "in",
    amount: 5200,
    currencyCode: "GHS",
    createdAt: "2026-03-03T09:50:00.000Z",
  },
  {
    id: "txn-2",
    accountId: "acc-1",
    accountName: "Main Checking",
    title: "Groceries",
    category: "Food",
    direction: "out",
    amount: 289.3,
    currencyCode: "GHS",
    createdAt: "2026-03-03T08:40:00.000Z",
  },
  {
    id: "txn-3",
    accountId: "acc-2",
    accountName: "Emergency Savings",
    title: "Transfer to Savings",
    category: "Transfer",
    direction: "in",
    amount: 800,
    currencyCode: "GHS",
    createdAt: "2026-03-02T19:20:00.000Z",
  },
  {
    id: "txn-4",
    accountId: "acc-1",
    accountName: "Main Checking",
    title: "Fuel",
    category: "Transport",
    direction: "out",
    amount: 120,
    currencyCode: "GHS",
    createdAt: "2026-03-02T17:05:00.000Z",
  },
  {
    id: "txn-5",
    accountId: "acc-1",
    accountName: "Main Checking",
    title: "Restaurant",
    category: "Dining",
    direction: "out",
    amount: 94,
    currencyCode: "GHS",
    createdAt: "2026-03-02T13:55:00.000Z",
  },
  {
    id: "txn-6",
    accountId: "acc-2",
    accountName: "Emergency Savings",
    title: "Interest Credit",
    category: "Income",
    direction: "in",
    amount: 41.6,
    currencyCode: "GHS",
    createdAt: "2026-03-01T22:10:00.000Z",
  },
  {
    id: "txn-7",
    accountId: "acc-1",
    accountName: "Main Checking",
    title: "Internet Bill",
    category: "Utilities",
    direction: "out",
    amount: 210,
    currencyCode: "GHS",
    createdAt: "2026-03-01T20:00:00.000Z",
  },
  {
    id: "txn-8",
    accountId: "acc-1",
    accountName: "Main Checking",
    title: "Taxi",
    category: "Transport",
    direction: "out",
    amount: 58.5,
    currencyCode: "GHS",
    createdAt: "2026-03-01T09:18:00.000Z",
  },
  {
    id: "txn-9",
    accountId: "acc-2",
    accountName: "Emergency Savings",
    title: "Emergency Fund Top-Up",
    category: "Transfer",
    direction: "in",
    amount: 500,
    currencyCode: "GHS",
    createdAt: "2026-02-28T16:40:00.000Z",
  },
  {
    id: "txn-10",
    accountId: "acc-1",
    accountName: "Main Checking",
    title: "Pharmacy",
    category: "Health",
    direction: "out",
    amount: 73.45,
    currencyCode: "GHS",
    createdAt: "2026-02-28T12:15:00.000Z",
  },
  {
    id: "txn-11",
    accountId: "acc-1",
    accountName: "Main Checking",
    title: "Airtime",
    category: "Mobile",
    direction: "out",
    amount: 30,
    currencyCode: "GHS",
    createdAt: "2026-02-27T18:30:00.000Z",
  },
  {
    id: "txn-12",
    accountId: "acc-2",
    accountName: "Emergency Savings",
    title: "Cash Deposit",
    category: "Income",
    direction: "in",
    amount: 250,
    currencyCode: "GHS",
    createdAt: "2026-02-26T10:45:00.000Z",
  },
];

function compareNewestFirst(left: TransactionRecord, right: TransactionRecord): number {
  return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
}

export async function listTransactions(params: ListTransactionsParams = {}): Promise<TransactionRecord[]> {
  const limit = Math.max(1, Math.min(params.limit ?? 10, 10));

  return transactionsStore
    .filter((transaction) => (params.accountId ? transaction.accountId === params.accountId : true))
    .sort(compareNewestFirst)
    .slice(0, limit);
}

export async function getTransaction(transactionId: string): Promise<TransactionRecord | null> {
  return transactionsStore.find((transaction) => transaction.id === transactionId) ?? null;
}

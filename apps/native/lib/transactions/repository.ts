import { postJson } from "@/lib/accounts/http-client";

import type {
  CreateTransactionPayload,
  ListTransactionsParams,
  TransactionDirection,
  TransactionKind,
  TransactionRecord,
  UpdateTransactionPayload,
} from "./types";

type BackendTransaction = {
  _id: string;
  kind: TransactionKind;
  amount: number;
  currency: string;
  accountName?: string;
  accountId?: string;
  fromAccountId?: string;
  toAccountId?: string;
  categoryId?: string;
  note?: string;
  occurredAt: number;
  createdAt: number;
  updatedAt: number;
};

type SummaryResponse = {
  count: number;
  income: number;
  expense: number;
  transfer: number;
  net: number;
};

const FALLBACK_TRANSACTIONS: TransactionRecord[] = [
  {
    id: "txn-1",
    kind: "income",
    accountName: "Main Checking",
    accountId: "acc-1",
    title: "Salary Deposit",
    category: "Income",
    direction: "in",
    amount: 5200,
    currencyCode: "GHS",
    createdAt: "2026-03-03T09:50:00.000Z",
    updatedAt: "2026-03-03T09:50:00.000Z",
    occurredAt: "2026-03-03T09:50:00.000Z",
  },
  {
    id: "txn-2",
    kind: "expense",
    accountName: "Main Checking",
    accountId: "acc-1",
    title: "Groceries",
    category: "Food",
    direction: "out",
    amount: 289.3,
    currencyCode: "GHS",
    createdAt: "2026-03-03T08:40:00.000Z",
    updatedAt: "2026-03-03T08:40:00.000Z",
    occurredAt: "2026-03-03T08:40:00.000Z",
  },
];

function toDirection(kind: TransactionKind): TransactionDirection {
  return kind === "income" || kind === "adjustment" ? "in" : "out";
}

function toCategory(kind: TransactionKind, categoryId?: string): string {
  if (categoryId) {
    return categoryId;
  }

  switch (kind) {
    case "income":
      return "Income";
    case "expense":
      return "Expense";
    case "transfer":
      return "Transfer";
    case "adjustment":
      return "Adjustment";
  }
}

function mapBackendTransaction(transaction: BackendTransaction): TransactionRecord {
  const title = transaction.note?.trim() || toCategory(transaction.kind, transaction.categoryId);

  return {
    id: transaction._id,
    kind: transaction.kind,
    accountName: transaction.accountName,
    accountId: transaction.accountId,
    fromAccountId: transaction.fromAccountId,
    toAccountId: transaction.toAccountId,
    categoryId: transaction.categoryId,
    title,
    category: toCategory(transaction.kind, transaction.categoryId),
    direction: toDirection(transaction.kind),
    amount: transaction.amount,
    currencyCode: transaction.currency,
    createdAt: new Date(transaction.createdAt).toISOString(),
    updatedAt: new Date(transaction.updatedAt).toISOString(),
    occurredAt: new Date(transaction.occurredAt).toISOString(),
  };
}

export async function listTransactions(params: ListTransactionsParams = {}): Promise<TransactionRecord[]> {
  try {
    const rows = await postJson<BackendTransaction[]>("/transactions/list", {
      limit: params.limit,
      before: params.before,
    });

    return rows.map(mapBackendTransaction);
  } catch {
    return FALLBACK_TRANSACTIONS;
  }
}

export async function getTransaction(transactionId: string): Promise<TransactionRecord | null> {
  try {
    const row = await postJson<BackendTransaction | null>("/transactions/getById", {
      id: transactionId,
    });

    return row ? mapBackendTransaction(row) : null;
  } catch {
    return FALLBACK_TRANSACTIONS.find((item) => item.id === transactionId) ?? null;
  }
}

export async function createTransaction(payload: CreateTransactionPayload): Promise<TransactionRecord> {
  const row = await postJson<BackendTransaction>("/transactions/create", {
    kind: payload.kind,
    amount: payload.amount,
    currency: payload.currencyCode ?? "GHS",
    accountId: payload.accountId,
    fromAccountId: payload.fromAccountId,
    toAccountId: payload.toAccountId,
    categoryId: payload.categoryId,
    note: payload.note,
    occurredAt: payload.occurredAt ? new Date(payload.occurredAt).getTime() : undefined,
  });

  return mapBackendTransaction(row);
}

export async function updateTransaction(
  transactionId: string,
  payload: UpdateTransactionPayload,
): Promise<TransactionRecord> {
  const row = await postJson<BackendTransaction>("/transactions/update", {
    id: transactionId,
    amount: payload.amount,
    categoryId: payload.categoryId,
    note: payload.note,
    occurredAt: payload.occurredAt ? new Date(payload.occurredAt).getTime() : undefined,
  });

  return mapBackendTransaction(row);
}

export async function deleteTransaction(transactionId: string, reverseAccountDelta: boolean = true): Promise<boolean> {
  const response = await postJson<boolean>("/transactions/delete", {
    id: transactionId,
    reverseAccountDelta,
  });

  return response;
}

export async function reverseTransaction(transactionId: string): Promise<TransactionRecord> {
  const row = await postJson<BackendTransaction>("/transactions/reverse", {
    id: transactionId,
  });

  return mapBackendTransaction(row);
}

export async function getTransactionSummary(from: string, to: string): Promise<SummaryResponse> {
  return postJson<SummaryResponse>("/transactions/summary", {
    from: new Date(from).getTime(),
    to: new Date(to).getTime(),
  });
}

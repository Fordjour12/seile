import { api } from "@/lib/backend-api";
import { convex } from "@/lib/convex-client";

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
    const rows = await convex.query(api["transactions/queries"].listTransactions, {
      limit: params.limit,
      before: params.before,
    });

    return rows.map(mapBackendTransaction);
  } catch {
    return [];
  }
}

export async function getTransaction(transactionId: string): Promise<TransactionRecord | null> {
  try {
    const row = await convex.query(api["transactions/queries"].getTransactionById, {
      id: transactionId,
    });

    return row ? mapBackendTransaction(row) : null;
  } catch {
    return null;
  }
}

export async function createTransaction(payload: CreateTransactionPayload): Promise<TransactionRecord> {
  const row = await convex.mutation(api["transactions/mutations"].createTransaction, {
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
  const row = await convex.mutation(api["transactions/mutations"].updateTransaction, {
    id: transactionId,
    amount: payload.amount,
    categoryId: payload.categoryId,
    note: payload.note,
    occurredAt: payload.occurredAt ? new Date(payload.occurredAt).getTime() : undefined,
  });

  return mapBackendTransaction(row);
}

export async function deleteTransaction(transactionId: string, reverseAccountDelta: boolean = true): Promise<boolean> {
  const response = await convex.mutation(api["transactions/mutations"].deleteTransaction, {
    id: transactionId,
    reverseAccountDelta,
  });

  return response;
}

export async function reverseTransaction(transactionId: string): Promise<TransactionRecord> {
  const row = await convex.mutation(api["transactions/mutations"].reverseTransaction, {
    id: transactionId,
  });

  return mapBackendTransaction(row);
}

export async function getTransactionSummary(from: string, to: string): Promise<SummaryResponse> {
  return convex.query(api["transactions/queries"].getTransactionSummary, {
    from: new Date(from).getTime(),
    to: new Date(to).getTime(),
  });
}

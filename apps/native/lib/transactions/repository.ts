import { api, asId, asOptionalId } from "@/lib/backend-api";
import { useMutation, useQuery } from "convex/react";

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

export function useTransactions(
  params: ListTransactionsParams = {},
): TransactionRecord[] | undefined {
  const rows = useQuery(api.transactions.queries.listTransactions, {
    limit: params.limit,
    before: params.before,
  });

  return rows?.map(mapBackendTransaction);
}

export function useTransaction(
  transactionId?: string,
): TransactionRecord | null | undefined {
  const row = useQuery(
    api.transactions.queries.getTransactionById,
    transactionId ? { id: asId<"transactions">(transactionId) } : "skip",
  );

  return row ? mapBackendTransaction(row) : row;
}

export function useCreateTransaction(): (
  payload: CreateTransactionPayload,
) => Promise<TransactionRecord> {
  const createTransaction = useMutation(api.transactions.mutations.createTransaction);

  return async (payload) => {
    const row = await createTransaction({
      kind: payload.kind,
      amount: payload.amount,
      currency: payload.currencyCode ?? "GHS",
      accountId: asOptionalId<"accounts">(payload.accountId),
      fromAccountId: asOptionalId<"accounts">(payload.fromAccountId),
      toAccountId: asOptionalId<"accounts">(payload.toAccountId),
      categoryId: asOptionalId<"categories">(payload.categoryId),
      note: payload.note,
      occurredAt: payload.occurredAt ? new Date(payload.occurredAt).getTime() : undefined,
    });

    return mapBackendTransaction(row);
  };
}

export function useUpdateTransaction(): (
  transactionId: string,
  payload: UpdateTransactionPayload,
) => Promise<TransactionRecord> {
  const updateTransaction = useMutation(api.transactions.mutations.updateTransaction);

  return async (transactionId, payload) => {
    const row = await updateTransaction({
      id: asId<"transactions">(transactionId),
      amount: payload.amount,
      categoryId: asOptionalId<"categories">(payload.categoryId),
      note: payload.note,
      occurredAt: payload.occurredAt ? new Date(payload.occurredAt).getTime() : undefined,
    });

    return mapBackendTransaction(row);
  };
}

export function useDeleteTransaction(): (
  transactionId: string,
  reverseAccountDelta?: boolean,
) => Promise<boolean> {
  const deleteTransaction = useMutation(api.transactions.mutations.deleteTransaction);

  return (transactionId, reverseAccountDelta = true) =>
    deleteTransaction({
      id: asId<"transactions">(transactionId),
      reverseAccountDelta,
    });
}

export function useReverseTransaction(): (
  transactionId: string,
) => Promise<TransactionRecord> {
  const reverseTransaction = useMutation(api.transactions.mutations.reverseTransaction);

  return async (transactionId) => {
    const row = await reverseTransaction({
      id: asId<"transactions">(transactionId),
    });

    return mapBackendTransaction(row);
  };
}

export function useTransactionSummary(
  from?: string,
  to?: string,
): SummaryResponse | undefined {
  return useQuery(
    api.transactions.queries.getTransactionSummary,
    from && to
      ? {
          from: new Date(from).getTime(),
          to: new Date(to).getTime(),
        }
      : "skip",
  );
}

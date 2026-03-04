export type TransactionKind = "expense" | "income" | "transfer" | "adjustment";
export type TransactionDirection = "in" | "out";

export interface TransactionRecord {
  id: string;
  kind: TransactionKind;
  accountName?: string;
  accountId?: string;
  fromAccountId?: string;
  toAccountId?: string;
  categoryId?: string;
  title: string;
  category: string;
  direction: TransactionDirection;
  amount: number;
  currencyCode: string;
  createdAt: string;
  updatedAt: string;
  occurredAt: string;
}

export interface ListTransactionsParams {
  limit?: number;
  before?: number;
}

export interface CreateTransactionPayload {
  kind: TransactionKind;
  amount: number;
  currencyCode?: string;
  accountId?: string;
  fromAccountId?: string;
  toAccountId?: string;
  categoryId?: string;
  note?: string;
  occurredAt?: string;
}

export interface UpdateTransactionPayload {
  amount?: number;
  categoryId?: string;
  note?: string;
  occurredAt?: string;
}

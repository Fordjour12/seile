export type TransactionDirection = "in" | "out";

export interface TransactionRecord {
  id: string;
  accountId: string;
  accountName: string;
  title: string;
  category: string;
  direction: TransactionDirection;
  amount: number;
  currencyCode: string;
  createdAt: string;
}

export interface ListTransactionsParams {
  limit?: number;
  accountId?: string;
}

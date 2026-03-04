export type AccountType = "checking" | "savings" | "credit" | "cash" | "investment";

export type AccountStatus = "active" | "archived" | "closed";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  status: AccountStatus;
  currencyCode: string;
  balance: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountPayload {
  name: string;
  type: AccountType;
  currencyCode?: string;
  openingBalance?: number;
  note?: string;
}

export interface UpdateAccountPayload {
  name?: string;
  type?: AccountType;
  status?: AccountStatus;
  currencyCode?: string;
  balance?: number;
  note?: string;
}

export interface DeleteAccountPayload {
  id: string;
  hardDelete?: boolean;
}

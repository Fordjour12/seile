import { api } from "@/lib/backend-api";
import { convex } from "@/lib/convex-client";

import type {
  Account,
  AccountStatus,
  AccountType,
  CreateAccountPayload,
  DeleteAccountPayload,
  UpdateAccountPayload,
} from "./types";

type BackendAccountType = "checking" | "savings" | "cash" | "credit" | "investment" | "bank";
type BackendAccountStatus = "active" | "archived" | "closed";

type BackendAccount = {
  _id: string;
  _creationTime: number;
  userId: string;
  name: string;
  providerName?: string;
  type: BackendAccountType;
  status?: BackendAccountStatus;
  currency: string;
  balance: number;
  note?: string;
  createdAt: number;
  updatedAt: number;
  isArchived?: boolean;
};

type PaginatedAccounts = {
  page: BackendAccount[];
};

type ArchiveResponse = {
  success: boolean;
};

function mapBackendType(type: BackendAccountType): AccountType {
  switch (type) {
    case "bank":
      return "checking";
    case "investment":
      return "investment";
    default:
      return type;
  }
}

function mapBackendStatus(input: Pick<BackendAccount, "status" | "isArchived">): AccountStatus {
  if (input.status) {
    return input.status;
  }

  return input.isArchived ? "archived" : "active";
}

function mapAccount(account: BackendAccount): Account {
  return {
    id: account._id,
    name: account.name,
    providerName: account.providerName,
    type: mapBackendType(account.type),
    status: mapBackendStatus(account),
    currencyCode: account.currency,
    balance: account.balance,
    note: account.note,
    createdAt: new Date(account.createdAt).toISOString(),
    updatedAt: new Date(account.updatedAt).toISOString(),
  };
}

function mapOutgoingType(type: AccountType): BackendAccountType {
  return type;
}

export async function getAccount(accountId: string): Promise<Account | null> {
  try {
    const response = await convex.query(api.accounts.getAccountById, {
      accountId,
    });

    return mapAccount(response);
  } catch {
    return null;
  }
}

export async function createAccount(payload: CreateAccountPayload): Promise<Account> {
  const response = await convex.mutation(api.accounts.createAccount, {
    name: payload.name,
    providerName: payload.providerName,
    type: mapOutgoingType(payload.type),
    currency: payload.currencyCode ?? "GHS",
    openingBalance: payload.openingBalance ?? 0,
    note: payload.note,
  });

  return mapAccount(response);
}

export async function updateAccount(
  accountId: string,
  payload: UpdateAccountPayload,
): Promise<Account | null> {
  try {
    const response = await convex.mutation(api.accounts.updateAccount, {
      accountId,
      name: payload.name,
      providerName: payload.providerName,
      type: payload.type ? mapOutgoingType(payload.type) : undefined,
      currency: payload.currencyCode,
      balance: payload.balance,
      status: payload.status,
      note: payload.note,
    });

    return mapAccount(response);
  } catch {
    return null;
  }
}

export async function deleteAccount(payload: DeleteAccountPayload): Promise<boolean> {
  const response = await convex.mutation(api.accounts.deleteAccount, {
    accountId: payload.id,
  });
  return response;
}

export async function listAccounts(): Promise<Account[]> {
  const response = await convex.query(api.accounts.listAccounts, {
    includeArchived: false,
    pagination: {
      limit: 50,
    },
  });

  return response.page.map(mapAccount);
}

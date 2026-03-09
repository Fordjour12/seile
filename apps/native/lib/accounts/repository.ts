import { api, asId } from "@/lib/backend-api";
import { useMutation, useQuery } from "convex/react";

import type {
  Account,
  AccountStatus,
  AccountType,
  CreateAccountPayload,
  DeleteAccountPayload,
  UpdateAccountPayload,
} from "./types";

type BackendAccountType =
  | "checking"
  | "savings"
  | "cash"
  | "credit"
  | "investment"
  | "bank";
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

function mapBackendStatus(
  input: Pick<BackendAccount, "status" | "isArchived">,
): AccountStatus {
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

export function useAccount(accountId?: string): Account | null | undefined {
  const response = useQuery(
    api.accounts.getAccountById,
    accountId ? { accountId: asId<"accounts">(accountId) } : "skip",
  );

  return response ? mapAccount(response) : response;
}

export function useCreateAccount(): (
  payload: CreateAccountPayload,
) => Promise<Account> {
  const createAccount = useMutation(api.accounts.createAccount);

  return async (payload) => {
    const response = await createAccount({
      name: payload.name,
      providerName: payload.providerName,
      type: mapOutgoingType(payload.type),
      currency: payload.currencyCode ?? "GHS",
      openingBalance: payload.openingBalance ?? 0,
      note: payload.note,
    });

    return mapAccount(response);
  };
}

export function useUpdateAccount(): (
  accountId: string,
  payload: UpdateAccountPayload,
) => Promise<Account> {
  const updateAccount = useMutation(api.accounts.updateAccount);

  return async (accountId, payload) => {
    const response = await updateAccount({
      accountId: asId<"accounts">(accountId),
      name: payload.name,
      providerName: payload.providerName,
      type: payload.type ? mapOutgoingType(payload.type) : undefined,
      currency: payload.currencyCode,
      balance: payload.balance,
      status: payload.status,
      note: payload.note,
    });

    return mapAccount(response);
  };
}

export function useDeleteAccount(): (
  payload: DeleteAccountPayload,
) => Promise<boolean> {
  const deleteAccount = useMutation(api.accounts.deleteAccount);

  return (payload) =>
    deleteAccount({
      accountId: asId<"accounts">(payload.id),
    });
}

export function useAccounts(): Account[] | undefined {
  const response = useQuery(api.accounts.listAccounts, {
    includeArchived: false,
    pagination: {
      limit: 50,
    },
  });

  return response?.page.map(mapAccount);
}

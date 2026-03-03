import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { getAccountById, type AccountRecord } from "../data";

type RouteAccountContextValue = {
  accountId: string;
  account: AccountRecord | null;
  isLoading: boolean;
  error: string | null;
  refreshAccount: () => Promise<void>;
};

const RouteAccountContext = createContext<RouteAccountContextValue | null>(null);

export function RouteAccountProvider({ children }: { children: React.ReactNode }) {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const accountId = Array.isArray(params.id) ? params.id[0] ?? "" : params.id ?? "";

  const [account, setAccount] = useState<AccountRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAccount = async () => {
    if (!accountId) {
      setAccount(null);
      setError("Missing account id.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const nextAccount = await getAccountById(accountId);

      if (!nextAccount) {
        setAccount(null);
        setError("This account no longer exists.");
        return;
      }

      setAccount(nextAccount);
      setError(null);
    } catch {
      setAccount(null);
      setError("Unable to load account details right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshAccount();
  }, [accountId]);

  const value = useMemo<RouteAccountContextValue>(
    () => ({
      account,
      accountId,
      isLoading,
      error,
      refreshAccount,
    }),
    [account, accountId, error, isLoading],
  );

  return <RouteAccountContext.Provider value={value}>{children}</RouteAccountContext.Provider>;
}

export function useRouteAccount() {
  const value = useContext(RouteAccountContext);

  if (!value) {
    throw new Error("useRouteAccount must be used inside RouteAccountProvider");
  }

  return value;
}

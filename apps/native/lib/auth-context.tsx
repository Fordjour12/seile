import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { authClient } from "@/lib/auth-client";

export type AuthUser = {
  id?: string;
  userId?: string;
  name?: string;
  email?: string;
  image?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signInWithPasskey: () => Promise<void>;
  signUp: (credentials: { name: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const user = raw as Record<string, unknown>;
  const canonicalId =
    typeof user.id === "string"
      ? user.id
      : typeof user.userId === "string"
        ? user.userId
        : undefined;

  return {
    id: canonicalId,
    userId:
      typeof user.userId === "string"
        ? user.userId
        : canonicalId,
    name: typeof user.name === "string" ? user.name : undefined,
    email: typeof user.email === "string" ? user.email : undefined,
    image: typeof user.image === "string" ? user.image : undefined,
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await authClient.getSession();
      setUser(toAuthUser(session.data?.user));
    } catch {
      setUser(null);
      setError("Failed to refresh session");
    } finally {
      setIsLoading(false);
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const signIn = useCallback(
    async (credentials: { email: string; password: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await authClient.signIn.email(credentials);
        if (result.error) {
          setError(result.error.message ?? "Failed to sign in");
          return;
        }

        setUser(toAuthUser(result.data?.user));
        await refreshSession();
      } catch {
        setError("Failed to sign in");
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession],
  );

  const signInWithPasskey = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authClient.signIn.passkey({
        autoFill: false,
      });
      if (result.error) {
        setError(result.error.message ?? "Failed to sign in with passkey");
        return;
      }

      setUser(toAuthUser(result.data?.user));
      await refreshSession();
    } catch {
      setError("Failed to sign in with passkey");
    } finally {
      setIsLoading(false);
    }
  }, [refreshSession]);

  const signUp = useCallback(
    async (credentials: { name: string; email: string; password: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await authClient.signUp.email(credentials);
        if (result.error) {
          setError(result.error.message ?? "Failed to sign up");
          return;
        }

        setUser(toAuthUser(result.data?.user));
        await refreshSession();
      } catch {
        setError("Failed to sign up");
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession],
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signOut();
    } catch {
      setError("Failed to sign out");
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      error,
      hasHydrated,
      signIn,
      signInWithPasskey,
      signUp,
      signOut,
      refreshSession,
      clearError,
    }),
    [clearError, error, hasHydrated, isLoading, refreshSession, signIn, signInWithPasskey, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}

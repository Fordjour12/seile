/**
 * Life OS — AuthContext
 *
 * Flow:
 *   1. Cold open → check SecureStore for onboarding flags
 *   2. First install → Onboarding (7-step setup)
 *   3. End of onboarding → Create Account (email/social)
 *   4. Authenticated + first-run → First Run Today (days 1-7)
 *   5. After 7 days → Weekly review unlocks, full Tabs
 *   6. Subsequent opens → straight to Tabs
 *
 * Stack:
 *   - convex-auth        server-side session management
 *   - better-auth        client-side auth (email, Google, Apple)
 *   - expo-secure-store  device-local flag persistence
 *   - react-native       navigation via Expo Router
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import * as SecureStore from "expo-secure-store";
import { useConvexAuth } from "convex/react";
import { router } from "expo-router";

import { authClient } from "@/lib/auth-client";

const STORE_KEYS = {
  ONBOARDING_STARTED: "lifeos.onboarding.started",
  ONBOARDING_COMPLETE: "lifeos.onboarding.complete",
  FIRST_LOGIN_AT: "lifeos.first_login_at",
  FIRST_RUN_COMPLETE: "lifeos.first_run.complete",
  ONBOARDING_DRAFT: "lifeos.onboarding.draft",
} as const;

export type AppStage =
  | "loading"
  | "onboarding"
  | "create-account"
  | "first-run"
  | "tabs";

export interface OnboardingDraft {
  name?: string;
  selectedDomains?: string[];
  planningStyle?: "light" | "balanced" | "intensive";
  aiTone?: "direct" | "coaching" | "minimal";
  notifications?: Record<string, boolean>;
  lastStep?: number;
}

export type AuthUser = {
  id?: string;
  userId?: string;
  name?: string;
  email?: string;
  image?: string;
};

interface AuthState {
  stage: AppStage;
  daysSinceFirstLogin: number | null;
  onboardingDraft: OnboardingDraft;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "SET_STAGE"; stage: AppStage }
  | { type: "SET_DAYS"; days: number }
  | { type: "SET_DRAFT"; draft: Partial<OnboardingDraft> }
  | { type: "CLEAR_DRAFT" }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_LOADING"; loading: boolean };

export interface AuthContextValue extends AuthState {
  user: AuthUser | null;
  hasHydrated: boolean;
  hasCompletedOnboarding: boolean;
  needsOnboarding: boolean;
  startOnboarding: () => Promise<void>;
  saveOnboardingDraft: (draft: Partial<OnboardingDraft>) => Promise<void>;
  completeOnboardingSetup: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (credentials: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  advanceOnboardingStage: (
    stage: "first-run-today" | "week-1" | "complete",
  ) => Promise<void>;
  clearError: () => void;
  completeFirstRun: () => Promise<void>;
}

const INITIAL_STATE: AuthState = {
  stage: "loading",
  daysSinceFirstLogin: null,
  onboardingDraft: {},
  isLoading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_STAGE":
      return { ...state, stage: action.stage };
    case "SET_DAYS":
      return { ...state, daysSinceFirstLogin: action.days };
    case "SET_DRAFT":
      return {
        ...state,
        onboardingDraft: { ...state.onboardingDraft, ...action.draft },
      };
    case "CLEAR_DRAFT":
      return { ...state, onboardingDraft: {} };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_LOADING":
      return { ...state, isLoading: action.loading };
    default:
      return state;
  }
}

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
      typeof user.userId === "string" ? user.userId : canonicalId,
    name: typeof user.name === "string" ? user.name : undefined,
    email: typeof user.email === "string" ? user.email : undefined,
    image: typeof user.image === "string" ? user.image : undefined,
  };
}

async function readFlag(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function writeFlag(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

async function deleteFlag(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

function daysBetween(isoTimestamp: string): number {
  const first = new Date(isoTimestamp).getTime();
  const now = Date.now();
  return Math.floor((now - first) / (1000 * 60 * 60 * 24));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, INITIAL_STATE);

  const { isAuthenticated, isLoading: convexLoading } = useConvexAuth();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const user = useMemo(() => toAuthUser(session?.user), [session?.user]);

  const hasBooted = useRef(false);

  useEffect(() => {
    if (convexLoading) return;
    if (hasBooted.current) return;
    hasBooted.current = true;

    (async () => {
      try {
        const [
          onboardingComplete,
          firstLoginAt,
          firstRunComplete,
          draftRaw,
        ] = await Promise.all([
          readFlag(STORE_KEYS.ONBOARDING_COMPLETE),
          readFlag(STORE_KEYS.FIRST_LOGIN_AT),
          readFlag(STORE_KEYS.FIRST_RUN_COMPLETE),
          readFlag(STORE_KEYS.ONBOARDING_DRAFT),
        ]);

        if (draftRaw) {
          try {
            dispatch({
              type: "SET_DRAFT",
              draft: JSON.parse(draftRaw) as OnboardingDraft,
            });
          } catch {
            await deleteFlag(STORE_KEYS.ONBOARDING_DRAFT);
          }
        }

        if (firstLoginAt) {
          dispatch({
            type: "SET_DAYS",
            days: daysBetween(firstLoginAt),
          });
        }

        let stage: AppStage = "onboarding";

        if (!onboardingComplete && !isAuthenticated) {
          stage = "onboarding";
        } else if (!onboardingComplete && isAuthenticated) {
          await writeFlag(STORE_KEYS.ONBOARDING_COMPLETE, "true");
          if (firstRunComplete === "true") {
            stage = "tabs";
          } else if (firstLoginAt && daysBetween(firstLoginAt) >= 7) {
            await writeFlag(STORE_KEYS.FIRST_RUN_COMPLETE, "true");
            stage = "tabs";
          } else {
            stage = "first-run";
          }
        } else if (!isAuthenticated) {
          stage = "create-account";
        } else if (firstRunComplete === "true") {
          stage = "tabs";
        } else if (firstLoginAt) {
          const days = daysBetween(firstLoginAt);
          if (days >= 7) {
            await writeFlag(STORE_KEYS.FIRST_RUN_COMPLETE, "true");
            stage = "tabs";
          } else {
            stage = "first-run";
          }
        } else {
          await writeFlag(STORE_KEYS.FIRST_LOGIN_AT, new Date().toISOString());
          dispatch({ type: "SET_DAYS", days: 0 });
          stage = "first-run";
        }

        dispatch({ type: "SET_STAGE", stage });
        navigateToStage(stage);
      } catch (err) {
        console.error("[AuthContext] boot error", err);
        dispatch({ type: "SET_STAGE", stage: "onboarding" });
      }
    })();
  }, [convexLoading, isAuthenticated]);

  const navigateToStage = useCallback((stage: AppStage) => {
    switch (stage) {
      case "onboarding":
        router.replace("/(auth)");
        break;
      case "create-account":
        router.replace("/(auth)/sign-up");
        break;
      case "first-run":
        router.replace("/(tabs)");
        break;
      case "tabs":
        router.replace("/(tabs)");
        break;
      default:
        break;
    }
  }, []);

  const startOnboarding = useCallback(async () => {
    await writeFlag(STORE_KEYS.ONBOARDING_STARTED, "true");
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", error: null });
  }, []);

  const saveOnboardingDraft = useCallback(
    async (draft: Partial<OnboardingDraft>) => {
      dispatch({ type: "SET_DRAFT", draft });
      const merged = { ...state.onboardingDraft, ...draft };
      await writeFlag(STORE_KEYS.ONBOARDING_DRAFT, JSON.stringify(merged));
    },
    [state.onboardingDraft],
  );

  const completeOnboardingSetup = useCallback(async () => {
    await writeFlag(STORE_KEYS.ONBOARDING_COMPLETE, "true");
    dispatch({ type: "SET_STAGE", stage: "create-account" });
  }, []);

  const handleSuccessfulAuth = useCallback(async () => {
    dispatch({ type: "CLEAR_DRAFT" });
    dispatch({ type: "SET_ERROR", error: null });
    await deleteFlag(STORE_KEYS.ONBOARDING_DRAFT);
    await writeFlag(STORE_KEYS.ONBOARDING_COMPLETE, "true");

    const existing = await readFlag(STORE_KEYS.FIRST_LOGIN_AT);
    const firstRunComplete = await readFlag(STORE_KEYS.FIRST_RUN_COMPLETE);
    if (!existing) {
      const now = new Date().toISOString();
      await writeFlag(STORE_KEYS.FIRST_LOGIN_AT, now);
      dispatch({ type: "SET_DAYS", days: 0 });
      dispatch({ type: "SET_STAGE", stage: "first-run" });
      router.replace("/(tabs)");
    } else {
      const days = daysBetween(existing);
      dispatch({ type: "SET_DAYS", days });
      let stage: AppStage = "first-run";
      if (firstRunComplete === "true") {
        stage = "tabs";
      } else if (days >= 7) {
        await writeFlag(STORE_KEYS.FIRST_RUN_COMPLETE, "true");
        stage = "tabs";
      }
      dispatch({ type: "SET_STAGE", stage });
      navigateToStage(stage);
    }
  }, [navigateToStage]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        dispatch({
          type: "SET_ERROR",
          error: result.error.message ?? "Sign in failed",
        });
        return;
      }

      await handleSuccessfulAuth();
    } catch (err: any) {
      dispatch({
        type: "SET_ERROR",
        error: err?.message ?? "Sign in failed",
      });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, [handleSuccessfulAuth]);

  const signUpWithEmail = useCallback(
    async (name: string, email: string, password: string) => {
      dispatch({ type: "SET_LOADING", loading: true });
      dispatch({ type: "SET_ERROR", error: null });
      try {
        const result = await authClient.signUp.email({ name, email, password });
        if (result.error) {
          dispatch({
            type: "SET_ERROR",
            error: result.error.message ?? "Sign up failed",
          });
          return;
        }

        await handleSuccessfulAuth();
      } catch (err: any) {
        dispatch({
          type: "SET_ERROR",
          error: err?.message ?? "Sign up failed",
        });
      } finally {
        dispatch({ type: "SET_LOADING", loading: false });
      }
    },
    [handleSuccessfulAuth],
  );

  const signInWithGoogle = useCallback(async () => {
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      const result = await authClient.signIn.social({ provider: "google" });
      if (result.error) {
        dispatch({
          type: "SET_ERROR",
          error: result.error.message ?? "Google sign in failed",
        });
        return;
      }

      await handleSuccessfulAuth();
    } catch (err: any) {
      dispatch({
        type: "SET_ERROR",
        error: err?.message ?? "Google sign in failed",
      });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, [handleSuccessfulAuth]);

  const signInWithApple = useCallback(async () => {
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      const result = await authClient.signIn.social({ provider: "apple" });
      if (result.error) {
        dispatch({
          type: "SET_ERROR",
          error: result.error.message ?? "Apple sign in failed",
        });
        return;
      }

      await handleSuccessfulAuth();
    } catch (err: any) {
      dispatch({
        type: "SET_ERROR",
        error: err?.message ?? "Apple sign in failed",
      });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, [handleSuccessfulAuth]);

  const signIn = useCallback(
    async (credentials: { email: string; password: string }) => {
      await signInWithEmail(credentials.email, credentials.password);
    },
    [signInWithEmail],
  );

  const signUp = useCallback(
    async (credentials: { name: string; email: string; password: string }) => {
      await signUpWithEmail(
        credentials.name,
        credentials.email,
        credentials.password,
      );
    },
    [signUpWithEmail],
  );

  const signOut = useCallback(async () => {
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      await authClient.signOut();
      dispatch({ type: "SET_STAGE", stage: "create-account" });
      router.replace("/(auth)/sign-in");
    } catch (err: any) {
      dispatch({
        type: "SET_ERROR",
        error: err?.message ?? "Sign out failed",
      });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, []);

  const prevAuthenticated = useRef<boolean | null>(null);

  useEffect(() => {
    if (convexLoading) return;
    if (prevAuthenticated.current === isAuthenticated) return;
    prevAuthenticated.current = isAuthenticated;

    if (isAuthenticated && state.stage === "create-account") {
      void handleSuccessfulAuth();
    }
  }, [isAuthenticated, convexLoading, state.stage, handleSuccessfulAuth]);

  const refreshSession = useCallback(async () => {
    await authClient.getSession();
  }, []);

  const completeFirstRun = useCallback(async () => {
    await writeFlag(STORE_KEYS.FIRST_RUN_COMPLETE, "true");
    dispatch({ type: "SET_STAGE", stage: "tabs" });
    router.replace("/(tabs)");
  }, []);

  const completeOnboarding = useCallback(async () => {
    await completeFirstRun();
  }, [completeFirstRun]);

  const advanceOnboardingStage = useCallback(
    async (stage: "first-run-today" | "week-1" | "complete") => {
      if (stage === "complete") {
        await completeFirstRun();
        return;
      }

      dispatch({ type: "SET_STAGE", stage: "first-run" });
    },
    [completeFirstRun],
  );

  const hasHydrated = state.stage !== "loading" && !convexLoading && !sessionLoading;
  const hasCompletedOnboarding = state.stage === "tabs";
  const needsOnboarding = Boolean(user) && state.stage !== "tabs";

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      user,
      hasHydrated,
      hasCompletedOnboarding,
      needsOnboarding,
      startOnboarding,
      saveOnboardingDraft,
      completeOnboardingSetup,
      completeOnboarding,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signInWithApple,
      signIn,
      signUp,
      signOut,
      refreshSession,
      advanceOnboardingStage,
      clearError,
      completeFirstRun,
    }),
    [
      state,
      user,
      hasHydrated,
      hasCompletedOnboarding,
      needsOnboarding,
      startOnboarding,
      saveOnboardingDraft,
      completeOnboardingSetup,
      completeOnboarding,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signInWithApple,
      signIn,
      signUp,
      signOut,
      refreshSession,
      advanceOnboardingStage,
      clearError,
      completeFirstRun,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}

export function useIsFirstRun(): boolean {
  const { stage } = useAuth();
  return stage === "first-run";
}

export function useDaysSinceFirstLogin(): number | null {
  const { daysSinceFirstLogin } = useAuth();
  return daysSinceFirstLogin;
}

export function useOnboardingDraft(): OnboardingDraft {
  const { onboardingDraft } = useAuth();
  return onboardingDraft;
}

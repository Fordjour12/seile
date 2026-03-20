/**
 * Life OS — AuthContext
 *
 * Flow:
 *   1. Cold open → check SecureStore for onboarding draft and migration flags
 *   2. First install → Onboarding (7-step setup)
 *   3. End of onboarding → Create Account (email/social)
 *   4. Successful auth → Sync draft to Convex userProfile + initialize first-run
 *   5. Authenticated routing resolves from Convex onboardingState
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
import { useConvex, useConvexAuth } from "convex/react";
import { router } from "expo-router";
import { api } from "@/convex/_generated/api";

import { authClient } from "@/lib/auth-client";
import {
  type UserNotificationPreferences,
  type UserProfileAiTone,
  type UserProfileInput,
  type UserProfilePlanningStyle,
  isCompleteUserProfileInput,
} from "@/lib/user-profile";

const STORE_KEYS = {
  ONBOARDING_STARTED: "lifeos.onboarding.started",
  ONBOARDING_COMPLETE: "lifeos.onboarding.complete",
  FIRST_LOGIN_AT: "lifeos.first_login_at",
  FIRST_RUN_COMPLETE: "lifeos.first_run.complete",
  ONBOARDING_DRAFT: "lifeos.onboarding.draft",
} as const;

export type AppStage = "loading" | "onboarding" | "create-account" | "first-run" | "tabs";

export interface OnboardingDraft extends Partial<UserProfileInput> {
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
  | { type: "SET_DAYS"; days: number | null }
  | { type: "SET_DRAFT"; draft: Partial<OnboardingDraft> }
  | { type: "REPLACE_DRAFT"; draft: OnboardingDraft }
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
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (credentials: { name: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  advanceOnboardingStage: (stage: "first-run-today" | "week-1" | "complete") => Promise<void>;
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
    case "REPLACE_DRAFT":
      return { ...state, onboardingDraft: action.draft };
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
    userId: typeof user.userId === "string" ? user.userId : canonicalId,
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

function daysBetween(timestamp: number): number {
  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
}

function parseTimestamp(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseDraft(raw: string | null): OnboardingDraft | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as OnboardingDraft;
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

function toUserProfileInput(draft: OnboardingDraft): UserProfileInput | null {
  if (!isCompleteUserProfileInput(draft)) {
    return null;
  }

  return {
    name: draft.name.trim(),
    selectedDomains: uniqueStrings(draft.selectedDomains),
    pinnedDomainIds: uniqueStrings(draft.pinnedDomainIds),
    planningStyle: draft.planningStyle,
    aiTone: draft.aiTone,
    notifications: draft.notifications,
    draftCompletedAt: draft.draftCompletedAt ?? Date.now(),
  };
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, INITIAL_STATE);

  const convex = useConvex();
  const { isAuthenticated, isLoading: convexLoading } = useConvexAuth();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const user = useMemo(() => toAuthUser(session?.user), [session?.user]);

  const hasBooted = useRef(false);
  const isResolvingAuth = useRef(false);
  const prevAuthenticated = useRef<boolean | null>(null);
  const onboardingDraftRef = useRef<OnboardingDraft>(INITIAL_STATE.onboardingDraft);

  useEffect(() => {
    onboardingDraftRef.current = state.onboardingDraft;
  }, [state.onboardingDraft]);

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

  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", error: null });
  }, []);

  const saveOnboardingDraft = useCallback(async (draft: Partial<OnboardingDraft>) => {
    const merged = { ...onboardingDraftRef.current, ...draft };
    dispatch({ type: "SET_DRAFT", draft });
    await writeFlag(STORE_KEYS.ONBOARDING_DRAFT, JSON.stringify(merged));
  }, []);

  const startOnboarding = useCallback(async () => {
    await writeFlag(STORE_KEYS.ONBOARDING_STARTED, "true");
  }, []);

  const completeOnboardingSetup = useCallback(async () => {
    await writeFlag(STORE_KEYS.ONBOARDING_COMPLETE, "true");
    dispatch({ type: "SET_STAGE", stage: "create-account" });
  }, []);

  const syncDraftToBackend = useCallback(
    async (draft: OnboardingDraft) => {
      const profile = toUserProfileInput(draft);
      if (!profile) {
        return false;
      }

      await convex.mutation(api.onboarding.upsertUserProfile, profile);
      await convex.mutation(api.onboarding.initializeOnboardingState, {});
      await convex.action(api.onboarding_actions.initializeFirstRunForUser, {});
      return true;
    },
    [convex],
  );

  const setFirstRunLocalClock = useCallback(async (startedAt: number | null) => {
    const existing = await readFlag(STORE_KEYS.FIRST_LOGIN_AT);
    const timestamp = startedAt ?? parseTimestamp(existing) ?? Date.now();

    if (!existing) {
      await writeFlag(STORE_KEYS.FIRST_LOGIN_AT, new Date(timestamp).toISOString());
    }

    dispatch({ type: "SET_DAYS", days: daysBetween(timestamp) });
  }, []);

  const resolveAuthenticatedStage = useCallback(async () => {
    const [onboardingComplete, firstRunComplete, firstLoginAt, draftRaw] = await Promise.all([
      readFlag(STORE_KEYS.ONBOARDING_COMPLETE),
      readFlag(STORE_KEYS.FIRST_RUN_COMPLETE),
      readFlag(STORE_KEYS.FIRST_LOGIN_AT),
      readFlag(STORE_KEYS.ONBOARDING_DRAFT),
    ]);

    const storedDraft = parseDraft(draftRaw);
    if (storedDraft) {
      dispatch({ type: "REPLACE_DRAFT", draft: storedDraft });
    }

    const shouldSyncDraft =
      onboardingComplete === "true" &&
      storedDraft !== null &&
      isCompleteUserProfileInput(storedDraft);

    if (shouldSyncDraft) {
      await syncDraftToBackend(storedDraft);
      await deleteFlag(STORE_KEYS.ONBOARDING_DRAFT);
      dispatch({ type: "CLEAR_DRAFT" });
    }

    let remoteState = await convex.query(api.onboarding.getOnboardingState, {});

    if (!remoteState.exists) {
      if (firstRunComplete === "true") {
        dispatch({ type: "SET_DAYS", days: null });
        return "tabs" as const;
      }

      await convex.mutation(api.onboarding.initializeOnboardingState, {});
      remoteState = await convex.query(api.onboarding.getOnboardingState, {});
    }

    if (remoteState.currentStage === "complete") {
      await writeFlag(STORE_KEYS.ONBOARDING_COMPLETE, "true");
      await writeFlag(STORE_KEYS.FIRST_RUN_COMPLETE, "true");
      dispatch({ type: "SET_DAYS", days: null });
      return "tabs" as const;
    }

    const localFirstLogin = parseTimestamp(firstLoginAt);
    const startedAt = remoteState.startedAt ?? localFirstLogin ?? Date.now();
    await writeFlag(STORE_KEYS.ONBOARDING_COMPLETE, "true");
    await deleteFlag(STORE_KEYS.FIRST_RUN_COMPLETE);
    await setFirstRunLocalClock(startedAt);
    return "first-run" as const;
  }, [convex, setFirstRunLocalClock, syncDraftToBackend]);

  const handleSuccessfulAuth = useCallback(async () => {
    if (isResolvingAuth.current) {
      return;
    }

    isResolvingAuth.current = true;
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_ERROR", error: null });

    try {
      const stage = await resolveAuthenticatedStage();
      dispatch({ type: "SET_STAGE", stage });
      navigateToStage(stage);
    } catch (err: any) {
      console.error("[AuthContext] auth resolution error", err);
      dispatch({
        type: "SET_ERROR",
        error: err?.message ?? "Failed to sync onboarding",
      });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
      isResolvingAuth.current = false;
    }
  }, [navigateToStage, resolveAuthenticatedStage]);

  useEffect(() => {
    if (convexLoading) {
      return;
    }
    if (hasBooted.current) {
      return;
    }

    hasBooted.current = true;

    (async () => {
      try {
        const [onboardingComplete, draftRaw] = await Promise.all([
          readFlag(STORE_KEYS.ONBOARDING_COMPLETE),
          readFlag(STORE_KEYS.ONBOARDING_DRAFT),
        ]);

        const draft = parseDraft(draftRaw);
        if (draft) {
          dispatch({ type: "REPLACE_DRAFT", draft });
        } else if (draftRaw) {
          await deleteFlag(STORE_KEYS.ONBOARDING_DRAFT);
        }

        let stage: AppStage;
        if (!isAuthenticated) {
          stage = onboardingComplete === "true" ? "create-account" : "onboarding";
          const firstLoginAt = parseTimestamp(await readFlag(STORE_KEYS.FIRST_LOGIN_AT));
          dispatch({
            type: "SET_DAYS",
            days: firstLoginAt === null ? null : daysBetween(firstLoginAt),
          });
        } else {
          stage = await resolveAuthenticatedStage();
        }

        prevAuthenticated.current = isAuthenticated;
        dispatch({ type: "SET_STAGE", stage });
        navigateToStage(stage);
      } catch (err) {
        console.error("[AuthContext] boot error", err);
        dispatch({ type: "SET_STAGE", stage: "onboarding" });
      }
    })();
  }, [convexLoading, isAuthenticated, navigateToStage, resolveAuthenticatedStage]);

  useEffect(() => {
    if (convexLoading) {
      return;
    }
    if (prevAuthenticated.current === isAuthenticated) {
      return;
    }

    prevAuthenticated.current = isAuthenticated;

    if (isAuthenticated) {
      void handleSuccessfulAuth();
      return;
    }

    void (async () => {
      const onboardingComplete = await readFlag(STORE_KEYS.ONBOARDING_COMPLETE);
      const nextStage = onboardingComplete === "true" ? "create-account" : "onboarding";
      dispatch({ type: "SET_STAGE", stage: nextStage });
      navigateToStage(nextStage);
    })();
  }, [convexLoading, handleSuccessfulAuth, isAuthenticated, navigateToStage]);

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

      await authClient.getSession();
    } catch (err: any) {
      dispatch({
        type: "SET_ERROR",
        error: err?.message ?? "Sign in failed",
      });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, []);

  const signUpWithEmail = useCallback(async (name: string, email: string, password: string) => {
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

      await authClient.getSession();
    } catch (err: any) {
      dispatch({
        type: "SET_ERROR",
        error: err?.message ?? "Sign up failed",
      });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, []);

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

      await authClient.getSession();
    } catch (err: any) {
      dispatch({
        type: "SET_ERROR",
        error: err?.message ?? "Google sign in failed",
      });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, []);

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

      await authClient.getSession();
    } catch (err: any) {
      dispatch({
        type: "SET_ERROR",
        error: err?.message ?? "Apple sign in failed",
      });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, []);

  const signIn = useCallback(
    async (credentials: { email: string; password: string }) => {
      await signInWithEmail(credentials.email, credentials.password);
    },
    [signInWithEmail],
  );

  const signUp = useCallback(
    async (credentials: { name: string; email: string; password: string }) => {
      await signUpWithEmail(credentials.name, credentials.email, credentials.password);
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

  const refreshSession = useCallback(async () => {
    await authClient.getSession();
    if (isAuthenticated) {
      await handleSuccessfulAuth();
    }
  }, [handleSuccessfulAuth, isAuthenticated]);

  const completeFirstRun = useCallback(async () => {
    await convex.mutation(api.onboarding.completeOnboarding, {});
    await writeFlag(STORE_KEYS.FIRST_RUN_COMPLETE, "true");
    await writeFlag(STORE_KEYS.ONBOARDING_COMPLETE, "true");
    dispatch({ type: "SET_DAYS", days: null });
    dispatch({ type: "SET_STAGE", stage: "tabs" });
    router.replace("/(tabs)");
  }, [convex]);

  const completeOnboarding = useCallback(async () => {
    await completeFirstRun();
  }, [completeFirstRun]);

  const advanceOnboardingStage = useCallback(
    async (stage: "first-run-today" | "week-1" | "complete") => {
      if (stage === "complete") {
        await completeFirstRun();
        return;
      }

      await convex.mutation(api.onboarding.advanceOnboardingStage, { stage });
      dispatch({ type: "SET_STAGE", stage: "first-run" });
    },
    [completeFirstRun, convex],
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

export type { UserNotificationPreferences, UserProfileAiTone, UserProfilePlanningStyle };

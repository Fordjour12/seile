/**
 * Life OS — AuthContext
 *
 * Flow:
 *   1. Cold open → check SecureStore for onboarding draft and migration flags
 *   2. First install → Onboarding (7-step setup)
 *   3. End of onboarding → Create Account (email/social)
 *   4. Successful auth → Sync draft to Convex userProfile + initialize first-run
 *   5. Authenticated routing resolves from Convex onboardingState
 *
 * Key design decisions:
 *   - Setup completion is separate from first-run completion
 *   - Draft is only cleared after Convex profile sync succeeds (PROFILE_SYNCED flag)
 *   - Backend onboardingState is the source of truth after auth
 *   - Legacy `lifeos.onboarding.complete` is read for migration from older installs
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

import { api } from "@seile/backend/convexApi";

import { authClient } from "@/lib/auth-client";
import {
  type UserNotificationPreferences,
  type UserProfileCommitmentLevel,
  type UserProfileInput,
  type UserProfilePreferredStyle,
  isCompleteUserProfileInput,
} from "@/lib/user-profile";

const STORE_KEYS = {
  SETUP_STARTED: "lifeos.onboarding.started",
  SETUP_COMPLETE: "lifeos.setup.complete",
  PROFILE_SYNCED: "lifeos.profile.synced",
  FIRST_LOGIN_AT: "lifeos.first_login_at",
  FIRST_RUN_COMPLETE: "lifeos.first_run.complete",
  ONBOARDING_DRAFT: "lifeos.onboarding.draft",
} as const;

const LEGACY_STORE_KEYS = {
  ONBOARDING_COMPLETE: "lifeos.onboarding.complete",
} as const;

async function logSecureStoreData(): Promise<void> {
  if (__DEV__) {
    try {
      console.log("[SecureStore] Reading all stored data...");
      const storeData: Record<string, string | null> = {};

      for (const keyValue of Object.values(STORE_KEYS)) {
        try {
          storeData[keyValue] = await SecureStore.getItemAsync(keyValue);
        } catch {
          storeData[keyValue] = "[error reading]";
        }
      }

      for (const keyValue of Object.values(LEGACY_STORE_KEYS)) {
        try {
          storeData[keyValue] = await SecureStore.getItemAsync(keyValue);
        } catch {
          storeData[keyValue] = "[error reading]";
        }
      }

      console.log("[SecureStore] Current state:", storeData);
      console.table(storeData);
    } catch (err) {
      console.error("[SecureStore] Failed to log data:", err);
    }
  }
}

export type AppStage =
  | "loading"
  | "onboarding"
  | "create-account"
  | "first-run"
  | "tabs";

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

async function readSetupCompleteFlag(): Promise<string | null> {
  const current = await readFlag(STORE_KEYS.SETUP_COMPLETE);
  if (current !== null) {
    return current;
  }
  return await readFlag(LEGACY_STORE_KEYS.ONBOARDING_COMPLETE);
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
    primaryGoal: draft.primaryGoal,
    energyPattern: draft.energyPattern,
    biggestBlocker: draft.biggestBlocker,
    preferredStyle: draft.preferredStyle,
    commitmentLevel: draft.commitmentLevel,
    notifications: draft.notifications,
    timezone:
      draft.timezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC",
    seedAnswers: {
      name: draft.name.trim(),
      primaryGoal: draft.primaryGoal,
      energyPattern: draft.energyPattern,
      biggestBlocker: draft.biggestBlocker,
      preferredStyle: draft.preferredStyle,
      commitmentLevel: draft.commitmentLevel,
      notifications: draft.notifications,
      timezone:
        draft.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        "UTC",
    },
    draftCompletedAt: draft.draftCompletedAt ?? Date.now(),
  };
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

  const saveOnboardingDraft = useCallback(
    async (draft: Partial<OnboardingDraft>) => {
      const merged = { ...onboardingDraftRef.current, ...draft };
      dispatch({ type: "SET_DRAFT", draft });
      await writeFlag(STORE_KEYS.ONBOARDING_DRAFT, JSON.stringify(merged));
    },
    [],
  );

  const startOnboarding = useCallback(async () => {
    await writeFlag(STORE_KEYS.SETUP_STARTED, "true");
  }, []);

  const completeOnboardingSetup = useCallback(async () => {
    await writeFlag(STORE_KEYS.SETUP_COMPLETE, "true");
    await deleteFlag(LEGACY_STORE_KEYS.ONBOARDING_COMPLETE);
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

  const clearLocalOnboardingState = useCallback(async () => {
    await Promise.all([
      deleteFlag(STORE_KEYS.ONBOARDING_DRAFT),
      deleteFlag(STORE_KEYS.SETUP_STARTED),
      deleteFlag(STORE_KEYS.SETUP_COMPLETE),
      deleteFlag(STORE_KEYS.PROFILE_SYNCED),
      deleteFlag(STORE_KEYS.FIRST_RUN_COMPLETE),
      deleteFlag(LEGACY_STORE_KEYS.ONBOARDING_COMPLETE),
    ]);
  }, []);

  const resolveAuthenticatedStage = useCallback(async () => {
    const [
      setupComplete,
      profileSynced,
      firstRunComplete,
      firstLoginAt,
      draftRaw,
    ] = await Promise.all([
      readSetupCompleteFlag(),
      readFlag(STORE_KEYS.PROFILE_SYNCED),
      readFlag(STORE_KEYS.FIRST_RUN_COMPLETE),
      readFlag(STORE_KEYS.FIRST_LOGIN_AT),
      readFlag(STORE_KEYS.ONBOARDING_DRAFT),
    ]);

    const storedDraft = parseDraft(draftRaw);
    if (storedDraft) {
      dispatch({ type: "REPLACE_DRAFT", draft: storedDraft });
    }

    let didSyncProfile = profileSynced === "true";

    if (!didSyncProfile && storedDraft && isCompleteUserProfileInput(storedDraft)) {
      const synced = await syncDraftToBackend(storedDraft);
      if (synced) {
        didSyncProfile = true;
        await Promise.all([
          writeFlag(STORE_KEYS.PROFILE_SYNCED, "true"),
          deleteFlag(STORE_KEYS.ONBOARDING_DRAFT),
          deleteFlag(STORE_KEYS.SETUP_STARTED),
          deleteFlag(LEGACY_STORE_KEYS.ONBOARDING_COMPLETE),
        ]);
        dispatch({ type: "CLEAR_DRAFT" });
      }
    }

    let remoteState = await convex.query(api.onboarding.getOnboardingState, {});
    const remoteProfile = await convex.query(api.onboarding.getUserProfile, {});

    if (!remoteState.exists) {
      if (firstRunComplete === "true") {
        dispatch({ type: "SET_DAYS", days: null });
        return "tabs" as const;
      }

      if (didSyncProfile || remoteProfile) {
        await convex.mutation(api.onboarding.initializeOnboardingState, {});
        remoteState = await convex.query(api.onboarding.getOnboardingState, {});
      } else if (setupComplete === "true") {
        return "create-account" as const;
      } else {
        return "tabs" as const;
      }
    }

    if (remoteState.currentStage === "complete") {
      await clearLocalOnboardingState();
      dispatch({ type: "SET_DAYS", days: null });
      return "tabs" as const;
    }

    const localFirstLogin = parseTimestamp(firstLoginAt);
    const startedAt = remoteState.startedAt ?? localFirstLogin ?? Date.now();
    await writeFlag(STORE_KEYS.SETUP_COMPLETE, "true");
    await writeFlag(STORE_KEYS.PROFILE_SYNCED, "true");
    await deleteFlag(STORE_KEYS.FIRST_RUN_COMPLETE);
    await deleteFlag(LEGACY_STORE_KEYS.ONBOARDING_COMPLETE);
    await setFirstRunLocalClock(startedAt);
    return "first-run" as const;
  }, [clearLocalOnboardingState, convex, setFirstRunLocalClock, syncDraftToBackend]);

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

    void (async () => {
      try {
        await logSecureStoreData();

        const stage = isAuthenticated
          ? await resolveAuthenticatedStage()
          : ("onboarding" as const);

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
      try {
        const [setupComplete, draftRaw, firstLoginAt] = await Promise.all([
          readSetupCompleteFlag(),
          readFlag(STORE_KEYS.ONBOARDING_DRAFT),
          readFlag(STORE_KEYS.FIRST_LOGIN_AT),
        ]);

        const draft = parseDraft(draftRaw);
        if (draft) {
          dispatch({ type: "REPLACE_DRAFT", draft });
        } else if (draftRaw) {
          await deleteFlag(STORE_KEYS.ONBOARDING_DRAFT);
        }

        const nextStage =
          setupComplete === "true" ? "create-account" : "onboarding";
        const firstLoginTimestamp = parseTimestamp(firstLoginAt);
        const daysSince =
          firstLoginTimestamp === null ? null : daysBetween(firstLoginTimestamp);

        dispatch({ type: "SET_DAYS", days: daysSince });
        dispatch({ type: "SET_STAGE", stage: nextStage });
        navigateToStage(nextStage);
      } catch (err) {
        console.error("[AuthContext] unauthenticated state load error", err);
        dispatch({ type: "SET_STAGE", stage: "onboarding" });
      }
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

        await authClient.getSession();
      } catch (err: any) {
        dispatch({
          type: "SET_ERROR",
          error: err?.message ?? "Sign up failed",
        });
      } finally {
        dispatch({ type: "SET_LOADING", loading: false });
      }
    },
    [],
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

  const refreshSession = useCallback(async () => {
    await authClient.getSession();
    if (isAuthenticated) {
      await handleSuccessfulAuth();
    }
  }, [handleSuccessfulAuth, isAuthenticated]);

  const completeFirstRun = useCallback(async () => {
    await convex.mutation(api.onboarding.completeOnboarding, {});
    await Promise.all([
      clearLocalOnboardingState(),
      deleteFlag(STORE_KEYS.FIRST_LOGIN_AT),
    ]);
    dispatch({ type: "SET_DAYS", days: null });
    dispatch({ type: "SET_STAGE", stage: "tabs" });
    router.replace("/(tabs)");
  }, [clearLocalOnboardingState, convex]);

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

  const hasHydrated =
    state.stage !== "loading" && !convexLoading && !sessionLoading;
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

export type {
  UserNotificationPreferences,
  UserProfileCommitmentLevel,
  UserProfilePreferredStyle,
};

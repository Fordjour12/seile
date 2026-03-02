import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useLocalAuth } from "@/lib/use-local-auth";

interface AuthContextType {
  isLocked: boolean;
  isBiometricEnabled: boolean;
  isLoading: boolean;
  lock: () => void;
  unlock: () => Promise<{ success: boolean; error?: string }>;
  enableBiometric: () => Promise<{ success: boolean; error?: string }>;
  disableBiometric: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BIOMETRIC_KEY = "biometric_enabled";
const AUTO_LOCK_DELAY = 0;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef<number | null>(null);
  const { isReady, isSupported, isEnrolled, authenticateAsync } = useLocalAuth();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const init = async () => {
      try {
        const enabled = await SecureStore.getItemAsync(BIOMETRIC_KEY);
        if (enabled === "true") {
          setIsBiometricEnabled(true);
        } else if (enabled === null && isSupported && isEnrolled) {
          await SecureStore.setItemAsync(BIOMETRIC_KEY, "true");
          setIsBiometricEnabled(true);
        }
      } catch (error) {
        console.error("Failed to load biometric setting:", error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [isReady, isSupported, isEnrolled]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (appState.current === "active" && nextAppState.match(/inactive|background/)) {
        backgroundTime.current = Date.now();
      }

      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        if (isBiometricEnabled && backgroundTime.current) {
          setIsLocked(true);
        }
        backgroundTime.current = null;
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isBiometricEnabled]);

  const lock = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlock = useCallback(async () => {
    if (!isBiometricEnabled) {
      setIsLocked(false);
      return { success: true };
    }

    const result = await authenticateAsync({ 
      promptMessage: "Unlock Seile",
      disableDeviceFallback: false,
    });
    if (result.success) {
      setIsLocked(false);
    }
    return result;
  }, [isBiometricEnabled, isSupported, isEnrolled, authenticateAsync]);

  const enableBiometric = useCallback(async () => {
    const result = await authenticateAsync({ 
      promptMessage: "Enable biometric authentication",
      disableDeviceFallback: false,
    });
    if (result.success) {
      await SecureStore.setItemAsync(BIOMETRIC_KEY, "true");
      setIsBiometricEnabled(true);
    }
    return result;
  }, [authenticateAsync]);

  const disableBiometric = useCallback(async () => {
    await SecureStore.setItemAsync(BIOMETRIC_KEY, "false");
    setIsBiometricEnabled(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLocked,
        isBiometricEnabled,
        isLoading,
        lock,
        unlock,
        enableBiometric,
        disableBiometric,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

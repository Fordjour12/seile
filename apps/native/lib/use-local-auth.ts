import { useState, useEffect, useCallback } from "react";

type LocalAuthenticationModule = typeof import("expo-local-authentication");

export type AuthenticationType =
  | "fingerprint"
  | "facialRecognition"
  | "iris";

export interface LocalAuthResult {
  success: boolean;
  error?: string;
  warning?: string;
}

interface UseLocalAuthResult {
  isReady: boolean;
  isSupported: boolean;
  isEnrolled: boolean;
  securityLevel: "none" | "secret" | "biometricWeak" | "biometricStrong";
  authenticationTypes: AuthenticationType[];
  hasHardwareAsync: () => Promise<boolean>;
  getEnrolledLevelAsync: () => Promise<"none" | "secret" | "biometricWeak" | "biometricStrong">;
  getSupportedTypesAsync: () => Promise<AuthenticationType[]>;
  authenticateAsync: (options?: Parameters<LocalAuthenticationModule["authenticateAsync"]>[0]) => Promise<LocalAuthResult>;
}

let localAuthenticationModule: LocalAuthenticationModule | null | undefined;

function getLocalAuthenticationModule(): LocalAuthenticationModule | null {
  if (localAuthenticationModule !== undefined) {
    return localAuthenticationModule;
  }

  try {
    localAuthenticationModule = require("expo-local-authentication") as LocalAuthenticationModule;
  } catch {
    localAuthenticationModule = null;
  }

  return localAuthenticationModule;
}

function mapSecurityLevel(
  module: LocalAuthenticationModule | null,
  level: number | undefined,
): "none" | "secret" | "biometricWeak" | "biometricStrong" {
  if (!module || level === undefined) {
    return "none";
  }

  switch (level) {
    case module.SecurityLevel.NONE:
      return "none";
    case module.SecurityLevel.SECRET:
      return "secret";
    case module.SecurityLevel.BIOMETRIC_WEAK:
      return "biometricWeak";
    case module.SecurityLevel.BIOMETRIC_STRONG:
      return "biometricStrong";
    default:
      return "none";
  }
}

function mapAuthenticationTypes(
  module: LocalAuthenticationModule | null,
  types: number[],
): AuthenticationType[] {
  if (!module) {
    return [];
  }

  return types.map((type) => {
    switch (type) {
      case module.AuthenticationType.FINGERPRINT:
        return "fingerprint";
      case module.AuthenticationType.FACIAL_RECOGNITION:
        return "facialRecognition";
      case module.AuthenticationType.IRIS:
        return "iris";
      default:
        return "fingerprint";
    }
  });
}

function formatError(error: string | undefined): string {
  switch (error) {
    case "not_enrolled":
      return "No biometrics enrolled on this device";
    case "user_cancel":
      return "Authentication was cancelled";
    case "app_cancel":
      return "Authentication was cancelled by the app";
    case "not_available":
      return "Biometric authentication is not available";
    case "lockout":
      return "Too many failed attempts. Try again later";
    case "timeout":
      return "Authentication timed out";
    case "authentication_failed":
      return "Authentication failed";
    case "passcode_not_set":
      return "No passcode set on device";
    case "user_fallback":
      return "User chose to use passcode";
    case "system_cancel":
      return "Authentication was cancelled by the system";
    default:
      return "Authentication failed";
  }
}

export function useLocalAuth(): UseLocalAuthResult {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<"none" | "secret" | "biometricWeak" | "biometricStrong">("none");
  const [authenticationTypes, setAuthenticationTypes] = useState<AuthenticationType[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const localAuthentication = getLocalAuthenticationModule();

    if (!localAuthentication) {
      setIsReady(true);
      return;
    }

    const checkHardware = async () => {
      try {
        const hasHardware = await localAuthentication.hasHardwareAsync();
        setIsSupported(hasHardware);

        const enrolled = await localAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);

        const level = await localAuthentication.getEnrolledLevelAsync();
        setSecurityLevel(mapSecurityLevel(localAuthentication, level));

        const types = await localAuthentication.supportedAuthenticationTypesAsync();
        setAuthenticationTypes(mapAuthenticationTypes(localAuthentication, types));
      } finally {
        setIsReady(true);
      }
    };

    void checkHardware();
  }, []);

  const hasHardwareAsync = useCallback(async (): Promise<boolean> => {
    const localAuthentication = getLocalAuthenticationModule();
    return localAuthentication ? localAuthentication.hasHardwareAsync() : false;
  }, []);

  const getEnrolledLevelAsync = useCallback(async (): Promise<"none" | "secret" | "biometricWeak" | "biometricStrong"> => {
    const localAuthentication = getLocalAuthenticationModule();
    if (!localAuthentication) {
      return "none";
    }

    const level = await localAuthentication.getEnrolledLevelAsync();
    return mapSecurityLevel(localAuthentication, level);
  }, []);

  const getSupportedTypesAsync = useCallback(async (): Promise<AuthenticationType[]> => {
    const localAuthentication = getLocalAuthenticationModule();
    if (!localAuthentication) {
      return [];
    }

    const types = await localAuthentication.supportedAuthenticationTypesAsync();
    return mapAuthenticationTypes(localAuthentication, types);
  }, []);

  const authenticateAsync = useCallback(async (
    options?: Parameters<LocalAuthenticationModule["authenticateAsync"]>[0],
  ): Promise<LocalAuthResult> => {
    const localAuthentication = getLocalAuthenticationModule();
    if (!localAuthentication) {
      return {
        success: false,
        error: "Biometric authentication is unavailable in this build",
      };
    }

    try {
      const hasHardware = await localAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return { success: false, error: "Device does not support biometric authentication" };
      }

      const enrolled = await localAuthentication.isEnrolledAsync();
      if (!enrolled) {
        return { success: false, error: "No biometrics enrolled on this device" };
      }

      const result = await localAuthentication.authenticateAsync({
        promptMessage: options?.promptMessage ?? "Authenticate to continue",
        cancelLabel: options?.cancelLabel ?? "Cancel",
        disableDeviceFallback: options?.disableDeviceFallback ?? false,
        fallbackLabel: options?.fallbackLabel ?? "Use Passcode",
        ...options,
      });

      if (result.success) {
        return { success: true };
      }

      return {
        success: false,
        error: formatError(result.error),
        warning: result.warning,
      };
    } catch {
      return { success: false, error: "Authentication error" };
    }
  }, []);

  return {
    isReady,
    isSupported,
    isEnrolled,
    securityLevel,
    authenticationTypes,
    hasHardwareAsync,
    getEnrolledLevelAsync,
    getSupportedTypesAsync,
    authenticateAsync,
  };
}

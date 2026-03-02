import * as LocalAuthentication from "expo-local-authentication";
import { useState, useEffect, useCallback } from "react";

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
  authenticateAsync: (options?: LocalAuthentication.LocalAuthenticationOptions) => Promise<LocalAuthResult>;
}

export function useLocalAuth(): UseLocalAuthResult {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<"none" | "secret" | "biometricWeak" | "biometricStrong">("none");
  const [authenticationTypes, setAuthenticationTypes] = useState<AuthenticationType[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkHardware = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        setIsSupported(hasHardware);

        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);

        const level = await LocalAuthentication.getEnrolledLevelAsync();
        setSecurityLevel(mapSecurityLevel(level));

        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        setAuthenticationTypes(mapAuthenticationTypes(types));

        setIsReady(true);
      } catch {
        setIsReady(true);
      }
    };
    checkHardware();
  }, []);

  const mapSecurityLevel = (level: LocalAuthentication.SecurityLevel) => {
    switch (level) {
      case LocalAuthentication.SecurityLevel.NONE:
        return "none";
      case LocalAuthentication.SecurityLevel.SECRET:
        return "secret";
      case LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK:
        return "biometricWeak";
      case LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG:
        return "biometricStrong";
      default:
        return "none";
    }
  };

  const mapAuthenticationTypes = (types: LocalAuthentication.AuthenticationType[]): AuthenticationType[] => {
    return types.map((type) => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return "fingerprint";
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return "facialRecognition";
        case LocalAuthentication.AuthenticationType.IRIS:
          return "iris";
        default:
          return "fingerprint";
      }
    });
  };

  const hasHardwareAsync = useCallback(async (): Promise<boolean> => {
    return LocalAuthentication.hasHardwareAsync();
  }, []);

  const getEnrolledLevelAsync = useCallback(async (): Promise<"none" | "secret" | "biometricWeak" | "biometricStrong"> => {
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    return mapSecurityLevel(level);
  }, [])

  const getSupportedTypesAsync = useCallback(async (): Promise<AuthenticationType[]> => {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return mapAuthenticationTypes(types);
  }, []);

  const authenticateAsync = useCallback(async (
    options?: LocalAuthentication.LocalAuthenticationOptions
  ): Promise<LocalAuthResult> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      
      if (!hasHardware) {
        return { success: false, error: "Device does not support biometric authentication" };
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!enrolled) {
        return { success: false, error: "No biometrics enrolled on this device" };
      }

      const result = await LocalAuthentication.authenticateAsync({
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
        error: result.error ? formatError(result.error) : "Authentication failed",
        warning: result.warning 
      };
    } catch {
      return { success: false, error: "Authentication error" };
    }
  }, []);

  const formatError = (error: LocalAuthentication.LocalAuthenticationError): string => {
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
  };

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

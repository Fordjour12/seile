import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useAuth } from "@/lib/auth-context";
import { useLocalAuth } from "@/lib/use-local-auth";
import { Button } from "./button";
import { Text } from "./text";
import { Spinner } from "./spinner";

export function LockScreen() {
  const { unlock, isBiometricEnabled, isLoading: isAuthLoading } = useAuth();
  const { isSupported, isEnrolled } = useLocalAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading) {
      handleUnlock();
    }
  }, [isAuthLoading]);

  const handleUnlock = async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    setError(null);

    const result = await unlock();

    if (!result.success && result.error) {
      setError(result.error);
    }

    setIsAuthenticating(false);
  };

  if (isAuthLoading) {
    return (
      <View style={styles.container}>
        <Spinner size="large" />
      </View>
    );
  }

  const showBiometricOption = isBiometricEnabled && isSupported && isEnrolled;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>
          Seile
        </Text>

        <Text variant="muted" style={styles.subtitle}>
          {showBiometricOption ? "Authenticate to unlock" : "Welcome back"}
        </Text>

        {error && (
          <Text variant="muted" style={styles.error}>
            {error}
          </Text>
        )}

        {showBiometricOption ? (
          <Button
            title={isAuthenticating ? "Authenticating..." : "Unlock"}
            onPress={handleUnlock}
            loading={isAuthenticating}
            style={styles.button}
          />
        ) : (
          <Button
            title="Continue"
            onPress={handleUnlock}
            style={styles.button}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    textAlign: "center",
  },
  error: {
    marginBottom: 16,
    color: "#ef4444",
    textAlign: "center",
  },
  button: {
    minWidth: 200,
  },
});

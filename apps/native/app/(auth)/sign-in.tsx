import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";

import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthField } from "@/components/auth/auth-field";
import { AUTH_PALETTE } from "@/components/auth/auth-palette";
import { AuthPasswordField } from "@/components/auth/auth-password-field";
import { AuthScrollScreen } from "@/components/auth/auth-scroll-screen";
import { AuthSocialButton } from "@/components/auth/auth-social-button";
import { Button, Text } from "@/components/ui";
import { useAuth } from "@/lib/v1-auth-context";

export default function SignIn() {
  const router = useRouter();
  const {
    clearError,
    error,
    isLoading,
    signInWithEmail,
    signInWithGoogle,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    clearError();
  }, [clearError]);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0 && !isLoading,
    [email, isLoading, password],
  );

  async function handleSignIn() {
    if (!canSubmit) {
      return;
    }

    await signInWithEmail(email.trim(), password);
  }

  return (
    <AuthScrollScreen contentStyle={styles.content}>
      <Pressable onPress={() => router.push("/(auth)/welcome")} style={styles.backRow}>
        <FontAwesome name="angle-left" size={16} color={AUTH_PALETTE.textSubtle} />
        <Text selectable variant="small" style={styles.backText}>
          Back
        </Text>
      </Pressable>

      <View style={styles.copy}>
        <Text selectable style={styles.title}>
          Welcome back.
        </Text>
        <Text selectable variant="small" style={styles.subtitle}>
          Sign in to continue your Life OS.
        </Text>
      </View>

      <AuthSocialButton
        provider="google"
        label="Continue with Google"
        onPress={() => {
          void signInWithGoogle();
        }}
        disabled={isLoading}
      />

      <AuthDivider label="or email" />

      <View style={styles.form}>
        <AuthField
          label="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="you@example.com"
        />
        <AuthPasswordField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          error={error}
        />
      </View>

      <Pressable
        onPress={() => router.push("/(auth)/forgot-password")}
        style={styles.forgotWrap}
      >
        <Text selectable variant="small" style={styles.forgotLink}>
          Forgot password?
        </Text>
      </Pressable>

      <Button
        title={error ? "Try again" : "Sign in"}
        onPress={() => {
          void handleSignIn();
        }}
        disabled={!canSubmit}
        loading={isLoading}
        style={styles.primaryButton}
      />

      <View style={styles.switchRow}>
        <Text selectable variant="small" style={styles.switchText}>
          New to Life OS?
        </Text>
        <Pressable onPress={() => router.push("/(auth)/sign-up")}>
          <Text selectable variant="small" style={styles.switchLink}>
            Create account
          </Text>
        </Pressable>
      </View>
    </AuthScrollScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: AUTH_PALETTE.screen,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: {
    color: AUTH_PALETTE.textSubtle,
  },
  copy: {
    gap: 6,
    marginTop: 8,
  },
  title: {
    color: AUTH_PALETTE.text,
    fontFamily: "Geist",
    fontSize: 22,
    fontWeight: "600",
  },
  subtitle: {
    color: AUTH_PALETTE.textSubtle,
  },
  form: {
    gap: 12,
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginTop: -6,
  },
  forgotLink: {
    color: AUTH_PALETTE.textSubtle,
  },
  primaryButton: {
    borderRadius: 14,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    paddingBottom: 8,
  },
  switchText: {
    color: AUTH_PALETTE.textSubtle,
  },
  switchLink: {
    color: AUTH_PALETTE.primary,
    fontWeight: "600",
  },
});

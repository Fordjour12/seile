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
import { useAuth } from "@/lib/auth-context";

export default function CreateAccount() {
  const router = useRouter();
  const {
    clearError,
    error,
    isLoading,
    signInWithApple,
    signInWithGoogle,
    signUpWithEmail,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    clearError();
  }, [clearError]);

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const passwordReady = useMemo(() => password.length >= 8, [password]);
  const canSubmit = emailValid && passwordReady && !isLoading;

  async function handleCreateAccount() {
    if (!canSubmit) {
      return;
    }

    const derivedName = deriveNameFromEmail(email);
    await signUpWithEmail(derivedName, email.trim(), password);
  }

  return (
    <AuthScrollScreen contentStyle={styles.content}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.push("/(auth)/welcome")} style={styles.backRow}>
          <FontAwesome name="angle-left" size={16} color={AUTH_PALETTE.textSubtle} />
          <Text selectable variant="small" style={styles.backText}>
            Back
          </Text>
        </Pressable>
        <Text selectable variant="small" style={styles.stepText}>
          Step 1 of 2
        </Text>
      </View>

      <View style={styles.copy}>
        <Text selectable style={styles.title}>
          Create your account
        </Text>
        <Text selectable variant="small" style={styles.subtitle}>
          Your onboarding answers are ready. Creating an account saves them to your profile.
        </Text>
      </View>

      <View style={styles.stack}>
        <AuthSocialButton
          provider="google"
          label="Continue with Google"
          onPress={() => {
            void signInWithGoogle();
          }}
          disabled={isLoading}
        />
        <AuthSocialButton
          provider="apple"
          label="Continue with Apple"
          onPress={() => {
            void signInWithApple();
          }}
          disabled={isLoading}
        />
      </View>

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
          placeholder="8+ characters"
          error={error}
          showStrengthMeter
        />
      </View>

      <Button
        title="Create account"
        onPress={() => {
          void handleCreateAccount();
        }}
        disabled={!canSubmit}
        loading={isLoading}
        style={styles.primaryButton}
      />

      <Text selectable variant="small" style={styles.terms}>
        We don&apos;t sell your data or show ads. Ever.{"\n"}Privacy policy ·
        Terms of service
      </Text>

      <View style={styles.switchRow}>
        <Text selectable variant="small" style={styles.switchText}>
          Already have an account?
        </Text>
        <Pressable onPress={() => router.push("/(auth)/sign-in")}>
          <Text selectable variant="small" style={styles.switchLink}>
            Sign in
          </Text>
        </Pressable>
      </View>
    </AuthScrollScreen>
  );
}

function deriveNameFromEmail(email: string) {
  const [localPart] = email.trim().split("@");
  if (!localPart) {
    return "Life OS User";
  }

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: AUTH_PALETTE.screen,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: {
    color: AUTH_PALETTE.textSubtle,
  },
  stepText: {
    color: AUTH_PALETTE.textFaint,
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
    lineHeight: 21,
  },
  stack: {
    gap: 8,
  },
  form: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 14,
    marginTop: 4,
  },
  terms: {
    color: AUTH_PALETTE.textFaint,
    textAlign: "center",
    lineHeight: 18,
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

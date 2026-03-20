import { useState } from "react";
import { Alert as RNAlert, View } from "react-native";
import { Link, Redirect } from "expo-router";

import { Button, Card, Text } from "@/components";
import {
  AuthBackLink,
  AuthDivider,
  AuthField,
  AuthShell,
  AuthSocialButton,
} from "@/components/auth/auth-shell";
import { useAuth } from "@/lib/auth-context";

export default function SignInScreen() {
  const {
    clearError,
    error,
    hasCompletedOnboarding,
    hasHydrated,
    isLoading,
    signIn,
    user,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const busy = isLoading;

  if (hasHydrated && !isLoading && user) {
    return (
      <Redirect
        href={hasCompletedOnboarding ? "/(tabs)" : "/(auth)/first-run-today"}
      />
    );
  }

  const isHydrating = !hasHydrated;
  const canSubmit = email.trim().length > 0 && password.length > 0;

  function showUnavailable(provider: string) {
    RNAlert.alert(
      `${provider} unavailable`,
      `${provider} auth is shown in the mock, but this backend has not configured social providers yet.`,
    );
  }

  function resetErrors() {
    if (error) {
      clearError();
    }
  }

  async function handleSubmit() {
    if (busy || !canSubmit) {
      return;
    }

    clearError();
    await signIn({
      email: email.trim(),
      password,
    });
  }

  return (
    <AuthShell minHeightOffset={40}>
      <View style={{ gap: 20 }}>
        <AuthBackLink href="/(auth)" label="Back to onboarding" />

        <View style={{ gap: 8 }}>
          <Text
            selectable
            style={{
              color: "#ffffff",
              fontFamily: "Geist",
              fontSize: 28,
              fontWeight: "700",
              lineHeight: 34,
            }}
          >
            Welcome back.
          </Text>
          <Text
            selectable
            variant="small"
            style={{ color: "#7c7c92", lineHeight: 22 }}
          >
            Sign in to continue your Life OS.
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          <AuthSocialButton
            title="Continue with Google"
            icon="google"
            onPress={() => showUnavailable("Google")}
          />
        </View>

        <AuthDivider />

        <Card
          variant="outline"
          style={{
            gap: 16,
            borderRadius: 22,
            borderWidth: 1,
            padding: 18,
            backgroundColor: "rgba(12, 15, 25, 0.84)",
          }}
        >
          <AuthField
            label="Email address"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@example.com"
            value={email}
            onChangeText={(value) => {
              resetErrors();
              setEmail(value);
            }}
            error={error ? "Email or password is incorrect. Try again." : null}
          />

          <AuthField
            label="Password"
            autoComplete="password"
            placeholder="Your password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(value) => {
              resetErrors();
              setPassword(value);
            }}
            rightActionLabel={showPassword ? "Hide" : "Show"}
            onRightActionPress={() => setShowPassword((current) => !current)}
            error={
              error
                ? "Email or password is incorrect. Try again or reset your password."
                : null
            }
          />

          <Link href="/(auth)/forgot-password" asChild>
            <Text
              selectable
              variant="small"
              style={{
                color: "#7c7c92",
                textAlign: "right",
              }}
            >
              Forgot password?
            </Text>
          </Link>

          <Button
            title="Sign in"
            size="lg"
            onPress={() => void handleSubmit()}
            loading={busy}
            disabled={!canSubmit || isHydrating}
            style={{ borderRadius: 14, borderCurve: "continuous" }}
          />
        </Card>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Text selectable variant="small" style={{ color: "#7c7c92" }}>
          New to Life OS?
        </Text>
        <Link href="/(auth)/sign-up" asChild>
          <Text selectable variant="small" style={{ color: "#9b8fff" }}>
            Create account
          </Text>
        </Link>
      </View>
    </AuthShell>
  );
}

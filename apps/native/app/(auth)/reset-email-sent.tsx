import React from "react";
import { StyleSheet } from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import { AUTH_PALETTE } from "@/components/auth/auth-palette";
import { AuthScrollScreen } from "@/components/auth/auth-scroll-screen";
import { AuthSuccessState } from "@/components/auth/auth-success-state";

export default function ResetEmailSent() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email =
    typeof params.email === "string" && params.email.length > 0
      ? params.email
      : "bobie@example.com";

  return (
    <AuthScrollScreen contentStyle={styles.content}>
      <AuthSuccessState
        title="Check your inbox"
        subtitle={`We sent a reset link to ${email}. It expires in 15 minutes.`}
        primaryLabel="Back to sign in"
        onPrimaryPress={() => router.push("/(auth)/sign-in")}
        secondaryLabel="Didn't receive it? Resend"
        onSecondaryPress={() =>
          router.push({
            pathname: "/(auth)/reset-email-sent",
            params: { email },
          })
        }
      />
    </AuthScrollScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: AUTH_PALETTE.screen,
    justifyContent: "center",
  },
});

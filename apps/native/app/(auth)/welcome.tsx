import React from "react";
import { StyleSheet, View } from "react-native";

import { useRouter } from "expo-router";

import { AuthFeaturePill } from "@/components/auth/auth-feature-pill";
import { AUTH_PALETTE } from "@/components/auth/auth-palette";
import { AuthScrollScreen } from "@/components/auth/auth-scroll-screen";
import { AuthWordmark } from "@/components/auth/auth-wordmark";
import { Button, Text } from "@/components/ui";

export default function Welcome() {
  const router = useRouter();

  return (
    <AuthScrollScreen contentStyle={styles.content}>
      <View style={styles.header}>
        <Text selectable variant="muted" style={styles.stepChip}>
           Welcome Once Again,
        </Text>
        <AuthWordmark />
      </View>

      <View style={styles.hero}>
        <Text selectable style={styles.heroTitle}>
          One system for{"\n"}
          <Text selectable style={styles.heroAccent}>
            every part of life.
          </Text>
        </Text>
        <Text selectable variant="small" style={styles.heroSubtitle}>
          Faith, career, finances, health, and more — managed by an AI that
          learns your patterns and plans your week.
        </Text>
      </View>

      <View style={styles.featurePills}>
        <AuthFeaturePill color={AUTH_PALETTE.faith} label="Faith-first" />
        <AuthFeaturePill color={AUTH_PALETTE.primary} label="AI-powered" />
        <AuthFeaturePill color={AUTH_PALETTE.positive} label="Approval-based" />
        <AuthFeaturePill color={AUTH_PALETTE.warning} label="8 life domains" />
        <AuthFeaturePill color={AUTH_PALETTE.info} label="Private by design" />
      </View>

      <View style={styles.actions}>
        <Button
          title="Create account"
          onPress={() => router.push("/(auth)/sign-up")}
          style={styles.primaryButton}
        />
        <Button
          title="Sign in"
          variant="outline"
          onPress={() => router.push("/(auth)/sign-in")}
          style={styles.secondaryButton}
        />
      </View>

      <Text selectable variant="small" style={styles.terms}>
        By continuing you agree to our Terms and Privacy Policy.{"\n"}Your data
        never leaves your account.
      </Text>
    </AuthScrollScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: AUTH_PALETTE.screen,
  },
  header: {
    gap: 16,
    paddingTop: 8,
  },
  stepChip: {
    color: AUTH_PALETTE.textFaint,
    fontWeight: "500",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  hero: {
    gap: 12,
    marginTop: 8,
  },
  heroTitle: {
    color: AUTH_PALETTE.text,
    fontFamily: "Geist",
    fontSize: 30,
    fontWeight: "600",
    lineHeight: 38,
  },
  heroAccent: {
    color: AUTH_PALETTE.primary,
    fontFamily: "Geist",
    fontSize: 30,
    fontWeight: "600",
    lineHeight: 38,
  },
  heroSubtitle: {
    color: AUTH_PALETTE.textSubtle,
    lineHeight: 24,
    maxWidth: 320,
  },
  featurePills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actions: {
    flex: 1,
    justifyContent: "flex-end",
    gap: 10,
    paddingTop: 16,
  },
  primaryButton: {
    borderRadius: 14,
  },
  secondaryButton: {
    borderRadius: 14,
    backgroundColor: "transparent",
    borderColor: AUTH_PALETTE.border,
  },
  terms: {
    color: AUTH_PALETTE.textFaint,
    textAlign: "center",
    lineHeight: 18,
    paddingBottom: 8,
  },
});

import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";

import { AuthField } from "@/components/auth/auth-field";
import { AUTH_PALETTE } from "@/components/auth/auth-palette";
import { AuthScrollScreen } from "@/components/auth/auth-scroll-screen";
import { Button, Surface, Text } from "@/components/ui";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const canSubmit = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);

  function handleSendReset() {
    if (!canSubmit) {
      return;
    }

    router.push({
      pathname: "/(auth)/reset-email-sent",
      params: { email: email.trim() },
    });
  }

  return (
    <AuthScrollScreen contentStyle={styles.content}>
      <Pressable onPress={() => router.push("/(auth)/sign-in")} style={styles.backRow}>
        <FontAwesome name="angle-left" size={16} color={AUTH_PALETTE.textSubtle} />
        <Text selectable variant="small" style={styles.backText}>
          Sign in
        </Text>
      </Pressable>

      <View style={styles.copy}>
        <Text selectable style={styles.title}>
          Reset your password
        </Text>
        <Text selectable variant="small" style={styles.subtitle}>
          Enter your email and we&apos;ll send a reset link. It expires in 15
          minutes.
        </Text>
      </View>

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

      <Button
        title="Send reset link"
        onPress={handleSendReset}
        disabled={!canSubmit}
        style={styles.primaryButton}
      />

      <Surface elevation="flat" tone="card" style={styles.note}>
        <Text selectable variant="small" style={styles.noteText}>
          Your Life OS data, AI context, and domain history are all safe.
          Resetting your password doesn&apos;t affect any of your data.
        </Text>
      </Surface>
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
    lineHeight: 21,
  },
  primaryButton: {
    borderRadius: 14,
    marginTop: 4,
  },
  note: {
    borderRadius: 12,
    backgroundColor: AUTH_PALETTE.surface,
    borderColor: "#22242a",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noteText: {
    color: AUTH_PALETTE.textSubtle,
    lineHeight: 20,
  },
});

import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Button, Text } from "@/components";
import { Container } from "@/components/container";
import { useAuth } from "@/lib/auth-context";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function ResetEmailSentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === "string" ? params.email : "";
  const { colorScheme } = useColorScheme();
  const { height } = useWindowDimensions();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const { clearError, error, requestPasswordReset } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const minHeight = Math.max(height - UI_PRESETS.spacing.screen * 2, 620);

  async function handleResend() {
    if (isResending || !email) {
      return;
    }

    setIsResending(true);
    clearError();

    try {
      await requestPasswordReset(email);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Container>
      <View style={[styles.content, { minHeight }]}>
        <View style={[styles.checkmark, { borderColor: theme.primary, backgroundColor: theme.card }]}>
          <Text style={{ color: theme.primary, fontSize: 28, fontWeight: "700" }}>
            ✓
          </Text>
        </View>

        <View style={styles.header}>
          <Text variant="h2">Check your inbox</Text>
          <Text
            variant="small"
            style={{ color: theme.mutedForeground, textAlign: "center" }}
            selectable
          >
            {email
              ? `We sent a reset link to ${email}.`
              : "We sent your reset link."}
          </Text>
        </View>

        <Button
          title="Back to sign in"
          size="lg"
          onPress={() => router.replace("/(auth)/sign-in")}
        />

        <View style={styles.footer}>
          {isResending ? (
            <View style={styles.resendRow}>
              <ActivityIndicator color={theme.primary} />
              <Text variant="small" style={{ color: theme.mutedForeground }}>
                Resending
              </Text>
            </View>
          ) : (
            <Text
              variant="small"
              style={{ color: theme.primary }}
              onPress={() => void handleResend()}
            >
              Didn&apos;t receive it? Resend
            </Text>
          )}

          {error ? (
            <Text
              variant="small"
              style={{ color: theme.destructive, textAlign: "center" }}
              selectable
            >
              {error}
            </Text>
          ) : null}
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingVertical: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.lg,
  },
  checkmark: {
    width: 68,
    height: 68,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    gap: UI_PRESETS.spacing.xs,
    alignItems: "center",
  },
  footer: {
    gap: UI_PRESETS.spacing.sm,
    alignItems: "center",
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
});

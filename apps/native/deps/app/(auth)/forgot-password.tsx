import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Link, useRouter } from "expo-router";

import { Button, Card, Input, Text } from "@/components";
import { Container } from "@/components/container";
import { useAuth } from "@/lib/auth-context";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { height } = useWindowDimensions();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const { clearError, error, requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const canSubmit = email.trim().length > 0;
  const minHeight = Math.max(height - UI_PRESETS.spacing.screen * 2, 680);

  async function handleSubmit() {
    if (isSending || !canSubmit) {
      return;
    }

    setIsSending(true);
    clearError();

    try {
      const didSend = await requestPasswordReset(email.trim());
      if (!didSend) {
        return;
      }

      router.push({
        pathname: "/(auth)/reset-email-sent",
        params: { email: email.trim() },
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Container>
      <View style={[styles.content, { minHeight }]}>
        <Link href="/(auth)/sign-in" asChild>
          <Text variant="small" style={{ color: theme.mutedForeground }}>
            Back to sign in
          </Text>
        </Link>

        <View style={styles.header}>
          <Text variant="h2">Reset your password</Text>
          <Text
            variant="small"
            style={{ color: theme.mutedForeground }}
            selectable
          >
            Enter your email and we&apos;ll send a reset link.
          </Text>
        </View>

        <Card
          variant="outline"
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={styles.fieldGroup}>
            <Text
              variant="muted"
              style={[styles.fieldLabel, { color: theme.mutedForeground }]}
            >
              Email
            </Text>
            <Input
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="name@example.com"
              value={email}
              onChangeText={(value) => {
                if (error) {
                  clearError();
                }
                setEmail(value);
              }}
            />
          </View>

          {error ? (
            <Text
              variant="small"
              style={{ color: theme.destructive }}
              selectable
            >
              {error}
            </Text>
          ) : null}

          <Button
            title="Send reset link"
            size="lg"
            onPress={() => void handleSubmit()}
            loading={isSending}
            disabled={!canSubmit}
          />
        </Card>

        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          {isSending ? (
            <View style={styles.sendingRow}>
              <ActivityIndicator color={theme.primary} />
              <Text variant="small" style={{ color: theme.mutedForeground }}>
                Sending reset email
              </Text>
            </View>
          ) : null}
          <Text
            variant="small"
            style={{ color: theme.mutedForeground }}
            selectable
          >
            Resetting your password does not affect your onboarding data or app
            history.
          </Text>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingVertical: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.lg,
  },
  header: {
    gap: UI_PRESETS.spacing.xs,
  },
  card: {
    gap: UI_PRESETS.spacing.md,
    borderWidth: 1,
    borderRadius: 24,
  },
  fieldGroup: {
    gap: UI_PRESETS.spacing.xs,
  },
  fieldLabel: {
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  infoCard: {
    gap: UI_PRESETS.spacing.sm,
    borderWidth: 1,
    borderRadius: 20,
    padding: UI_PRESETS.spacing.md,
  },
  sendingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
});

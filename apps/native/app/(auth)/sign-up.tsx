import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from "react-native";
import { Link, Redirect } from "expo-router";

import { Button, Card, Input, Text } from "@/components";
import { Container } from "@/components/container";
import { useAuth } from "@/lib/auth-context";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const BACKGROUND_IMAGE: ImageSourcePropType | null = null;

function BrandMark({
  backgroundColor,
  foregroundColor,
}: {
  backgroundColor: string;
  foregroundColor: string;
}) {
  return (
    <View style={[styles.brandMark, { backgroundColor }]}>
      <Text variant="h3" style={{ color: foregroundColor }}>
        S
      </Text>
    </View>
  );
}

export default function SignUpScreen() {
  const { colorScheme } = useColorScheme();
  const { height } = useWindowDimensions();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const { clearError, error, hasCompletedOnboarding, hasHydrated, isLoading, signUp, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const busy = isLoading;

  if (hasHydrated && user) {
    return (
      <Redirect
        href={hasCompletedOnboarding ? "/(tabs)/domains" : "/(auth)/first-run-today"}
      />
    );
  }

  const canSubmit =
    name.trim().length > 0 && email.trim().length > 0 && password.length > 0;
  const minHeight = Math.max(height - UI_PRESETS.spacing.screen * 2, 760);
  const accentGlow =
    colorScheme === "dark"
      ? "rgba(174, 135, 255, 0.16)"
      : "rgba(108, 76, 255, 0.12)";
  const warmGlow =
    colorScheme === "dark"
      ? "rgba(116, 231, 190, 0.12)"
      : "rgba(139, 226, 204, 0.16)";
  const glassSurface =
    colorScheme === "dark"
      ? "rgba(12, 15, 25, 0.84)"
      : "rgba(255, 255, 255, 0.86)";
  const pillSurface =
    colorScheme === "dark"
      ? "rgba(174, 135, 255, 0.12)"
      : "rgba(108, 76, 255, 0.10)";

  const resetErrors = () => {
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async () => {
    if (busy || !canSubmit) {
      return;
    }

    clearError();
    await signUp({
      name: name.trim(),
      email: email.trim(),
      password,
    });
  };

  const isHydrating = !hasHydrated;

  return (
    <KeyboardAvoidingView pointerEvents="box-none" behavior="position">
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.baseBackground,
          { backgroundColor: theme.background },
        ]}
      />
      {BACKGROUND_IMAGE ? (
        <ImageBackground
          source={BACKGROUND_IMAGE}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
          imageStyle={styles.backgroundImage}
        />
      ) : null}
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.overlay,
          {
            backgroundColor:
              colorScheme === "dark"
                ? "rgba(8, 10, 18, 0.74)"
                : "rgba(248, 249, 252, 0.76)",
          },
        ]}
      />
      <View
        style={[
          styles.backdropOrb,
          styles.backdropOrbTop,
          { backgroundColor: accentGlow },
        ]}
      />
      <View
        style={[
          styles.backdropOrb,
          styles.backdropOrbBottom,
          { backgroundColor: warmGlow },
        ]}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        bounces={false}
        contentContainerStyle={[styles.content, { minHeight }]}
      >
        <View style={styles.topZone}>
          <View style={styles.brandRow}>
            <View style={styles.brandText}>
              <Text variant="small" style={{ color: theme.primary }}>
                New workspace
              </Text>
              <Text variant="h2">Create your account</Text>
              <Text
                variant="small"
                style={{ color: theme.mutedForeground }}
                selectable
              >
                Start with a clean setup for spending, debt, savings, and
                routines.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.middleZone}>
          <Card
            variant="outline"
            style={[
              styles.formCard,
              {
                backgroundColor: glassSurface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: pillSurface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text variant="muted" style={{ color: theme.primary }}>
                  SETUP
                </Text>
              </View>
              <Text
                variant="small"
                style={{ color: theme.mutedForeground }}
                selectable
              >
                Keep it simple now. You can add passkeys and refine your setup
                after your first sign-in.
              </Text>
            </View>

            {isHydrating ? (
              <View
                style={[
                  styles.loadingState,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <ActivityIndicator color={theme.primary} />
                <Text variant="small" style={{ color: theme.mutedForeground }}>
                  Preparing account setup
                </Text>
              </View>
            ) : (
              <View style={styles.form}>
                <View style={styles.fieldGroup}>
                  <Text
                    variant="muted"
                    style={[
                      styles.fieldLabel,
                      { color: theme.mutedForeground },
                    ]}
                  >
                    Name
                  </Text>
                  <Input
                    autoCapitalize="words"
                    autoComplete="name"
                    placeholder="Your name"
                    value={name}
                    onChangeText={(value) => {
                      resetErrors();
                      setName(value);
                    }}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text
                    variant="muted"
                    style={[
                      styles.fieldLabel,
                      { color: theme.mutedForeground },
                    ]}
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
                      resetErrors();
                      setEmail(value);
                    }}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text
                    variant="muted"
                    style={[
                      styles.fieldLabel,
                      { color: theme.mutedForeground },
                    ]}
                  >
                    Password
                  </Text>
                  <Input
                    autoComplete="new-password"
                    placeholder="Create password"
                    secureTextEntry
                    value={password}
                    onChangeText={(value) => {
                      resetErrors();
                      setPassword(value);
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
              </View>
            )}
          </Card>
        </View>

        <View style={styles.bottomZone}>
          <Button
            title="Create Account"
            size="lg"
            onPress={() => void handleSubmit()}
            loading={busy}
            disabled={!canSubmit || isHydrating}
          />

          <View style={styles.footer}>
            <Text variant="small" style={{ color: theme.mutedForeground }}>
              Already have an account?
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Text variant="small" style={{ color: theme.primary }}>
                Sign in
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  baseBackground: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.36,
  },
  overlay: {
    flex: 1,
  },
  backdropOrb: {
    position: "absolute",
    borderRadius: 999,
  },
  backdropOrbTop: {
    width: 220,
    height: 220,
    top: -40,
    right: -40,
  },
  backdropOrbBottom: {
    width: 260,
    height: 260,
    bottom: 90,
    left: -90,
  },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingTop: UI_PRESETS.spacing.section,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.xl,
  },
  topZone: {
    gap: UI_PRESETS.spacing.lg,
  },
  backLink: {
    alignSelf: "flex-start",
    paddingHorizontal: UI_PRESETS.spacing.md,
    paddingVertical: UI_PRESETS.spacing.sm,
  },
  brandRow: {
    gap: UI_PRESETS.spacing.md,
  },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    gap: UI_PRESETS.spacing.xs,
  },
  middleZone: {
    flex: 1,
    justifyContent: "center",
  },
  formCard: {
    gap: UI_PRESETS.spacing.lg,
    borderWidth: 1,
    borderRadius: 28,
  },
  cardHeader: {
    gap: UI_PRESETS.spacing.sm,
  },
  statusPill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.full,
    paddingHorizontal: UI_PRESETS.spacing.sm,
    paddingVertical: 6,
  },
  form: {
    gap: UI_PRESETS.spacing.md,
  },
  fieldGroup: {
    gap: UI_PRESETS.spacing.xs,
  },
  fieldLabel: {
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  loadingState: {
    minHeight: 180,
    borderWidth: 1,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: UI_PRESETS.spacing.sm,
  },
  bottomZone: {
    gap: UI_PRESETS.spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
});

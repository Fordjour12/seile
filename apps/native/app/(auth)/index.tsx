import React from "react";
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

import { Button, Card, Text } from "@/components";
import { Container } from "@/components/container";
import { useAuth } from "@/lib/auth-context";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

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
      <View style={[styles.brandDot, { backgroundColor: foregroundColor }]} />
    </View>
  );
}

function WelcomeContent({
  theme,
  minHeight,
  isLoading,
  accentGlow,
  warmGlow,
  glassSurface,
  chipSurface,
  liveSurface,
  liveBorder,
}: {
  theme: (typeof NAV_THEME)["light"] | (typeof NAV_THEME)["dark"];
  minHeight: number;
  isLoading: boolean;
  accentGlow: string;
  warmGlow: string;
  glassSurface: string;
  chipSurface: string;
  liveSurface: string;
  liveBorder: string;
}) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      bounces={false}
      contentContainerStyle={[styles.content, { minHeight }]}
    >
      <View style={styles.topZone}>
        <BrandMark
          backgroundColor={theme.primary}
          foregroundColor={theme.primaryForeground}
        />
        <View style={styles.brandText}>
          <Text variant="h2">Seile</Text>
          <Text
            variant="small"
            style={{ color: theme.mutedForeground }}
            selectable
          >
            Your money, plans, and progress. In sync.
          </Text>
        </View>
      </View>

      <View style={styles.middleZone}>
        <View
          style={[
            styles.heroVisual,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.heroGlowLarge,
              { backgroundColor: accentGlow },
            ]}
          />
          <View
            style={[
              styles.heroGlowSmall,
              { backgroundColor: warmGlow },
            ]}
          />

          <Card
            variant="outline"
            style={[
              styles.previewFrame,
              {
                backgroundColor: glassSurface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.previewHeader}>
              <View style={styles.previewTitleBlock}>
                <Text variant="small" style={{ color: theme.mutedForeground }}>
                  Live workspace
                </Text>
                <Text variant="h3">Today</Text>
              </View>
              <View
                style={[
                  styles.livePill,
                  {
                    backgroundColor: liveSurface,
                    borderColor: liveBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.liveDot,
                    { backgroundColor: theme.primary },
                  ]}
                />
                <Text variant="muted" style={{ color: theme.primary }}>
                  SYNCED
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.balancePanel,
                { backgroundColor: theme.primary },
              ]}
            >
              <Text
                variant="small"
                style={{ color: theme.primaryForeground, opacity: 0.82 }}
              >
                Cash position
              </Text>
              <Text
                variant="h2"
                style={{ color: theme.primaryForeground }}
                selectable
              >
                GH₵24,860
              </Text>
              <Text
                variant="muted"
                style={{ color: theme.primaryForeground, opacity: 0.78 }}
                selectable
              >
                Budget, spending, and savings moving together
              </Text>
            </View>

            <View style={styles.metricRow}>
              <View
                style={[
                  styles.metricCard,
                  { backgroundColor: theme.secondary },
                ]}
              >
                <Text
                  variant="muted"
                  style={{ color: theme.secondaryForeground, opacity: 0.74 }}
                >
                  Budget left
                </Text>
                <Text variant="body" style={{ color: theme.secondaryForeground }}>
                  GH₵4,120
                </Text>
              </View>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text variant="muted" style={{ color: theme.mutedForeground }}>
                  Savings pace
                </Text>
                <Text variant="body">82%</Text>
              </View>
            </View>

            <View style={styles.progressGroup}>
              <View style={styles.progressHeader}>
                <Text variant="small" style={{ color: theme.mutedForeground }}>
                  Monthly rhythm
                </Text>
                <Text variant="small">On track</Text>
              </View>
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: theme.secondary },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: theme.chart4,
                      width: "74%",
                    },
                  ]}
                />
              </View>
            </View>
          </Card>

          <View
            style={[
              styles.floatingChip,
              styles.floatingChipLeft,
              {
                backgroundColor: chipSurface,
                borderColor: theme.border,
              },
            ]}
          >
            <Text variant="muted" style={{ color: theme.mutedForeground }}>
              Debt
            </Text>
            <Text variant="small">Focused</Text>
          </View>

          <View
            style={[
              styles.floatingChip,
              styles.floatingChipRight,
              {
                backgroundColor: chipSurface,
                borderColor: theme.border,
              },
            ]}
          >
            <Text variant="muted" style={{ color: theme.mutedForeground }}>
              Habits
            </Text>
            <Text variant="small">Live</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomZone}>
        {isLoading ? (
          <View
            style={[
              styles.loadingDock,
              {
                backgroundColor: glassSurface,
                borderColor: theme.border,
              },
            ]}
          >
            <ActivityIndicator color={theme.primary} />
            <Text variant="small" style={{ color: theme.mutedForeground }}>
              Preparing your workspace
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.actions}>
              <Link href="/(auth)/sign-up" asChild>
                <Button title="Create Account" size="lg" />
              </Link>
              <Link href="/(auth)/sign-in" asChild>
                <Button title="Sign In" variant="outline" size="lg" />
              </Link>
            </View>
            <Text
              variant="muted"
              style={[styles.supportText, { color: theme.mutedForeground }]}
              selectable
            >
              Passkeys become available after your first sign-in.
            </Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}

export default function AuthIndexScreen() {
  const { user, hasHydrated, isLoading } = useAuth();
  const { colorScheme } = useColorScheme();
  const { height } = useWindowDimensions();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const accentGlow =
    colorScheme === "dark"
      ? "rgba(174, 135, 255, 0.16)"
      : "rgba(108, 76, 255, 0.12)";
  const warmGlow =
    colorScheme === "dark"
      ? "rgba(255, 187, 92, 0.14)"
      : "rgba(255, 208, 120, 0.18)";
  const glassSurface =
    colorScheme === "dark"
      ? "rgba(12, 15, 25, 0.84)"
      : "rgba(255, 255, 255, 0.84)";
  const chipSurface =
    colorScheme === "dark"
      ? "rgba(14, 17, 28, 0.92)"
      : "rgba(255, 255, 255, 0.92)";
  const liveSurface =
    colorScheme === "dark"
      ? "rgba(174, 135, 255, 0.14)"
      : "rgba(108, 76, 255, 0.10)";
  const liveBorder =
    colorScheme === "dark"
      ? "rgba(174, 135, 255, 0.22)"
      : "rgba(108, 76, 255, 0.16)";

  if (hasHydrated && user) {
    return <Redirect href="/(tabs)/finance" />;
  }

  const minHeight = Math.max(height - UI_PRESETS.spacing.screen * 2, 680);
  const content = (
    <>
      <View
        style={[
          StyleSheet.absoluteFillObject,
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
          StyleSheet.absoluteFillObject,
          styles.overlay,
          {
            backgroundColor:
              colorScheme === "dark"
                ? "rgba(8, 10, 18, 0.72)"
                : "rgba(248, 249, 252, 0.72)",
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

      <WelcomeContent
        theme={theme}
        minHeight={minHeight}
        isLoading={!hasHydrated || isLoading}
        accentGlow={accentGlow}
        warmGlow={warmGlow}
        glassSurface={glassSurface}
        chipSurface={chipSurface}
        liveSurface={liveSurface}
        liveBorder={liveBorder}
      />
    </>
  );

  return <Container>{content}</Container>;
}

const styles = StyleSheet.create({
  baseBackground: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.42,
  },
  overlay: {
    flex: 1,
  },
  backdropOrb: {
    position: "absolute",
    borderRadius: 999,
  },
  backdropOrbTop: {
    width: 240,
    height: 240,
    top: -60,
    right: -40,
  },
  backdropOrbBottom: {
    width: 280,
    height: 280,
    bottom: 120,
    left: -90,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingTop: UI_PRESETS.spacing.section,
    paddingBottom: UI_PRESETS.spacing.section,
    justifyContent: "space-between",
    gap: UI_PRESETS.spacing.xl,
  },
  topZone: {
    gap: UI_PRESETS.spacing.md,
  },
  brandMark: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  brandDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 999,
    bottom: 14,
    right: 14,
  },
  brandText: {
    gap: UI_PRESETS.spacing.xs,
  },
  middleZone: {
    flex: 1,
    justifyContent: "center",
  },
  heroVisual: {
    minHeight: 360,
    borderRadius: 32,
    borderWidth: 1,
    overflow: "hidden",
    justifyContent: "center",
    padding: UI_PRESETS.spacing.lg,
  },
  heroGlowLarge: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    top: -40,
    left: -70,
  },
  heroGlowSmall: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    bottom: -60,
    right: -30,
  },
  previewFrame: {
    gap: UI_PRESETS.spacing.md,
    borderWidth: 1,
    borderRadius: 28,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: UI_PRESETS.spacing.md,
  },
  previewTitleBlock: {
    gap: 4,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: UI_PRESETS.spacing.sm,
    paddingVertical: 6,
    borderRadius: UI_PRESETS.radius.full,
    borderWidth: 1,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  balancePanel: {
    borderRadius: 24,
    padding: UI_PRESETS.spacing.md,
    gap: UI_PRESETS.spacing.xs,
  },
  metricRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
  metricCard: {
    flex: 1,
    borderRadius: 20,
    padding: UI_PRESETS.spacing.md,
    gap: 4,
    borderWidth: 1,
  },
  progressGroup: {
    gap: UI_PRESETS.spacing.xs,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  floatingChip: {
    position: "absolute",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: UI_PRESETS.spacing.sm,
    paddingVertical: UI_PRESETS.spacing.xs,
    gap: 2,
  },
  floatingChipLeft: {
    left: 18,
    top: 84,
  },
  floatingChipRight: {
    right: 18,
    bottom: 74,
  },
  bottomZone: {
    gap: UI_PRESETS.spacing.md,
  },
  loadingDock: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: UI_PRESETS.spacing.sm,
  },
  actions: {
    gap: UI_PRESETS.spacing.sm,
  },
  supportText: {
    textAlign: "center",
  },
});

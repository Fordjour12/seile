import { ScrollView, Pressable, StyleSheet, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@seile/backend/convexApi";

import { Container } from "@/components/container";
import { Badge, Text } from "@/components/ui";
import { DOMAIN_ITEMS, type DomainItem } from "@/components/settings/data";
import { DOMAIN_CONFIGS } from "@/components/domains/domain-setup-screen";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

function useDomainActivationTheme() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  return { theme, isDarkColorScheme };
}

export function DomainActivationScreen() {
  const router = useRouter();
  const { theme } = useDomainActivationTheme();

  // Read real domain status from Convex
  const userDomains = useQuery(api.domains.getUserDomains) ?? [];

  // Merge static DOMAIN_ITEMS with persisted status
  const mergedDomains: DomainItem[] = DOMAIN_ITEMS.map((item) => {
    const persisted = userDomains.find((d) => d.domain === item.id);
    return {
      ...item,
      status: (persisted?.status ?? "inactive") as DomainItem["status"],
    };
  });

  const inactiveDomains = mergedDomains.filter(
    (item) => item.status === "inactive",
  );
  const activeDomains = mergedDomains.filter(
    (item) => item.status !== "inactive",
  );
  const pinnedCount = activeDomains.filter(
    (item) => item.status === "pinned",
  ).length;

  return (
    <Container>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: theme.muted },
              pressed && { opacity: 0.6 },
            ]}
          >
            <FontAwesome
              name="chevron-left"
              size={11}
              color={theme.mutedForeground}
            />
          </Pressable>

          <Text selectable variant="h3" style={{ color: theme.foreground }}>
            Domains
          </Text>
          <Text
            selectable
            variant="small"
            style={{ color: theme.mutedForeground, lineHeight: 20 }}
          >
            Life OS is domain-shaped. Activate the domains you want the AI to
            track, suggest, and build habits around.
          </Text>
        </View>

        {/* ── Summary bar ─────────────────────────────────────────────── */}
        <View style={[styles.summaryBar, { borderColor: theme.border }]}>
          <View style={styles.summaryItem}>
            <Text
              selectable
              variant="small"
              style={[styles.summaryValue, { color: theme.foreground }]}
            >
              {activeDomains.length}
            </Text>
            <Text
              selectable
              variant="muted"
              style={{ color: theme.mutedForeground }}
            >
              Active
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryItem}>
            <Text
              selectable
              variant="small"
              style={[styles.summaryValue, { color: theme.foreground }]}
            >
              {pinnedCount}/4
            </Text>
            <Text
              selectable
              variant="muted"
              style={{ color: theme.mutedForeground }}
            >
              Pinned
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryItem}>
            <Text
              selectable
              variant="small"
              style={[styles.summaryValue, { color: theme.foreground }]}
            >
              {inactiveDomains.length}
            </Text>
            <Text
              selectable
              variant="muted"
              style={{ color: theme.mutedForeground }}
            >
              Inactive
            </Text>
          </View>
        </View>

        {/* ── Needs activation ────────────────────────────────────────── */}
        {inactiveDomains.length > 0 && (
          <View style={styles.section}>
            <Text
              selectable
              variant="muted"
              style={[styles.eyebrow, { color: theme.mutedForeground }]}
            >
              Needs activation
            </Text>

            <View style={[styles.listCard, { borderColor: theme.border }]}>
              {inactiveDomains.map((domain, i) => {
                const cfg = DOMAIN_CONFIGS[domain.id];
                return (
                  <Pressable
                    key={domain.id}
                    onPress={() =>
                      router.push(`/(tabs)/settings/${domain.id}` as never)
                    }
                    style={({ pressed }) => [
                      styles.domainRow,
                      i > 0 && {
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: theme.border,
                      },
                      pressed && { backgroundColor: `${theme.muted}80` },
                    ]}
                  >
                    <View
                      style={[
                        styles.domainIcon,
                        {
                          backgroundColor: cfg
                            ? cfg.accentMuted
                            : `${domain.accentColor}18`,
                        },
                      ]}
                    >
                      <Text selectable style={styles.domainEmoji}>
                        {cfg?.emoji ?? "?"}
                      </Text>
                    </View>

                    <View style={styles.domainInfo}>
                      <Text
                        selectable
                        variant="small"
                        style={[styles.domainLabel, { color: theme.foreground }]}
                      >
                        {domain.label}
                      </Text>
                      <Text
                        selectable
                        variant="muted"
                        style={{ color: theme.mutedForeground }}
                      >
                        {cfg?.description
                          ? cfg.description.split(".")[0] + "."
                          : "Tap to set up and activate."}
                      </Text>
                    </View>

                    <FontAwesome
                      name="angle-right"
                      size={16}
                      color={theme.mutedForeground}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Already active ──────────────────────────────────────────── */}
        {activeDomains.length > 0 && (
          <View style={styles.section}>
            <Text
              selectable
              variant="muted"
              style={[styles.eyebrow, { color: theme.mutedForeground }]}
            >
              Active
            </Text>

            <View style={[styles.listCard, { borderColor: theme.border }]}>
              {activeDomains.map((domain, i) => {
                const cfg = DOMAIN_CONFIGS[domain.id];
                return (
                  <Pressable
                    key={domain.id}
                    onPress={() =>
                      router.push(`/(tabs)/settings/${domain.id}` as never)
                    }
                    style={({ pressed }) => [
                      styles.domainRow,
                      i > 0 && {
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: theme.border,
                      },
                      pressed && { backgroundColor: `${theme.muted}80` },
                    ]}
                  >
                    <View
                      style={[
                        styles.domainIcon,
                        {
                          backgroundColor: cfg
                            ? cfg.accentMuted
                            : `${domain.accentColor}18`,
                        },
                      ]}
                    >
                      <Text selectable style={styles.domainEmoji}>
                        {cfg?.emoji ?? "?"}
                      </Text>
                    </View>

                    <View style={styles.domainInfo}>
                      <Text
                        selectable
                        variant="small"
                        style={[styles.domainLabel, { color: theme.foreground }]}
                      >
                        {domain.label}
                      </Text>
                    </View>

                    {domain.status === "pinned" && (
                      <Badge variant="subtle" color="default">
                        Pinned
                      </Badge>
                    )}

                    <View
                      style={[
                        styles.activeDot,
                        { backgroundColor: cfg?.accent ?? domain.accentColor },
                      ]}
                    />

                    <FontAwesome
                      name="angle-right"
                      size={16}
                      color={theme.mutedForeground}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* ── All activated empty state ────────────────────────────────── */}
        {inactiveDomains.length === 0 && (
          <View style={[styles.emptyCard, { borderColor: theme.border }]}>
            <Text selectable style={{ fontSize: 24 }}>
              🎉
            </Text>
            <Text
              selectable
              variant="small"
              style={{
                color: theme.mutedForeground,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              All domains are activated. Tap any domain above to configure
              its settings or pin it to your dashboard.
            </Text>
          </View>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 20,
    paddingBottom: 96,
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: UI_PRESETS.spacing.lg,
  },
  header: {
    gap: 8,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },

  /* Summary bar */
  summaryBar: {
    flexDirection: "row",
    borderRadius: UI_PRESETS.radius.lg,
    borderCurve: "continuous",
    borderWidth: 1,
    overflow: "hidden",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    gap: 2,
  },
  summaryValue: {
    fontFamily: "Geist",
    fontWeight: "700",
    fontSize: 16,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    marginVertical: 10,
  },

  /* Section */
  section: {
    gap: 8,
  },
  eyebrow: {
    fontFamily: "Geist",
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginLeft: 2,
  },

  /* List card (iOS grouped style) */
  listCard: {
    borderRadius: UI_PRESETS.radius.lg,
    borderCurve: "continuous",
    borderWidth: 1,
    overflow: "hidden",
  },

  /* Domain row */
  domainRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  domainIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  domainEmoji: {
    fontSize: 18,
    lineHeight: 22,
  },
  domainInfo: {
    flex: 1,
    gap: 2,
  },
  domainLabel: {
    fontFamily: "Geist",
    fontWeight: "600",
    fontSize: 14,
  },

  /* Active dot */
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  /* Empty state */
  emptyCard: {
    borderRadius: UI_PRESETS.radius.lg,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
});

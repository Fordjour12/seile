import { ScrollView, StyleSheet, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@seile/backend/convexApi";

import { Container } from "@/components/container";
import { Button, Card, Text } from "@/components/ui";
import { DOMAIN_ITEMS, type DomainItem } from "@/components/settings/data";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

function useDomainActivationTheme() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return { theme, isDarkColorScheme };
}

export function DomainActivationScreen() {
  const router = useRouter();
  const { theme, isDarkColorScheme } = useDomainActivationTheme();

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

  return (
    <Container>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Button
            title="Back to settings"
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
          />
          <Text selectable variant="h3" style={{ color: theme.foreground }}>
            Activate domains
          </Text>
          <Text
            selectable
            variant="small"
            style={{ color: theme.mutedForeground, lineHeight: 20 }}
          >
            Life OS is domain-shaped. Activate the missing domains here before
            expecting the AI to read or recommend from them.
          </Text>
        </View>

        <Card style={[styles.heroCard, { borderColor: theme.border }]}>
          <Text
            selectable
            variant="small"
            style={[styles.cardTitle, { color: theme.foreground }]}
          >
            What activation means
          </Text>
          <Text
            selectable
            variant="small"
            style={{ color: theme.mutedForeground, lineHeight: 20 }}
          >
            A domain becomes active after its first real object or signal
            exists: a person, a room, a project, a budget cap, a session, or a
            check-in trail.
          </Text>
        </Card>

        <View style={styles.section}>
          <Text
            selectable
            variant="muted"
            style={[styles.eyebrow, { color: theme.mutedForeground }]}
          >
            Needs activation
          </Text>
          {inactiveDomains.map((domain) => (
            <Card
              key={domain.id}
              style={[styles.domainCard, { borderColor: theme.border }]}
            >
              <View style={styles.domainRow}>
                <View
                  style={[
                    styles.domainAccent,
                    { backgroundColor: `${domain.accentColor}22` },
                  ]}
                >
                  <View
                    style={[
                      styles.domainAccentDot,
                      { backgroundColor: domain.accentColor },
                    ]}
                  />
                </View>
                <View style={styles.domainBody}>
                  <Text
                    selectable
                    variant="small"
                    style={[styles.cardTitle, { color: theme.foreground }]}
                  >
                    {domain.label}
                  </Text>
                  <Text
                    selectable
                    variant="small"
                    style={{ color: theme.mutedForeground, lineHeight: 20 }}
                  >
                    {domain.id === "relationships"
                      ? "Add one person, relationship rhythm, or follow-up thread to bring this domain online."
                      : "Add a zone, room, or recurring reset pattern to make this domain worth tracking."}
                  </Text>
                </View>
              </View>
              <Button
                title={`Activate ${domain.label}`}
                variant="outline"
                onPress={() =>
                  router.push(`/(tabs)/domains/${domain.id}` as never)
                }
              />
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text
            selectable
            variant="muted"
            style={[styles.eyebrow, { color: theme.mutedForeground }]}
          >
            Already active
          </Text>
          {activeDomains.map((domain) => (
            <Card
              key={domain.id}
              style={[styles.activeCard, { borderColor: theme.border }]}
              onPress={() =>
                router.push(`/(tabs)/domains/${domain.id}` as never)
              }
            >
              <View style={styles.domainRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: domain.accentColor },
                  ]}
                />
                <Text
                  selectable
                  variant="small"
                  style={[styles.cardTitle, { color: theme.foreground, flex: 1 }]}
                >
                  {domain.label}
                </Text>
                <Text
                  selectable
                  variant="muted"
                  style={{ color: theme.mutedForeground }}
                >
                  {domain.status === "pinned" ? "📌 Pinned" : "Active"}
                </Text>
              </View>
            </Card>
          ))}
        </View>

        <Card style={styles.footerCard}>
          <View style={styles.footerRow}>
            <FontAwesome name="lightbulb-o" size={14} color="#9b8fff" />
            <Text selectable variant="small" style={styles.footerText}>
              First-run domain cards now route here so activation happens inside
              Settings until the native domains stack is fully built.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 16,
    paddingBottom: 96,
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: UI_PRESETS.spacing.lg,
  },
  glow: {
    borderRadius: 999,
    height: 220,
    position: "absolute",
    width: 220,
  },
  glowLeft: {
    left: -80,
    top: 240,
  },
  glowRight: {
    right: -72,
    top: -40,
  },
  header: {
    gap: 8,
  },
  section: {
    gap: 10,
  },
  eyebrow: {
    fontFamily: "Geist",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroCard: {
    borderCurve: "continuous",
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  domainCard: {
    borderCurve: "continuous",
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  activeCard: {
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
  },
  domainRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  domainAccent: {
    alignItems: "center",
    borderRadius: 12,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  domainAccentDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  domainBody: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontFamily: "Geist",
    fontWeight: "700",
  },
  statusDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  footerCard: {
    backgroundColor: "#13131f",
    borderColor: "#2d2a40",
    borderCurve: "continuous",
    borderRadius: 18,
    borderWidth: 1,
  },
  footerRow: {
    flexDirection: "row",
    gap: 8,
  },
  footerText: {
    color: "#aba3de",
    flex: 1,
    lineHeight: 20,
  },
});

import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";

import { Button, Card, Chip, Text } from "@/components/ui";
import { Container } from "@/components/container";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type DomainScope = "all" | "faith" | "career" | "finance" | "health" | "wellness";

type MemoryEntry = {
  key: string;
  value: string;
  tone?: "highlight" | "warn" | "positive";
  actions: string[];
  suppressed?: boolean;
};

type MemorySection = {
  id: Exclude<DomainScope, "all">;
  title: string;
  accent: string;
  freshness: string;
  entries: MemoryEntry[];
  sources: string[];
};

const MEMORY_SECTIONS: MemorySection[] = [
  {
    id: "faith",
    title: "Faith",
    accent: "#534AB7",
    freshness: "6:00 AM",
    entries: [
      { key: "Prayer streak", value: "5 consecutive days · logged today 6:12 AM", tone: "positive", actions: ["Correct", "Suppress"] },
      { key: "Bible reading", value: "6 of last 7 days · Romans 8 today", tone: "positive", actions: ["Correct", "Suppress"] },
      { key: "Fasting rhythm", value: "Wednesdays · 3 consecutive weeks · last: Mar 12", actions: ["Correct", "Suppress"] },
      { key: "Pattern", value: "Early prayer before 7 AM correlates with higher energy across 18 of the last 21 days.", tone: "highlight", actions: ["Suppress pattern"] },
    ],
    sources: [
      "faithLogs -> prayer, fasting, devotional, gratitude entries",
      "habitTracker -> streak calculations",
      "wellnessCheckins -> cross-domain energy correlation",
    ],
  },
  {
    id: "career",
    title: "Career",
    accent: "#185FA5",
    freshness: "6:00 AM",
    entries: [
      { key: "Active project", value: "Life OS · UI/UX sprint · 68% complete", actions: ["Suppress"] },
      { key: "Deep work", value: "5-day streak · Mon-Fri this week", tone: "positive", actions: ["Suppress"] },
      { key: "Deferred", value: "2 tasks deferred to next week · Convex monitoring, Faith UX research", tone: "warn", actions: ["Suppress"] },
    ],
    sources: [
      "tasks -> completion counts, deferred items",
      "plannerBlocks -> deep work streak",
    ],
  },
  {
    id: "finance",
    title: "Finance",
    accent: "#ba7517",
    freshness: "Needs review",
    entries: [
      { key: "Budget status", value: "GH₵ 2,760 spent of GH₵ 4,000 · 69% used · 14 days remain", actions: ["Suppress"] },
      { key: "Review status", value: "Q2 review overdue · 4 days", tone: "warn", actions: ["Mark done", "Suppress"] },
      { key: "Pending proposal", value: "Savings goal GH₵ 400/month · awaiting approval", tone: "highlight", actions: ["Approve", "Dismiss"] },
    ],
    sources: [
      "transactions -> 42 records, March 2026",
      "recurringTransactions -> 8 active subscriptions",
      "savingsGoals -> 2 active + 1 pending proposal",
    ],
  },
  {
    id: "health",
    title: "Health",
    accent: "#993C1D",
    freshness: "6:00 AM",
    entries: [
      { key: "Training", value: "2 of 3 target sessions · Mon + Wed · 1 remaining", actions: ["Suppress"] },
      { key: "Avg energy", value: "6.2 / 10 this week · below usual 7.4", tone: "warn", actions: ["Correct", "Suppress"] },
      { key: "Sleep", value: "Avg 7.1h this week · quality 7.8/10", actions: ["Suppress"] },
      { key: "Weight", value: "74.2 kg · stable", suppressed: true, actions: ["Restore"] },
    ],
    sources: [
      "trainingSessions -> session count, types",
      "wellnessCheckins -> energy and mood averages",
      "sleepLogs -> duration and quality scores",
    ],
  },
  {
    id: "wellness",
    title: "Wellness",
    accent: "#993556",
    freshness: "6:00 AM",
    entries: [
      { key: "Avg mood", value: "7.1 this week · above 3-month average of 6.8", tone: "positive", actions: ["Suppress"] },
      { key: "Stress", value: "Below 4 all week · lowest sustained in 30 days", tone: "positive", actions: ["Suppress"] },
      { key: "Check-in streak", value: "47 consecutive days", tone: "positive", actions: ["Suppress"] },
    ],
    sources: [
      "wellnessCheckins -> mood, energy, focus, stress",
      "reflections -> qualitative entries",
    ],
  },
];

function useMemoryTheme() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  return { theme };
}

export function MemoryViewerScreen() {
  const router = useRouter();
  const { theme } = useMemoryTheme();
  const [scope, setScope] = useState<DomainScope>("all");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    faith: true,
  });
  const [selectedClearDomains, setSelectedClearDomains] = useState<string[]>([]);
  const [contextWindow, setContextWindow] = useState<"3d" | "7d" | "14d" | "30d">("7d");

  const visibleSections = useMemo(
    () =>
      scope === "all"
        ? MEMORY_SECTIONS
        : MEMORY_SECTIONS.filter((section) => section.id === scope),
    [scope],
  );

  function toggleSection(id: string) {
    setOpenSections((current) => ({ ...current, [id]: !current[id] }));
  }

  function toggleClearDomain(id: string) {
    setSelectedClearDomains((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function showPreview(title: string, message: string) {
    Alert.alert(title, message);
  }

  return (
    <Container>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="angle-left" size={16} color={theme.mutedForeground} />
            <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
              Settings
            </Text>
          </Pressable>
        </View>

        <View style={styles.headerWrap}>
          <Text selectable variant="h3">
            AI memory
          </Text>
          <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
            What the model reads before generating anything.
          </Text>
        </View>

        <Card style={styles.freshnessCard}>
          <View style={styles.freshnessHeader}>
            <View style={styles.freshDot} />
            <Text selectable variant="small" style={styles.freshTitle}>
              Context is fresh
            </Text>
            <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
              Updated today · 6:00 AM UTC
            </Text>
          </View>
          <View style={styles.statsRow}>
            {[
              ["Domains read", "8"],
              ["Tables", "53"],
              ["Cron jobs", "24"],
              ["Window", "7d"],
            ].map(([label, value]) => (
              <Card key={label} style={styles.statCard}>
                <Text selectable variant="small" style={styles.statValue}>
                  {value}
                </Text>
                <Text selectable variant="muted" style={styles.statLabel}>
                  {label}
                </Text>
              </Card>
            ))}
          </View>
        </Card>

        <View style={styles.sectionBlock}>
          <Text selectable variant="muted" style={[styles.sectionTag, { color: theme.mutedForeground }]}>
            Context by domain
          </Text>
          <View style={styles.scopeRow}>
            {(["all", "faith", "career", "finance", "health", "wellness"] as const).map((item) => (
              <Chip
                key={item}
                label={item === "all" ? "All" : item[0].toUpperCase() + item.slice(1)}
                selected={scope === item}
                onSelect={() => setScope(item)}
              />
            ))}
          </View>
        </View>

        {visibleSections.map((section) => {
          const isOpen = Boolean(openSections[section.id]);

          return (
            <Card key={section.id} style={styles.memoryCard}>
              <Pressable onPress={() => toggleSection(section.id)} style={styles.memoryHeader}>
                <View style={[styles.sectionAccentDot, { backgroundColor: section.accent }]} />
                <Text selectable variant="small" style={styles.sectionTitle}>
                  {section.title}
                </Text>
                <Text selectable variant="muted" style={{ color: section.freshness === "Needs review" ? "#ba7517" : theme.mutedForeground }}>
                  {section.freshness}
                </Text>
                <FontAwesome
                  name={isOpen ? "angle-down" : "angle-right"}
                  size={16}
                  color={theme.mutedForeground}
                />
              </Pressable>

              {isOpen ? (
                <View style={styles.memoryBody}>
                  {section.entries.map((entry) => (
                    <View
                      key={`${section.id}-${entry.key}`}
                      style={[
                        styles.entryRow,
                        entry.suppressed && styles.entrySuppressed,
                      ]}
                    >
                      <Text selectable variant="muted" style={styles.entryKey}>
                        {entry.key}
                        {entry.suppressed ? " · Suppressed" : ""}
                      </Text>
                      <View style={styles.entryBody}>
                        <Text
                          selectable
                          variant="small"
                          style={[
                            styles.entryValue,
                            entry.tone === "highlight" && styles.highlightValue,
                            entry.tone === "warn" && styles.warnValue,
                            entry.tone === "positive" && styles.positiveValue,
                            entry.suppressed && styles.suppressedValue,
                          ]}
                        >
                          {entry.value}
                        </Text>
                        <View style={styles.entryActions}>
                          {entry.actions.map((action) => (
                            <Chip
                              key={action}
                              label={action}
                              onSelect={() => showPreview(action, `${action} for ${entry.key}`)}
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                  ))}

                  <Card style={styles.sourceCard}>
                    <Text selectable variant="muted" style={styles.sectionTag}>
                      Source
                    </Text>
                    {section.sources.map((source) => (
                      <Text
                        key={source}
                        selectable
                        variant="muted"
                        style={styles.sourceRow}
                      >
                        {source}
                      </Text>
                    ))}
                  </Card>
                </View>
              ) : null}
            </Card>
          );
        })}

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoDot} />
            <Text selectable variant="muted" style={{ color: theme.mutedForeground, flex: 1, lineHeight: 18 }}>
              This is pre-aggregated data, not raw conversation history. Suppressed entries are excluded from AI suggestions until restored. Context refreshes daily at 6:00 AM UTC.
            </Text>
          </View>
        </Card>

        <View style={styles.sectionBlock}>
          <Text selectable variant="muted" style={[styles.sectionTag, { color: theme.mutedForeground }]}>
            Context controls
          </Text>
          <Card style={styles.controlCard}>
            <Text selectable variant="small" style={styles.sectionTitle}>
              Clear domain context
            </Text>
            <Text selectable variant="muted" style={{ color: theme.mutedForeground, lineHeight: 18 }}>
              Wipes the pre-aggregated summaries for selected domains. Your actual data stays untouched and regenerates at the next sync.
            </Text>
            <View style={styles.scopeRow}>
              {MEMORY_SECTIONS.map((section) => (
                <Chip
                  key={section.id}
                  label={section.title}
                  selected={selectedClearDomains.includes(section.id)}
                  onSelect={() => toggleClearDomain(section.id)}
                />
              ))}
            </View>
            <Button
              title="Clear selected domains"
              variant="outline"
              onPress={() =>
                showPreview(
                  "Clear selected domains",
                  selectedClearDomains.length
                    ? `Would clear: ${selectedClearDomains.join(", ")}`
                    : "Select at least one domain first.",
                )
              }
            />
          </Card>

          <Card style={styles.controlCard}>
            <Text selectable variant="small" style={styles.sectionTitle}>
              Clear all context
            </Text>
            <Text selectable variant="muted" style={{ color: theme.mutedForeground, lineHeight: 18 }}>
              The model will have no memory of your patterns until the next sync. Your underlying logs, transactions, and habits remain untouched.
            </Text>
            <Button
              title="Clear all context"
              variant="destructive"
              onPress={() => showPreview("Clear all context", "This needs a confirmation flow before it goes live.")}
            />
          </Card>

          <Card style={styles.controlCard}>
            <Text selectable variant="small" style={styles.sectionTitle}>
              Change context window
            </Text>
            <Text selectable variant="muted" style={{ color: theme.mutedForeground, lineHeight: 18 }}>
              Currently reading 7 days back. Extend for deeper pattern recognition or reduce for more current signal.
            </Text>
            <View style={styles.scopeRow}>
              {[
                { id: "3d", label: "3 days" },
                { id: "7d", label: "7 days" },
                { id: "14d", label: "14 days" },
                { id: "30d", label: "30 days" },
              ].map((option) => (
                <Chip
                  key={option.id}
                  label={option.label}
                  selected={contextWindow === option.id}
                  onSelect={() => setContextWindow(option.id as typeof contextWindow)}
                />
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  controlCard: {
    borderColor: "#2a2a2e",
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  entryActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  entryBody: {
    flex: 1,
    gap: 6,
  },
  entryKey: {
    color: "#66667b",
    width: 92,
  },
  entryRow: {
    borderBottomColor: "#1a1a22",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingVertical: 10,
  },
  entrySuppressed: {
    opacity: 0.45,
  },
  entryValue: {
    color: "#c8c8d4",
    lineHeight: 20,
  },
  freshDot: {
    backgroundColor: "#1d9e75",
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  freshTitle: {
    color: "#1d9e75",
    flex: 1,
    fontFamily: "Geist",
    fontWeight: "700",
  },
  freshnessCard: {
    backgroundColor: "#13131f",
    borderColor: "#2a2a36",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  freshnessHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  headerWrap: {
    gap: 6,
  },
  highlightValue: {
    color: "#b4adf5",
  },
  infoCard: {
    backgroundColor: "#13131f",
    borderColor: "#1e1e28",
    borderCurve: "continuous",
    borderRadius: 10,
    borderWidth: 1,
  },
  infoDot: {
    backgroundColor: "#555555",
    borderRadius: 999,
    height: 5,
    marginTop: 4,
    width: 5,
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
  },
  memoryBody: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 2,
  },
  memoryCard: {
    borderColor: "#2a2a2e",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 0,
  },
  memoryHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  positiveValue: {
    color: "#1d9e75",
  },
  scopeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 40,
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: UI_PRESETS.spacing.lg,
  },
  sectionAccentDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  sectionBlock: {
    gap: 12,
  },
  sectionTag: {
    fontFamily: "Geist",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: "#ccccd4",
    flex: 1,
    fontFamily: "Geist",
    fontWeight: "700",
  },
  sourceCard: {
    backgroundColor: "#13131f",
    borderColor: "#1e1e28",
    borderCurve: "continuous",
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    marginTop: 8,
  },
  sourceRow: {
    color: "#56566e",
    lineHeight: 16,
  },
  statCard: {
    backgroundColor: "#1a1a24",
    borderCurve: "continuous",
    borderRadius: 8,
    flex: 1,
    gap: 2,
    minWidth: 68,
    padding: 8,
  },
  statLabel: {
    color: "#66667b",
    textAlign: "center",
  },
  statValue: {
    color: "#e0e0ec",
    fontFamily: "Geist",
    fontWeight: "700",
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suppressedValue: {
    color: "#444444",
  },
  topBar: {
    flexDirection: "row",
  },
  warnValue: {
    color: "#ba7517",
  },
});

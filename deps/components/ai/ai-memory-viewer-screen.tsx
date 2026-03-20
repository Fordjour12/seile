import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button, Card, Text } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type ScopeId = "all" | "faith" | "career" | "finance" | "health" | "wellness";
type WindowId = "3d" | "7d" | "14d" | "30d";

type MemoryEntry = {
  id: string;
  keyLabel: string;
  value: string;
  tone?: "default" | "positive" | "warn" | "highlight";
  actions?: Array<{ id: string; label: string; tone?: "default" | "correct" | "danger" }>;
  suppressed?: boolean;
};

type MemoryDomain = {
  id: Exclude<ScopeId, "all">;
  name: string;
  dotColor: string;
  freshness: string;
  entries: MemoryEntry[];
  sources: Array<{ source: string; value: string }>;
};

const SCOPE_FILTERS: Array<{ id: ScopeId; label: string }> = [
  { id: "all", label: "All" },
  { id: "faith", label: "Faith" },
  { id: "career", label: "Career" },
  { id: "finance", label: "Finance" },
  { id: "health", label: "Health" },
  { id: "wellness", label: "Wellness" },
];

const DOMAINS: MemoryDomain[] = [
  {
    id: "faith",
    name: "Faith",
    dotColor: "#534AB7",
    freshness: "6:00 AM",
    entries: [
      { id: "faith-prayer", keyLabel: "Prayer streak", value: "5 consecutive days · logged today 6:12 AM", tone: "positive", actions: [{ id: "correct", label: "Correct", tone: "correct" }, { id: "suppress", label: "Suppress", tone: "danger" }] },
      { id: "faith-reading", keyLabel: "Bible reading", value: "6 of last 7 days · Romans 8 today", tone: "positive", actions: [{ id: "correct", label: "Correct", tone: "correct" }, { id: "suppress", label: "Suppress", tone: "danger" }] },
      { id: "faith-fasting", keyLabel: "Fasting rhythm", value: "Wednesdays · 3 consecutive weeks · last: Mar 12", actions: [{ id: "correct", label: "Correct", tone: "correct" }, { id: "suppress", label: "Suppress", tone: "danger" }] },
      { id: "faith-pattern", keyLabel: "Pattern", value: "Early prayer before 7 AM correlates with energy 7.4 vs 5.9. Consistent across 18 of 21 days.", tone: "highlight", actions: [{ id: "suppress", label: "Suppress this pattern", tone: "danger" }] },
    ],
    sources: [
      { source: "faithLogs table", value: "prayer, fasting, devotional, gratitude entries" },
      { source: "habitTracker", value: "streak calculations" },
      { source: "wellnessCheckins", value: "cross-domain energy correlation" },
    ],
  },
  {
    id: "career",
    name: "Career",
    dotColor: "#185FA5",
    freshness: "6:00 AM",
    entries: [
      { id: "career-project", keyLabel: "Active project", value: "Life OS · UI/UX sprint · 68% complete", actions: [{ id: "suppress", label: "Suppress", tone: "danger" }] },
      { id: "career-focus", keyLabel: "Deep work", value: "5-day streak · Mon-Fri this week", tone: "positive", actions: [{ id: "suppress", label: "Suppress", tone: "danger" }] },
      { id: "career-completion", keyLabel: "Completion rate", value: "8 tasks done · 90% domain health", tone: "positive", actions: [{ id: "suppress", label: "Suppress", tone: "danger" }] },
      { id: "career-deferred", keyLabel: "Deferred", value: "2 tasks deferred to next week · Convex monitoring, Faith UX research", tone: "warn", actions: [{ id: "suppress", label: "Suppress", tone: "danger" }] },
    ],
    sources: [
      { source: "tasks table", value: "completion counts, deferred items" },
      { source: "plannerBlocks", value: "deep work streak" },
    ],
  },
  {
    id: "finance",
    name: "Finance",
    dotColor: "#ba7517",
    freshness: "Needs review",
    entries: [
      { id: "finance-budget", keyLabel: "Budget status", value: "GHc 2,760 spent of GHc 4,000 · 69% used · 14 days remain", actions: [{ id: "suppress", label: "Suppress", tone: "danger" }] },
      { id: "finance-review", keyLabel: "Review status", value: "Q2 review overdue · 4 days · was due Mon Mar 10", tone: "warn", actions: [{ id: "mark-done", label: "Mark done", tone: "correct" }, { id: "suppress", label: "Suppress", tone: "danger" }] },
      { id: "finance-surplus", keyLabel: "Surplus pattern", value: "GHc 380-520 unallocated at month-end · last 3 months", tone: "highlight", actions: [{ id: "suppress", label: "Suppress this pattern", tone: "danger" }] },
      { id: "finance-proposal", keyLabel: "Pending proposal", value: "Savings goal GHc 400/month · awaiting approval", tone: "highlight", actions: [{ id: "approve", label: "Approve", tone: "correct" }, { id: "dismiss", label: "Dismiss", tone: "danger" }] },
    ],
    sources: [
      { source: "transactions table", value: "42 records, March 2026" },
      { source: "recurringTransactions", value: "8 active subscriptions" },
      { source: "savingsGoals", value: "2 active + 1 pending proposal" },
    ],
  },
  {
    id: "health",
    name: "Health",
    dotColor: "#993C1D",
    freshness: "6:00 AM",
    entries: [
      { id: "health-training", keyLabel: "Training", value: "2 of 3 target sessions · Mon + Wed · 1 remaining", actions: [{ id: "suppress", label: "Suppress", tone: "danger" }] },
      { id: "health-energy", keyLabel: "Avg energy", value: "6.2 / 10 this week · below usual 7.4", tone: "warn", actions: [{ id: "correct", label: "Correct", tone: "correct" }, { id: "suppress", label: "Suppress", tone: "danger" }] },
      { id: "health-sleep", keyLabel: "Sleep", value: "Avg 7.1h this week · quality 7.8/10", actions: [{ id: "suppress", label: "Suppress", tone: "danger" }] },
      { id: "health-weight", keyLabel: "Weight", value: "74.2 kg · stable", suppressed: true, actions: [{ id: "restore", label: "Restore", tone: "correct" }] },
    ],
    sources: [
      { source: "trainingSessions", value: "session count, types" },
      { source: "wellnessCheckins", value: "energy, mood averages" },
      { source: "sleepLogs", value: "duration, quality scores" },
    ],
  },
  {
    id: "wellness",
    name: "Wellness",
    dotColor: "#993556",
    freshness: "6:00 AM",
    entries: [
      { id: "wellness-mood", keyLabel: "Avg mood", value: "7.1 this week · above 3-month avg of 6.8", tone: "positive", actions: [{ id: "suppress", label: "Suppress", tone: "danger" }] },
      { id: "wellness-stress", keyLabel: "Stress", value: "Below 4 all week · lowest sustained in 30 days", tone: "positive", actions: [{ id: "suppress", label: "Suppress", tone: "danger" }] },
      { id: "wellness-streak", keyLabel: "Check-in streak", value: "47 consecutive days", tone: "positive", actions: [{ id: "suppress", label: "Suppress", tone: "danger" }] },
    ],
    sources: [
      { source: "wellnessCheckins", value: "mood, energy, focus, stress · daily" },
      { source: "reflections table", value: "qualitative entries" },
    ],
  },
];

const WINDOW_OPTIONS: Array<{ id: WindowId; label: string }> = [
  { id: "3d", label: "3 days" },
  { id: "7d", label: "7 days" },
  { id: "14d", label: "14 days" },
  { id: "30d", label: "30 days" },
];

export function AiMemoryViewerScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [scope, setScope] = useState<ScopeId>("all");
  const [openIds, setOpenIds] = useState<string[]>(["faith"]);
  const [suppressedIds, setSuppressedIds] = useState<string[]>(
    DOMAINS.flatMap((domain) => domain.entries.filter((entry) => entry.suppressed).map((entry) => entry.id)),
  );
  const [selectedDomains, setSelectedDomains] = useState<Array<Exclude<ScopeId, "all">>>([]);
  const [windowId, setWindowId] = useState<WindowId>("7d");

  const visibleDomains = useMemo(
    () => (scope === "all" ? DOMAINS : DOMAINS.filter((domain) => domain.id === scope)),
    [scope],
  );

  function toggleOpen(id: string) {
    setOpenIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleSuppressed(id: string) {
    setSuppressedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleSelectedDomain(id: Exclude<ScopeId, "all">) {
    setSelectedDomains((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function valueColor(tone?: MemoryEntry["tone"]) {
    if (tone === "positive") return "#1d9e75";
    if (tone === "warn") return "#ba7517";
    if (tone === "highlight") return "#b4adf5";
    return theme.foreground;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.lg,
          paddingBottom: 36,
          gap: 14,
        }}
      >
        <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 8 }}>
          <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 28, fontWeight: "700" }}>
            AI memory
          </Text>
          <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
            What Claude reads before generating anything.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(40).duration(420)}>
          <Card
            style={{
              borderRadius: 18,
              borderCurve: "continuous",
              padding: 14,
              gap: 12,
              borderWidth: 1,
              borderColor: "rgba(61, 53, 112, 0.34)",
              backgroundColor: isDarkColorScheme ? "rgba(19, 19, 31, 0.96)" : "rgba(244, 242, 255, 0.98)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#1d9e75" }} />
              <Text selectable variant="small" style={{ color: "#1d9e75", fontFamily: "Geist", fontWeight: "700", flex: 1 }}>
                Context is fresh
              </Text>
              <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                Updated today · 6:00 AM UTC
              </Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {[
                { label: "Domains read", value: "8" },
                { label: "Tables", value: "53" },
                { label: "Cron jobs", value: "24" },
                { label: "Window", value: windowId },
              ].map((item) => (
                <View
                  key={item.label}
                  style={{
                    flexGrow: 1,
                    flexBasis: "47%",
                    minWidth: 140,
                    borderRadius: 12,
                    borderCurve: "continuous",
                    padding: 12,
                    backgroundColor: isDarkColorScheme ? "rgba(26, 26, 36, 0.96)" : "rgba(255, 255, 255, 0.9)",
                    borderWidth: 1,
                    borderColor: theme.border,
                    gap: 4,
                  }}
                >
                  <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 17, fontWeight: "700" }}>
                    {item.value}
                  </Text>
                  <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(420)} style={{ gap: 10 }}>
          <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
            Context by domain
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {SCOPE_FILTERS.map((item) => {
              const active = scope === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setScope(item.id)}
                  style={({ pressed }) => ({
                    borderRadius: 999,
                    borderCurve: "continuous",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    backgroundColor: active ? "rgba(123, 109, 246, 0.18)" : theme.card,
                    borderWidth: 1,
                    borderColor: active ? "rgba(123, 109, 246, 0.36)" : theme.border,
                    opacity: pressed ? 0.86 : 1,
                  })}
                >
                  <Text selectable variant="small" style={{ color: active ? "#c8c0ff" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {visibleDomains.map((domain, index) => {
          const isOpen = openIds.includes(domain.id);
          return (
            <Animated.View key={domain.id} entering={FadeInDown.delay(90 + index * 26).duration(420)}>
              <Card style={{ borderRadius: 18, borderCurve: "continuous", overflow: "hidden", borderWidth: 1, borderColor: theme.border }}>
                <Pressable onPress={() => toggleOpen(domain.id)} style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 14 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: domain.dotColor }} />
                    <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700", flex: 1 }}>
                      {domain.name}
                    </Text>
                    <Text selectable variant="muted" style={{ color: domain.id === "finance" ? "#ba7517" : theme.mutedForeground }}>
                      {domain.freshness}
                    </Text>
                    <FontAwesome name={isOpen ? "chevron-down" : "chevron-right"} size={13} color={theme.mutedForeground} />
                  </View>
                </Pressable>

                {isOpen ? (
                  <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: theme.border, gap: 10 }}>
                    {domain.entries.map((entry) => {
                      const isSuppressed = suppressedIds.includes(entry.id);
                      return (
                        <View key={entry.id} style={{ gap: 6, paddingTop: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                          <View style={{ flexDirection: "row", gap: 12 }}>
                            <Text selectable variant="muted" style={{ color: theme.mutedForeground, width: 94 }}>
                              {entry.keyLabel}
                              {isSuppressed ? (
                                <Text selectable variant="muted" style={{ color: "#44444f" }}>
                                  {" · Suppressed"}
                                </Text>
                              ) : null}
                            </Text>
                            <View style={{ flex: 1, gap: 6 }}>
                              <Text selectable variant="small" style={{ color: isSuppressed ? "#44444f" : valueColor(entry.tone), lineHeight: 20 }}>
                                {entry.value}
                              </Text>
                              {entry.actions?.length ? (
                                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                                  {entry.actions.map((action) => {
                                    const mutatesSuppressed = action.id === "suppress" || action.id === "restore" || action.id === "dismiss";
                                    return (
                                      <Pressable
                                        key={action.id}
                                        onPress={() => {
                                          if (mutatesSuppressed) {
                                            toggleSuppressed(entry.id);
                                          }
                                        }}
                                        style={({ pressed }) => ({
                                          borderRadius: 999,
                                          borderCurve: "continuous",
                                          paddingHorizontal: 10,
                                          paddingVertical: 5,
                                          backgroundColor: action.tone === "correct" ? "rgba(123, 109, 246, 0.12)" : action.tone === "danger" ? "rgba(58, 26, 26, 0.76)" : theme.card,
                                          borderWidth: 1,
                                          borderColor: action.tone === "correct" ? "rgba(123, 109, 246, 0.22)" : action.tone === "danger" ? "rgba(84, 32, 32, 0.9)" : theme.border,
                                          opacity: pressed ? 0.84 : 1,
                                        })}
                                      >
                                        <Text selectable variant="muted" style={{ color: action.tone === "correct" ? "#b8abff" : action.tone === "danger" ? "#e07a7a" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                                          {action.id === "suppress" && isSuppressed ? "Restore" : action.label}
                                        </Text>
                                      </Pressable>
                                    );
                                  })}
                                </View>
                              ) : null}
                            </View>
                          </View>
                        </View>
                      );
                    })}

                    <Card style={{ borderRadius: 12, borderCurve: "continuous", padding: 12, gap: 6, borderWidth: 1, borderColor: theme.border, backgroundColor: isDarkColorScheme ? "#13131f" : "#f7f7ff" }}>
                      <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                        Source
                      </Text>
                      {domain.sources.map((source) => (
                        <View key={source.source} style={{ flexDirection: "row", gap: 8 }}>
                          <Text selectable variant="small" style={{ color: "#58586a", fontFamily: "Geist" }}>
                            {source.source}
                          </Text>
                          <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                            →
                          </Text>
                          <Text selectable variant="small" style={{ color: theme.mutedForeground, flex: 1 }}>
                            {source.value}
                          </Text>
                        </View>
                      ))}
                    </Card>
                  </View>
                ) : null}
              </Card>
            </Animated.View>
          );
        })}

        <Animated.View entering={FadeInDown.delay(180).duration(420)}>
          <Card style={{ borderRadius: 14, borderCurve: "continuous", padding: 12, borderWidth: 1, borderColor: theme.border, backgroundColor: isDarkColorScheme ? "#13131f" : "#f7f7ff", flexDirection: "row", gap: 8 }}>
            <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: theme.mutedForeground, marginTop: 6 }} />
            <Text selectable variant="muted" style={{ color: theme.mutedForeground, flex: 1, lineHeight: 18 }}>
              This is pre-aggregated data, not raw conversation history. Suppressed entries are excluded from AI suggestions until restored. Context refreshes daily at 6:00 AM UTC.
            </Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220).duration(420)} style={{ gap: 10 }}>
          <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
            Context controls
          </Text>

          <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 14, gap: 12, borderWidth: 1, borderColor: theme.border }}>
            <View style={{ gap: 4 }}>
              <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                Clear domain context
              </Text>
              <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
                Wipes the pre-aggregated summaries for selected domains. Your actual data is untouched and regenerates at the next 6 AM sync.
              </Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {DOMAINS.map((domain) => {
                const active = selectedDomains.includes(domain.id);
                return (
                  <Pressable
                    key={domain.id}
                    onPress={() => toggleSelectedDomain(domain.id)}
                    style={({ pressed }) => ({
                      borderRadius: 999,
                      borderCurve: "continuous",
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      backgroundColor: active ? "rgba(123, 109, 246, 0.18)" : theme.card,
                      borderWidth: 1,
                      borderColor: active ? "rgba(123, 109, 246, 0.32)" : theme.border,
                      opacity: pressed ? 0.84 : 1,
                    })}
                  >
                    <Text selectable variant="small" style={{ color: active ? "#c8c0ff" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                      {domain.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Button title="Clear selected domains" variant="outline" onPress={() => setSelectedDomains([])} style={{ borderRadius: 12, borderCurve: "continuous" }} />
          </Card>

          <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 14, gap: 12, borderWidth: 1, borderColor: "rgba(190, 76, 95, 0.26)", backgroundColor: isDarkColorScheme ? "rgba(30, 14, 18, 0.88)" : "rgba(255, 242, 245, 0.94)" }}>
            <View style={{ gap: 4 }}>
              <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                Clear all context
              </Text>
              <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
                Claude will have no memory of your patterns until tomorrow&apos;s 6 AM sync. Your actual data is untouched.
              </Text>
            </View>
            <Button title="Clear all context" variant="ghost" onPress={() => setSuppressedIds([])} style={{ borderRadius: 12, borderCurve: "continuous" }} />
          </Card>

          <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 14, gap: 12, borderWidth: 1, borderColor: theme.border }}>
            <View style={{ gap: 4 }}>
              <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                Change context window
              </Text>
              <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
                Extend for deeper pattern recognition or reduce for a more current-focused AI.
              </Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {WINDOW_OPTIONS.map((item) => {
                const active = windowId === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setWindowId(item.id)}
                    style={({ pressed }) => ({
                      borderRadius: 999,
                      borderCurve: "continuous",
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      backgroundColor: active ? "rgba(123, 109, 246, 0.18)" : theme.card,
                      borderWidth: 1,
                      borderColor: active ? "rgba(123, 109, 246, 0.32)" : theme.border,
                      opacity: pressed ? 0.84 : 1,
                    })}
                  >
                    <Text selectable variant="small" style={{ color: active ? "#c8c0ff" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

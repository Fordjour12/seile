import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Card, Text } from "@/components";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type ScopeId = "all" | "faith" | "career" | "finance" | "health" | "tasks" | "cmds";
type SearchState = "default" | "prayer" | "budget" | "convex" | "none";

type SearchResultItem = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  tagBackground: string;
  time: string;
  barColor: string;
  onPress: () => void;
};

const SCOPE_PILLS: Array<{ id: ScopeId; label: string }> = [
  { id: "all", label: "All" },
  { id: "faith", label: "Faith" },
  { id: "career", label: "Career" },
  { id: "finance", label: "Finance" },
  { id: "health", label: "Health" },
  { id: "tasks", label: "Tasks" },
  { id: "cmds", label: "Commands" },
];

const RECENT_SEARCHES = [
  { id: "prayer", label: "prayer", time: "2h ago", icon: "bullseye" as const, iconColor: "#9b8fff", iconBackground: "#2a2040" },
  { id: "budget", label: "budget", time: "Yesterday", icon: "money" as const, iconColor: "#6fcf97", iconBackground: "#1a2a1e" },
  { id: "convex", label: "Convex schema", time: "Thu", icon: "database" as const, iconColor: "#85b7eb", iconBackground: "#1a1e2a" },
];

const QUICK_COMMANDS = [
  { id: "log-prayer", title: "Log prayer", subtitle: "Add to Faith domain · today", shortcut: "Faith", icon: "bullseye" as const, iconColor: "#9b8fff", iconBackground: "#2a2040", action: "/(tabs)/domains/faith" },
  { id: "add-task", title: "Add task", subtitle: "Quick add to Tasks · today", shortcut: "Cmd+T", icon: "check-square-o" as const, iconColor: "#9ca1af", iconBackground: "#1e1e1e", action: "/actions/quick-add" },
  { id: "log-expense", title: "Log expense", subtitle: "Add transaction to Finance", shortcut: "Cmd+E", icon: "money" as const, iconColor: "#6fcf97", iconBackground: "#1a2a1e", action: "/(tabs)/domains/finance" },
  { id: "check-in", title: "Check-in", subtitle: "Log mood, energy, focus", shortcut: "Cmd+C", icon: "heartbeat" as const, iconColor: "#ed93b1", iconBackground: "#2a1020", action: "/actions/check-in" },
  { id: "ask-ai", title: "Ask AI", subtitle: "Open AI tab · new session", shortcut: "Cmd+A", icon: "commenting-o" as const, iconColor: "#ba7517", iconBackground: "#2a2010", action: "/(tabs)/ai" },
  { id: "plan-week", title: "Plan next week", subtitle: "Generate weekly plan · AI session", shortcut: "Cmd+P", icon: "calendar" as const, iconColor: "#9b8fff", iconBackground: "#1e1a30", action: "/(tabs)/ai/weekly-plan" },
];

export function SearchCommandScreen() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const [scope, setScope] = useState<ScopeId>("all");
  const [query, setQuery] = useState("");

  const state = useMemo<SearchState>(() => {
    const value = query.trim().toLowerCase();
    if (!value || scope === "cmds") return "default";
    if (value.includes("pray")) return "prayer";
    if (value.includes("budget") || value.includes("finance") || value.includes("money") || value.includes("spending")) return "budget";
    if (value.includes("convex") || value.includes("schema") || value.includes("cron") || value.includes("database")) return "convex";
    if (value.length > 1) return "none";
    return "default";
  }, [query, scope]);

  return (
    <View style={{ flex: 1, backgroundColor: "#050508" }}>
      <View style={{ flex: 1, backgroundColor: "rgba(5, 5, 8, 0.92)" }}>
        <View style={{ position: "absolute", inset: 0, paddingTop: 72, paddingHorizontal: 24, opacity: 0.22 }}>
          <Text selectable style={{ color: "#ffffff", fontFamily: "Geist", fontSize: 24, fontWeight: "700", marginBottom: 12 }}>
            Good morning, Bobie.
          </Text>
          {[72, 220].map((width, index) => (
            <View key={width} style={{ height: 10, width, borderRadius: 999, backgroundColor: "#1a1a1e", marginBottom: index === 0 ? 10 : 20 }} />
          ))}
          {[0, 1].map((item) => (
            <Card key={item} style={{ borderRadius: 16, borderCurve: "continuous", padding: 14, marginBottom: 10, backgroundColor: "#1a1a1e", borderWidth: 1, borderColor: "#222" }}>
              <View style={{ height: 10, width: item === 0 ? "80%" : "90%", borderRadius: 999, backgroundColor: "#222" }} />
              <View style={{ height: 10, width: item === 0 ? "55%" : "60%", borderRadius: 999, backgroundColor: "#222", marginTop: 8 }} />
            </Card>
          ))}
        </View>

        <Animated.View entering={FadeInDown.duration(420)} style={{ flex: 1, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20 }}>
          <View style={{ borderRadius: 18, borderCurve: "continuous", borderWidth: 1, borderColor: "rgba(61, 53, 112, 0.92)", backgroundColor: "rgba(26, 26, 30, 0.98)", paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <FontAwesome name="search" size={16} color="#88889a" />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Search anything..."
              placeholderTextColor="#44444f"
              style={{ flex: 1, color: "#ececf6", fontFamily: "Figtree", fontSize: 16, paddingVertical: 0 }}
            />
            {query ? (
              <Pressable onPress={() => setQuery("")}>
                <Text selectable variant="small" style={{ color: "#777786", fontFamily: "Geist", fontWeight: "700" }}>
                  Clear
                </Text>
              </Pressable>
            ) : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 10, paddingBottom: 10 }}>
            {SCOPE_PILLS.map((item) => {
              const active = scope === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setScope(item.id);
                    if (item.id === "cmds") setQuery("");
                  }}
                  style={({ pressed }) => ({
                    borderRadius: 999,
                    borderCurve: "continuous",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: active ? "rgba(123, 109, 246, 0.18)" : "#1a1a1e",
                    borderWidth: 1,
                    borderColor: active ? "#3d3570" : "#222",
                    opacity: pressed ? 0.84 : 1,
                  })}
                >
                  <Text selectable variant="muted" style={{ color: active ? "#c8c0ff" : "#777786", fontFamily: "Geist", fontWeight: "700" }}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 8, paddingBottom: 24, gap: 16 }}>
            {state === "default" ? (
              <>
                <Animated.View entering={FadeInDown.delay(60).duration(420)} style={{ gap: 8 }}>
                  <Text selectable variant="muted" style={{ color: "#666673", fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                    Recent searches
                  </Text>
                  {RECENT_SEARCHES.map((item) => (
                    <Pressable key={item.id} onPress={() => setQuery(item.label)} style={({ pressed }) => ({ opacity: pressed ? 0.84 : 1 })}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "#1a1a1e" }}>
                        <View style={{ width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: item.iconBackground, borderWidth: 1, borderColor: "#222" }}>
                          <FontAwesome name={item.icon} size={12} color={item.iconColor} />
                        </View>
                        <Text selectable variant="small" style={{ color: "#b8b8c6", flex: 1 }}>
                          {item.label}
                        </Text>
                        <Text selectable variant="muted" style={{ color: "#555565" }}>
                          {item.time}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(100).duration(420)} style={{ gap: 8 }}>
                  <Text selectable variant="muted" style={{ color: "#666673", fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                    Quick commands
                  </Text>
                  {QUICK_COMMANDS.map((item) => (
                    <Pressable key={item.id} onPress={() => router.push(item.action as never)} style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 14, backgroundColor: "#141418", borderWidth: 1, borderColor: "#202028" }}>
                        <View style={{ width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: item.iconBackground }}>
                          <FontAwesome name={item.icon} size={13} color={item.iconColor} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text selectable variant="small" style={{ color: "#d6d6e2", fontFamily: "Geist", fontWeight: "700" }}>
                            {item.title}
                          </Text>
                          <Text selectable variant="muted" style={{ color: "#666673", marginTop: 2 }}>
                            {item.subtitle}
                          </Text>
                        </View>
                        <Badge variant="outline" color="secondary">{item.shortcut}</Badge>
                      </View>
                    </Pressable>
                  ))}
                </Animated.View>
              </>
            ) : null}

            {state === "prayer" ? (
              <>
                <Animated.View entering={FadeInDown.delay(60).duration(420)}>
                  <Card style={{ borderRadius: 16, borderCurve: "continuous", padding: 14, gap: 8, backgroundColor: "#13131f", borderWidth: 1, borderColor: "#2a2a36" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: "#9b8fff" }} />
                      <Text selectable variant="muted" style={{ color: "#9b8fff", fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                        AI insight
                      </Text>
                    </View>
                    <Text selectable variant="small" style={{ color: "#b4b4c6", lineHeight: 20 }}>
                      On days you logged prayer before 7 AM, your energy averaged 7.4 vs 5.9 on other days. Strongest cross-domain signal in your data.
                    </Text>
                  </Card>
                </Animated.View>
                <ResultGroup
                  label="Faith · Prayer logs"
                  actionLabel="See all"
                  onAction={() => router.push("/(tabs)/domains/faith" as never)}
                  items={[
                    { id: "prayer-morning", title: "Morning prayer", subtitle: "Gratitude for clarity this week. Prayed for direction on the Life OS build...", tag: "Faith", tagColor: "#b4adf5", tagBackground: "#2a2040", time: "Today · 6:12 AM", barColor: "#534AB7", onPress: () => router.push("/(tabs)/domains/faith" as never) },
                    { id: "prayer-evening", title: "Evening prayer · fasting day", subtitle: "Quieter prayer. Fasting day made the evening feel more grounded...", tag: "Faith", tagColor: "#b4adf5", tagBackground: "#2a2040", time: "Wed · 9:40 PM", barColor: "#534AB7", onPress: () => router.push("/(tabs)/domains/faith" as never) },
                  ]}
                  highlightNeedle="prayer"
                  theme={theme}
                />
              </>
            ) : null}

            {state === "budget" ? (
              <>
                <Animated.View entering={FadeInDown.delay(60).duration(420)}>
                  <Card style={{ borderRadius: 16, borderCurve: "continuous", padding: 14, gap: 8, backgroundColor: "#13131f", borderWidth: 1, borderColor: "#2a2a36" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: "#e8c06a" }} />
                      <Text selectable variant="muted" style={{ color: "#e8c06a", fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                        Pending action
                      </Text>
                    </View>
                    <Text selectable variant="small" style={{ color: "#d0c6a6", lineHeight: 20 }}>
                      Budget review is 4 days overdue. Finance health is at 55%. One hour today lifts it back above 80%.
                    </Text>
                  </Card>
                </Animated.View>
                <ResultGroup
                  label="Finance · Budget"
                  actionLabel="Finance domain"
                  onAction={() => router.push("/(tabs)/domains/finance" as never)}
                  items={[
                    { id: "march-budget", title: "March budget · GHc 4,000", subtitle: "GHc 2,760 spent · GHc 1,240 remaining", tag: "Finance", tagColor: "#6fcf97", tagBackground: "#1a2a1e", time: "69% used · 14 days left", barColor: "#0F6E56", onPress: () => router.push("/(tabs)/domains/finance" as never) },
                    { id: "q2-budget", title: "Q2 budget variance review", subtitle: "Overdue since Monday · was due Mar 10", tag: "Overdue", tagColor: "#ba7517", tagBackground: "#2a1e08", time: "4 days", barColor: "#ba7517", onPress: () => router.push("/(tabs)/domains/finance" as never) },
                  ]}
                  highlightNeedle="budget"
                  theme={theme}
                />
                <ResultGroup
                  label="Savings goals"
                  items={[
                    { id: "goal-review", title: "Emergency fund · GHc 400/month", subtitle: "Proposed by AI · pending approval", tag: "Pending approval", tagColor: "#9b8fff", tagBackground: "#1e1a30", time: "Review", barColor: "#0F6E56", onPress: () => router.push("/(tabs)/ai/approvals" as never) },
                  ]}
                  highlightNeedle="budget"
                  theme={theme}
                />
              </>
            ) : null}

            {state === "convex" ? (
              <>
                <ResultGroup
                  label="Career · Tasks"
                  items={[
                    { id: "convex-schema", title: "Convex schema · recurring transactions table", subtitle: "Today · Deep work · In progress", tag: "Career", tagColor: "#85b7eb", tagBackground: "#1a1e2a", time: "Today", barColor: "#185FA5", onPress: () => router.push("/(tabs)/domains/career" as never) },
                    { id: "convex-monitoring", title: "Set up Convex cron job monitoring", subtitle: "Deferred to Mon Mar 17", tag: "Deferred", tagColor: "#ba7517", tagBackground: "#2a1e08", time: "Mon Mar 17", barColor: "#ba7517", onPress: () => router.push("/(tabs)/domains/career" as never) },
                    { id: "convex-done", title: "Convex cron job implementation", subtitle: "Completed · Tue Mar 11", tag: "Done", tagColor: "#6fcf97", tagBackground: "#1a2a1e", time: "Tue", barColor: "#1d9e75", onPress: () => router.push("/(tabs)/domains/career" as never) },
                  ]}
                  highlightNeedle="convex"
                  theme={theme}
                />
                <ResultGroup
                  label="AI sessions"
                  items={[
                    { id: "convex-session", title: "AI session · Convex architecture", subtitle: "Thu · 53 tables, 24 cron jobs discussed", tag: "AI", tagColor: "#9b8fff", tagBackground: "#1e1a30", time: "Thu", barColor: "#9b8fff", onPress: () => router.push("/(tabs)/ai/classic" as never) },
                  ]}
                  highlightNeedle="convex"
                  theme={theme}
                />
              </>
            ) : null}

            {state === "none" ? (
              <Animated.View entering={FadeInDown.delay(60).duration(420)} style={{ alignItems: "center", paddingTop: 36, gap: 8 }}>
                <Text selectable style={{ color: "#88889a", fontFamily: "Geist", fontWeight: "700" }}>
                  No results for &quot;{query}&quot;
                </Text>
                <Text selectable variant="small" style={{ color: "#555565", textAlign: "center", lineHeight: 20 }}>
                  Try a domain name, task title, habit, prayer entry, or AI command.
                </Text>
                <Pressable onPress={() => router.push("/(tabs)/ai/classic" as never)} style={({ pressed }) => ({ marginTop: 8, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#1e1a30", borderWidth: 1, borderColor: "#3d3570", opacity: pressed ? 0.84 : 1 })}>
                  <Text selectable variant="small" style={{ color: "#9b8fff", fontFamily: "Geist", fontWeight: "700" }}>
                    Ask AI instead
                  </Text>
                </Pressable>
              </Animated.View>
            ) : null}
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
}

function ResultGroup({
  label,
  actionLabel,
  onAction,
  items,
  highlightNeedle,
  theme,
}: {
  label: string;
  actionLabel?: string;
  onAction?: () => void;
  items: SearchResultItem[];
  highlightNeedle: string;
  theme: (typeof NAV_THEME)[keyof typeof NAV_THEME];
}) {
  function highlightText(text: string) {
    const lowerText = text.toLowerCase();
    const lowerNeedle = highlightNeedle.toLowerCase();
    const index = lowerText.indexOf(lowerNeedle);
    if (index === -1) {
      return (
        <Text selectable variant="small" style={{ color: "#d0d0dc", fontFamily: "Geist", fontWeight: "700", lineHeight: 20 }}>
          {text}
        </Text>
      );
    }
    return (
      <Text selectable variant="small" style={{ color: "#d0d0dc", fontFamily: "Geist", fontWeight: "700", lineHeight: 20 }}>
        {text.slice(0, index)}
        <Text selectable variant="small" style={{ color: "#9b8fff", fontFamily: "Geist", fontWeight: "700" }}>
          {text.slice(index, index + highlightNeedle.length)}
        </Text>
        {text.slice(index + highlightNeedle.length)}
      </Text>
    );
  }

  return (
    <Animated.View entering={FadeInDown.delay(90).duration(420)} style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <Text selectable variant="muted" style={{ color: "#666673", fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
          {label}
        </Text>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction}>
            <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {items.map((item) => (
        <Pressable key={item.id} onPress={item.onPress} style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 10, borderRadius: 14, backgroundColor: "#141418", borderWidth: 1, borderColor: "#202028" }}>
            <View style={{ width: 3, alignSelf: "stretch", borderRadius: 999, backgroundColor: item.barColor }} />
            <View style={{ flex: 1, gap: 2 }}>
              {highlightText(item.title)}
              <Text selectable variant="muted" style={{ color: "#666673" }}>
                {item.subtitle}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: item.tagBackground }}>
                  <Text selectable variant="muted" style={{ color: item.tagColor, fontFamily: "Geist", fontWeight: "700" }}>
                    {item.tag}
                  </Text>
                </View>
                <Text selectable variant="muted" style={{ color: "#555565" }}>
                  {item.time}
                </Text>
              </View>
            </View>
            <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
              Open
            </Text>
          </View>
        </Pressable>
      ))}
    </Animated.View>
  );
}

import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type FilterId = "all" | "pending" | "finance" | "faith" | "health" | "history";

type PendingItem = {
  id: string;
  domain: "finance" | "faith" | "health";
  domainLabel: string;
  typeLabel: string;
  title: string;
  preview: string;
  timeLabel: string;
  impactLabel: string;
  impactColor: string;
  impactBackground: string;
  domainColor: string;
  domainBackground: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  why: string;
  changes: Array<{ key: string; value: string; color?: string }>;
  context: string;
  editLabel?: string;
};

type HistoryItem = {
  id: string;
  title: string;
  subtitle: string;
  status: "approved" | "dismissed" | "expired";
  timeLabel: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  iconColor: string;
  iconBackground: string;
};

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "finance", label: "Finance" },
  { id: "faith", label: "Faith" },
  { id: "health", label: "Health" },
  { id: "history", label: "History" },
];

const INITIAL_PENDING_ITEMS: PendingItem[] = [
  {
    id: "finance-goal",
    domain: "finance",
    domainLabel: "Finance",
    typeLabel: "Create goal",
    title: "Create emergency fund savings goal",
    preview: "GHc 400/month allocated from your consistent month-end surplus. Est. completion 17 months.",
    timeLabel: "Proposed 4 days ago",
    impactLabel: "Finance +25%",
    impactColor: "#ba7517",
    impactBackground: "#2a1e08",
    domainColor: "#1d9e75",
    domainBackground: "#1a2a1e",
    icon: "plus",
    why: "You consistently have GHc 380-520 unallocated at month-end. Channeling that into a structured goal puts it to work rather than letting it drift.",
    changes: [
      { key: "Goal name", value: "Emergency fund" },
      { key: "Monthly allocation", value: "GHc 400", color: "#1d9e75" },
      { key: "Target", value: "GHc 8,000" },
      { key: "Est. completion", value: "~17 months", color: "#9b8fff" },
    ],
    context: "Based on Finance data · last 30 days · avg surplus GHc 420",
  },
  {
    id: "faith-routine",
    domain: "faith",
    domainLabel: "Faith",
    typeLabel: "Schedule routine",
    title: "Add morning spiritual block to weekly plan",
    preview: "Prayer + devotional + reading · 6:00-6:45 AM · Mon-Fri recurring.",
    timeLabel: "Proposed 2 days ago",
    impactLabel: "Faith +10%",
    impactColor: "#9b8fff",
    impactBackground: "#2a2040",
    domainColor: "#9b8fff",
    domainBackground: "#2a2040",
    icon: "bullseye",
    why: "You have logged prayer and devotional on 5 of the last 7 mornings. Formalizing it protects the streak and makes it plannable.",
    changes: [
      { key: "Routine", value: "Morning spiritual block" },
      { key: "Time", value: "6:00-6:45 AM", color: "#9b8fff" },
      { key: "Days", value: "Mon-Fri" },
      { key: "Added to", value: "Planner + habits" },
    ],
    context: "Based on Faith logs · last 7 days · prayer streak 5 days",
    editLabel: "Edit",
  },
  {
    id: "health-training",
    domain: "health",
    domainLabel: "Health",
    typeLabel: "Adjust target",
    title: "Reduce training to 3x this week",
    preview: "Down from 4 sessions. Energy averaged 6.2 below your usual 7.4. Temporary for this week only.",
    timeLabel: "Proposed today",
    impactLabel: "Recovery up",
    impactColor: "#1d9e75",
    impactBackground: "#1a2a1e",
    domainColor: "#d85a30",
    domainBackground: "#2a1510",
    icon: "heartbeat",
    why: "Your average energy this week is 6.2 vs your usual 7.4. Pushing 4 sessions on a recovery week tends to set you back more than it helps.",
    changes: [
      { key: "Current target", value: "4 sessions", color: "#ba7517" },
      { key: "Proposed", value: "3 sessions", color: "#1d9e75" },
      { key: "Removed", value: "Thursday session" },
      { key: "Duration", value: "This week only", color: "#9b8fff" },
    ],
    context: "Based on wellness check-ins · avg energy 6.2 vs usual 7.4",
    editLabel: "Keep 4, reschedule",
  },
];

const HISTORY_ITEMS: HistoryItem[] = [
  {
    id: "weekly-plan",
    title: "Weekly plan · Mar 17 draft",
    subtitle: "Career + Faith + Finance · 16 priorities",
    status: "approved",
    timeLabel: "Approved · Thu",
    icon: "check",
    iconColor: "#1d9e75",
    iconBackground: "#1a2a1e",
  },
  {
    id: "faith-reflection",
    title: "Faith reflection prompt · weekly",
    subtitle: "Suggested adding structured Sunday reflection",
    status: "dismissed",
    timeLabel: "Dismissed · Tue",
    icon: "clock-o",
    iconColor: "#666673",
    iconBackground: "#1a1a1e",
  },
  {
    id: "prayer-streak",
    title: "Habit log · prayer streak update",
    subtitle: "Auto-approved · low-risk · streak tracker only",
    status: "approved",
    timeLabel: "Auto · Mon",
    icon: "check",
    iconColor: "#1d9e75",
    iconBackground: "#1a2a1e",
  },
  {
    id: "subscription-audit",
    title: "Subscriptions audit · 3 items flagged",
    subtitle: "Expired after 7 days without response",
    status: "expired",
    timeLabel: "Expired · Mon",
    icon: "clock-o",
    iconColor: "#44444f",
    iconBackground: "#1a1a1e",
  },
];

export function AiApprovalInboxScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const [filter, setFilter] = useState<FilterId>("all");
  const [pendingItems, setPendingItems] = useState(INITIAL_PENDING_ITEMS);
  const [openItemId, setOpenItemId] = useState<string | null>("finance-goal");
  const [readIds, setReadIds] = useState<string[]>([]);

  const filteredPendingItems = useMemo(() => {
    if (filter === "all" || filter === "pending") {
      return pendingItems;
    }
    if (filter === "history") {
      return [];
    }
    return pendingItems.filter((item) => item.domain === filter);
  }, [filter, pendingItems]);

  const showPending = filter !== "history";
  const showHistory = filter === "all" || filter === "history";
  const pendingCount = pendingItems.length;

  function openItem(id: string) {
    setOpenItemId((current) => (current === id ? null : id));
    setReadIds((current) => (current.includes(id) ? current : [...current, id]));
  }

  function removePending(id: string) {
    setPendingItems((current) => current.filter((item) => item.id !== id));
    setOpenItemId((current) => (current === id ? null : current));
    setReadIds((current) => (current.includes(id) ? current : [...current, id]));
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
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <View style={{ gap: 4, flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 28, fontWeight: "700" }}>
                  Approvals
                </Text>
                <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                  {pendingCount > 0 ? `${pendingCount} pending` : "All clear"}
                </Text>
              </View>
              <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                AI is waiting on you before making any changes.
              </Text>
            </View>
            <Pressable onPress={() => setReadIds(pendingItems.map((item) => item.id))}>
              <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
                Mark all read
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(40).duration(420)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {FILTERS.map((item) => {
              const active = filter === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setFilter(item.id)}
                  style={({ pressed }) => ({
                    borderRadius: 999,
                    borderCurve: "continuous",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    backgroundColor: active ? "rgba(123, 109, 246, 0.18)" : theme.card,
                    borderWidth: 1,
                    borderColor: active ? "rgba(123, 109, 246, 0.36)" : theme.border,
                    opacity: pressed ? 0.84 : 1,
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

        {pendingCount > 0 && showPending ? (
          <Animated.View entering={FadeInDown.delay(70).duration(420)}>
            <Card
              style={{
                borderRadius: 16,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: "rgba(123, 109, 246, 0.32)",
                backgroundColor: isDarkColorScheme ? "rgba(30, 26, 48, 0.96)" : "rgba(243, 239, 255, 0.98)",
                padding: 14,
                gap: 10,
              }}
            >
              <Text selectable variant="small" style={{ color: "#b8abff", lineHeight: 20 }}>
                {pendingCount} pending. Approve all low-risk items?
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button title="Approve all" onPress={() => setPendingItems([])} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
                <Button title="Review each" variant="outline" onPress={() => setOpenItemId(null)} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
              </View>
            </Card>
          </Animated.View>
        ) : null}

        {showPending ? (
          <Animated.View entering={FadeInDown.delay(90).duration(420)} style={{ gap: 10 }}>
            <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
              Pending · {filteredPendingItems.length}
            </Text>

            {filteredPendingItems.length === 0 ? (
              <Card
                style={{
                  borderRadius: 18,
                  borderCurve: "continuous",
                  padding: 20,
                  alignItems: "center",
                  gap: 8,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <View style={{ width: 46, height: 46, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}>
                  <FontAwesome name="check" size={18} color={theme.mutedForeground} />
                </View>
                <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                  All caught up
                </Text>
                <Text selectable variant="small" style={{ color: theme.mutedForeground, textAlign: "center", lineHeight: 20 }}>
                  No pending approvals. The AI will not make changes until you see them here first.
                </Text>
              </Card>
            ) : null}

            {filteredPendingItems.map((item, index) => {
              const isOpen = openItemId === item.id;
              const isRead = readIds.includes(item.id);
              return (
                <Animated.View key={item.id} entering={FadeInDown.delay(110 + index * 30).duration(420)}>
                  <Pressable onPress={() => openItem(item.id)} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
                    <Card
                      style={{
                        borderRadius: 18,
                        borderCurve: "continuous",
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: item.domain === "finance" ? "#3d3010" : theme.border,
                        backgroundColor: item.domain === "finance" ? (isDarkColorScheme ? "#181208" : "#fff7eb") : theme.card,
                        opacity: isRead ? 0.88 : 1,
                      }}
                    >
                      <View style={{ flexDirection: "row", gap: 12, padding: 14 }}>
                        <View style={{ width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: item.domainBackground }}>
                          <FontAwesome name={item.icon} size={14} color={item.domainColor} />
                        </View>
                        <View style={{ flex: 1, gap: 4 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Text selectable variant="small" style={{ color: item.domainColor, fontFamily: "Geist", fontWeight: "700" }}>
                              {item.domainLabel}
                            </Text>
                            <Badge variant="outline" color="secondary">{item.typeLabel}</Badge>
                          </View>
                          <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700", lineHeight: 20 }}>
                            {item.title}
                          </Text>
                          <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
                            {item.preview}
                          </Text>
                          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 4 }}>
                            <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                              {item.timeLabel}
                            </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                              <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: item.impactBackground }}>
                                <Text selectable variant="muted" style={{ color: item.impactColor, fontFamily: "Geist", fontWeight: "700" }}>
                                  {item.impactLabel}
                                </Text>
                              </View>
                              {!isRead ? <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: item.domainColor }} /> : null}
                            </View>
                          </View>
                        </View>
                      </View>

                      {isOpen ? (
                        <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: theme.border, gap: 12 }}>
                          <Text selectable variant="small" style={{ color: theme.foreground, lineHeight: 20, paddingTop: 12 }}>
                            {item.why}
                          </Text>
                          <Card style={{ borderRadius: 12, borderCurve: "continuous", padding: 12, gap: 6, borderWidth: 1, borderColor: theme.border, backgroundColor: isDarkColorScheme ? "#141418" : "#f8f8fb" }}>
                            <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                              What will change
                            </Text>
                            {item.changes.map((change) => (
                              <View key={change.key} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, paddingVertical: 4 }}>
                                <Text selectable variant="small" style={{ color: theme.mutedForeground, flex: 1 }}>
                                  {change.key}
                                </Text>
                                <Text selectable variant="small" style={{ color: change.color ?? theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                                  {change.value}
                                </Text>
                              </View>
                            ))}
                          </Card>
                          <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
                            <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: theme.primary, marginTop: 6 }} />
                            <Text selectable variant="muted" style={{ color: theme.mutedForeground, flex: 1 }}>
                              {item.context}
                            </Text>
                          </View>
                          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                            <Button title="Approve" onPress={() => removePending(item.id)} style={{ flexGrow: 1, borderRadius: 12, borderCurve: "continuous", minWidth: 110 }} />
                            <Button
                              title={item.editLabel ?? "Edit"}
                              variant="outline"
                              onPress={() => router.push("/(tabs)/ai/classic" as never)}
                              style={{ flexGrow: 1, borderRadius: 12, borderCurve: "continuous", minWidth: 110 }}
                            />
                            <Button title="Reject" variant="ghost" onPress={() => removePending(item.id)} style={{ flexGrow: 1, borderRadius: 12, borderCurve: "continuous", minWidth: 110 }} />
                          </View>
                        </View>
                      ) : null}
                    </Card>
                  </Pressable>
                </Animated.View>
              );
            })}
          </Animated.View>
        ) : null}

        {showHistory ? (
          <Animated.View entering={FadeInDown.delay(120).duration(420)} style={{ gap: 10 }}>
            <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
              History · this week
            </Text>
            {HISTORY_ITEMS.map((item, index) => {
              const statusColor = item.status === "approved" ? "#1d9e75" : item.status === "dismissed" ? "#666673" : "#44444f";
              const statusBackground = item.status === "approved" ? "#1a2a1e" : "#1a1a1e";
              return (
                <Animated.View key={item.id} entering={FadeInDown.delay(140 + index * 24).duration(420)}>
                  <Card style={{ borderRadius: 16, borderCurve: "continuous", padding: 12, borderWidth: 1, borderColor: theme.border }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <View style={{ width: 28, height: 28, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: item.iconBackground }}>
                        <FontAwesome name={item.icon} size={12} color={item.iconColor} />
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                          {item.title}
                        </Text>
                        <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                          {item.subtitle}
                        </Text>
                      </View>
                      <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: statusBackground }}>
                        <Text selectable variant="muted" style={{ color: statusColor, fontFamily: "Geist", fontWeight: "700" }}>
                          {item.timeLabel}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </Animated.View>
              );
            })}
          </Animated.View>
        ) : null}
      </ScrollView>
    </View>
  );
}

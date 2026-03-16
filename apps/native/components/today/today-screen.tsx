import { useMemo, useState } from "react";
import {
  Alert as RNAlert,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Avatar, Badge, Card, Text } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { useColorScheme } from "@/lib/use-color-scheme";

type PriorityId = "p1" | "p2" | "p3";
type HabitId = "h1" | "h2" | "h3" | "h4" | "h5";
type CheckinMetric = "mood" | "energy" | "focus";
type AppTheme = (typeof NAV_THEME)[keyof typeof NAV_THEME];

const PRIORITIES = [
  {
    id: "p1" as const,
    title: "Morning devotional + Bible reading",
    domain: "Faith",
    time: "6:00 AM",
    route: "/(tabs)/domains/faith",
    domainBg: "rgba(123, 109, 246, 0.14)",
    domainText: "#b8abff",
  },
  {
    id: "p2" as const,
    title: "Review Q2 budget variance report",
    domain: "Finance",
    time: "Before noon",
    route: "/(tabs)/domains/finance",
    domainBg: "rgba(31, 169, 127, 0.14)",
    domainText: "#7cd9aa",
  },
  {
    id: "p3" as const,
    title: "Life OS - domain schema finalization",
    domain: "Career",
    time: "Deep work block",
    route: "/(tabs)/domains/career",
    domainBg: "rgba(47, 125, 209, 0.14)",
    domainText: "#91bfff",
  },
];

const HABITS = [
  { id: "h1" as const, label: "Prayer" },
  { id: "h2" as const, label: "Water (2L)" },
  { id: "h3" as const, label: "Gratitude log" },
  { id: "h4" as const, label: "No spend" },
  { id: "h5" as const, label: "Read" },
];

const CHECKIN_CONFIG: Record<CheckinMetric, { label: string; color: string; initial: number }> = {
  mood: { label: "Mood", color: "#9b8fff", initial: 7 },
  energy: { label: "Energy", color: "#9b8fff", initial: 6 },
  focus: { label: "Focus", color: "#9b8fff", initial: 8 },
};

export function TodayScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { user } = useAuth();

  const [completedPriorities, setCompletedPriorities] = useState<Record<PriorityId, boolean>>({
    p1: false,
    p2: false,
    p3: false,
  });
  const [completedHabits, setCompletedHabits] = useState<Record<HabitId, boolean>>({
    h1: false,
    h2: true,
    h3: false,
    h4: false,
    h5: true,
  });
  const [checkinValues, setCheckinValues] = useState<Record<CheckinMetric, number>>({
    mood: CHECKIN_CONFIG.mood.initial,
    energy: CHECKIN_CONFIG.energy.initial,
    focus: CHECKIN_CONFIG.focus.initial,
  });
  const [trackWidths, setTrackWidths] = useState<Record<CheckinMetric, number>>({
    mood: 0,
    energy: 0,
    focus: 0,
  });
  const [approvalVisible, setApprovalVisible] = useState(true);
  const [suggestionVisible, setSuggestionVisible] = useState(true);

  const displayName = user?.name?.trim()?.split(" ")[0] || "there";
  const completedPriorityCount = Object.values(completedPriorities).filter(Boolean).length;
  const completedHabitCount = Object.values(completedHabits).filter(Boolean).length;
  const prioritiesLeft = PRIORITIES.length - completedPriorityCount;
  const habitsLeft = HABITS.length - completedHabitCount;
  const freshnessLine = `Insights refreshed at 6:00 AM · UTC+0`;
  const compactStats = width < 390;

  const contextLine = useMemo(() => {
    const approvalLine = approvalVisible ? "1 approval pending" : "approved";
    return `${prioritiesLeft} priorities left · ${habitsLeft} habits left · ${approvalLine}`;
  }, [approvalVisible, habitsLeft, prioritiesLeft]);

  function navigateTo(href: string) {
    router.push(href as never);
  }

  function togglePriority(id: PriorityId) {
    setCompletedPriorities((current) => ({ ...current, [id]: !current[id] }));
  }

  function toggleHabit(id: HabitId) {
    setCompletedHabits((current) => ({ ...current, [id]: !current[id] }));
  }

  function onTrackLayout(metric: CheckinMetric, event: LayoutChangeEvent) {
    const { width: layoutWidth } = event.nativeEvent.layout;
    setTrackWidths((current) => ({ ...current, [metric]: layoutWidth }));
  }

  function updateCheckin(metric: CheckinMetric, locationX: number) {
    const widthForMetric = trackWidths[metric];

    if (!widthForMetric) {
      return;
    }

    const ratio = Math.max(0, Math.min(1, locationX / widthForMetric));
    const nextValue = Math.max(0, Math.min(10, Math.round(ratio * 10)));
    setCheckinValues((current) => ({ ...current, [metric]: nextValue }));
  }

  function logCheckin() {
    navigateTo("/(tabs)/domains/wellness");
  }

  function reviewApproval() {
    RNAlert.alert(
      "Approval details",
      "Finance approval detail is next after the Today screen UI pass. The approval card state is already in place.",
    );
  }

  function openQuickAdd() {
    RNAlert.alert(
      "Quick add",
      "Quick add can branch into task, note, prayer, or transaction creation once the sheet flow is wired.",
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -44,
          right: -56,
          width: 220,
          height: 220,
          borderRadius: 999,
          backgroundColor: isDarkColorScheme ? "rgba(155, 143, 255, 0.14)" : "rgba(155, 143, 255, 0.12)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 260,
          left: -100,
          width: 240,
          height: 240,
          borderRadius: 999,
          backgroundColor: isDarkColorScheme ? "rgba(47, 125, 209, 0.08)" : "rgba(47, 125, 209, 0.08)",
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.xl,
          paddingBottom: 128,
          gap: 20,
        }}
      >
        <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text
                selectable
                style={{
                  fontFamily: "Geist",
                  fontSize: 28,
                  fontWeight: "700",
                  lineHeight: 32,
                  color: theme.foreground,
                }}
              >
                {`Good morning,\n`}
                <Text selectable style={{ color: "#b8abff", fontFamily: "Geist", fontSize: 28, fontWeight: "700" }}>
                  {displayName}.
                </Text>
              </Text>
            </View>
            <Avatar
              source={user?.image ? { uri: user.image } : undefined}
              fallback={user?.name ?? user?.email ?? displayName}
              size="md"
              style={{
                borderWidth: 1.5,
                borderColor: "rgba(123, 109, 246, 0.28)",
                backgroundColor: "rgba(123, 109, 246, 0.12)",
              }}
            />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#9b8fff" }} />
            <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
              {contextLine}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(420)} style={{ gap: 10 }}>
          <SectionLabel label="Today&apos;s priorities" />
          {PRIORITIES.map((priority) => {
            const done = completedPriorities[priority.id];

            return (
              <Pressable
                key={priority.id}
                onPress={() => togglePriority(priority.id)}
                onLongPress={() => navigateTo(priority.route)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.94 : done ? 0.48 : 1,
                })}
              >
                <Card
                  style={{
                    borderRadius: 20,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: theme.border,
                    padding: 14,
                    boxShadow: theme.shadowSm,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 999,
                        borderWidth: 1.5,
                        borderColor: done ? "#9b8fff" : theme.border,
                        backgroundColor: done ? "#9b8fff" : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 2,
                      }}
                    >
                      {done ? <FontAwesome name="check" size={11} color="#ffffff" /> : null}
                    </View>
                    <View style={{ flex: 1, gap: 6 }}>
                      <Text
                        selectable
                        style={{
                          fontFamily: "Geist",
                          fontWeight: "700",
                          color: theme.foreground,
                          textDecorationLine: done ? "line-through" : "none",
                        }}
                      >
                        {priority.title}
                      </Text>
                      <View style={{ flexDirection: "row", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <View
                          style={{
                            borderRadius: 999,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            backgroundColor: priority.domainBg,
                          }}
                        >
                          <Text selectable variant="muted" style={{ color: priority.domainText, fontFamily: "Geist", fontWeight: "700" }}>
                            {priority.domain}
                          </Text>
                        </View>
                        <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                          {priority.time}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(420)} style={{ gap: 10 }}>
          <SectionLabel label="Habits due today" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {HABITS.map((habit) => {
              const done = completedHabits[habit.id];

              return (
                <Pressable
                  key={habit.id}
                  onPress={() => toggleHabit(habit.id)}
                  style={({ pressed }) => ({
                    borderRadius: 999,
                    borderCurve: "continuous",
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: done
                      ? isDarkColorScheme
                        ? "rgba(15, 31, 22, 0.96)"
                        : "rgba(235, 251, 242, 0.98)"
                      : theme.card,
                    borderWidth: 1,
                    borderColor: done ? "rgba(31, 169, 127, 0.22)" : theme.border,
                    opacity: pressed ? 0.88 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      borderWidth: 1.5,
                      borderColor: done ? "#1fa97f" : theme.border,
                      backgroundColor: done ? "#1fa97f" : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {done ? <FontAwesome name="check" size={9} color="#ffffff" /> : null}
                  </View>
                  <Text
                    selectable
                    variant="small"
                    style={{
                      color: done ? "#1fa97f" : theme.foreground,
                      fontFamily: "Geist",
                      fontWeight: "700",
                    }}
                  >
                    {habit.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(420)} style={{ gap: 10 }}>
          <SectionLabel label="Quick check-in" />
          <Card style={{ borderRadius: 20, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 16, gap: 14, boxShadow: theme.shadowSm }}>
            <Text selectable variant="small" style={{ color: theme.foreground }}>
              How are you starting the day?
            </Text>
            {(["mood", "energy", "focus"] as CheckinMetric[]).map((metric) => (
              <View key={metric} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Text selectable variant="small" style={{ color: theme.mutedForeground, width: 48 }}>
                  {CHECKIN_CONFIG[metric].label}
                </Text>
                <Pressable
                  onLayout={(event) => onTrackLayout(metric, event)}
                  onPress={(event) => updateCheckin(metric, event.nativeEvent.locationX)}
                  style={{ flex: 1, height: 20, justifyContent: "center" }}
                >
                  <View style={{ height: 4, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <View
                      style={{
                        width: `${checkinValues[metric] * 10}%`,
                        height: "100%",
                        borderRadius: 999,
                        backgroundColor: CHECKIN_CONFIG[metric].color,
                      }}
                    />
                  </View>
                </Pressable>
                <Text
                  selectable
                  variant="small"
                  style={{
                    width: 24,
                    textAlign: "right",
                    color: "#b8abff",
                    fontFamily: "Geist",
                    fontWeight: "700",
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {checkinValues[metric]}
                </Text>
              </View>
            ))}
            <Pressable
              onPress={logCheckin}
              style={({ pressed }) => ({
                borderRadius: 14,
                borderCurve: "continuous",
                backgroundColor: "#9b8fff",
                minHeight: 44,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.86 : 1,
              })}
            >
              <Text selectable style={{ color: "#0e0e10", fontFamily: "Geist", fontWeight: "700" }}>
                Log check-in
              </Text>
            </Pressable>
          </Card>
        </Animated.View>

        {approvalVisible ? (
          <Animated.View entering={FadeInDown.delay(240).duration(420)} style={{ gap: 10 }}>
            <SectionLabel label="Pending approval" />
            <Card
              style={{
                borderRadius: 20,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: isDarkColorScheme ? "rgba(186, 117, 23, 0.42)" : "rgba(186, 117, 23, 0.24)",
                backgroundColor: isDarkColorScheme ? "rgba(31, 26, 14, 0.96)" : "rgba(255, 245, 224, 0.98)",
                padding: 16,
                gap: 12,
                boxShadow: theme.shadowSm,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isDarkColorScheme ? "rgba(186, 117, 23, 0.12)" : "rgba(186, 117, 23, 0.08)",
                  }}
                >
                  <FontAwesome name="exclamation" size={14} color="#d69030" />
                </View>
                <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: isDarkColorScheme ? "#f0d396" : "#8a621b", flex: 1 }}>
                  AI wants to make a change
                </Text>
                <Badge variant="outline" color="warning">
                  Finance
                </Badge>
              </View>

              <Text selectable variant="small" style={{ color: isDarkColorScheme ? "#d1b47a" : "#8c6b2a" }}>
                Based on your last 30 days, you consistently have GHc 380-520 unallocated at month-end.
              </Text>

              <View
                style={{
                  borderRadius: 14,
                  borderCurve: "continuous",
                  padding: 12,
                  backgroundColor: isDarkColorScheme ? "rgba(186, 117, 23, 0.08)" : "rgba(255, 239, 204, 0.98)",
                }}
              >
                <Text selectable variant="muted" style={{ color: theme.mutedForeground, marginBottom: 4 }}>
                  Proposed change
                </Text>
                <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: isDarkColorScheme ? "#f0d396" : "#8a621b" }}>
                  Create savings goal · GHc 400/month to Emergency fund
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => setApprovalVisible(false)}
                  style={({ pressed }) => ({
                    flex: 1,
                    minHeight: 42,
                    borderRadius: 12,
                    borderCurve: "continuous",
                    backgroundColor: "#d69030",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.88 : 1,
                  })}
                >
                  <Text selectable style={{ color: "#ffffff", fontFamily: "Geist", fontWeight: "700" }}>
                    Approve
                  </Text>
                </Pressable>
                <Pressable
                  onPress={reviewApproval}
                  style={({ pressed }) => ({
                    flex: 1,
                    minHeight: 42,
                    borderRadius: 12,
                    borderCurve: "continuous",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderWidth: 1,
                    borderColor: theme.border,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.88 : 1,
                  })}
                >
                  <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                    Review in full
                  </Text>
                </Pressable>
              </View>
            </Card>
          </Animated.View>
        ) : null}

        {suggestionVisible ? (
          <Animated.View entering={FadeInDown.delay(300).duration(420)} style={{ gap: 10 }}>
            <SectionLabel label="AI suggestion" />
            <Card
              style={{
                borderRadius: 20,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: isDarkColorScheme ? "rgba(110, 98, 190, 0.34)" : "rgba(110, 98, 190, 0.2)",
                backgroundColor: isDarkColorScheme ? "rgba(26, 26, 32, 0.96)" : "rgba(244, 242, 255, 0.98)",
                padding: 16,
                gap: 12,
                boxShadow: theme.shadowSm,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: "#9b8fff" }} />
                <Text selectable variant="muted" style={{ color: theme.primary, textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
                  Insight
                </Text>
                <View style={{ marginLeft: "auto" }}>
                  <Badge variant="subtle" color="primary">
                    Faith
                  </Badge>
                </View>
              </View>

              <Text selectable style={{ color: theme.foreground }}>
                You have logged prayer 5 of the last 7 days. Consider adding a short fasting intention today to anchor the week spiritually.
              </Text>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => navigateTo("/(tabs)/domains/faith")}
                  style={({ pressed }) => ({
                    flex: 1,
                    minHeight: 42,
                    borderRadius: 12,
                    borderCurve: "continuous",
                    backgroundColor: "#9b8fff",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.88 : 1,
                  })}
                >
                  <Text selectable style={{ color: "#0e0e10", fontFamily: "Geist", fontWeight: "700" }}>
                    Add intention
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSuggestionVisible(false)}
                  style={({ pressed }) => ({
                    flex: 1,
                    minHeight: 42,
                    borderRadius: 12,
                    borderCurve: "continuous",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderWidth: 1,
                    borderColor: theme.border,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.88 : 1,
                  })}
                >
                  <Text selectable style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                    Not now
                  </Text>
                </Pressable>
              </View>
            </Card>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(360).duration(420)} style={{ gap: 10 }}>
          <SectionLabel label="Today&apos;s snapshot" />
          <View style={{ flexDirection: compactStats ? "column" : "row", gap: 8 }}>
            <SnapshotCard value={`${completedPriorityCount}/3`} label="Priorities" sublabel="done today" theme={theme} />
            <SnapshotCard
              value={`${completedHabitCount}/5`}
              label="Habits"
              sublabel="on track"
              sublabelColor="#1fa97f"
              theme={theme}
            />
            <SnapshotCard value="Fri" label="Review due" sublabel="3 days away" theme={theme} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(420).duration(420)}>
          <Text selectable variant="muted" style={{ textAlign: "center", color: theme.mutedForeground }}>
            {freshnessLine}
          </Text>
        </Animated.View>
      </ScrollView>

      <Pressable
        onPress={openQuickAdd}
        style={({ pressed }) => ({
          position: "absolute",
          right: 24,
          bottom: 88,
          width: 52,
          height: 52,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#9b8fff",
          boxShadow: "0 0 0 8px rgba(155, 143, 255, 0.08)",
          opacity: pressed ? 0.86 : 1,
        })}
      >
        <FontAwesome name="plus" size={20} color="#0e0e10" />
      </Pressable>
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text
      selectable
      variant="muted"
      style={{
        textTransform: "uppercase",
        letterSpacing: 1.2,
        fontFamily: "Geist",
        fontWeight: "700",
      }}
    >
      {label}
    </Text>
  );
}

function SnapshotCard({
  value,
  label,
  sublabel,
  sublabelColor,
  theme,
}: {
  value: string;
  label: string;
  sublabel: string;
  sublabelColor?: string;
  theme: AppTheme;
}) {
  return (
    <Card
      style={{
        flex: 1,
        borderRadius: 18,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: theme.border,
        padding: 14,
        gap: 4,
        boxShadow: theme.shadowSm,
      }}
    >
      <Text
        selectable
        style={{
          fontFamily: "Geist",
          fontSize: 24,
          fontWeight: "700",
          color: theme.foreground,
          fontVariant: ["tabular-nums"],
        }}
      >
        {value}
      </Text>
      <Text selectable variant="small" style={{ color: theme.foreground }}>
        {label}
      </Text>
      <Text selectable variant="muted" style={{ color: sublabelColor ?? theme.mutedForeground }}>
        {sublabel}
      </Text>
    </Card>
  );
}

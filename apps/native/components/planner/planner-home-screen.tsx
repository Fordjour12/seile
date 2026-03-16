import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { Container } from "@/components/container";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type PlanItem = {
  id: string;
  title: string;
  domain: string;
  time: string;
  domainColor: string;
  badgeBackground: string;
  badgeText: string;
  completed?: boolean;
};

type PlannerDay = {
  id: string;
  short: string;
  date: string;
  full: string;
  load: number;
  loadTone: "low" | "med" | "high";
  items: PlanItem[];
  note?: string;
  today?: boolean;
};

const PLAN_DAYS: PlannerDay[] = [
  {
    id: "mon",
    short: "M",
    date: "10",
    full: "Monday · Mar 10",
    load: 90,
    loadTone: "high",
    items: [
      { id: "mon-faith", title: "Morning devotional + prayer", domain: "Faith", time: "6:00 AM", domainColor: "#534AB7", badgeBackground: "#2a2040", badgeText: "#b4adf5", completed: true },
      { id: "mon-finance", title: "Q2 budget variance review", domain: "Finance", time: "10:00 AM", domainColor: "#1d9e75", badgeBackground: "#1a2a1e", badgeText: "#6fcf97" },
      { id: "mon-career", title: "Life OS schema finalization", domain: "Career", time: "Deep work", domainColor: "#378add", badgeBackground: "#1a1e2a", badgeText: "#85b7eb", completed: true },
      { id: "mon-tasks", title: "Reply to 3 pending messages", domain: "Tasks", time: "Afternoon", domainColor: "#888888", badgeBackground: "#252525", badgeText: "#b1b4bc" },
    ],
    note: "High cognitive load day. You flagged energy at 6/10 this morning - consider deferring the message reply to Tuesday.",
  },
  {
    id: "tue",
    short: "T",
    date: "11",
    full: "Tuesday · Mar 11",
    load: 55,
    loadTone: "med",
    items: [
      { id: "tue-faith", title: "Bible reading - Romans 8", domain: "Faith", time: "Morning", domainColor: "#534AB7", badgeBackground: "#2a2040", badgeText: "#b4adf5", completed: true },
      { id: "tue-career", title: "Convex cron job implementation", domain: "Career", time: "Deep work", domainColor: "#378add", badgeBackground: "#1a1e2a", badgeText: "#85b7eb", completed: true },
      { id: "tue-wellness", title: "Evening decompression - walk", domain: "Wellness", time: "6:30 PM", domainColor: "#d4537e", badgeBackground: "#2a1020", badgeText: "#ed93b1" },
    ],
  },
  {
    id: "wed",
    short: "W",
    date: "12",
    full: "Wednesday · Mar 12",
    load: 60,
    loadTone: "med",
    items: [
      { id: "wed-faith", title: "Fasting day - intention set", domain: "Faith", time: "All day", domainColor: "#534AB7", badgeBackground: "#2a2040", badgeText: "#b4adf5", completed: true },
      { id: "wed-career", title: "AI layer userContext design", domain: "Career", time: "Deep work", domainColor: "#378add", badgeBackground: "#1a1e2a", badgeText: "#85b7eb", completed: true },
      { id: "wed-health", title: "30 min strength training", domain: "Health", time: "5:00 PM", domainColor: "#d85a30", badgeBackground: "#2a1a1a", badgeText: "#f0997b", completed: true },
    ],
  },
  {
    id: "thu",
    short: "T",
    date: "13",
    full: "Thursday · Mar 13",
    load: 40,
    loadTone: "low",
    items: [
      { id: "thu-faith", title: "Gratitude journaling", domain: "Faith", time: "Morning", domainColor: "#534AB7", badgeBackground: "#2a2040", badgeText: "#b4adf5", completed: true },
      { id: "thu-career", title: "UI/UX blueprint review", domain: "Career", time: "Afternoon", domainColor: "#378add", badgeBackground: "#1a1e2a", badgeText: "#85b7eb", completed: true },
    ],
  },
  {
    id: "fri",
    short: "F",
    date: "14",
    full: "Today · Mar 14",
    load: 65,
    loadTone: "med",
    today: true,
    items: [
      { id: "fri-faith", title: "Morning devotional + Bible reading", domain: "Faith", time: "6:00 AM", domainColor: "#534AB7", badgeBackground: "#2a2040", badgeText: "#b4adf5" },
      { id: "fri-career", title: "Life OS - Today screen design", domain: "Career", time: "Deep work", domainColor: "#378add", badgeBackground: "#1a1e2a", badgeText: "#85b7eb" },
      { id: "fri-finance", title: "Review budget variance (deferred)", domain: "Finance", time: "Deferred from Mon", domainColor: "#1d9e75", badgeBackground: "#1a2a1e", badgeText: "#6fcf97" },
    ],
    note: "Friday - lighter load intentional. Wrap the week well. Weekly review unlocks tonight.",
  },
  {
    id: "sat",
    short: "S",
    date: "15",
    full: "Saturday · Mar 15",
    load: 25,
    loadTone: "low",
    items: [
      { id: "sat-wellness", title: "Rest + reflection day", domain: "Wellness", time: "Open", domainColor: "#d4537e", badgeBackground: "#2a1020", badgeText: "#ed93b1" },
    ],
  },
  {
    id: "sun",
    short: "S",
    date: "16",
    full: "Sunday · Mar 16",
    load: 20,
    loadTone: "low",
    items: [
      { id: "sun-faith", title: "Church + weekly review", domain: "Faith", time: "Morning", domainColor: "#534AB7", badgeBackground: "#2a2040", badgeText: "#b4adf5" },
    ],
  },
];

export function PlannerHomeScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const todayIndex = PLAN_DAYS.findIndex((day) => day.today);
  const [selectedDayId, setSelectedDayId] = useState(PLAN_DAYS[todayIndex]?.id ?? PLAN_DAYS[0].id);
  const [openDayIds, setOpenDayIds] = useState<Record<string, boolean>>({
    [PLAN_DAYS[todayIndex]?.id ?? PLAN_DAYS[0].id]: true,
  });
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      PLAN_DAYS.flatMap((day) => day.items.map((item) => [item.id, Boolean(item.completed)])),
    ),
  );

  const summaryStats = useMemo(() => {
    const allItems = PLAN_DAYS.flatMap((day) => day.items);
    const completed = allItems.filter((item) => completedMap[item.id]).length;
    const percent = Math.round((completed / allItems.length) * 100);
    return {
      total: allItems.length,
      completed,
      percent,
      deferred: 2,
      activeDays: 5,
    };
  }, [completedMap]);

  function toggleDay(dayId: string) {
    setOpenDayIds((current) => ({ ...current, [dayId]: !current[dayId] }));
  }

  function selectDay(dayId: string) {
    setSelectedDayId(dayId);
    setOpenDayIds((current) => ({ ...current, [dayId]: true }));
  }

  function toggleItem(itemId: string) {
    setCompletedMap((current) => ({ ...current, [itemId]: !current[itemId] }));
  }

  return (
    <Container>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.lg,
          paddingBottom: 36,
          gap: 16,
        }}
      >
        <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 20, fontWeight: "700" }}>
                Week of Mar 10 - 16, 2026
              </Text>
              <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                Plan the week, manage daily load, and keep cross-domain priorities aligned.
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/(tabs)/planner/weekly-review" as never)}
              style={({ pressed }) => ({
                borderRadius: 999,
                borderCurve: "continuous",
                paddingHorizontal: 14,
                paddingVertical: 8,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                opacity: pressed ? 0.84 : 1,
              })}
            >
              <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                Review week
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(40).duration(420)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {PLAN_DAYS.map((day) => {
              const selected = day.id === selectedDayId;
              const activeStyle = day.today
                ? { backgroundColor: "rgba(123, 109, 246, 0.16)", borderColor: "rgba(123, 109, 246, 0.28)" }
                : selected
                  ? { backgroundColor: "rgba(47, 125, 209, 0.16)", borderColor: "rgba(47, 125, 209, 0.24)" }
                  : { backgroundColor: theme.card, borderColor: "transparent" };
              return (
                <Pressable
                  key={day.id}
                  onPress={() => selectDay(day.id)}
                  style={({ pressed }) => ({
                    width: 54,
                    borderRadius: 14,
                    borderCurve: "continuous",
                    paddingVertical: 10,
                    alignItems: "center",
                    borderWidth: 1,
                    opacity: pressed ? 0.84 : 1,
                    ...activeStyle,
                  })}
                >
                  <Text selectable variant="muted" style={{ color: day.today ? "#9b8fff" : selected ? "#85b7eb" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                    {day.short}
                  </Text>
                  <Text selectable style={{ color: day.today ? "#d7d1ff" : selected ? "#b9d8ff" : theme.foreground, fontFamily: "Geist", fontWeight: "700", fontSize: 17 }}>
                    {day.date}
                  </Text>
                  <View style={{ width: 4, height: 4, borderRadius: 999, marginTop: 4, backgroundColor: day.items.length ? (day.today ? "#9b8fff" : "#444") : "transparent" }} />
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(420)}>
          <Card
            style={{
              borderRadius: 20,
              borderCurve: "continuous",
              padding: 16,
              gap: 12,
              borderWidth: 1,
              borderColor: isDarkColorScheme ? "rgba(61, 53, 112, 0.34)" : "rgba(61, 53, 112, 0.18)",
              backgroundColor: isDarkColorScheme ? "rgba(19, 19, 26, 0.96)" : "rgba(244, 242, 255, 0.98)",
              boxShadow: theme.shadowSm,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: "#9b8fff" }} />
              <Text selectable variant="muted" style={{ color: theme.primary, textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700", flex: 1 }}>
                Week summary
              </Text>
              <Text selectable variant="muted">
                Updated 6:00 AM
              </Text>
            </View>
            <Text selectable style={{ color: theme.foreground, lineHeight: 21 }}>
              Heavy career week with strong faith consistency. Finance needs attention - budget review still pending from Monday.
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <SummaryStat value={String(summaryStats.total)} label="Priorities" theme={theme} />
              <SummaryStat value={`${summaryStats.percent}%`} label="Done so far" color="#1d9e75" theme={theme} />
              <SummaryStat value={String(summaryStats.deferred)} label="Deferred" color="#ba7517" theme={theme} />
              <SummaryStat value={String(summaryStats.activeDays)} label="Days active" color="#9b8fff" theme={theme} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(420)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <ControlPill label="Lighten load" warn onPress={() => router.push("/(tabs)/ai/weekly-plan" as never)} theme={theme} />
            <ControlPill label="Regenerate" onPress={() => router.push("/(tabs)/ai/weekly-plan" as never)} theme={theme} />
            <ControlPill label="Add priority" onPress={() => router.push("/actions/quick-add" as never)} theme={theme} />
            <ControlPill label="New goal" onPress={() => router.push("/actions/goal" as never)} theme={theme} />
            <ControlPill label="Energy forecast" onPress={() => router.push("/(tabs)/domains/wellness" as never)} theme={theme} />
            <ControlPill label="Balance view" onPress={() => router.push("/(tabs)/balance" as never)} theme={theme} />
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(420)} style={{ gap: 10 }}>
          <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
            Daily breakdown
            <Text selectable style={{ textTransform: "none", letterSpacing: 0, fontWeight: "400", color: theme.mutedForeground }}>
              {" "}tap a day to expand
            </Text>
          </Text>
          <View style={{ gap: 8 }}>
            {PLAN_DAYS.map((day) => {
              const isOpen = Boolean(openDayIds[day.id]);
              return (
                <Card
                  key={day.id}
                  style={{
                    borderRadius: 18,
                    borderCurve: "continuous",
                    padding: 0,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: isOpen ? "rgba(123, 109, 246, 0.24)" : theme.border,
                    boxShadow: theme.shadowSm,
                  }}
                >
                  <Pressable onPress={() => toggleDay(day.id)} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
                    <View style={{ paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Text selectable style={{ color: day.today ? "#9b8fff" : theme.foreground, fontFamily: "Geist", fontWeight: "700", flex: 1 }}>
                        {day.full}
                      </Text>
                      <LoadBar value={day.load} tone={day.loadTone} />
                      <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                        {day.items.length} items
                      </Text>
                      <FontAwesome name="chevron-right" size={12} color={day.today ? "#9b8fff" : theme.mutedForeground} style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }} />
                    </View>
                  </Pressable>
                  {isOpen ? (
                    <View style={{ borderTopWidth: 1, borderTopColor: theme.border, paddingHorizontal: 16, paddingBottom: 12 }}>
                      {day.items.map((item) => (
                        <PlanRow
                          key={item.id}
                          item={item}
                          completed={Boolean(completedMap[item.id])}
                          onToggle={() => toggleItem(item.id)}
                          theme={theme}
                        />
                      ))}
                      {day.note ? (
                        <View style={{ flexDirection: "row", gap: 8, padding: 10, backgroundColor: isDarkColorScheme ? "rgba(21,21,21,0.96)" : "rgba(245,245,247,0.98)", borderRadius: 10, borderCurve: "continuous", marginTop: 8 }}>
                          <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                            {day.today ? "✦" : "⚡"}
                          </Text>
                          <Text selectable variant="small" style={{ color: theme.mutedForeground, flex: 1, lineHeight: 18, fontStyle: "italic" }}>
                            {day.note}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </Card>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220).duration(420)}>
          <Pressable onPress={() => router.push("/(tabs)/planner/weekly-review" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}>
            <Card
              style={{
                borderRadius: 20,
                borderCurve: "continuous",
                padding: 16,
                borderWidth: 1,
                borderColor: "rgba(26, 48, 32, 0.7)",
                backgroundColor: "rgba(15, 26, 18, 0.98)",
                boxShadow: theme.shadowSm,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: "rgba(26, 48, 32, 0.96)", borderWidth: 1, borderColor: "rgba(42, 80, 48, 0.8)", alignItems: "center", justifyContent: "center" }}>
                  <FontAwesome name="clock-o" size={15} color="#1d9e75" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text selectable style={{ color: "#c8e8d4", fontFamily: "Geist", fontWeight: "700" }}>
                    Weekly review ready Friday night
                  </Text>
                  <Text selectable variant="small" style={{ color: "rgba(168, 184, 172, 0.68)" }}>
                    Generates after your last check-in - takes about 8 min
                  </Text>
                </View>
                <FontAwesome name="chevron-right" size={14} color="#1d9e75" />
              </View>
            </Card>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </Container>
  );
}

function SummaryStat({
  value,
  label,
  color,
  theme,
}: {
  value: string;
  label: string;
  color?: string;
  theme: typeof NAV_THEME.light | typeof NAV_THEME.dark;
}) {
  return (
    <Card style={{ flex: 1, borderRadius: 12, borderCurve: "continuous", padding: 10, alignItems: "center", borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card }}>
      <Text selectable style={{ color: color ?? theme.foreground, fontFamily: "Geist", fontSize: 18, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
      <Text selectable variant="muted" style={{ textAlign: "center" }}>
        {label}
      </Text>
    </Card>
  );
}

function ControlPill({
  label,
  onPress,
  theme,
  warn = false,
}: {
  label: string;
  onPress: () => void;
  theme: typeof NAV_THEME.light | typeof NAV_THEME.dark;
  warn?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 999,
        borderCurve: "continuous",
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: warn ? "rgba(186, 117, 23, 0.32)" : theme.border,
        opacity: pressed ? 0.84 : 1,
      })}
    >
      <Text selectable variant="small" style={{ color: warn ? "#ba7517" : theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function LoadBar({ value, tone }: { value: number; tone: "low" | "med" | "high" }) {
  const color = tone === "high" ? "#e24b4a" : tone === "med" ? "#ba7517" : "#1d9e75";
  return (
    <View style={{ width: 40, height: 4, borderRadius: 999, backgroundColor: "rgba(37, 37, 48, 0.96)", overflow: "hidden" }}>
      <View style={{ width: `${value}%`, height: "100%", borderRadius: 999, backgroundColor: color }} />
    </View>
  );
}

function PlanRow({
  item,
  completed,
  onToggle,
  theme,
}: {
  item: PlanItem;
  completed: boolean;
  onToggle: () => void;
  theme: typeof NAV_THEME.light | typeof NAV_THEME.dark;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border }}>
      <View style={{ width: 3, alignSelf: "stretch", borderRadius: 999, backgroundColor: item.domainColor }} />
      <View style={{ flex: 1 }}>
        <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700", lineHeight: 18 }}>
          {item.title}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
          <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: item.badgeBackground }}>
            <Text selectable variant="muted" style={{ color: item.badgeText, fontFamily: "Geist", fontWeight: "700" }}>
              {item.domain}
            </Text>
          </View>
          <Text selectable variant="muted" style={{ color: item.time.includes("Deferred") ? "#ba7517" : theme.mutedForeground }}>
            {item.time}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => ({
          width: 20,
          height: 20,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1.5,
          borderColor: completed ? "#9b8fff" : theme.border,
          backgroundColor: completed ? "#9b8fff" : "transparent",
          marginTop: 2,
          opacity: pressed ? 0.84 : 1,
        })}
      >
        {completed ? <FontAwesome name="check" size={10} color="#ffffff" /> : null}
      </Pressable>
    </View>
  );
}

import { useMemo, useState, type ComponentProps } from "react";
import { Pressable, ScrollView, Switch, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { Container } from "@/components/container";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { plannerApi } from "@/lib/planner/api";
import { useColorScheme } from "@/lib/use-color-scheme";

type AppTheme = (typeof NAV_THEME)[keyof typeof NAV_THEME];
type IconName = ComponentProps<typeof FontAwesome>["name"];
type RhythmCell = {
  id: string;
  prompt: string;
  background?: string;
  pips?: string[];
  empty?: boolean;
  borderColor?: string;
};
type RhythmRow = {
  day: string;
  accent?: boolean;
  cells: RhythmCell[];
};

const DOMAIN_HEALTH = [
  { key: "career", label: "Career", value: 90, color: "#185FA5", tint: "#85b7eb", route: "/(tabs)/domains/career" },
  { key: "faith", label: "Faith", value: 85, color: "#534AB7", tint: "#b4adf5", route: "/(tabs)/domains/faith" },
  { key: "tasks", label: "Tasks", value: 72, color: "#5F5E5A", tint: "#b1b4bc", route: "/(tabs)/domains/tasks" },
  { key: "health", label: "Health", value: 70, color: "#993C1D", tint: "#f0997b", route: "/(tabs)/domains/health" },
  { key: "wellness", label: "Wellness", value: 60, color: "#993556", tint: "#ed93b1", route: "/(tabs)/domains/wellness" },
  { key: "finance", label: "Finance", value: 55, color: "#ba7517", tint: "#d69030", route: "/(tabs)/domains/finance" },
] as const;

const RHYTHM_LEGEND = [
  { label: "Faith", color: "#534AB7" },
  { label: "Career", color: "#185FA5" },
  { label: "Finance", color: "#0F6E56" },
  { label: "Health", color: "#993C1D" },
  { label: "Wellness", color: "#993556" },
] as const;

const RHYTHM_ROWS: RhythmRow[] = [
  {
    day: "M",
    cells: [
      { id: "mon-faith", prompt: "What happened in my Faith domain on Monday?", background: "#1e1a30", pips: ["#534AB7", "#534AB7"] },
      { id: "mon-career", prompt: "What happened in my Career domain on Monday?", background: "#1a2030", pips: ["#185FA5", "#185FA5", "#185FA5"] },
      { id: "mon-finance", empty: true, prompt: "What happened in Finance on Monday?" },
      { id: "mon-health", prompt: "What health activity happened on Monday?", background: "#2a1510", pips: ["#993C1D"] },
      { id: "mon-wellness", empty: true, prompt: "What happened in Wellness on Monday?" },
    ],
  },
  {
    day: "T",
    cells: [
      { id: "tue-faith", prompt: "Tell me about my Faith activities on Tuesday", background: "#1e1a30", pips: ["#534AB7"] },
      { id: "tue-career", prompt: "Tell me about my Career work on Tuesday", background: "#1a2030", pips: ["#185FA5", "#185FA5"] },
      { id: "tue-finance", empty: true, prompt: "What happened in Finance on Tuesday?" },
      { id: "tue-health", empty: true, prompt: "What happened in Health on Tuesday?" },
      { id: "tue-wellness", prompt: "What wellness activity happened on Tuesday?", background: "#2a1020", pips: ["#993556"] },
    ],
  },
  {
    day: "W",
    cells: [
      { id: "wed-faith", prompt: "Tell me about my Faith activities on Wednesday - fasting day", background: "#2a2050", pips: ["#534AB7", "#9b8fff"] },
      { id: "wed-career", prompt: "Tell me about my Career work on Wednesday", background: "#1a2030", pips: ["#185FA5", "#185FA5"] },
      { id: "wed-finance", empty: true, prompt: "What happened in Finance on Wednesday?" },
      { id: "wed-health", prompt: "Tell me about Health on Wednesday", background: "#2a1510", pips: ["#993C1D"] },
      { id: "wed-wellness", empty: true, prompt: "What happened in Wellness on Wednesday?" },
    ],
  },
  {
    day: "T",
    cells: [
      { id: "thu-faith", prompt: "Tell me about Faith on Thursday", background: "#1e1a30", pips: ["#534AB7"] },
      { id: "thu-career", prompt: "Tell me about Career on Thursday", background: "#1a2030", pips: ["#185FA5", "#185FA5"] },
      { id: "thu-finance", empty: true, prompt: "What happened in Finance on Thursday?" },
      { id: "thu-health", empty: true, prompt: "What happened in Health on Thursday?" },
      { id: "thu-wellness", prompt: "Tell me about Wellness on Thursday", background: "#2a1020", pips: ["#993556"] },
    ],
  },
  {
    day: "F",
    accent: true,
    cells: [
      { id: "fri-faith", prompt: "Tell me about Faith today Friday", background: "#1e1a30", pips: ["#534AB7"], borderColor: "#3d3570" },
      { id: "fri-career", prompt: "Tell me about Career work today", background: "#1a2030", pips: ["#185FA5"], borderColor: "#2a4060" },
      { id: "fri-finance", empty: true, prompt: "Why is Finance empty today and what should I do about it?", borderColor: "#2a1e08" },
      { id: "fri-health", empty: true, prompt: "What happened in Health today?" },
      { id: "fri-wellness", empty: true, prompt: "What happened in Wellness today?" },
    ],
  },
] as const;

const OBSERVATIONS = [
  {
    id: "faith-wellness",
    type: "Pattern - Faith x Wellness",
    badgeLabel: "Positive",
    badgeColor: "#1d9e75",
    badgeBackground: "#1a2a1e",
    dotA: { label: "F", color: "#9b8fff", background: "#2a2040" },
    dotB: { label: "W", color: "#85b7eb", background: "#1a1e2a" },
    text: "On days you prayed before 7 AM, your energy averaged 7.4 vs 5.9 on days you did not. Consistent across 18 of the last 21 mornings - the strongest cross-domain signal in your data.",
    primaryLabel: "Lock this in",
    secondaryLabel: "See data",
    primaryAction: "/(tabs)/domains/faith",
    secondaryAction: "/(tabs)/ai/classic",
  },
  {
    id: "career-health",
    type: "Tension - Career x Health",
    badgeLabel: "Watch",
    badgeColor: "#ba7517",
    badgeBackground: "#2a1e08",
    dotA: { label: "C", color: "#85b7eb", background: "#1a1e2a" },
    dotB: { label: "H", color: "#f0997b", background: "#2a1510" },
    text: "Career is your best domain at 90% - but that is 5 consecutive deep work days with only 2 training sessions. The load is sustainable for now, but another week at this pace usually drags energy down.",
    primaryLabel: "Train today",
    secondaryLabel: "History",
    primaryAction: "/(tabs)/domains/health",
    secondaryAction: "/(tabs)/ai/classic",
  },
  {
    id: "finance-tasks",
    type: "Backlog - Finance x Tasks",
    badgeLabel: "Act",
    badgeColor: "#e24b4a",
    badgeBackground: "#2a1010",
    dotA: { label: "$", color: "#6fcf97", background: "#1a2a1e" },
    dotB: { label: "T", color: "#aaaaaa", background: "#1e1e1e" },
    text: "The budget review is 4 days overdue and sitting in your task backlog. Finance is dragging overall life health from 75% to 71%. One hour this afternoon closes both gaps simultaneously.",
    primaryLabel: "Do it now",
    secondaryLabel: "Move to Sat",
    primaryAction: "/(tabs)/domains/finance",
    secondaryAction: "/(tabs)/ai/resume-plan",
  },
  {
    id: "week-balance",
    type: "Balance - This Week Overall",
    badgeLabel: "Note",
    badgeColor: "#9b8fff",
    badgeBackground: "#1e1a30",
    dotA: { label: "W", color: "#ed93b1", background: "#2a1020" },
    dotB: { label: "R", color: "#aaaaaa", background: "#1e1e1e" },
    text: "Faith and Career are thriving. Wellness is quiet at 60% - three decompression walks but no structured rest time logged. Friday and the weekend are the clean window to rebalance.",
    primaryLabel: "Plan rest weekend",
    secondaryLabel: "What balance looks like",
    primaryAction: "/(tabs)/domains/wellness",
    secondaryAction: "/(tabs)/ai/weekly-plan",
  },
] as const;

export function PlannerOverviewScreen() {
  const router = useRouter();
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [focusMode, setFocusMode] = useState(false);

  const home = useQuery(plannerApi["productivity/planner/queries"].getPlannerChatHome, {});
  const overallHealth = useMemo(
    () => Math.round(DOMAIN_HEALTH.reduce((sum, item) => sum + item.value, 0) / DOMAIN_HEALTH.length),
    [],
  );

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
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700", color: theme.mutedForeground }}>
                Cross-domain view
              </Text>
              <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700", fontSize: 20 }}>
                Week of Mar 10
              </Text>
              <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                Faith and Career are carrying the week. Finance is the open drag.
              </Text>
            </View>
            <Badge color={home?.agentState?.agentEnabled ? "primary" : "warning"}>
              {home?.agentState?.agentEnabled ? "AI synthesis" : "Agent paused"}
            </Badge>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(420)} style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
              Domain health
            </Text>
            <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
              Overall {overallHealth}%
            </Text>
          </View>
          <Card
            style={{
              borderRadius: 20,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: isDarkColorScheme ? "rgba(19, 19, 26, 0.96)" : "rgba(244, 242, 255, 0.98)",
              padding: 16,
              gap: 10,
              boxShadow: theme.shadowSm,
            }}
          >
            {DOMAIN_HEALTH.map((item) => (
              <DomainRow
                key={item.key}
                label={item.label}
                value={item.value}
                color={item.color}
                tint={item.tint}
                onPress={() => router.push(item.route as never)}
              />
            ))}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(110).duration(420)} style={{ gap: 10 }}>
          <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
            Weekly rhythm map
          </Text>
          <Card
            style={{
              borderRadius: 20,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: theme.border,
              padding: 16,
              gap: 12,
              boxShadow: theme.shadowSm,
            }}
          >
            <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
              Activity by domain across the week
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {RHYTHM_LEGEND.map((item) => (
                <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: item.color }} />
                  <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
            <View style={{ gap: 6 }}>
              {RHYTHM_ROWS.map((row, rowIndex) => (
                <View key={`${row.day}-${rowIndex}`} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text selectable variant="muted" style={{ width: 16, textAlign: "right", color: row.accent ? "#9b8fff" : theme.mutedForeground }}>
                    {row.day}
                  </Text>
                  {row.cells.map((cell) => (
                    <Pressable
                      key={cell.id}
                      onPress={() => router.push("/(tabs)/ai/classic" as never)}
                      style={({ pressed }) => ({
                        flex: 1,
                        minHeight: 22,
                        borderRadius: 6,
                        borderCurve: "continuous",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        gap: 2,
                        backgroundColor: cell.empty ? "rgba(20, 20, 24, 0.96)" : cell.background,
                        borderWidth: cell.borderColor ? 1 : 0,
                        borderColor: cell.borderColor ?? "transparent",
                        opacity: pressed ? 0.82 : 1,
                      })}
                    >
                      {(cell.pips ?? []).map((pip, pipIndex) => (
                        <View
                          key={`${cell.id}-pip-${pipIndex}`}
                          style={{ width: 4, height: 4, borderRadius: 999, backgroundColor: pip }}
                        />
                      ))}
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: 6, paddingLeft: 22 }}>
              {["Faith", "Career", "Finance", "Health", "Wellness"].map((label) => (
                <Text
                  key={label}
                  selectable
                  variant="muted"
                  style={{ flex: 1, textAlign: "center", color: theme.mutedForeground }}
                >
                  {label}
                </Text>
              ))}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(420)} style={{ gap: 10 }}>
          <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
            AI - Cross-domain observations
          </Text>
          <View style={{ gap: 10 }}>
            {OBSERVATIONS.map((item) => (
              <ObservationCard key={item.id} item={item} theme={theme} />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(210).duration(420)}>
          <Card
            style={{
              borderRadius: 20,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: isDarkColorScheme ? "rgba(110, 98, 190, 0.28)" : "rgba(110, 98, 190, 0.18)",
              backgroundColor: isDarkColorScheme ? "rgba(19, 19, 31, 0.96)" : "rgba(244, 242, 255, 0.98)",
              padding: 16,
              gap: 12,
              boxShadow: theme.shadowSm,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#9b8fff" }} />
              <Text selectable variant="muted" style={{ color: theme.primary, textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700", flex: 1 }}>
                Week synthesis
              </Text>
              <Text selectable variant="muted">
                Updated 6:00 AM
              </Text>
            </View>
            <Text selectable variant="small" style={{ color: isDarkColorScheme ? "#a7a1d6" : "#5b548d", lineHeight: 22 }}>
              This week has a clear shape: <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>Faith and Career are carrying the week</Text>, Wellness is steady, Health is functional but thin, and Finance is the open wound. One hour on Finance today and one rest block this weekend closes the week cleanly.
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <MiniChip label="Rebalance this week" onPress={() => router.push("/(tabs)/ai/weekly-plan" as never)} theme={theme} />
              <MiniChip label="What balance looks like" onPress={() => router.push("/(tabs)/ai/classic" as never)} theme={theme} />
              <MiniChip label="30-day patterns" onPress={() => router.push("/(tabs)/ai/classic" as never)} theme={theme} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(260).duration(420)} style={{ gap: 10 }}>
          <Card
            style={{
              borderRadius: 18,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: theme.border,
              padding: 14,
              boxShadow: theme.shadowSm,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(123, 109, 246, 0.14)",
                  borderWidth: 1,
                  borderColor: "rgba(123, 109, 246, 0.26)",
                }}
              >
                <FontAwesome name="bullseye" size={15} color="#9b8fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text selectable style={{ color: "#c8c0ff", fontFamily: "Geist", fontWeight: "700" }}>
                  Focus mode
                </Text>
                <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                  Surface only the highest-leverage cross-domain action
                </Text>
              </View>
              <Switch value={focusMode} onValueChange={setFocusMode} trackColor={{ false: "#252530", true: "#9b8fff" }} thumbColor="#ffffff" />
            </View>
          </Card>

          {focusMode ? (
            <Card
              style={{
                borderRadius: 20,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: "rgba(110, 98, 190, 0.28)",
                backgroundColor: isDarkColorScheme ? "rgba(26, 26, 36, 0.96)" : "rgba(244, 242, 255, 0.98)",
                padding: 16,
                gap: 12,
                boxShadow: theme.shadowSm,
              }}
            >
              <Text selectable variant="muted" style={{ color: theme.primary, textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
                Highest-leverage action right now
              </Text>
              <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                Complete the Q2 budget review
              </Text>
              <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
                Closes the Finance backlog, clears a Tasks item, lifts overall life health from 71% to 75%, and removes the one open stressor before the weekend. Estimated 45 minutes.
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button title="Start now" onPress={() => router.push("/(tabs)/domains/finance" as never)} style={{ flex: 2, borderRadius: 12, borderCurve: "continuous" }} />
                <Button title="Schedule" variant="outline" onPress={() => router.push("/(tabs)/ai/resume-plan" as never)} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
              </View>
            </Card>
          ) : null}
        </Animated.View>
      </ScrollView>
    </Container>
  );
}

function DomainRow({
  label,
  value,
  color,
  tint,
  onPress,
}: {
  label: string;
  value: number;
  color: string;
  tint: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.84 : 1 })}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 }}>
        <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: color }} />
        <Text selectable variant="small" style={{ width: 74, color: tint, fontFamily: "Geist", fontWeight: "700" }}>
          {label}
        </Text>
        <View style={{ flex: 1, height: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <View style={{ width: `${value}%`, height: "100%", borderRadius: 999, backgroundColor: color }} />
        </View>
        <Text selectable variant="muted" style={{ width: 34, textAlign: "right", color: tint, fontFamily: "Geist", fontWeight: "700" }}>
          {value}%
        </Text>
      </View>
    </Pressable>
  );
}

function ObservationCard({
  item,
  theme,
}: {
  item: (typeof OBSERVATIONS)[number];
  theme: AppTheme;
}) {
  const router = useRouter();

  return (
    <Card
      style={{
        borderRadius: 18,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: theme.border,
        padding: 14,
        gap: 10,
        boxShadow: theme.shadowSm,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <DomainDot {...item.dotA} />
          <View style={{ marginLeft: -6 }}>
            <DomainDot {...item.dotB} />
          </View>
        </View>
        <Text selectable variant="small" style={{ color: theme.mutedForeground, flex: 1 }}>
          {item.type}
        </Text>
        <View style={{ borderRadius: 999, backgroundColor: item.badgeBackground, paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text selectable variant="muted" style={{ color: item.badgeColor, fontFamily: "Geist", fontWeight: "700" }}>
            {item.badgeLabel}
          </Text>
        </View>
      </View>
      <Text selectable variant="small" style={{ color: theme.foreground, lineHeight: 21 }}>
        {item.text}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <MiniChip label={item.primaryLabel} onPress={() => router.push(item.primaryAction as never)} theme={theme} primary />
        <MiniChip label={item.secondaryLabel} onPress={() => router.push(item.secondaryAction as never)} theme={theme} />
      </View>
    </Card>
  );
}

function DomainDot({
  label,
  color,
  background,
}: {
  label: string;
  color: string;
  background: string;
}) {
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: background,
        borderWidth: 1.5,
        borderColor: "#0e0e10",
      }}
    >
      <Text selectable variant="muted" style={{ color, fontFamily: "Geist", fontWeight: "700" }}>
        {label}
      </Text>
    </View>
  );
}

function MiniChip({
  label,
  onPress,
  theme,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  theme: AppTheme;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 999,
        borderCurve: "continuous",
        paddingHorizontal: 12,
        paddingVertical: 7,
        backgroundColor: primary ? "rgba(123, 109, 246, 0.16)" : theme.card,
        borderWidth: 1,
        borderColor: primary ? "rgba(123, 109, 246, 0.24)" : theme.border,
        opacity: pressed ? 0.84 : 1,
      })}
    >
      <Text selectable variant="small" style={{ color: primary ? "#b8abff" : theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}

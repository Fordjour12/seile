import type { ReactNode } from "react";
import { useMemo } from "react";
import { Alert as RNAlert, Pressable, ScrollView, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { Container } from "@/components/container";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type GoalVariantId = "prayer-habit" | "life-os-project" | "emergency-fund";

type GoalConfig = {
  id: GoalVariantId;
  selectorLabel: string;
  backLabel: string;
  domainName: string;
  domainColor: string;
  domainTextColor: string;
  type: string;
  name: string;
  meta: string;
  statusText: string;
  statusTone: "success" | "warning";
  progress: number;
  progressLabel: string;
  statRows: Array<{ label: string; value: string; valueColor?: string }>;
  chartLabel: string;
  chartRange: string;
  bars: number[];
  barsMax: number;
  streakLabel: string;
  streakSub: string;
  streakDots: Array<1 | 0 | 0.5>;
  milestones: Array<{
    title: string;
    sub: string;
    date: string;
    state: "done" | "active" | "upcoming";
  }>;
  log: Array<{
    date: string;
    text: string;
    emphasis?: string;
    tag?: { label: string; background: string; color: string };
  }>;
  aiText: string;
  aiChips: string[];
  primaryAction: string;
  primaryActionMessage: string;
};

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const WEEK_LABELS = ["W1", "", "", "", "", "", "", "W2", "", "", "", "", "", "", "W3", "", "", "", "", "", "", "W4", "", "", "", "", "", ""];

const GOAL_CONFIGS: GoalConfig[] = [
  {
    id: "prayer-habit",
    selectorLabel: "Prayer habit",
    backLabel: "Faith",
    domainName: "Faith",
    domainColor: "#534AB7",
    domainTextColor: "#b4adf5",
    type: "Habit goal",
    name: "Pray every morning",
    meta: "Started Mar 1 · ends Mar 31 · 31 days",
    statusText: "On track",
    statusTone: "success",
    progress: 73,
    progressLabel: "73%",
    statRows: [
      { label: "Target", value: "7 days / week" },
      { label: "This week", value: "5 of 7 days", valueColor: "#1d9e75" },
      { label: "Best streak", value: "8 days" },
      { label: "Time left", value: "17 days" },
    ],
    chartLabel: "Daily completions · last 4 weeks",
    chartRange: "Feb 17 - Mar 14",
    bars: [0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0],
    barsMax: 1,
    streakLabel: "This month · day by day",
    streakSub: "14 of 14 days logged · current streak 5",
    streakDots: [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
    milestones: [
      { title: "First 7-day streak", sub: "Hit the first full week", date: "Mar 7", state: "done" },
      { title: "50% of month logged", sub: "15 of 30 days", date: "Mar 15", state: "active" },
      { title: "Complete the month", sub: "30 of 31 days logged", date: "Mar 31", state: "upcoming" },
    ],
    log: [
      { date: "Mar 14", emphasis: "Prayer logged", text: "6:12 AM · morning session" },
      { date: "Mar 13", emphasis: "Prayer logged", text: "7:04 AM · with gratitude" },
      { date: "Mar 12", text: "Day missed · fasting day - lower energy", tag: { label: "Missed", background: "#2a1e08", color: "#ba7517" } },
      { date: "Mar 11", emphasis: "Prayer logged", text: "6:45 AM" },
    ],
    aiText:
      "You are at 73% with 17 days remaining. If you hit 6 of the next 7 days you should finish above target. The pattern is strongest Monday through Wednesday, while Thursday and Friday tend to slip.",
    aiChips: ["Full analysis", "Close strong"],
    primaryAction: "Log today",
    primaryActionMessage: "This preview would log a prayer entry for today and advance the Faith habit goal.",
  },
  {
    id: "life-os-project",
    selectorLabel: "Life OS project",
    backLabel: "Career",
    domainName: "Career",
    domainColor: "#185FA5",
    domainTextColor: "#85b7eb",
    type: "Project goal",
    name: "Life OS v0.1 launch",
    meta: "Started Jan 1 · target Jun 30 · 6 months",
    statusText: "On track",
    statusTone: "success",
    progress: 68,
    progressLabel: "68%",
    statRows: [
      { label: "Phase", value: "UI/UX sprint" },
      { label: "Screens done", value: "12 of 18", valueColor: "#1d9e75" },
      { label: "Deferred", value: "2 tasks" },
      { label: "Days remaining", value: "108" },
    ],
    chartLabel: "Weekly task completion · last 4 weeks",
    chartRange: "Feb 17 - Mar 14",
    bars: [3, 5, 4, 3, 5, 4, 2, 4, 6, 5, 3, 4, 5, 4, 5, 7, 6, 4, 5, 4, 3, 6, 7, 5, 3, 8, 7, 5],
    barsMax: 8,
    streakLabel: "Deep work days this month",
    streakSub: "12 of 14 days with at least one deep work block",
    streakDots: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1],
    milestones: [
      { title: "Architecture finalized", sub: "53 tables, 24 cron jobs, AI layer", date: "Feb 15", state: "done" },
      { title: "UI/UX sprint complete", sub: "All 18 screens designed", date: "Apr 1", state: "active" },
      { title: "Backend implementation", sub: "Convex schema and cron jobs live", date: "May 15", state: "upcoming" },
      { title: "v0.1 launch", sub: "Deployed and in use", date: "Jun 30", state: "upcoming" },
    ],
    log: [
      { date: "Mar 14", emphasis: "Domains hub screen", text: "designed and reviewed", tag: { label: "Done", background: "#1a2a1e", color: "#6fcf97" } },
      { date: "Mar 13", emphasis: "Career domain screen", text: "completed", tag: { label: "Done", background: "#1a2a1e", color: "#6fcf97" } },
      { date: "Mar 12", text: "Cron monitoring task deferred to next week", tag: { label: "Deferred", background: "#2a1e08", color: "#ba7517" } },
      { date: "Mar 11", emphasis: "AI tab V2", text: "thread switcher variation built", tag: { label: "Done", background: "#1a2a1e", color: "#6fcf97" } },
    ],
    aiText:
      "You are 68% complete at week 10 of 26. Current pace of roughly 1.5 screens per day still keeps the v0.1 launch on track. The deferred Convex monitoring task is the one item that could compound if it keeps slipping.",
    aiChips: ["Sprint status", "Unblock deferred"],
    primaryAction: "Log progress",
    primaryActionMessage: "This preview would log completed work against the Life OS launch project goal.",
  },
  {
    id: "emergency-fund",
    selectorLabel: "Emergency fund",
    backLabel: "Finance",
    domainName: "Finance",
    domainColor: "#0F6E56",
    domainTextColor: "#6fcf97",
    type: "Metric goal",
    name: "Save GHc 8,000 emergency fund",
    meta: "Started Jan 1 · target Jun 30 · 6 months",
    statusText: "Ahead of pace",
    statusTone: "success",
    progress: 40,
    progressLabel: "40%",
    statRows: [
      { label: "Saved", value: "GHc 3,200 of 8,000" },
      { label: "Monthly", value: "GHc 400 / month" },
      { label: "Pace", value: "Ahead", valueColor: "#1d9e75" },
      { label: "Est. done", value: "Jun 2026" },
    ],
    chartLabel: "Monthly savings · GHc",
    chartRange: "Jan - Mar 2026",
    bars: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0.5],
    barsMax: 1,
    streakLabel: "Monthly contributions",
    streakSub: "3 of 3 months hit target · GHc 1,200 total contributed",
    streakDots: [1, 1, 1, 0],
    milestones: [
      { title: "First GHc 1,000 saved", sub: "Month 1 milestone", date: "Jan 31", state: "done" },
      { title: "25% of target · GHc 2,000", sub: "Two months in", date: "Feb 28", state: "done" },
      { title: "50% of target · GHc 4,000", sub: "Halfway milestone", date: "Apr 30", state: "active" },
      { title: "Goal complete · GHc 8,000", sub: "Emergency fund fully funded", date: "Jun 30", state: "upcoming" },
    ],
    log: [
      { date: "Mar 1", emphasis: "GHc 400", text: "allocated to emergency fund · auto-tracked", tag: { label: "Auto", background: "#1a2a1e", color: "#6fcf97" } },
      { date: "Feb 1", emphasis: "GHc 400", text: "allocated · month-end surplus", tag: { label: "Auto", background: "#1a2a1e", color: "#6fcf97" } },
      { date: "Jan 1", emphasis: "Goal created", text: "GHc 400/month · AI proposed", tag: { label: "Created", background: "#1e1a30", color: "#9b8fff" } },
    ],
    aiText:
      "You are 3 months in and 40% complete, which is slightly ahead of pace. Actual month-end surplus has averaged GHc 440, a bit above the GHc 400 target, so this should finish around two weeks early if spending stays stable.",
    aiChips: ["Adjust target", "See surplus history"],
    primaryAction: "Log contribution",
    primaryActionMessage: "This preview would log a manual contribution to the emergency fund goal.",
  },
];

export function PlannerGoalDetailScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const currentGoal = useMemo(() => {
    const candidate = GOAL_CONFIGS.find((goal) => goal.id === params.id);
    return candidate ?? GOAL_CONFIGS[0];
  }, [params.id]);

  function openStub(title: string, message: string) {
    RNAlert.alert(title, message);
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
        <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 10 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {GOAL_CONFIGS.map((goal) => {
              const active = goal.id === currentGoal.id;
              return (
                <Pressable
                  key={goal.id}
                  onPress={() => router.replace(`/(tabs)/planner/goals/${goal.id}` as never)}
                  style={({ pressed }) => ({
                    borderRadius: 999,
                    borderCurve: "continuous",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    backgroundColor: active ? "rgba(123, 109, 246, 0.18)" : theme.card,
                    borderWidth: 1,
                    borderColor: active ? "rgba(123, 109, 246, 0.32)" : theme.border,
                    opacity: pressed ? 0.84 : 1,
                  })}
                >
                  <Text
                    selectable
                    variant="small"
                    style={{
                      color: active ? "#c8c0ff" : theme.mutedForeground,
                      fontFamily: "Geist",
                      fontWeight: "700",
                    }}
                  >
                    {goal.selectorLabel}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                opacity: pressed ? 0.84 : 1,
              })}
            >
              <FontAwesome name="angle-left" size={16} color={theme.mutedForeground} />
              <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                {currentGoal.backLabel}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => openStub("Goal options", "This preview would show edit, pause, and archive actions for the selected goal.")}
              style={({ pressed }) => ({ opacity: pressed ? 0.84 : 1, paddingHorizontal: 4, paddingVertical: 2 })}
            >
              <FontAwesome name="ellipsis-h" size={18} color={theme.mutedForeground} />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(40).duration(420)} style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: currentGoal.domainColor }} />
            <Text selectable variant="small" style={{ color: currentGoal.domainTextColor, fontFamily: "Geist", fontWeight: "700" }}>
              {currentGoal.domainName}
            </Text>
            <Badge variant="outline" color="secondary">
              {currentGoal.type}
            </Badge>
          </View>

          <View style={{ gap: 6 }}>
            <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 26, fontWeight: "700", lineHeight: 32 }}>
              {currentGoal.name}
            </Text>
            <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
              {currentGoal.meta}
            </Text>
          </View>

          <StatusChip tone={currentGoal.statusTone} label={currentGoal.statusText} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(420)}>
          <Card
            style={{
              borderRadius: 22,
              borderCurve: "continuous",
              padding: 16,
              gap: 14,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.card,
              boxShadow: theme.shadowSm,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
              <ProgressRing progress={currentGoal.progress} color={currentGoal.domainColor} label={currentGoal.progressLabel} />
              <View style={{ flex: 1, gap: 6 }}>
                {currentGoal.statRows.map((row) => (
                  <View
                    key={row.label}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      paddingBottom: 6,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.border,
                    }}
                  >
                    <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                      {row.label}
                    </Text>
                    <Text
                      selectable
                      variant="small"
                      style={{
                        color: row.valueColor ?? theme.foreground,
                        fontFamily: "Geist",
                        fontWeight: "700",
                        textAlign: "right",
                      }}
                    >
                      {row.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(420)}>
          <SectionCard label="Weekly progress" actionLabel={currentGoal.chartRange}>
            <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
              {currentGoal.chartLabel}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 5, height: 60 }}>
              {currentGoal.bars.map((value, index) => {
                const height = Math.max(6, Math.round((value / currentGoal.barsMax) * 52));
                const active = value > 0;
                return (
                  <View
                    key={`${currentGoal.id}-bar-${index}`}
                    style={{
                      flex: 1,
                      height,
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                      backgroundColor: active ? currentGoal.domainColor : theme.border,
                      opacity: active ? Math.min(1, 0.45 + value / Math.max(currentGoal.barsMax, 1) * 0.55) : 0.35,
                    }}
                  />
                );
              })}
            </View>
            <View style={{ flexDirection: "row", gap: 5 }}>
              {currentGoal.bars.map((_, index) => (
                <Text
                  key={`${currentGoal.id}-label-${index}`}
                  selectable
                  variant="muted"
                  style={{ flex: 1, textAlign: "center", color: theme.mutedForeground }}
                >
                  {WEEK_LABELS[index] ?? ""}
                </Text>
              ))}
            </View>
          </SectionCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(420)} style={{ gap: 10 }}>
          <SectionHeader label={currentGoal.streakLabel} actionLabel="Full history" onAction={() => openStub("Full history", `This preview would show the full history for ${currentGoal.name}.`)} />
          <Card
            style={{
              borderRadius: 18,
              borderCurve: "continuous",
              padding: 14,
              gap: 10,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.card,
            }}
          >
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
              {currentGoal.streakDots.map((dot, index) => {
                const state = dot === 1 ? "done" : dot === 0.5 ? "today" : "skip";
                return (
                  <View
                    key={`${currentGoal.id}-streak-${index}`}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 8,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: state === "today" ? 1.5 : 1,
                      borderColor:
                        state === "done"
                          ? `${currentGoal.domainColor}55`
                          : state === "today"
                            ? currentGoal.domainColor
                            : theme.border,
                      backgroundColor:
                        state === "done"
                          ? `${currentGoal.domainColor}22`
                          : state === "today"
                            ? "transparent"
                            : isDarkColorScheme
                              ? "rgba(20, 20, 24, 0.9)"
                              : "rgba(246, 247, 250, 0.96)",
                    }}
                  >
                    <Text
                      selectable
                      variant="muted"
                      style={{
                        color: state === "skip" ? theme.mutedForeground : currentGoal.domainColor,
                        fontFamily: "Geist",
                        fontWeight: "700",
                      }}
                    >
                      {DAY_LABELS[index % 7]}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
              {currentGoal.streakSub}
            </Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(420)} style={{ gap: 10 }}>
          <SectionHeader label="Milestones" actionLabel="+ Add" onAction={() => openStub("Add milestone", `This preview would add a milestone to ${currentGoal.name}.`)} />
          <Card
            style={{
              borderRadius: 18,
              borderCurve: "continuous",
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.card,
              overflow: "hidden",
            }}
          >
            {currentGoal.milestones.map((milestone, index) => {
              const isLast = index === currentGoal.milestones.length - 1;
              const dotColor =
                milestone.state === "done" || milestone.state === "active"
                  ? currentGoal.domainColor
                  : theme.border;

              return (
                <Pressable
                  key={`${currentGoal.id}-milestone-${milestone.title}`}
                  onPress={() => openStub("Milestone", `${milestone.title}: ${milestone.sub}`)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.88 : 1,
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: theme.border,
                  })}
                >
                  <View style={{ width: 20, alignItems: "center" }}>
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 999,
                        backgroundColor:
                          milestone.state === "done"
                            ? dotColor
                            : milestone.state === "active"
                              ? theme.background
                              : theme.card,
                        borderWidth: 1.5,
                        borderColor: dotColor,
                      }}
                    />
                    {!isLast ? (
                      <View
                        style={{
                          width: 1.5,
                          flex: 1,
                          minHeight: 18,
                          marginTop: 2,
                          backgroundColor: theme.border,
                        }}
                      />
                    ) : null}
                  </View>

                  <View style={{ flex: 1, gap: 3 }}>
                    <Text
                      selectable
                      style={{
                        color:
                          milestone.state === "done"
                            ? theme.mutedForeground
                            : milestone.state === "active"
                              ? theme.foreground
                              : theme.mutedForeground,
                        fontFamily: "Geist",
                        fontWeight: "700",
                      }}
                    >
                      {milestone.title}
                    </Text>
                    <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                      {milestone.sub}
                    </Text>
                  </View>

                  <Text
                    selectable
                    variant="muted"
                    style={{
                      color: milestone.state === "done" ? "#1d9e75" : theme.mutedForeground,
                    }}
                  >
                    {milestone.date}
                  </Text>
                </Pressable>
              );
            })}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(420)} style={{ gap: 10 }}>
          <SectionHeader label="Activity log" actionLabel="+ Log" onAction={() => openStub("Log entry", `This preview would add a manual entry to ${currentGoal.name}.`)} />
          <Card
            style={{
              borderRadius: 18,
              borderCurve: "continuous",
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.card,
            }}
          >
            {currentGoal.log.map((entry, index) => (
              <View
                key={`${currentGoal.id}-log-${entry.date}-${index}`}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 10,
                  paddingVertical: 12,
                  borderBottomWidth: index === currentGoal.log.length - 1 ? 0 : 1,
                  borderBottomColor: theme.border,
                }}
              >
                <Text selectable variant="muted" style={{ width: 40, color: theme.mutedForeground }}>
                  {entry.date}
                </Text>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text selectable variant="small" style={{ color: theme.foreground, lineHeight: 20 }}>
                    {entry.emphasis ? (
                      <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                        {entry.emphasis}
                      </Text>
                    ) : null}
                    {entry.emphasis ? " · " : ""}
                    {entry.text}
                  </Text>
                  {entry.tag ? (
                    <Badge variant="outline" color="secondary" style={{ alignSelf: "flex-start", borderColor: entry.tag.background, backgroundColor: entry.tag.background }}>
                      {entry.tag.label}
                    </Badge>
                  ) : null}
                </View>
              </View>
            ))}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).duration(420)}>
          <Card
            style={{
              borderRadius: 18,
              borderCurve: "continuous",
              padding: 14,
              gap: 10,
              borderWidth: 1,
              borderColor: isDarkColorScheme ? "rgba(61, 53, 112, 0.34)" : "rgba(61, 53, 112, 0.18)",
              backgroundColor: isDarkColorScheme ? "rgba(19, 19, 31, 0.96)" : "rgba(244, 242, 255, 0.98)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  marginTop: 6,
                  backgroundColor: "#9b8fff",
                }}
              />
              <View style={{ flex: 1, gap: 8 }}>
                <Text selectable variant="small" style={{ color: theme.primary, lineHeight: 21 }}>
                  {currentGoal.aiText}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {currentGoal.aiChips.map((chip) => (
                    <Pressable
                      key={`${currentGoal.id}-${chip}`}
                      onPress={() => openStub(chip, `This preview would open the ${chip.toLowerCase()} flow for ${currentGoal.name}.`)}
                      style={({ pressed }) => ({
                        borderRadius: 999,
                        borderCurve: "continuous",
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        backgroundColor: "rgba(123, 109, 246, 0.16)",
                        borderWidth: 1,
                        borderColor: "rgba(123, 109, 246, 0.28)",
                        opacity: pressed ? 0.84 : 1,
                      })}
                    >
                      <Text selectable variant="muted" style={{ color: theme.primary }}>
                        {chip}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).duration(420)} style={{ flexDirection: "row", gap: 8 }}>
          <Button
            title={currentGoal.primaryAction}
            onPress={() => openStub(currentGoal.primaryAction, currentGoal.primaryActionMessage)}
            style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }}
          />
          <Button
            title="Edit goal"
            variant="outline"
            onPress={() => openStub("Edit goal", `This preview would edit ${currentGoal.name}.`)}
            style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(360).duration(420)} style={{ flexDirection: "row", gap: 8 }}>
          <DangerButton label="Pause goal" onPress={() => openStub("Pause goal", `This preview would pause ${currentGoal.name} without deleting its history.`)} />
          <DangerButton label="Archive" onPress={() => openStub("Archive goal", `This preview would archive ${currentGoal.name} as complete or abandoned.`)} />
          <DangerButton label="Delete" destructive onPress={() => openStub("Delete goal", `This preview would explain what happens before deleting ${currentGoal.name}.`)} />
        </Animated.View>
      </ScrollView>
    </Container>
  );
}

function SectionCard({
  label,
  actionLabel,
  children,
}: {
  label: string;
  actionLabel?: string;
  children: ReactNode;
}) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Card
      style={{
        borderRadius: 18,
        borderCurve: "continuous",
        padding: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.card,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
          {label}
        </Text>
        {actionLabel ? (
          <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
            {actionLabel}
          </Text>
        ) : null}
      </View>
      {children}
    </Card>
  );
}

function SectionHeader({
  label,
  actionLabel,
  onAction,
}: {
  label: string;
  actionLabel: string;
  onAction: () => void;
}) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
        {label}
      </Text>
      <Pressable onPress={onAction}>
        <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

function ProgressRing({
  progress,
  color,
  label,
}: {
  progress: number;
  color: string;
  label: string;
}) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View style={{ width: 82, height: 82, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          position: "absolute",
          width: 82,
          height: 82,
          borderRadius: 999,
          borderWidth: 7,
          borderColor: theme.border,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 82,
          height: 82,
          borderRadius: 999,
          borderWidth: 7,
          borderColor: color,
          borderTopColor: color,
          borderRightColor: color,
          borderBottomColor: `${color}22`,
          borderLeftColor: `${color}22`,
          transform: [{ rotate: `${Math.max(8, (progress / 100) * 360)}deg` }],
        }}
      />
      <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 18, fontWeight: "700" }}>
        {label}
      </Text>
      <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
        complete
      </Text>
    </View>
  );
}

function StatusChip({
  tone,
  label,
}: {
  tone: "success" | "warning";
  label: string;
}) {
  const palette =
    tone === "success"
      ? { background: "rgba(31, 169, 127, 0.14)", border: "rgba(31, 169, 127, 0.24)", text: "#1d9e75" }
      : { background: "rgba(186, 117, 23, 0.14)", border: "rgba(186, 117, 23, 0.24)", text: "#ba7517" };

  return (
    <View
      style={{
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderCurve: "continuous",
        backgroundColor: palette.background,
        borderWidth: 1,
        borderColor: palette.border,
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: palette.text }} />
      <Text selectable variant="small" style={{ color: palette.text, fontFamily: "Geist", fontWeight: "700" }}>
        {label}
      </Text>
    </View>
  );
}

function DangerButton({
  label,
  destructive,
  onPress,
}: {
  label: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        borderRadius: 14,
        borderCurve: "continuous",
        paddingVertical: 11,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: destructive
          ? isDarkColorScheme
            ? "rgba(48, 17, 19, 0.9)"
            : "rgba(255, 238, 239, 0.94)"
          : theme.card,
        borderWidth: 1,
        borderColor: destructive
          ? isDarkColorScheme
            ? "rgba(192, 86, 95, 0.36)"
            : "rgba(192, 86, 95, 0.18)"
          : theme.border,
        opacity: pressed ? 0.84 : 1,
      })}
    >
      <Text
        selectable
        variant="small"
        style={{
          color: destructive ? "#e24b4a" : theme.mutedForeground,
          fontFamily: "Geist",
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

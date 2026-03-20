import { type ReactNode } from "react";
import {
  Alert as RNAlert,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type AppTheme = (typeof NAV_THEME)[keyof typeof NAV_THEME];

const ACTIVE_PROJECT_STEPS = [
  { label: "Today screen", state: "done" as const },
  { label: "Planner screen", state: "done" as const },
  { label: "AI tab · all modes", state: "done" as const },
  { label: "Profile screen", state: "done" as const },
  { label: "Domains hub", state: "done" as const },
  { label: "Career domain screen", state: "active" as const },
  { label: "Faith domain screen", state: "pending" as const },
  { label: "Health · Wellness · Relationships", state: "pending" as const },
  { label: "Onboarding flow", state: "pending" as const },
];

const FOCUS_AREAS = [
  { title: "Life OS - full build", status: "Active", meta: "v0.1 target · Q2 2026", progress: 68, color: "#2f7dd1" },
  { title: "TypeScript + Convex mastery", status: "Learning", meta: "Ongoing · via Life OS build", progress: 55, color: "#4a91f0" },
  { title: "Product thinking + UI/UX", status: "Active", meta: "Building via design sprint", progress: 74, color: "#7b6df6" },
];

const SKILLS = [
  { name: "Convex", progress: 72, meta: "72% · cron jobs · schema", color: "#2f7dd1" },
  { name: "React Native", progress: 58, meta: "58% · navigation · hooks", color: "#4a91f0" },
  { name: "TypeScript", progress: 81, meta: "81% · types · generics", color: "#1fa97f" },
  { name: "System design", progress: 64, meta: "64% · data modeling · cron", color: "#7b6df6" },
];

export function CareerDomainScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const { width } = useWindowDimensions();
  const compactStats = width < 390;

  function openStub(title: string, message: string) {
    RNAlert.alert(title, message);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -56,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: 999,
          backgroundColor: isDarkColorScheme ? "rgba(47, 125, 209, 0.14)" : "rgba(47, 125, 209, 0.1)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 260,
          left: -90,
          width: 220,
          height: 220,
          borderRadius: 999,
          backgroundColor: isDarkColorScheme ? "rgba(123, 109, 246, 0.08)" : "rgba(123, 109, 246, 0.08)",
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.xl,
          paddingBottom: 48,
          gap: 16,
        }}
      >
        <Animated.View entering={FadeInDown.duration(420)}>
          <Card
            style={{
              borderRadius: 26,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: isDarkColorScheme ? "rgba(47, 125, 209, 0.3)" : "rgba(47, 125, 209, 0.16)",
              padding: 18,
              gap: 16,
              boxShadow: theme.shadowLg,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Badge variant="subtle" color="secondary">
                Career domain
              </Badge>
              <Button
                title="Add goal"
                size="sm"
                onPress={() => openStub("Career goal", "Career planning actions are next after the UI screens.")}
                style={{ minHeight: 34, paddingHorizontal: 14 }}
              />
            </View>

            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: "#2f7dd1" }} />
                <Text selectable style={{ fontFamily: "Geist", fontSize: 18, fontWeight: "700", color: theme.foreground }}>
                  Week of Mar 10
                </Text>
              </View>
              <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                Deep work streak active · strongest domain this week.
              </Text>
            </View>

            <View style={{ flexDirection: compactStats ? "column" : "row", gap: 10 }}>
              <MetricPill label="Health" value="90%" color="#91bfff" theme={theme} />
              <MetricPill label="Tasks done" value="8" color="#1fa97f" theme={theme} />
              <MetricPill label="Deep work" value="5 days" color="#91bfff" theme={theme} />
              <MetricPill label="Screens" value="12" color="#c8b8ff" theme={theme} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(420)}>
          <Card style={{ borderRadius: 22, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 16, gap: 14, boxShadow: theme.shadowSm }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
              <View>
                <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
                  Domain health this week
                </Text>
                <Text selectable style={{ fontFamily: "Geist", fontSize: 32, fontWeight: "700", color: "#91bfff", lineHeight: 34, fontVariant: ["tabular-nums"] }}>
                  90%
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text selectable variant="muted">
                  Best domain
                </Text>
                <Text selectable variant="small" style={{ color: "#1fa97f", fontFamily: "Geist", fontWeight: "700" }}>
                  vs last week
                </Text>
              </View>
            </View>

            <View style={{ height: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <View style={{ width: "90%", height: "100%", borderRadius: 999, backgroundColor: "#2f7dd1" }} />
            </View>

            <View style={{ flexDirection: compactStats ? "column" : "row", gap: 8 }}>
              <MiniStat label="Tasks done" value="8" color="#1fa97f" theme={theme} />
              <MiniStat label="Deep work days" value="5" color="#91bfff" theme={theme} />
              <MiniStat label="Screens designed" value="12" color="#c8b8ff" theme={theme} />
              <MiniStat label="Deferred" value="2" color="#d69030" theme={theme} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(420)} style={{ gap: 10 }}>
          <SectionRow title="Active project" actionLabel="All projects" onAction={() => openStub("Career projects", "Project list is not wired yet, but this screen is ready for it.")} />
          <Pressable onPress={() => openStub("Life OS project", "Project detail is the next obvious follow-up to this domain screen.")}>
            <Card
              style={{
                borderRadius: 22,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: isDarkColorScheme ? "rgba(47, 125, 209, 0.3)" : "rgba(47, 125, 209, 0.2)",
                backgroundColor: isDarkColorScheme ? "rgba(20, 26, 36, 0.96)" : "rgba(243, 248, 255, 0.98)",
                padding: 16,
                gap: 14,
                boxShadow: theme.shadowSm,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                <IconWrap background="rgba(47, 125, 209, 0.14)">
                  <FontAwesome name="th-large" size={16} color="#91bfff" />
                </IconWrap>
                <View style={{ flex: 1 }}>
                  <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground }}>
                    Life OS
                  </Text>
                  <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                    TypeScript · Convex · React Native
                  </Text>
                </View>
                <Badge variant="outline" color="secondary">
                  Active sprint
                </Badge>
              </View>

              <ProgressInline progress={68} label="UI/UX sprint · screen designs" color="#2f7dd1" theme={theme} />

              <View style={{ gap: 6 }}>
                {ACTIVE_PROJECT_STEPS.map((step) => (
                  <View key={step.label} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <ProjectCheck state={step.state} />
                    <Text
                      selectable
                      variant="small"
                      style={{
                        color: step.state === "done" ? theme.mutedForeground : step.state === "active" ? theme.foreground : "#7a7f8c",
                        textDecorationLine: step.state === "done" ? "line-through" : "none",
                        fontFamily: step.state === "active" ? "Geist" : "Figtree",
                        fontWeight: step.state === "active" ? "700" : "400",
                      }}
                    >
                      {step.label}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <ActionChip label="Next step" onPress={() => openStub("Next step", "Task generation is next after this UI pass.")} theme={theme} />
                <ActionChip label="Architecture" onPress={() => openStub("Architecture", "Architecture detail can hang off this card later.")} theme={theme} />
                <ActionChip label="Task list" onPress={() => openStub("Task list", "Planner-linked sprint tasks are not wired yet.")} theme={theme} />
              </View>
            </Card>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(420)} style={{ gap: 10 }}>
          <SectionRow title="Deep work" />
          <Card style={{ borderRadius: 20, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 16, gap: 12, boxShadow: theme.shadowSm }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <IconWrap background="rgba(47, 125, 209, 0.14)">
                <FontAwesome name="star-o" size={16} color="#91bfff" />
              </IconWrap>
              <View style={{ flex: 1 }}>
                <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground }}>
                  Deep work streak
                </Text>
                <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                  Consecutive days with a focus block logged
                </Text>
              </View>
              <Text selectable style={{ fontFamily: "Geist", fontSize: 24, fontWeight: "700", color: "#91bfff", fontVariant: ["tabular-nums"] }}>
                5
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 6 }}>
              {[
                { label: "M", state: "done" },
                { label: "T", state: "done" },
                { label: "W", state: "done" },
                { label: "T", state: "done" },
                { label: "F", state: "today" },
                { label: "S", state: "pending" },
                { label: "S", state: "pending" },
              ].map((item, index) => (
                <View
                  key={`${item.label}-${item.state}-${index}`}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      item.state === "done" ? "rgba(47, 125, 209, 0.14)" : item.state === "today" ? "#2f7dd1" : "rgba(255,255,255,0.03)",
                    borderWidth: 1,
                    borderColor: item.state === "done" ? "rgba(47, 125, 209, 0.2)" : theme.border,
                  }}
                >
                  <Text selectable variant="muted" style={{ color: item.state === "today" ? "#ffffff" : item.state === "done" ? "#91bfff" : theme.mutedForeground }}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(420)} style={{ gap: 10 }}>
          <SectionRow title="Focus areas" actionLabel="+ Add" onAction={() => openStub("Focus area", "Creating career focus areas is not wired yet.")} />
          {FOCUS_AREAS.map((area) => (
            <Pressable key={area.title} onPress={() => openStub(area.title, `${area.title} detail is not live yet.`)}>
              <Card style={{ borderRadius: 18, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 14, gap: 10, boxShadow: theme.shadowSm }}>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ width: 4, alignSelf: "stretch", borderRadius: 999, backgroundColor: area.color }} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground }}>
                      {area.title}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                      <Badge variant="subtle" color="secondary">
                        {area.status}
                      </Badge>
                      <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                        {area.meta}
                      </Text>
                    </View>
                    <ProgressInline progress={area.progress} label={`${area.progress}%`} color={area.color} theme={theme} />
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(420)} style={{ gap: 10 }}>
          <SectionRow title="Skills in progress" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {SKILLS.map((skill) => (
              <View key={skill.name} style={{ width: width < 390 ? "100%" : "48%" }}>
                <Card style={{ borderRadius: 16, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 14, gap: 8, boxShadow: theme.shadowSm }}>
                  <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground }}>
                    {skill.name}
                  </Text>
                  <ProgressInline progress={skill.progress} label={skill.meta} color={skill.color} theme={theme} />
                </Card>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(360).duration(420)}>
          <Card
            style={{
              borderRadius: 20,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: isDarkColorScheme ? "rgba(110, 98, 190, 0.34)" : "rgba(110, 98, 190, 0.2)",
              backgroundColor: isDarkColorScheme ? "rgba(18, 18, 32, 0.95)" : "rgba(243, 241, 255, 0.98)",
              padding: 16,
              gap: 12,
              boxShadow: theme.shadowSm,
            }}
          >
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: "#a896ff", marginTop: 6 }} />
              <View style={{ flex: 1, gap: 10 }}>
                <Text selectable style={{ color: isDarkColorScheme ? "#c8c2ff" : "#5c54c9" }}>
                  Best career week yet. The current UI sprint is 68% complete, and faith remains the natural next screen in the domain order.
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  <ActionChip label="Design Faith screen" onPress={() => openStub("Faith screen", "That screen is now built in the domains stack.")} theme={theme} />
                  <ActionChip label="Sprint task list" onPress={() => openStub("Sprint tasks", "Planner-backed sprint tasks are not wired yet.")} theme={theme} />
                  <ActionChip label="Next week focus" onPress={() => openStub("Next week focus", "Weekly focus planning is not connected here yet.")} theme={theme} />
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function MetricPill({ label, value, color, theme }: { label: string; value: string; color: string; theme: AppTheme }) {
  return (
    <View style={{ flex: 1, borderRadius: 16, borderCurve: "continuous", padding: 12, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.04)", gap: 4 }}>
      <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
        {label}
      </Text>
      <Text selectable style={{ fontFamily: "Geist", fontSize: 18, fontWeight: "700", color, fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
    </View>
  );
}

function MiniStat({ label, value, color, theme }: { label: string; value: string; color: string; theme: AppTheme }) {
  return (
    <View style={{ flex: 1, borderRadius: 16, borderCurve: "continuous", padding: 12, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.04)", gap: 4 }}>
      <Text selectable style={{ fontFamily: "Geist", fontSize: 18, fontWeight: "700", color, fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
      <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
        {label}
      </Text>
    </View>
  );
}

function SectionRow({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1.1, fontFamily: "Geist", fontWeight: "700" }}>
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <Text selectable variant="small" style={{ color: "#7b6df6", fontFamily: "Geist", fontWeight: "700" }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function IconWrap({ background, children }: { background: string; children: ReactNode }) {
  return (
    <View style={{ width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: background }}>
      {children}
    </View>
  );
}

function ProgressInline({ progress, label, color, theme }: { progress: number; label: string; color: string; theme: AppTheme }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1, height: 4, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <View style={{ width: `${progress}%`, height: "100%", borderRadius: 999, backgroundColor: color }} />
        </View>
        <Text selectable variant="small" style={{ color, fontFamily: "Geist", fontWeight: "700", width: 38, textAlign: "right" }}>
          {progress}%
        </Text>
      </View>
      <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
        {label}
      </Text>
    </View>
  );
}

function ProjectCheck({ state }: { state: "done" | "active" | "pending" }) {
  if (state === "done") {
    return (
      <View style={{ width: 16, height: 16, borderRadius: 999, backgroundColor: "#2f7dd1", alignItems: "center", justifyContent: "center" }}>
        <FontAwesome name="check" size={9} color="#ffffff" />
      </View>
    );
  }

  return (
    <View
      style={{
        width: 16,
        height: 16,
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: state === "active" ? "#4a91f0" : "#3a3e48",
        backgroundColor: state === "active" ? "rgba(47, 125, 209, 0.08)" : "transparent",
      }}
    />
  );
}

function ActionChip({ label, onPress, theme }: { label: string; onPress: () => void; theme: AppTheme }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 999,
        borderCurve: "continuous",
        paddingHorizontal: 12,
        paddingVertical: 7,
        backgroundColor: "rgba(110, 98, 190, 0.12)",
        borderWidth: 1,
        borderColor: "rgba(110, 98, 190, 0.22)",
        opacity: pressed ? 0.84 : 1,
      })}
    >
      <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}

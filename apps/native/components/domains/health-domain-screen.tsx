import { useState } from "react";
import {
  Alert as RNAlert,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type HealthView = "activity" | "metrics";
type AppTheme = (typeof NAV_THEME)[keyof typeof NAV_THEME];

const TRAINING_DAYS = [
  { label: "M", state: "done" as const, icon: "dumbbell" },
  { label: "T", state: "skip" as const },
  { label: "W", state: "done" as const, icon: "dumbbell" },
  { label: "T", state: "skip" as const },
  { label: "F", state: "today" as const, icon: "plus" },
  { label: "S", state: "skip" as const },
  { label: "S", state: "skip" as const },
];

const METRIC_CARDS = [
  { label: "Resting HR", value: "62", unit: "bpm", sub: "Down 3 from last week", progress: 62, color: "#e16969" },
  { label: "Weight", value: "74.2", unit: "kg", sub: "Stable this month", progress: 74, color: "#d07a36" },
  { label: "VO2 estimate", value: "42", unit: "ml/kg", sub: "Good for your age range", progress: 58, color: "#1fa97f" },
  { label: "Sleep quality", value: "7.8", unit: "/10", sub: "Up from 7.1 last week", progress: 78, color: "#2f7dd1" },
];

const GOALS = [
  { name: "Train 3x per week", sub: "Consistency goal · this week 2/3", progressLabel: "67%", color: "#d07a36" },
  { name: "Sleep 7.5h nightly", sub: "Avg 7.1h this week · close", progressLabel: "95%", color: "#2f7dd1" },
  { name: "2.5L water daily", sub: "Today: 1.5L · 3 cups remaining", progressLabel: "60%", color: "#4a91f0" },
];

export function HealthDomainScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [view, setView] = useState<HealthView>("activity");
  const [loggedTraining, setLoggedTraining] = useState(false);
  const [filledCups, setFilledCups] = useState(3);
  const compactStats = width < 390;

  function navigateTo(href: string) {
    router.push(href as never);
  }

  function openStub(title: string, message: string) {
    RNAlert.alert(title, message);
  }

  function logTraining() {
    setLoggedTraining(true);
    openStub("Training session", "Training logging is ready for backend hookup. The UI state now reflects today's session.");
  }

  function toggleCup(index: number) {
    setFilledCups((current) => {
      if (index < current) {
        return index;
      }

      return index + 1;
    });
  }

  const liters = `${(filledCups * 0.5).toFixed(1)} / 2.5L`;

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
          backgroundColor: isDarkColorScheme ? "rgba(208, 122, 54, 0.14)" : "rgba(208, 122, 54, 0.1)",
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
          backgroundColor: isDarkColorScheme ? "rgba(47, 125, 209, 0.08)" : "rgba(47, 125, 209, 0.08)",
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
              borderColor: isDarkColorScheme ? "rgba(208, 122, 54, 0.3)" : "rgba(208, 122, 54, 0.18)",
              padding: 18,
              gap: 16,
              boxShadow: theme.shadowLg,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Badge variant="subtle" color="warning">
                Health domain
              </Badge>
              <Button
                title="Log entry"
                size="sm"
                onPress={() => openStub("Health entry", "Quick health logging is next after this UI screen.")}
                style={{
                  minHeight: 34,
                  paddingHorizontal: 14,
                  backgroundColor: isDarkColorScheme ? "rgba(208, 122, 54, 0.16)" : "rgba(208, 122, 54, 0.12)",
                }}
              />
            </View>

            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: "#d07a36" }} />
                <Text selectable style={{ fontFamily: "Geist", fontSize: 18, fontWeight: "700", color: theme.foreground }}>
                  Week of Mar 10
                </Text>
              </View>
              <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                70% health · energy average 6.2 this week.
              </Text>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(420)}>
          <Card
            style={{
              borderRadius: 22,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: theme.border,
              padding: 16,
              gap: 14,
              boxShadow: theme.shadowSm,
            }}
          >
            <View style={{ flexDirection: compactStats ? "column" : "row", gap: 16, alignItems: compactStats ? "flex-start" : "center" }}>
              <View style={{ position: "relative", width: 78, height: 78, alignItems: "center", justifyContent: "center" }}>
                <View
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 999,
                    borderWidth: 6,
                    borderColor: "rgba(255,255,255,0.06)",
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 999,
                    borderWidth: 6,
                    borderColor: "#d07a36",
                    borderRightColor: "transparent",
                    borderBottomColor: "transparent",
                    transform: [{ rotate: "40deg" }],
                  }}
                />
                <Text selectable style={{ fontFamily: "Geist", fontSize: 20, fontWeight: "700", color: theme.foreground, fontVariant: ["tabular-nums"] }}>
                  70%
                </Text>
                <Text selectable variant="muted">
                  health
                </Text>
              </View>

              <View style={{ flex: 1, gap: 10 }}>
                <View>
                  <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground }}>
                    Consistent week
                  </Text>
                  <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                    2 training sessions · sleep steady · energy lower than usual mid-week.
                  </Text>
                </View>

                <View style={{ flexDirection: compactStats ? "column" : "row", gap: 10 }}>
                  <MetricPill label="Sessions" value="2" color="#f0a07b" theme={theme} />
                  <MetricPill label="Avg sleep" value="7.1h" color="#91bfff" theme={theme} />
                  <MetricPill label="Avg energy" value="6.2" color="#d69030" theme={theme} />
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(420)}>
          <SegmentedControl
            options={[
              { id: "activity", label: "Activity" },
              { id: "metrics", label: "Metrics" },
            ]}
            selected={view}
            onChange={(next) => setView(next as HealthView)}
            theme={theme}
          />
        </Animated.View>

        {view === "activity" ? (
          <>
            <Animated.View entering={FadeInDown.delay(180).duration(420)} style={{ gap: 10 }}>
              <SectionRow title="Training this week" actionLabel="+ Log session" onAction={logTraining} />
              <Card style={{ borderRadius: 20, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 14, gap: 12, boxShadow: theme.shadowSm }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <Text selectable variant="small" style={{ color: theme.foreground }}>
                    Target: 3 sessions this week
                  </Text>
                  <Text selectable variant="muted">
                    {loggedTraining ? "3 done · target hit" : "2 done · 1 remaining"}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {TRAINING_DAYS.map((day, index) => {
                    const todayDone = day.label === "F" && loggedTraining;
                    const state = todayDone ? "done" : day.state;

                    return (
                      <Pressable
                        key={`${day.label}-${state}-${index}`}
                        onPress={day.label === "F" ? logTraining : undefined}
                        style={({ pressed }) => ({
                          flex: 1,
                          borderRadius: 12,
                          borderCurve: "continuous",
                          paddingVertical: 10,
                          alignItems: "center",
                          backgroundColor:
                            state === "done"
                              ? "rgba(208, 122, 54, 0.14)"
                              : state === "today"
                                ? isDarkColorScheme
                                  ? "rgba(42, 28, 24, 0.96)"
                                  : "rgba(255, 246, 240, 0.98)"
                                : "rgba(255,255,255,0.03)",
                          borderWidth: 1,
                          borderColor: state === "done" || state === "today" ? "rgba(208, 122, 54, 0.22)" : theme.border,
                          opacity: pressed ? 0.84 : 1,
                        })}
                      >
                        <Text selectable variant="muted" style={{ color: state === "done" || state === "today" ? "#f0a07b" : theme.mutedForeground, marginBottom: 5 }}>
                          {day.label}
                        </Text>
                        {state === "done" ? (
                          <Text selectable style={{ fontSize: 12 }}>
                            {"💪"}
                          </Text>
                        ) : state === "today" ? (
                          <FontAwesome name="plus" size={12} color="#f0a07b" />
                        ) : (
                          <View style={{ height: 12 }} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </Card>

              <SessionCard
                type="Strength"
                title="Upper body + core"
                meta={["45 min", "Mon · 5:00 PM", "Energy after: 7/10"]}
                theme={theme}
              />
              <SessionCard
                type="Strength"
                title="Lower body + cardio"
                meta={["40 min", "Wed · 5:30 PM", "Energy after: 6/10"]}
                theme={theme}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(240).duration(420)} style={{ gap: 10 }}>
              <SectionRow title="Sleep" actionLabel="+ Log sleep" onAction={() => openStub("Sleep log", "Sleep logging is next after the UI build.")} />
              <Card style={{ borderRadius: 20, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 14, gap: 12, boxShadow: theme.shadowSm }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <IconWrap background="rgba(47, 125, 209, 0.14)">
                    <FontAwesome name="moon-o" size={14} color="#91bfff" />
                  </IconWrap>
                  <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground, flex: 1 }}>
                    Avg sleep this week
                  </Text>
                  <Text selectable style={{ fontFamily: "Geist", fontSize: 20, fontWeight: "700", color: "#91bfff", fontVariant: ["tabular-nums"] }}>
                    7.1h
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height: 40 }}>
                  {[70, 75, 60, 80, 72, 20, 20].map((value, index) => (
                    <View key={`sleep-${index}`} style={{ flex: 1, alignItems: "center", gap: 5 }}>
                      <View
                        style={{
                          width: "100%",
                          maxWidth: 24,
                          height: `${value}%`,
                          minHeight: 6,
                          borderTopLeftRadius: 4,
                          borderTopRightRadius: 4,
                          backgroundColor: index === 4 ? "#2f7dd1" : value <= 20 ? "#2e3038" : "rgba(47, 125, 209, 0.28)",
                          borderWidth: 1,
                          borderColor: index === 4 ? "rgba(47, 125, 209, 0.26)" : "transparent",
                        }}
                      />
                      <Text selectable variant="muted" style={{ color: index === 4 ? "#91bfff" : theme.mutedForeground }}>
                        {["M", "T", "W", "T", "F", "S", "S"][index]}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(420)} style={{ gap: 10 }}>
              <SectionRow title="Hydration today" />
              <Card style={{ borderRadius: 20, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 14, gap: 12, boxShadow: theme.shadowSm }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <IconWrap background="rgba(47, 125, 209, 0.14)">
                    <FontAwesome name="tint" size={14} color="#91bfff" />
                  </IconWrap>
                  <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground, flex: 1 }}>
                    Water intake
                  </Text>
                  <Text selectable variant="small" style={{ color: "#91bfff", fontFamily: "Geist", fontWeight: "700" }}>
                    {liters}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {Array.from({ length: 5 }, (_, index) => {
                    const filled = index < filledCups;

                    return (
                      <Pressable
                        key={`cup-${index}`}
                        onPress={() => toggleCup(index)}
                        style={({ pressed }) => ({
                          width: 32,
                          height: 36,
                          borderRadius: 8,
                          borderCurve: "continuous",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: filled ? "rgba(47, 125, 209, 0.14)" : "rgba(255,255,255,0.03)",
                          borderWidth: 1,
                          borderColor: filled ? "rgba(47, 125, 209, 0.24)" : theme.border,
                          opacity: pressed ? 0.84 : 1,
                        })}
                      >
                        <FontAwesome name="tint" size={13} color={filled ? "#2f7dd1" : theme.mutedForeground} />
                      </Pressable>
                    );
                  })}
                </View>
              </Card>
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
                      2 of 3 training sessions done. One more today or tomorrow closes the week at target and lifts this domain sharply.
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      <ActionChip label="Log session today" onPress={logTraining} theme={theme} />
                      <ActionChip label="Energy patterns" onPress={() => openStub("Energy patterns", "Cross-domain energy analysis is not connected yet.")} theme={theme} />
                      <ActionChip label="Next week plan" onPress={() => openStub("Next week plan", "Health planning is not wired here yet.")} theme={theme} />
                    </View>
                  </View>
                </View>
              </Card>
            </Animated.View>
          </>
        ) : (
          <>
            <Animated.View entering={FadeInDown.delay(180).duration(420)} style={{ gap: 10 }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {METRIC_CARDS.map((metric) => (
                  <View key={metric.label} style={{ width: width < 390 ? "100%" : "48%" }}>
                    <Pressable onPress={() => openStub(metric.label, `${metric.label} detail is not live yet.`)}>
                      <Card style={{ borderRadius: 18, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 14, gap: 8, boxShadow: theme.shadowSm }}>
                        <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "Geist", fontWeight: "700" }}>
                          {metric.label}
                        </Text>
                        <Text selectable style={{ fontFamily: "Geist", fontSize: 24, fontWeight: "700", color: metric.color, fontVariant: ["tabular-nums"] }}>
                          {metric.value} <Text selectable variant="small" style={{ color: theme.mutedForeground }}>{metric.unit}</Text>
                        </Text>
                        <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                          {metric.sub}
                        </Text>
                        <ProgressInline progress={metric.progress} color={metric.color} theme={theme} />
                      </Card>
                    </Pressable>
                  </View>
                ))}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(240).duration(420)} style={{ gap: 10 }}>
              <SectionRow title="Health goals" actionLabel="+ Add goal" onAction={() => openStub("Health goal", "Goal creation is next after the domain screens.")} />
              {GOALS.map((goal) => (
                <Pressable key={goal.name} onPress={() => openStub(goal.name, `${goal.name} detail is not live yet.`)}>
                  <Card style={{ borderRadius: 18, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 14, gap: 0, boxShadow: theme.shadowSm }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <View style={{ width: 4, height: 24, borderRadius: 999, backgroundColor: goal.color }} />
                      <View style={{ flex: 1, gap: 3 }}>
                        <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground }}>
                          {goal.name}
                        </Text>
                        <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                          {goal.sub}
                        </Text>
                      </View>
                      <Text selectable variant="small" style={{ color: goal.color, fontFamily: "Geist", fontWeight: "700" }}>
                        {goal.progressLabel}
                      </Text>
                    </View>
                  </Card>
                </Pressable>
              ))}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(420)}>
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
                      Sleep quality is improving and resting HR is down. The main lever now is consistency: hit 3 weekly sessions and this domain moves into strong territory.
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      <ActionChip label="30-day trends" onPress={() => navigateTo("/(tabs)/domains/health")} theme={theme} />
                      <ActionChip label="Adjust goals" onPress={() => openStub("Adjust goals", "Goal tuning is not connected yet.")} theme={theme} />
                    </View>
                  </View>
                </View>
              </Card>
            </Animated.View>
          </>
        )}
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

function SessionCard({ type, title, meta, theme }: { type: string; title: string; meta: string[]; theme: AppTheme }) {
  return (
    <Card style={{ borderRadius: 20, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 14, gap: 0, boxShadow: theme.shadowSm }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <IconWrap background="rgba(208, 122, 54, 0.14)">
          <FontAwesome name="heartbeat" size={14} color="#f0a07b" />
        </IconWrap>
        <View style={{ flex: 1, gap: 5 }}>
          <Text selectable variant="muted" style={{ color: "#d07a36", textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "Geist", fontWeight: "700" }}>
            {type}
          </Text>
          <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground }}>
            {title}
          </Text>
          <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
            {meta.map((item) => (
              <View key={`${title}-${item}`} style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: "rgba(208, 122, 54, 0.1)" }}>
                <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View style={{ width: 18, height: 18, borderRadius: 999, backgroundColor: "#d07a36", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
          <FontAwesome name="check" size={10} color="#ffffff" />
        </View>
      </View>
    </Card>
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

function IconWrap({ background, children }: { background: string; children: React.ReactNode }) {
  return (
    <View style={{ width: 32, height: 32, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: background }}>
      {children}
    </View>
  );
}

function ProgressInline({ progress, color, theme }: { progress: number; color: string; theme: AppTheme }) {
  return (
    <View style={{ gap: 0 }}>
      <View style={{ height: 4, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <View style={{ width: `${progress}%`, height: "100%", borderRadius: 999, backgroundColor: color }} />
      </View>
      <Text selectable variant="muted" style={{ color: theme.mutedForeground, marginTop: 8 }}>
        Progress signal
      </Text>
    </View>
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

function SegmentedControl({
  options,
  selected,
  onChange,
  theme,
}: {
  options: Array<{ id: string; label: string }>;
  selected: string;
  onChange: (value: string) => void;
  theme: AppTheme;
}) {
  return (
    <View style={{ flexDirection: "row", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 16, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 4, gap: 4 }}>
      {options.map((option) => {
        const active = option.id === selected;

        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={({ pressed }) => ({
              flex: 1,
              borderRadius: 12,
              borderCurve: "continuous",
              paddingVertical: 10,
              alignItems: "center",
              backgroundColor: active ? "rgba(208, 122, 54, 0.14)" : "transparent",
              borderWidth: active ? 1 : 0,
              borderColor: active ? "rgba(208, 122, 54, 0.24)" : "transparent",
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Text selectable variant="small" style={{ color: active ? "#f0a07b" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

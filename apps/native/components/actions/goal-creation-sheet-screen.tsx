import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type GoalStep = 1 | 2 | 3 | 4 | 5;
type PresetId = "habit" | "project" | "metric";
type DomainId = "faith" | "career" | "finance" | "health" | "wellness" | "tasks";
type GoalType = "habit" | "project" | "metric";
type TrackingType = "auto" | "manual" | "ai";

const DOMAIN_OPTIONS = [
  { id: "faith" as const, label: "Faith", color: "#534AB7" },
  { id: "career" as const, label: "Career", color: "#185FA5" },
  { id: "finance" as const, label: "Finance", color: "#0F6E56" },
  { id: "health" as const, label: "Health", color: "#993C1D" },
  { id: "wellness" as const, label: "Wellness", color: "#993556" },
  { id: "tasks" as const, label: "Tasks", color: "#5F5E5A" },
] as const;

const PRESETS: Record<
  PresetId,
  {
    name: string;
    domain: DomainId;
    type: GoalType;
    target: string;
    timeline: string;
    tracking: TrackingType;
    aiPreview: string;
  }
> = {
  habit: {
    name: "Pray every morning",
    domain: "faith",
    type: "habit",
    target: "7 days / week",
    timeline: "1 month",
    tracking: "auto",
    aiPreview: "I will read your Faith logs daily and update this goal automatically. If you miss 2 or more days I will surface a nudge in your weekly review.",
  },
  project: {
    name: "Life OS v0.1 launch",
    domain: "career",
    type: "project",
    target: "All screens complete",
    timeline: "3 months",
    tracking: "ai",
    aiPreview: "I will track task completion toward this goal each week and flag when sprint pace drops below the launch timeline.",
  },
  metric: {
    name: "Save GHc 8,000 emergency fund",
    domain: "finance",
    type: "metric",
    target: "GHc 8,000",
    timeline: "6 months",
    tracking: "auto",
    aiPreview: "I will calculate progress from your Finance data each day and flag when spending variance risks the target.",
  },
};

const GOAL_TYPES = [
  { id: "habit" as const, label: "Habit goal", description: "Something you do consistently every day or week.", icon: "check-square-o" as const, color: "#9b8fff", background: "#2a2040" },
  { id: "project" as const, label: "Project goal", description: "A defined outcome with a start and end.", icon: "list-alt" as const, color: "#85b7eb", background: "#1a2030" },
  { id: "metric" as const, label: "Metric goal", description: "A number you want to reach or maintain.", icon: "line-chart" as const, color: "#6fcf97", background: "#1a2a1e" },
] as const;

const TIMELINES = ["1 week", "2 weeks", "1 month", "3 months", "6 months", "Ongoing"] as const;
const TRACKING_OPTIONS = [
  { id: "auto" as const, label: "Automatic", description: "AI reads your logs and updates progress daily via cron.", color: "#9b8fff" },
  { id: "manual" as const, label: "Manual check-in", description: "You confirm progress each week and AI prompts you.", color: "#777786" },
  { id: "ai" as const, label: "AI-assisted", description: "AI suggests actions each week and tracks completion.", color: "#ba7517" },
] as const;

export function GoalCreationSheetScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();

  const [preset, setPreset] = useState<PresetId>("habit");
  const [step, setStep] = useState<GoalStep>(1);
  const [goalName, setGoalName] = useState(PRESETS.habit.name);
  const [domain, setDomain] = useState<DomainId>(PRESETS.habit.domain);
  const [goalType, setGoalType] = useState<GoalType>(PRESETS.habit.type);
  const [target, setTarget] = useState(PRESETS.habit.target);
  const [timeline, setTimeline] = useState<string>(PRESETS.habit.timeline);
  const [tracking, setTracking] = useState<TrackingType>(PRESETS.habit.tracking);
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(true);

  const selectedDomain = DOMAIN_OPTIONS.find((item) => item.id === domain) ?? DOMAIN_OPTIONS[0];
  const selectedType = GOAL_TYPES.find((item) => item.id === goalType) ?? GOAL_TYPES[0];
  const trackingLabel = TRACKING_OPTIONS.find((item) => item.id === tracking)?.label ?? "Automatic";
  const aiPreview = useMemo(() => PRESETS[preset].aiPreview, [preset]);

  function loadPreset(nextPreset: PresetId) {
    const config = PRESETS[nextPreset];
    setPreset(nextPreset);
    setGoalName(config.name);
    setDomain(config.domain);
    setGoalType(config.type);
    setTarget(config.target);
    setTimeline(config.timeline);
    setTracking(config.tracking);
    setAiSuggestionsEnabled(true);
    setStep(1);
  }

  function createGoal() {
    setStep(5);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
      <View style={{ paddingHorizontal: 24, paddingBottom: 10, opacity: 0.3 }}>
        <Text selectable style={{ color: "#ffffff", fontFamily: "Geist", fontSize: 22, fontWeight: "700", marginBottom: 10 }}>
          Good morning, Bobie.
        </Text>
        <View style={{ height: 10, width: "65%", borderRadius: 999, backgroundColor: "#1a1a1e", marginBottom: 8 }} />
        {[0, 1].map((item) => (
          <Card key={item} style={{ borderRadius: 14, borderCurve: "continuous", padding: 14, marginBottom: 8, backgroundColor: "rgba(26,26,30,0.96)" }}>
            <View style={{ height: 9, borderRadius: 999, backgroundColor: "#222226", marginBottom: 6, width: item === 0 ? "80%" : "88%" }} />
            <View style={{ height: 9, borderRadius: 999, backgroundColor: "#222226", width: item === 0 ? "55%" : "60%" }} />
          </Card>
        ))}
      </View>

      <Animated.View entering={FadeInDown.duration(420)}>
        <Card
          style={{
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            borderCurve: "continuous",
            paddingHorizontal: 22,
            paddingTop: 12,
            paddingBottom: 30,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: isDarkColorScheme ? "rgba(20,20,24,0.98)" : "rgba(248,248,251,0.98)",
            maxHeight: "88%",
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <View style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: theme.border }} />
          </View>

          <View style={{ alignSelf: "center", flexDirection: "row", gap: 5, backgroundColor: "rgba(20,20,24,0.96)", borderRadius: 999, padding: 4, borderWidth: 1, borderColor: theme.border, marginBottom: 14 }}>
            {(["habit", "project", "metric"] as PresetId[]).map((item) => {
              const active = preset === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => loadPreset(item)}
                  style={({ pressed }) => ({
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: active ? "rgba(123, 109, 246, 0.16)" : "transparent",
                    opacity: pressed ? 0.84 : 1,
                  })}
                >
                  <Text selectable variant="small" style={{ color: active ? "#d7d1ff" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                    {item === "habit" ? "Habit goal" : item === "project" ? "Project goal" : "Metric goal"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 8 }}>
            {step !== 5 ? (
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <View style={{ gap: 4, flex: 1 }}>
                    <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                      New goal · step {step} of 4
                    </Text>
                    <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 18, fontWeight: "700", lineHeight: 24 }}>
                      {step === 1 ? "What’s the goal?" : step === 2 ? "What kind of goal?" : step === 3 ? "Timeline and tracking" : "Review and create"}
                    </Text>
                  </View>
                  <Pressable onPress={() => router.back()}>
                    <Text selectable style={{ color: theme.mutedForeground, fontFamily: "Geist", fontSize: 20, fontWeight: "700" }}>
                      ×
                    </Text>
                  </Pressable>
                </View>

                <View style={{ flexDirection: "row", gap: 5 }}>
                  {[1, 2, 3, 4].map((item) => (
                    <View
                      key={item}
                      style={{
                        width: step === item ? 18 : 6,
                        height: 6,
                        borderRadius: step === item ? 3 : 999,
                        backgroundColor: step === item ? "#9b8fff" : item < step ? "#3d3570" : theme.border,
                      }}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {step === 1 ? (
              <Animated.View entering={FadeInDown.delay(50).duration(420)} style={{ gap: 14 }}>
                <View style={{ gap: 6 }}>
                  <TextInput
                    value={goalName}
                    onChangeText={setGoalName}
                    placeholder="Name this goal..."
                    placeholderTextColor={theme.mutedForeground}
                    style={{
                      borderRadius: 14,
                      borderCurve: "continuous",
                      borderWidth: 1,
                      borderColor: theme.border,
                      backgroundColor: theme.card,
                      color: theme.foreground,
                      fontFamily: "Geist",
                      fontSize: 18,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                    }}
                  />
                  <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                    Specific and personal works best.
                  </Text>
                </View>

                <View style={{ gap: 8 }}>
                  <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                    Which domain?
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {DOMAIN_OPTIONS.map((item) => {
                      const active = domain === item.id;
                      return (
                        <Pressable
                          key={item.id}
                          onPress={() => setDomain(item.id)}
                          style={({ pressed }) => ({
                            width: "48.5%",
                            minWidth: 140,
                            borderRadius: 14,
                            borderCurve: "continuous",
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            backgroundColor: active ? `${item.color}22` : theme.card,
                            borderWidth: active ? 1.5 : 1,
                            borderColor: active ? item.color : theme.border,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            opacity: pressed ? 0.84 : 1,
                          })}
                        >
                          <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: item.color }} />
                          <Text selectable variant="small" style={{ color: active ? theme.foreground : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", flex: 1 }}>
                            {item.label}
                          </Text>
                          {active ? <FontAwesome name="check" size={11} color={item.color} /> : null}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <Button title="Continue" onPress={() => setStep(2)} disabled={goalName.trim().length < 2} style={{ borderRadius: 14, borderCurve: "continuous" }} />
              </Animated.View>
            ) : null}

            {step === 2 ? (
              <Animated.View entering={FadeInDown.delay(50).duration(420)} style={{ gap: 14 }}>
                <View style={{ gap: 8 }}>
                  {GOAL_TYPES.map((item) => {
                    const active = goalType === item.id;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => setGoalType(item.id)}
                        style={({ pressed }) => ({
                          borderRadius: 14,
                          borderCurve: "continuous",
                          padding: 12,
                          backgroundColor: active ? "rgba(123, 109, 246, 0.18)" : theme.card,
                          borderWidth: 1,
                          borderColor: active ? "rgba(123, 109, 246, 0.32)" : theme.border,
                          flexDirection: "row",
                          alignItems: "flex-start",
                          gap: 10,
                          opacity: pressed ? 0.84 : 1,
                        })}
                      >
                        <View style={{ width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: item.background }}>
                          <FontAwesome name={item.icon} size={14} color={item.color} />
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                            {item.label}
                          </Text>
                          <Text selectable variant="muted" style={{ color: theme.mutedForeground, lineHeight: 18 }}>
                            {item.description}
                          </Text>
                        </View>
                        <View style={{ width: 16, height: 16, borderRadius: 999, borderWidth: 1.5, borderColor: active ? "#9b8fff" : theme.border, backgroundColor: active ? "#9b8fff" : "transparent" }} />
                      </Pressable>
                    );
                  })}
                </View>

                <View style={{ gap: 8 }}>
                  <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                    {goalType === "habit" ? "How often?" : goalType === "project" ? "What’s the outcome?" : "What number?"}
                  </Text>
                  <TextInput
                    value={target}
                    onChangeText={setTarget}
                    placeholder={goalType === "habit" ? "e.g. 7 days / week" : goalType === "project" ? "e.g. All screens complete" : "e.g. GHc 8,000"}
                    placeholderTextColor={theme.mutedForeground}
                    style={{
                      borderRadius: 12,
                      borderCurve: "continuous",
                      borderWidth: 1,
                      borderColor: theme.border,
                      backgroundColor: theme.card,
                      color: theme.foreground,
                      fontFamily: "Geist",
                      fontSize: 16,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                    }}
                  />
                </View>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Button title="Back" variant="outline" onPress={() => setStep(1)} style={{ borderRadius: 14, borderCurve: "continuous" }} />
                  <Button title="Continue" onPress={() => setStep(3)} style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }} />
                </View>
              </Animated.View>
            ) : null}

            {step === 3 ? (
              <Animated.View entering={FadeInDown.delay(50).duration(420)} style={{ gap: 14 }}>
                <View style={{ gap: 8 }}>
                  <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                    How long?
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {TIMELINES.map((item) => {
                      const active = timeline === item;
                      return (
                        <Pressable
                          key={item}
                          onPress={() => setTimeline(item)}
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
                          <Text selectable variant="small" style={{ color: active ? "#c8c0ff" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                            {item}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={{ gap: 8 }}>
                  <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                    How should the AI track this?
                  </Text>
                  {TRACKING_OPTIONS.map((item) => {
                    const active = tracking === item.id;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => setTracking(item.id)}
                        style={({ pressed }) => ({
                          borderRadius: 14,
                          borderCurve: "continuous",
                          padding: 12,
                          backgroundColor: active ? "rgba(123, 109, 246, 0.18)" : theme.card,
                          borderWidth: 1,
                          borderColor: active ? "rgba(123, 109, 246, 0.32)" : theme.border,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                          opacity: pressed ? 0.84 : 1,
                        })}
                      >
                        <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: item.color }} />
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                            {item.label}
                          </Text>
                          <Text selectable variant="muted" style={{ color: theme.mutedForeground, lineHeight: 18 }}>
                            {item.description}
                          </Text>
                        </View>
                        <View style={{ width: 16, height: 16, borderRadius: 999, borderWidth: 1.5, borderColor: active ? "#9b8fff" : theme.border, backgroundColor: active ? "#9b8fff" : "transparent" }} />
                      </Pressable>
                    );
                  })}
                </View>

                <Card style={{ borderRadius: 14, borderCurve: "continuous", padding: 12, borderWidth: 1, borderColor: "rgba(61, 53, 112, 0.32)", backgroundColor: isDarkColorScheme ? "rgba(19,19,31,0.96)" : "rgba(244,242,255,0.98)" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(123, 109, 246, 0.18)" }}>
                      <FontAwesome name="commenting-o" size={13} color="#9b8fff" />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text selectable variant="small" style={{ color: "#c8c0ff", fontFamily: "Geist", fontWeight: "700" }}>
                        AI suggestions
                      </Text>
                      <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                        Surface nudges and pattern insights for this goal.
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setAiSuggestionsEnabled((current) => !current)}
                      style={({ pressed }) => ({
                        width: 38,
                        height: 22,
                        borderRadius: 999,
                        backgroundColor: aiSuggestionsEnabled ? "#9b8fff" : "#252530",
                        justifyContent: "center",
                        paddingHorizontal: 2,
                        opacity: pressed ? 0.84 : 1,
                      })}
                    >
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 999,
                          backgroundColor: "#ffffff",
                          transform: [{ translateX: aiSuggestionsEnabled ? 16 : 0 }],
                        }}
                      />
                    </Pressable>
                  </View>
                </Card>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Button title="Back" variant="outline" onPress={() => setStep(2)} style={{ borderRadius: 14, borderCurve: "continuous" }} />
                  <Button title="Continue" onPress={() => setStep(4)} style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }} />
                </View>
              </Animated.View>
            ) : null}

            {step === 4 ? (
              <Animated.View entering={FadeInDown.delay(50).duration(420)} style={{ gap: 14 }}>
                <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 16, gap: 4, borderWidth: 1, borderColor: "rgba(61, 53, 112, 0.28)", backgroundColor: isDarkColorScheme ? "rgba(26,26,36,0.98)" : "rgba(245,242,255,0.98)" }}>
                  <Text selectable variant="muted" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                    Goal summary
                  </Text>
                  <ReviewRow label="Goal" value={goalName} onEdit={() => setStep(1)} theme={theme} />
                  <ReviewRow label="Domain" value={selectedDomain.label} color={selectedDomain.color} onEdit={() => setStep(1)} theme={theme} />
                  <ReviewRow label="Type" value={selectedType.label} onEdit={() => setStep(2)} theme={theme} />
                  <ReviewRow label="Target" value={target} onEdit={() => setStep(2)} theme={theme} />
                  <ReviewRow label="Timeline" value={timeline === "Ongoing" ? "Ongoing" : `${timeline} · ends Apr 14`} onEdit={() => setStep(3)} theme={theme} />
                  <ReviewRow label="Tracking" value={trackingLabel} theme={theme} />
                </Card>

                <Card style={{ borderRadius: 14, borderCurve: "continuous", padding: 12, borderWidth: 1, borderColor: "rgba(61, 53, 112, 0.32)", backgroundColor: isDarkColorScheme ? "rgba(19,19,31,0.96)" : "rgba(244,242,255,0.98)", flexDirection: "row", gap: 8 }}>
                  <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: "#9b8fff", marginTop: 6 }} />
                  <Text selectable variant="small" style={{ color: theme.primary, flex: 1, lineHeight: 19 }}>
                    {aiSuggestionsEnabled ? aiPreview : "AI suggestions are disabled for this goal. Progress will still be tracked based on your selected method."}
                  </Text>
                </Card>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Button title="Back" variant="outline" onPress={() => setStep(3)} style={{ borderRadius: 14, borderCurve: "continuous" }} />
                  <Button title="Create goal" onPress={createGoal} style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }} />
                </View>
              </Animated.View>
            ) : null}

            {step === 5 ? (
              <Animated.View entering={FadeInDown.delay(40).duration(420)} style={{ alignItems: "center", gap: 16, paddingTop: 16 }}>
                <View style={{ width: 54, height: 54, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: `${selectedDomain.color}22`, borderWidth: 1.5, borderColor: selectedDomain.color }}>
                  <FontAwesome name="check" size={22} color={selectedDomain.color} />
                </View>
                <View style={{ alignItems: "center", gap: 4 }}>
                  <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 18, fontWeight: "700", textAlign: "center" }}>
                    {goalName} - created
                  </Text>
                  <Text selectable variant="small" style={{ color: theme.mutedForeground, textAlign: "center", lineHeight: 20 }}>
                    {goalName} is now tracked in your {selectedDomain.label} domain. Progress updates via {trackingLabel.toLowerCase()}.
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 8, width: "100%" }}>
                  <Button title="Add another" variant="outline" onPress={() => loadPreset("habit")} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
                  <Button title="View in domain" onPress={() => router.push(domainRoute(selectedDomain.id) as never)} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
                </View>
              </Animated.View>
            ) : null}
          </ScrollView>
        </Card>
      </Animated.View>
    </View>
  );
}

function ReviewRow({
  label,
  value,
  color,
  onEdit,
  theme,
}: {
  label: string;
  value: string;
  color?: string;
  onEdit?: () => void;
  theme: typeof NAV_THEME.light | typeof NAV_THEME.dark;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: theme.border }}>
      <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text selectable variant="small" style={{ color: color ?? theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
          {value}
        </Text>
        {onEdit ? (
          <Pressable onPress={onEdit}>
            <Text selectable variant="muted" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
              Edit
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function domainRoute(domain: DomainId) {
  if (domain === "faith") return "/(tabs)/domains/faith";
  if (domain === "career") return "/(tabs)/domains/career";
  if (domain === "finance") return "/(tabs)/domains/finance";
  if (domain === "health") return "/(tabs)/domains/health";
  if (domain === "wellness") return "/(tabs)/domains/wellness";
  return "/(tabs)/domains/tasks";
}

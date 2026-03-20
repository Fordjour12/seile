import { useMemo, useState } from "react";
import {
  Alert as RNAlert,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type WellnessView = "checkin" | "patterns" | "reflect";
type MetricKey = "mood" | "energy" | "focus" | "stress";
type AppTheme = (typeof NAV_THEME)[keyof typeof NAV_THEME];

const METRIC_CONFIG: Record<
  MetricKey,
  { label: string; color: string; descriptions: string[]; defaultValue: number }
> = {
  mood: {
    label: "Mood",
    color: "#d45689",
    descriptions: ["", "Very low", "Low", "Low", "Moderate", "Moderate", "Good", "Good", "Great", "Great", "Excellent"],
    defaultValue: 7,
  },
  energy: {
    label: "Energy",
    color: "#d69030",
    descriptions: ["", "Drained", "Low", "Low", "Moderate", "Moderate", "Moderate", "Good", "Good", "High", "Peak"],
    defaultValue: 6,
  },
  focus: {
    label: "Focus",
    color: "#1fa97f",
    descriptions: ["", "Scattered", "Poor", "Poor", "Okay", "Okay", "Decent", "Good", "Sharp", "Sharp", "Laser"],
    defaultValue: 8,
  },
  stress: {
    label: "Stress",
    color: "#e16969",
    descriptions: ["", "None", "Very low", "Low", "Low", "Moderate", "Moderate", "High", "High", "Very high", "Intense"],
    defaultValue: 3,
  },
};

const CHECKIN_TAGS = ["Rested", "Grateful", "Anxious", "Motivated", "Tired", "Calm", "Overwhelmed"];

export function WellnessDomainScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [view, setView] = useState<WellnessView>("checkin");
  const [isLogged, setIsLogged] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(["Grateful", "Calm"]);
  const [notes, setNotes] = useState("");
  const [reflection, setReflection] = useState("");
  const [metrics, setMetrics] = useState<Record<MetricKey, number>>({
    mood: 7,
    energy: 6,
    focus: 8,
    stress: 3,
  });
  const [trackWidths, setTrackWidths] = useState<Record<MetricKey, number>>({
    mood: 0,
    energy: 0,
    focus: 0,
    stress: 0,
  });

  const moodFaces = useMemo(
    () => [
      { emoji: "😔", value: 1 },
      { emoji: "😕", value: 3 },
      { emoji: "😐", value: 5 },
      { emoji: "😊", value: 7 },
      { emoji: "😄", value: 9 },
      { emoji: "🤩", value: 10 },
    ],
    [],
  );

  function openStub(title: string, message: string) {
    RNAlert.alert(title, message);
  }

  function updateMetricFromPress(metric: MetricKey, locationX: number) {
    const width = trackWidths[metric];

    if (!width) {
      return;
    }

    const ratio = Math.max(0, Math.min(1, locationX / width));
    const value = Math.max(1, Math.min(10, Math.round(ratio * 10)));
    setMetrics((current) => ({ ...current, [metric]: value }));
  }

  function onTrackLayout(metric: MetricKey, event: LayoutChangeEvent) {
    const { width } = event.nativeEvent.layout;
    setTrackWidths((current) => ({ ...current, [metric]: width }));
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  }

  function submitCheckin() {
    setIsLogged(true);
    setView("checkin");
  }

  function editCheckin() {
    setIsLogged(false);
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
          backgroundColor: isDarkColorScheme ? "rgba(212, 86, 137, 0.14)" : "rgba(212, 86, 137, 0.1)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 260,
          left: -84,
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
              borderColor: isDarkColorScheme ? "rgba(212, 86, 137, 0.3)" : "rgba(212, 86, 137, 0.16)",
              padding: 18,
              gap: 16,
              boxShadow: theme.shadowLg,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Badge variant="subtle" color="destructive">
                Day 47 streak
              </Badge>
            </View>

            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: "#d45689" }} />
                <Text selectable style={{ fontFamily: "Geist", fontSize: 18, fontWeight: "700", color: theme.foreground }}>
                  Friday · Mar 14
                </Text>
              </View>
              <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                Morning check-in · you have logged every day this week.
              </Text>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(420)}>
          <SegmentedControl
            options={[
              { id: "checkin", label: "Check-in" },
              { id: "patterns", label: "Patterns" },
              { id: "reflect", label: "Reflect" },
            ]}
            selected={view}
            onChange={(value) => setView(value as WellnessView)}
            theme={theme}
          />
        </Animated.View>

        {view === "checkin" ? (
          isLogged ? (
            <Animated.View entering={FadeInDown.delay(120).duration(420)}>
              <Card style={{ borderRadius: 24, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 20, gap: 16, boxShadow: theme.shadowSm }}>
                <View style={{ alignItems: "center", gap: 10 }}>
                  <View style={{ width: 60, height: 60, borderRadius: 999, backgroundColor: "rgba(212, 86, 137, 0.12)", borderWidth: 1.5, borderColor: "rgba(212, 86, 137, 0.24)", alignItems: "center", justifyContent: "center" }}>
                    <Text selectable style={{ fontSize: 24, color: "#d45689" }}>
                      ✓
                    </Text>
                  </View>
                  <Text selectable style={{ fontFamily: "Geist", fontSize: 20, fontWeight: "700", color: theme.foreground }}>
                    Check-in logged
                  </Text>
                  <Text selectable variant="small" style={{ color: theme.mutedForeground, textAlign: "center" }}>
                    Friday · 9:41 AM · streak continues
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  {(["mood", "energy", "focus", "stress"] as MetricKey[]).map((metric) => (
                    <View key={metric} style={{ flex: 1, borderRadius: 14, borderCurve: "continuous", padding: 12, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.04)", gap: 4 }}>
                      <Text selectable style={{ fontFamily: "Geist", fontSize: 20, fontWeight: "700", color: METRIC_CONFIG[metric].color, textAlign: "center", fontVariant: ["tabular-nums"] }}>
                        {metrics[metric]}
                      </Text>
                      <Text selectable variant="muted" style={{ textAlign: "center" }}>
                        {METRIC_CONFIG[metric].label}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Button title="Edit" variant="outline" onPress={editCheckin} style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }} />
                  <Button
                    title="See patterns"
                    onPress={() => setView("patterns")}
                    style={{ flex: 1, borderRadius: 14, borderCurve: "continuous", backgroundColor: "#d45689" }}
                  />
                </View>
              </Card>
            </Animated.View>
          ) : (
            <>
              <Animated.View entering={FadeInDown.delay(120).duration(420)}>
                <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                  It is Friday morning. You have checked in every day this week. How are you starting today?
                </Text>
              </Animated.View>

              {(["mood", "energy", "focus", "stress"] as MetricKey[]).map((metric, index) => (
                <Animated.View key={metric} entering={FadeInDown.delay(160 + index * 50).duration(420)}>
                  <Card style={{ borderRadius: 20, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 16, gap: 12, boxShadow: theme.shadowSm }}>
                    <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground }}>
                        {METRIC_CONFIG[metric].label}
                      </Text>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text selectable style={{ fontFamily: "Geist", fontSize: 26, fontWeight: "700", color: METRIC_CONFIG[metric].color, lineHeight: 28, fontVariant: ["tabular-nums"] }}>
                          {metrics[metric]}
                        </Text>
                        <Text selectable variant="muted">
                          {METRIC_CONFIG[metric].descriptions[metrics[metric]]}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      onLayout={(event) => onTrackLayout(metric, event)}
                      onPress={(event) => updateMetricFromPress(metric, event.nativeEvent.locationX)}
                      style={{
                        height: 34,
                        justifyContent: "center",
                      }}
                    >
                      <View style={{ height: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <View
                          style={{
                            width: `${metrics[metric] * 10}%`,
                            height: "100%",
                            borderRadius: 999,
                            backgroundColor: METRIC_CONFIG[metric].color,
                          }}
                        />
                      </View>
                      <View
                        style={{
                          position: "absolute",
                          left: `${metrics[metric] * 10}%`,
                          marginLeft: -13,
                          width: 26,
                          height: 26,
                          borderRadius: 999,
                          backgroundColor: theme.background,
                          borderWidth: 3,
                          borderColor: METRIC_CONFIG[metric].color,
                        }}
                      />
                    </Pressable>

                    {metric === "mood" ? (
                      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 6 }}>
                        {moodFaces.map((face) => {
                          const active = metrics.mood >= face.value && metrics.mood < face.value + 2;

                          return (
                            <Pressable key={face.emoji} onPress={() => setMetrics((current) => ({ ...current, mood: face.value }))}>
                              <Text selectable style={{ fontSize: active ? 22 : 18, opacity: active ? 1 : 0.35 }}>
                                {face.emoji}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : null}
                  </Card>
                </Animated.View>
              ))}

              <Animated.View entering={FadeInDown.delay(380).duration(420)} style={{ gap: 10 }}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {CHECKIN_TAGS.map((tag) => {
                    const active = selectedTags.includes(tag);

                    return (
                      <Pressable
                        key={tag}
                        onPress={() => toggleTag(tag)}
                        style={({ pressed }) => ({
                          borderRadius: 999,
                          borderCurve: "continuous",
                          paddingHorizontal: 12,
                          paddingVertical: 7,
                          backgroundColor: active
                            ? isDarkColorScheme
                              ? "rgba(212, 86, 137, 0.14)"
                              : "rgba(255, 236, 244, 0.98)"
                            : "rgba(255,255,255,0.03)",
                          borderWidth: 1,
                          borderColor: active ? "rgba(212, 86, 137, 0.24)" : theme.border,
                          opacity: pressed ? 0.84 : 1,
                        })}
                      >
                        <Text selectable variant="small" style={{ color: active ? "#d45689" : theme.mutedForeground, fontFamily: "Geist", fontWeight: active ? "700" : "500" }}>
                          {tag}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <TextInput
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Anything on your mind? (optional)"
                  placeholderTextColor={theme.mutedForeground}
                  style={{
                    minHeight: 92,
                    borderRadius: 18,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: theme.border,
                    backgroundColor: theme.card,
                    padding: 14,
                    color: theme.foreground,
                    textAlignVertical: "top",
                    fontFamily: "Figtree",
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                />

                <Button
                  title="Log check-in"
                  onPress={submitCheckin}
                  style={{ borderRadius: 16, borderCurve: "continuous", minHeight: 50, backgroundColor: "#d45689" }}
                />
              </Animated.View>
            </>
          )
        ) : null}

        {view === "patterns" ? (
          <>
            <Animated.View entering={FadeInDown.delay(120).duration(420)}>
              <BarChartCard title="Mood this week" color="#d45689" values={[72, 80, 65, 78, 70, 20, 20]} currentIndex={4} theme={theme} />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(170).duration(420)}>
              <BarChartCard title="Energy this week" color="#d69030" values={[65, 70, 52, 60, 62, 20, 20]} currentIndex={4} theme={theme} />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(220).duration(420)}>
              <Card style={{ borderRadius: 20, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 16, gap: 6, boxShadow: theme.shadowSm }}>
                <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1.1, fontFamily: "Geist", fontWeight: "700" }}>
                  What the AI noticed
                </Text>
                <InsightRow color="#d45689" text="Mood averaged 7.1 this week, slightly above your 3-month average of 6.8." theme={theme} />
                <InsightRow color="#d69030" text="Energy dipped on Wednesday. Fasting days still correlate with lower energy in your logs." theme={theme} />
                <InsightRow color="#1fa97f" text="Decompression walks on 3 evenings preceded higher next-morning energy every time." theme={theme} />
                <InsightRow color="#e16969" text="Stress stayed below 4 all week, your lowest sustained reading in 30 days." theme={theme} />
              </Card>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(270).duration(420)}>
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
                      On days you log morning prayer before 7 AM, average energy is 7.4 vs 5.9 on days you do not.
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      <ActionChip label="Add to routine" onPress={() => openStub("Routine", "Routine creation is the next workflow to wire here.")} theme={theme} />
                      <ActionChip label="More patterns" onPress={() => openStub("More patterns", "Cross-domain analytics is not connected yet.")} theme={theme} />
                    </View>
                  </View>
                </View>
              </Card>
            </Animated.View>
          </>
        ) : null}

        {view === "reflect" ? (
          <>
            <Animated.View entering={FadeInDown.delay(120).duration(420)}>
              <Card
                style={{
                  borderRadius: 20,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: isDarkColorScheme ? "rgba(212, 86, 137, 0.3)" : "rgba(212, 86, 137, 0.16)",
                  backgroundColor: isDarkColorScheme ? "rgba(28, 16, 24, 0.96)" : "rgba(255, 241, 247, 0.98)",
                  padding: 16,
                  gap: 8,
                  boxShadow: theme.shadowSm,
                }}
              >
                <Text selectable variant="muted" style={{ color: "#d45689", textTransform: "uppercase", letterSpacing: 1.1, fontFamily: "Geist", fontWeight: "700" }}>
                  Today&apos;s prompt
                </Text>
                <Text selectable style={{ color: isDarkColorScheme ? "#f1d8e5" : "#6d3d52", fontStyle: "italic", lineHeight: 22 }}>
                  What is one thing that drained you this week, and one thing that restored you?
                </Text>
                <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                  Generated from your check-in patterns · week of Mar 10
                </Text>
              </Card>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(170).duration(420)} style={{ gap: 10 }}>
              <TextInput
                multiline
                value={reflection}
                onChangeText={setReflection}
                placeholder="Write freely - this stays in your Wellness domain..."
                placeholderTextColor={theme.mutedForeground}
                style={{
                  minHeight: 130,
                  borderRadius: 18,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                  padding: 14,
                  color: theme.foreground,
                  textAlignVertical: "top",
                  fontFamily: "Figtree",
                  fontSize: 14,
                  lineHeight: 20,
                }}
              />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button title="Save reflection" onPress={() => openStub("Reflection saved", "Reflection persistence is not wired yet, but the flow is mapped.")} style={{ flex: 1, borderRadius: 14, borderCurve: "continuous", backgroundColor: "#d45689" }} />
                <Button title="New prompt" variant="outline" onPress={() => openStub("New prompt", "Prompt regeneration is not live yet.")} style={{ borderRadius: 14, borderCurve: "continuous" }} />
              </View>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(220).duration(420)} style={{ gap: 8 }}>
              <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1.1, fontFamily: "Geist", fontWeight: "700" }}>
                Past reflections
              </Text>
              <ReflectionCard date="Thursday · Mar 13" text="The deep work sessions this week felt surprisingly sustainable. I think the morning spiritual block is doing more for my focus than I realised..." theme={theme} />
              <ReflectionCard date="Sunday · Mar 9" text="Heading into this week feeling grounded. The fasting on Wednesday was harder than usual but the evening felt peaceful..." theme={theme} />
              <Pressable onPress={() => openStub("All reflections", "Reflection history list is not connected yet.")}>
                <Card style={{ borderRadius: 16, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 12 }}>
                  <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
                    View all reflections
                  </Text>
                </Card>
              </Pressable>
            </Animated.View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function BarChartCard({ title, color, values, currentIndex, theme }: { title: string; color: string; values: number[]; currentIndex: number; theme: AppTheme }) {
  return (
    <Card style={{ borderRadius: 20, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 16, gap: 12, boxShadow: theme.shadowSm }}>
      <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1.1, fontFamily: "Geist", fontWeight: "700" }}>
        {title}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: 72 }}>
        {values.map((value, index) => (
          <View key={`${title}-${index}`} style={{ flex: 1, alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: "100%",
                maxWidth: 28,
                height: `${value}%`,
                minHeight: 8,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                backgroundColor: value <= 20 ? "#43434f" : color,
                opacity: index === currentIndex ? 0.95 : value <= 20 ? 0.45 : 0.65,
              }}
            />
            <Text selectable variant="muted" style={{ color: index === currentIndex ? color : theme.mutedForeground }}>
              {["M", "T", "W", "T", "F", "S", "S"][index]}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

function InsightRow({ color, text, theme }: { color: string; text: string; theme: AppTheme }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, paddingVertical: 7 }}>
      <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: color, marginTop: 6 }} />
      <Text selectable variant="small" style={{ color: theme.foreground, flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}

function ReflectionCard({ date, text, theme }: { date: string; text: string; theme: AppTheme }) {
  return (
    <Card style={{ borderRadius: 16, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 12, gap: 5, boxShadow: theme.shadowSm }}>
      <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
        {date}
      </Text>
      <Text selectable variant="small" style={{ color: theme.foreground }}>
        {text}
      </Text>
    </Card>
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
              backgroundColor: active ? "rgba(212, 86, 137, 0.14)" : "transparent",
              borderWidth: active ? 1 : 0,
              borderColor: active ? "rgba(212, 86, 137, 0.24)" : "transparent",
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Text selectable variant="small" style={{ color: active ? "#d45689" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

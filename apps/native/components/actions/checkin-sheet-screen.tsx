import { useMemo, useState, type ComponentProps } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button, Card, Text } from "@/components";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type Variant = "morning" | "midday" | "evening";
type IconName = ComponentProps<typeof FontAwesome>["name"];

const VARIANTS: Record<
  Variant,
  {
    time: string;
    title: string;
    subtitle: string;
    doneTitle: string;
    doneSubtitle: string;
    aiMessage: string;
    primaryLabel: string;
    ringColor: string;
  }
> = {
  morning: {
    time: "Morning check-in · 9:41 AM",
    title: "How are you starting today?",
    subtitle: "Takes 30 seconds. Feeds your weekly patterns.",
    doneTitle: "Morning logged",
    doneSubtitle: "Streak continues. Data feeds into your 6 AM context sync.",
    aiMessage: "Energy at 6 - I'll keep your plan balanced today. Finance review is still pending; good time for this afternoon.",
    primaryLabel: "Log morning",
    ringColor: "#d4537e",
  },
  midday: {
    time: "Midday check-in · 12:30 PM",
    title: "How's the day going?",
    subtitle: "Quick pulse - 15 seconds.",
    doneTitle: "Midday noted",
    doneSubtitle: "Logged. I'll use this for your afternoon suggestions.",
    aiMessage: "Midday noted. You're past the deep work peak. Consider a short break before the afternoon session.",
    primaryLabel: "Log midday",
    ringColor: "#ba7517",
  },
  evening: {
    time: "Evening check-in · 9:00 PM",
    title: "How did today end?",
    subtitle: "Close the day. This shapes tomorrow's suggestions.",
    doneTitle: "Day closed",
    doneSubtitle: "Tomorrow's plan will reflect this. Rest well.",
    aiMessage: "Good day logged. Tomorrow I'll start with a moderate load - one deep work block and the pending Faith devotional.",
    primaryLabel: "Close the day",
    ringColor: "#9b8fff",
  },
};

const MOOD_OPTIONS = [
  { value: 1, emoji: "😔", label: "Low" },
  { value: 3, emoji: "😕", label: "Meh" },
  { value: 5, emoji: "😐", label: "Okay" },
  { value: 7, emoji: "😊", label: "Good" },
  { value: 9, emoji: "😄", label: "Great" },
] as const;

const MORNING_TAGS = ["Rested", "Anxious", "Grateful", "Tired", "Motivated", "Calm"];
const MIDDAY_TAGS = ["On track", "Focused", "Distracted", "Behind", "Overwhelmed", "Hungry", "Need a break"];
const EVENING_TAGS = ["Productive", "Restful", "Deep work", "Stressful", "Social", "Interrupted", "Faith practice"];

const DESCRIPTORS = {
  energy: ["", "Drained", "Low", "Low", "Moderate", "Moderate", "Moderate", "Good", "Good", "High", "Peak"],
  focus: ["", "Scattered", "Poor", "Poor", "Okay", "Okay", "Decent", "Good", "Sharp", "Sharp", "Laser"],
  overall: ["", "Rough", "Hard", "Hard", "Below avg", "Okay", "Okay", "Good day", "Good day", "Great day", "Best day"],
};

export function CheckinSheetScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();

  const [variant, setVariant] = useState<Variant>("morning");
  const [done, setDone] = useState(false);
  const [morningMood, setMorningMood] = useState(7);
  const [eveningMood, setEveningMood] = useState(7);
  const [morningEnergy, setMorningEnergy] = useState(6);
  const [morningFocus, setMorningFocus] = useState(8);
  const [middayEnergy, setMiddayEnergy] = useState(5);
  const [eveningOverall, setEveningOverall] = useState(7);
  const [eveningNote, setEveningNote] = useState("");
  const [activeMorningTags, setActiveMorningTags] = useState<string[]>(["Rested", "Grateful"]);
  const [activeMiddayTags, setActiveMiddayTags] = useState<string[]>(["Focused"]);
  const [activeEveningTags, setActiveEveningTags] = useState<string[]>(["Productive", "Deep work", "Faith practice"]);

  const currentVariant = VARIANTS[variant];
  const doneScores = useMemo(() => {
    if (variant === "midday") {
      return [];
    }
    if (variant === "morning") {
      return [
        { label: "Mood", value: morningMood, color: currentVariant.ringColor },
        { label: "Energy", value: morningEnergy, color: "#ba7517" },
        { label: "Focus", value: morningFocus, color: "#1d9e75" },
      ];
    }
    return [
      { label: "Mood", value: eveningMood, color: currentVariant.ringColor },
      { label: "Overall", value: eveningOverall, color: "#9b8fff" },
      { label: "Tags", value: activeEveningTags.length, color: "#1d9e75" },
    ];
  }, [
    activeEveningTags.length,
    currentVariant.ringColor,
    eveningMood,
    eveningOverall,
    morningEnergy,
    morningFocus,
    morningMood,
    variant,
  ]);

  function toggleTag(tag: string, active: string[], setActive: (value: string[] | ((current: string[]) => string[])) => void) {
    setActive((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  }

  function submit() {
    setDone(true);
  }

  function reset() {
    setDone(false);
    setVariant("morning");
  }

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.58)", justifyContent: "flex-end" }}>
      <View style={{ paddingHorizontal: 24, paddingBottom: 10, opacity: 0.3 }}>
        <Text selectable style={{ color: "#ffffff", fontFamily: "Geist", fontSize: 22, fontWeight: "700", marginBottom: 10 }}>
          Good morning, Bobie.
        </Text>
        <View style={{ height: 10, width: "65%", borderRadius: 999, backgroundColor: "#1a1a1e", marginBottom: 8 }} />
        {[0, 1].map((item) => (
          <View key={item} style={{ borderRadius: 14, backgroundColor: "rgba(26,26,30,0.96)", padding: 14, marginBottom: 8 }}>
            <View style={{ height: 9, borderRadius: 999, backgroundColor: "#222226", marginBottom: 6, width: item === 0 ? "80%" : "90%" }} />
            <View style={{ height: 9, borderRadius: 999, backgroundColor: "#222226", width: item === 0 ? "55%" : "60%" }} />
          </View>
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
            paddingBottom: 32,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: isDarkColorScheme ? "rgba(20,20,24,0.98)" : "rgba(248,248,251,0.98)",
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 14 }}>
            <View style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: theme.border }} />
          </View>

          <View style={{ alignSelf: "center", flexDirection: "row", gap: 5, backgroundColor: "rgba(20,20,24,0.96)", borderRadius: 999, padding: 4, borderWidth: 1, borderColor: theme.border, marginBottom: 14 }}>
            {([
              ["morning", "Morning"],
              ["midday", "Midday"],
              ["evening", "Evening"],
            ] as Array<[Variant, string]>).map(([item, label]) => {
              const active = item === variant;
              return (
                <Pressable
                  key={item}
                  onPress={() => {
                    setVariant(item);
                    setDone(false);
                  }}
                  style={({ pressed }) => ({
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: active ? "rgba(123, 109, 246, 0.16)" : "transparent",
                    opacity: pressed ? 0.84 : 1,
                  })}
                >
                  <Text selectable variant="small" style={{ color: active ? "#d7d1ff" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {done ? (
            <View style={{ paddingTop: 10, alignItems: "center" }}>
              <View style={{ width: 52, height: 52, borderRadius: 999, alignItems: "center", justifyContent: "center", marginBottom: 14, backgroundColor: `${currentVariant.ringColor}22`, borderWidth: 1.5, borderColor: currentVariant.ringColor }}>
                <FontAwesome name="check" size={20} color={currentVariant.ringColor} />
              </View>
              <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 18, fontWeight: "700", marginBottom: 6 }}>
                {currentVariant.doneTitle}
              </Text>
              <Text selectable variant="small" style={{ color: theme.mutedForeground, textAlign: "center", lineHeight: 20, maxWidth: 250, marginBottom: 16 }}>
                {currentVariant.doneSubtitle}
              </Text>

              {doneScores.length ? (
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                  {doneScores.map((item) => (
                    <Card key={item.label} style={{ flex: 1, borderRadius: 10, borderCurve: "continuous", padding: 10, alignItems: "center", borderWidth: 1, borderColor: theme.border }}>
                      <Text selectable style={{ color: item.color, fontFamily: "Geist", fontSize: 17, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
                        {item.value}
                      </Text>
                      <Text selectable variant="muted">
                        {item.label}
                      </Text>
                    </Card>
                  ))}
                </View>
              ) : null}

              <View style={{ width: "100%", borderRadius: 12, borderCurve: "continuous", padding: 12, backgroundColor: "rgba(123, 109, 246, 0.08)", borderWidth: 1, borderColor: "rgba(123, 109, 246, 0.18)", flexDirection: "row", gap: 8, marginBottom: 16 }}>
                <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: "#9b8fff", marginTop: 5 }} />
                <Text selectable variant="small" style={{ color: theme.primary, flex: 1, lineHeight: 18 }}>
                  {currentVariant.aiMessage}
                </Text>
              </View>

              <Button title="Back to Today" variant="outline" onPress={reset} style={{ width: "100%", borderRadius: 14, borderCurve: "continuous" }} />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
              <View style={{ paddingTop: 2 }}>
                <Text selectable variant="muted" style={{ color: theme.mutedForeground, textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700", marginBottom: 4 }}>
                  {currentVariant.time}
                </Text>
                <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 20, fontWeight: "700", lineHeight: 26, marginBottom: 4 }}>
                  {currentVariant.title}
                </Text>
                <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 19 }}>
                  {currentVariant.subtitle}
                </Text>
              </View>

              {variant !== "midday" ? (
                <>
                  <SectionLabel label={variant === "morning" ? "Mood" : "End-of-day mood"} />
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    {MOOD_OPTIONS.map((option) => {
                      const value = variant === "morning" ? morningMood : eveningMood;
                      const active = value === option.value;
                      return (
                        <Pressable
                          key={`${variant}-${option.value}`}
                          onPress={() => (variant === "morning" ? setMorningMood(option.value) : setEveningMood(option.value))}
                          style={({ pressed }) => ({
                            flex: 1,
                            borderRadius: 10,
                            borderCurve: "continuous",
                            paddingVertical: 8,
                            alignItems: "center",
                            gap: 4,
                            backgroundColor: active ? "rgba(30, 30, 40, 0.96)" : "transparent",
                            borderWidth: 1,
                            borderColor: active ? theme.border : "transparent",
                            opacity: pressed ? 0.84 : 1,
                          })}
                        >
                          <Text selectable style={{ fontSize: 22 }}>{option.emoji}</Text>
                          <Text selectable variant="muted" style={{ color: active ? theme.foreground : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              ) : null}

              {variant === "morning" ? (
                <>
                  <ScoreSlider label="Energy" value={morningEnergy} color="#ba7517" descriptor={DESCRIPTORS.energy[morningEnergy]} onChange={setMorningEnergy} icon="bolt" />
                  <ScoreSlider label="Focus" value={morningFocus} color="#1d9e75" descriptor={DESCRIPTORS.focus[morningFocus]} onChange={setMorningFocus} icon="bullseye" />
                  <TagCloud tags={MORNING_TAGS} active={activeMorningTags} onToggle={(tag) => toggleTag(tag, activeMorningTags, setActiveMorningTags)} theme={theme} />
                  <ContextNote text="You checked in every morning this week. This feeds your weekly energy pattern and the AI's planning suggestions." />
                </>
              ) : null}

              {variant === "midday" ? (
                <>
                  <SectionLabel label="Energy right now" />
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => {
                      const active = value === middayEnergy;
                      const color = value <= 4 ? "#e24b4a" : value <= 6 ? "#8ab050" : "#1d9e75";
                      const background = value <= 4 ? "rgba(226, 75, 74, 0.08)" : value <= 6 ? "rgba(138, 176, 80, 0.08)" : "rgba(29, 158, 117, 0.08)";
                      return (
                        <Pressable
                          key={`mid-${value}`}
                          onPress={() => setMiddayEnergy(value)}
                          style={({ pressed }) => ({
                            flex: 1,
                            height: 34,
                            borderRadius: 8,
                            borderCurve: "continuous",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: active ? background : theme.card,
                            borderWidth: 1,
                            borderColor: active ? `${color}66` : theme.border,
                            opacity: pressed ? 0.84 : 1,
                          })}
                        >
                          <Text selectable variant="muted" style={{ color: active ? color : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                            {value}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <TagCloud tags={MIDDAY_TAGS} active={activeMiddayTags} onToggle={(tag) => toggleTag(tag, activeMiddayTags, setActiveMiddayTags)} theme={theme} />
                  <ContextNote text="Morning: mood 7, energy 6, focus 8. You have 3 hours left in your deep work block. Finance review is still pending." />
                </>
              ) : null}

              {variant === "evening" ? (
                <>
                  <SectionLabel label="Day rating" />
                  <ScoreSlider label="Overall" value={eveningOverall} color="#9b8fff" descriptor={DESCRIPTORS.overall[eveningOverall]} onChange={setEveningOverall} icon="star" />
                  <TagCloud tags={EVENING_TAGS} active={activeEveningTags} onToggle={(tag) => toggleTag(tag, activeEveningTags, setActiveEveningTags)} theme={theme} />
                  <TextInput
                    value={eveningNote}
                    onChangeText={setEveningNote}
                    placeholder="Anything worth remembering about today..."
                    placeholderTextColor={theme.mutedForeground}
                    multiline
                    style={{
                      minHeight: 72,
                      borderRadius: 12,
                      borderCurve: "continuous",
                      borderWidth: 1,
                      borderColor: theme.border,
                      backgroundColor: theme.card,
                      color: theme.foreground,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      fontFamily: "Figtree",
                      fontSize: 14,
                      textAlignVertical: "top",
                    }}
                  />
                  <ContextNote text="Your evening rating shapes tomorrow's AI suggestions. A good day here means a fuller plan tomorrow. A low rating means a lighter start." />
                </>
              ) : null}

              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button title="Skip" variant="outline" onPress={() => router.back()} style={{ borderRadius: 14, borderCurve: "continuous", paddingHorizontal: 18 }} />
                <Button title={`${currentVariant.primaryLabel} ↗`} onPress={submit} style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }} />
              </View>
            </ScrollView>
          )}
        </Card>
      </Animated.View>
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700", color: "#666" }}>
      {label}
    </Text>
  );
}

function ScoreSlider({
  label,
  value,
  color,
  descriptor,
  onChange,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  descriptor: string;
  onChange: (value: number) => void;
  icon: IconName;
}) {
  const [trackWidth, setTrackWidth] = useState(0);

  function handleLayout(event: LayoutChangeEvent) {
    setTrackWidth(event.nativeEvent.layout.width);
  }

  function updateFromX(locationX: number) {
    if (!trackWidth) {
      return;
    }
    const next = Math.max(1, Math.min(10, Math.round((locationX / trackWidth) * 10)));
    onChange(next);
  }

  const left = trackWidth ? (trackWidth * value) / 10 : 0;

  return (
    <View style={{ marginBottom: 4 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
        <Text selectable variant="small" style={{ color: "#d0d0dc", fontFamily: "Geist", fontWeight: "700" }}>
          {label}
        </Text>
        <View style={{ alignItems: "flex-end" }}>
          <Text selectable style={{ color, fontFamily: "Geist", fontSize: 24, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
            {value}
          </Text>
          <Text selectable variant="muted" style={{ color }}>
            {descriptor}
          </Text>
        </View>
      </View>
      <View
        onLayout={handleLayout}
        onStartShouldSetResponder={() => true}
        onResponderGrant={(event) => updateFromX(event.nativeEvent.locationX)}
        onResponderMove={(event) => updateFromX(event.nativeEvent.locationX)}
        style={{ height: 48, justifyContent: "center" }}
      >
        <View style={{ position: "absolute", left: 0, right: 0, height: 8, borderRadius: 999, backgroundColor: "#1e1e22" }} />
        <View style={{ position: "absolute", left: 0, width: `${value * 10}%`, height: 8, borderRadius: 999, backgroundColor: color }} />
        <View
          style={{
            position: "absolute",
            left,
            width: 28,
            height: 28,
            borderRadius: 999,
            transform: [{ translateX: -14 }],
            backgroundColor: "#ffffff",
            borderWidth: 2.5,
            borderColor: color,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome name={icon} size={11} color={color} />
        </View>
      </View>
    </View>
  );
}

function TagCloud({
  tags,
  active,
  onToggle,
  theme,
}: {
  tags: string[];
  active: string[];
  onToggle: (tag: string) => void;
  theme: typeof NAV_THEME.light | typeof NAV_THEME.dark;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {tags.map((tag) => {
        const selected = active.includes(tag);
        return (
          <Pressable
            key={tag}
            onPress={() => onToggle(tag)}
            style={({ pressed }) => ({
              borderRadius: 999,
              borderCurve: "continuous",
              paddingHorizontal: 12,
              paddingVertical: 7,
              backgroundColor: selected ? "rgba(123, 109, 246, 0.16)" : theme.card,
              borderWidth: 1,
              borderColor: selected ? "rgba(123, 109, 246, 0.24)" : theme.border,
              opacity: pressed ? 0.84 : 1,
            })}
          >
            <Text selectable variant="small" style={{ color: selected ? "#c8c0ff" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
              {tag}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ContextNote({ text }: { text: string }) {
  return (
    <View style={{ borderRadius: 12, borderCurve: "continuous", padding: 12, backgroundColor: "rgba(123, 109, 246, 0.08)", borderWidth: 1, borderColor: "rgba(123, 109, 246, 0.18)", flexDirection: "row", gap: 8 }}>
      <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: "#9b8fff", marginTop: 5 }} />
      <Text selectable variant="small" style={{ color: "#6b5fff", flex: 1, lineHeight: 18 }}>
        {text}
      </Text>
    </View>
  );
}

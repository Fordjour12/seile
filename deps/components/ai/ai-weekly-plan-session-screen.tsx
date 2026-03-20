import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  View,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type Step = 0 | 1 | 2 | 3 | 4;
type Pace = "maintain" | "lighter" | "push";
type Intensity = "light" | "balanced" | "intensive";
type PlanItem = { title: string; domain: string; color: string; badgeBg: string; badgeText: string; time: string };
type AppTheme = (typeof NAV_THEME)[keyof typeof NAV_THEME];

const PLAN_BY_DAY: Array<{ label: string; date: string; count: string; items: PlanItem[] }> = [
  {
    label: "M",
    date: "17",
    count: "4 items",
    items: [
      { title: "Morning devotional + Bible reading", domain: "Faith", color: "#7b6df6", badgeBg: "rgba(123, 109, 246, 0.14)", badgeText: "#b8abff", time: "6:00 AM" },
      { title: "Q2 budget variance review", domain: "Finance", color: "#1fa97f", badgeBg: "rgba(31, 169, 127, 0.14)", badgeText: "#7cd9aa", time: "Priority item" },
      { title: "Life OS - Domains hub screen design", domain: "Career", color: "#2f7dd1", badgeBg: "rgba(47, 125, 209, 0.14)", badgeText: "#91bfff", time: "Deep work · AM" },
      { title: "Clear 2 deferred tasks from last week", domain: "Tasks", color: "#8a8f9c", badgeBg: "rgba(138, 143, 156, 0.14)", badgeText: "#b1b4bc", time: "Afternoon" },
    ],
  },
  {
    label: "T",
    date: "18",
    count: "3 items",
    items: [
      { title: "Prayer + gratitude journaling", domain: "Faith", color: "#7b6df6", badgeBg: "rgba(123, 109, 246, 0.14)", badgeText: "#b8abff", time: "Morning" },
      { title: "Life OS - AI tab implementation", domain: "Career", color: "#2f7dd1", badgeBg: "rgba(47, 125, 209, 0.14)", badgeText: "#91bfff", time: "Deep work" },
      { title: "30 min walk or training", domain: "Health", color: "#d07a36", badgeBg: "rgba(208, 122, 54, 0.14)", badgeText: "#f0a07b", time: "5:30 PM" },
    ],
  },
  {
    label: "W",
    date: "19",
    count: "4 items",
    items: [
      { title: "Fasting intention - full day", domain: "Faith", color: "#7b6df6", badgeBg: "rgba(123, 109, 246, 0.14)", badgeText: "#b8abff", time: "All day" },
      { title: "Life OS - Approval sheet design", domain: "Career", color: "#2f7dd1", badgeBg: "rgba(47, 125, 209, 0.14)", badgeText: "#91bfff", time: "Deep work" },
      { title: "Check in on savings goal progress", domain: "Finance", color: "#1fa97f", badgeBg: "rgba(31, 169, 127, 0.14)", badgeText: "#7cd9aa", time: "Evening" },
      { title: "Decompression walk", domain: "Wellness", color: "#d45689", badgeBg: "rgba(212, 86, 137, 0.14)", badgeText: "#f0a7c2", time: "6:30 PM" },
    ],
  },
  {
    label: "T",
    date: "20",
    count: "3 items",
    items: [
      { title: "Bible reading - Romans 9", domain: "Faith", color: "#7b6df6", badgeBg: "rgba(123, 109, 246, 0.14)", badgeText: "#b8abff", time: "Morning" },
      { title: "Life OS - Profile screen design", domain: "Career", color: "#2f7dd1", badgeBg: "rgba(47, 125, 209, 0.14)", badgeText: "#91bfff", time: "Deep work" },
      { title: "Reach out to one person", domain: "Relationships", color: "#2f7dd1", badgeBg: "rgba(47, 125, 209, 0.14)", badgeText: "#91bfff", time: "Afternoon" },
    ],
  },
  {
    label: "F",
    date: "21",
    count: "2 items",
    items: [
      { title: "Morning devotional + reflection", domain: "Faith", color: "#7b6df6", badgeBg: "rgba(123, 109, 246, 0.14)", badgeText: "#b8abff", time: "6:00 AM" },
      { title: "Life OS - wrap week, prep review", domain: "Career", color: "#2f7dd1", badgeBg: "rgba(47, 125, 209, 0.14)", badgeText: "#91bfff", time: "Light session" },
    ],
  },
];

export function AiWeeklyPlanSessionScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [pace, setPace] = useState<Pace | null>(null);
  const [domains, setDomains] = useState<string[]>(["Faith", "Career", "Finance"]);
  const [intensity, setIntensity] = useState<Intensity>("balanced");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    if (step !== 3) {
      return;
    }

    setGenerationProgress(0);
    const timeouts = [
      setTimeout(() => setGenerationProgress(1), 700),
      setTimeout(() => setGenerationProgress(2), 1500),
      setTimeout(() => setGenerationProgress(3), 2300),
      setTimeout(() => {
        setGenerationProgress(4);
        setStep(4);
      }, 3000),
    ];

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [step]);

  function nextStep() {
    if (step === 0 && !pace) {
      return;
    }
    if (step === 3 || step === 4) {
      return;
    }
    setStep((current) => (current + 1) as Step);
  }

  function previousStep() {
    if (step === 0) {
      router.back();
      return;
    }
    setStep((current) => (current - 1) as Step);
  }

  function toggleDomain(label: string) {
    setDomains((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    );
  }

  const selectedPlanDay = PLAN_BY_DAY[selectedDay];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
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
        <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 12 }}>
          <Pressable onPress={previousStep} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <FontAwesome name="chevron-left" size={12} color={theme.mutedForeground} />
            <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
              AI · Plan
            </Text>
          </Pressable>
          <View style={{ flexDirection: "row", gap: 4 }}>
            {[0, 1, 2, 3, 4].map((index) => (
              <View
                key={`pip-${index}`}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 999,
                  backgroundColor: index < step ? "#9b8fff" : index === step ? "#6b5fff" : "rgba(255,255,255,0.08)",
                }}
              />
            ))}
          </View>
          <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
            {[
              "Step 1 of 5 - Reading your context",
              "Step 2 of 5 - Choose focus areas",
              "Step 3 of 5 - Energy budget",
              "Step 4 of 5 - Generating your plan",
              "Step 5 of 5 - Review and approve",
            ][step]}
          </Text>
        </Animated.View>

        {step === 0 ? (
          <Animated.View entering={FadeInDown.delay(60).duration(420)} style={{ gap: 16 }}>
            <Card style={{ borderRadius: 22, borderCurve: "continuous", borderWidth: 1, borderColor: isDarkColorScheme ? "rgba(110, 98, 190, 0.28)" : "rgba(110, 98, 190, 0.18)", backgroundColor: isDarkColorScheme ? "rgba(19, 19, 26, 0.96)" : "rgba(244, 242, 255, 0.98)", padding: 16, gap: 14, boxShadow: theme.shadowSm }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: "#9b8fff" }} />
                <Text selectable variant="muted" style={{ color: theme.primary, textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
                  What I know heading into next week
                </Text>
              </View>
              <Text selectable style={{ color: theme.foreground, lineHeight: 22 }}>
                You finished this week strong on faith and career. Finance needs a dedicated session, energy averaged 6.2/10, and two deferred tasks still need a home next week.
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {[
                  { label: "5/7 prayer days", tone: "faith" },
                  { label: "Life OS — active build", tone: "career" },
                  { label: "Budget review deferred", tone: "finance" },
                  { label: "Avg energy 6.2", tone: "health" },
                  { label: "2 deferred tasks", tone: "warn" },
                ].map((chip) => (
                  <Badge key={chip.label} variant="subtle" color={chip.tone === "warn" ? "warning" : chip.tone === "finance" ? "success" : "primary"}>
                    {chip.label}
                  </Badge>
                ))}
              </View>
              <Pressable onPress={() => router.push("/(tabs)/ai/classic" as never)}>
                <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
                  View full context
                </Text>
              </Pressable>
            </Card>

            <Card style={{ borderRadius: 22, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 16, gap: 12, boxShadow: theme.shadowSm }}>
              <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
                Quick question
              </Text>
              <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700", lineHeight: 22 }}>
                How do you want to approach next week overall?
              </Text>
              {[
                { id: "maintain", label: "Maintain - same pace as this week" },
                { id: "lighter", label: "Lighter - I need some recovery space" },
                { id: "push", label: "Push - I want a more intensive week" },
              ].map((option) => {
                const active = pace === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setPace(option.id as Pace)}
                    style={({ pressed }) => ({
                      borderRadius: 14,
                      borderCurve: "continuous",
                      padding: 12,
                      backgroundColor: active ? "rgba(123, 109, 246, 0.16)" : "rgba(19, 19, 31, 0.96)",
                      borderWidth: 1,
                      borderColor: active ? "rgba(123, 109, 246, 0.26)" : theme.border,
                      opacity: pressed ? 0.88 : 1,
                    })}
                  >
                    <Text selectable variant="small" style={{ color: active ? "#d7d1ff" : theme.foreground }}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </Card>

            <Button title="Continue" onPress={nextStep} disabled={!pace} style={{ borderRadius: 14, borderCurve: "continuous", minHeight: 48 }} />
          </Animated.View>
        ) : null}

        {step === 1 ? (
          <Animated.View entering={FadeInDown.delay(60).duration(420)} style={{ gap: 16 }}>
            <View>
              <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground, marginBottom: 4 }}>
                Which domains get focus next week?
              </Text>
              <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                Select all that apply. I will weight your plan accordingly.
              </Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {[
                { label: "Faith", sub: "Prayer, fasting", color: "#7b6df6" },
                { label: "Career", sub: "Life OS build", color: "#2f7dd1" },
                { label: "Finance", sub: "Budget review due", color: "#1fa97f" },
                { label: "Health", sub: "Exercise, sleep", color: "#d07a36" },
                { label: "Wellness", sub: "Mood, rest", color: "#d45689" },
                { label: "Tasks", sub: "2 deferred items", color: "#8a8f9c" },
                { label: "Relationships", sub: "Connections", color: "#2f7dd1" },
                { label: "Space", sub: "Zone, decor", color: "#ba7517" },
              ].map((domain) => {
                const selected = domains.includes(domain.label);
                return (
                  <Pressable
                    key={domain.label}
                    onPress={() => toggleDomain(domain.label)}
                    style={({ pressed }) => ({
                      width: "48%",
                      minWidth: 152,
                      borderRadius: 18,
                      borderCurve: "continuous",
                      padding: 14,
                      backgroundColor: selected ? `${domain.color}18` : theme.card,
                      borderWidth: 1.5,
                      borderColor: selected ? `${domain.color}` : theme.border,
                      opacity: pressed ? 0.88 : 1,
                    })}
                  >
                    <View style={{ position: "absolute", top: 12, right: 12, width: 18, height: 18, borderRadius: 999, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: selected ? domain.color : theme.border, backgroundColor: selected ? domain.color : "transparent" }}>
                      {selected ? <FontAwesome name="check" size={9} color="#ffffff" /> : null}
                    </View>
                    <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground, marginBottom: 4 }}>
                      {domain.label}
                    </Text>
                    <Text selectable variant="muted">
                      {domain.sub}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Button title="Continue" onPress={nextStep} style={{ borderRadius: 14, borderCurve: "continuous", minHeight: 48 }} />
          </Animated.View>
        ) : null}

        {step === 2 ? (
          <Animated.View entering={FadeInDown.delay(60).duration(420)} style={{ gap: 16 }}>
            <View>
              <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground, marginBottom: 4 }}>
                What is your energy budget next week?
              </Text>
              <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                This helps distribute load across the week without burning you out.
              </Text>
            </View>
            {[
              { id: "light", title: "Light - protect my energy", desc: "2-3 priorities per day. Habits only. Space for rest and the unexpected.", color: "#1fa97f" },
              { id: "balanced", title: "Balanced - steady progress", desc: "3-4 priorities per day. Full habit stack. One deep work block daily.", color: "#d69030" },
              { id: "intensive", title: "Intensive - I want to push", desc: "4-5 priorities per day. Multiple deep work blocks. Stretch goals included.", color: "#e16969" },
            ].map((option) => {
              const active = intensity === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setIntensity(option.id as Intensity)}
                  style={({ pressed }) => ({
                    borderRadius: 18,
                    borderCurve: "continuous",
                    padding: 16,
                    backgroundColor: active ? "rgba(123, 109, 246, 0.16)" : theme.card,
                    borderWidth: 1,
                    borderColor: active ? "rgba(123, 109, 246, 0.26)" : theme.border,
                    opacity: pressed ? 0.88 : 1,
                  })}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: option.color }} />
                    <Text selectable style={{ flex: 1, fontFamily: "Geist", fontWeight: "700", color: theme.foreground }}>
                      {option.title}
                    </Text>
                    <View style={{ width: 18, height: 18, borderRadius: 999, borderWidth: 1.5, borderColor: active ? "#9b8fff" : theme.border, backgroundColor: active ? "#9b8fff" : "transparent", alignItems: "center", justifyContent: "center" }}>
                      {active ? <FontAwesome name="check" size={9} color="#0e0e10" /> : null}
                    </View>
                  </View>
                  <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                    {option.desc}
                  </Text>
                </Pressable>
              );
            })}
            <Button title="Generate my plan" onPress={() => setStep(3)} style={{ borderRadius: 14, borderCurve: "continuous", minHeight: 48 }} />
          </Animated.View>
        ) : null}

        {step === 3 ? (
          <Animated.View entering={FadeInDown.delay(60).duration(420)} style={{ gap: 16, alignItems: "center", paddingTop: 24 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                borderWidth: 3,
                borderColor: "rgba(255,255,255,0.08)",
                borderTopColor: "#9b8fff",
                transform: [{ rotate: `${generationProgress * 40}deg` }],
              }}
            />
            <Text selectable style={{ fontFamily: "Geist", fontSize: 18, fontWeight: "700", color: theme.foreground }}>
              Building your week
            </Text>
            <Text selectable variant="small" style={{ color: theme.mutedForeground, textAlign: "center" }}>
              Reading your context and distributing priorities across 5 days.
            </Text>
            {[
              "Read last 7 days of userContext",
              "Scored domain health across 8 areas",
              "Distributing priorities by load + energy",
              "Slotting habits and recurring items",
              "Generating week summary",
            ].map((label, index) => (
              <Card key={label} style={{ width: "100%", borderRadius: 14, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 12, backgroundColor: index <= generationProgress ? "rgba(123, 109, 246, 0.08)" : theme.card }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: index < generationProgress ? "#1fa97f" : index === generationProgress ? "#9b8fff" : "rgba(255,255,255,0.1)",
                    }}
                  />
                  <Text selectable variant="small" style={{ color: index === generationProgress ? "#d7d1ff" : theme.mutedForeground }}>
                    {label}
                  </Text>
                </View>
              </Card>
            ))}
          </Animated.View>
        ) : null}

        {step === 4 ? (
          <Animated.View entering={FadeInDown.delay(60).duration(420)} style={{ gap: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Badge variant="subtle" color="primary">
                Draft plan · Mar 17-23
              </Badge>
              <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                Review and adjust
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {PLAN_BY_DAY.map((day, index) => {
                const selected = index === selectedDay;
                return (
                  <Pressable
                    key={`${day.label}-${day.date}`}
                    onPress={() => setSelectedDay(index)}
                    style={({ pressed }) => ({
                      borderRadius: 14,
                      borderCurve: "continuous",
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      alignItems: "center",
                      backgroundColor: selected ? "rgba(123, 109, 246, 0.16)" : theme.card,
                      borderWidth: 1,
                      borderColor: selected ? "rgba(123, 109, 246, 0.24)" : theme.border,
                      opacity: pressed ? 0.88 : 1,
                    })}
                  >
                    <Text selectable variant="muted" style={{ color: selected ? "#b8abff" : theme.mutedForeground }}>
                      {day.label}
                    </Text>
                    <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: selected ? "#d7d1ff" : theme.foreground }}>
                      {day.date}
                    </Text>
                    <Text selectable variant="muted">
                      {day.count}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={{ gap: 8 }}>
              {selectedPlanDay.items.map((item) => (
                <Card key={`${selectedPlanDay.date}-${item.title}`} style={{ borderRadius: 18, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 14, gap: 8, boxShadow: theme.shadowSm }}>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <View style={{ width: 4, alignSelf: "stretch", borderRadius: 999, backgroundColor: item.color }} />
                    <View style={{ flex: 1 }}>
                      <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground }}>
                        {item.title}
                      </Text>
                      <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                        <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: item.badgeBg }}>
                          <Text selectable variant="muted" style={{ color: item.badgeText, fontFamily: "Geist", fontWeight: "700" }}>
                            {item.domain}
                          </Text>
                        </View>
                        <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                          {item.time}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                        <Pressable onPress={() => router.push("/(tabs)/ai/classic" as never)} style={({ pressed }) => ({ borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, opacity: pressed ? 0.84 : 1 })}>
                          <Text selectable variant="small" style={{ color: theme.foreground }}>
                            Move
                          </Text>
                        </Pressable>
                        <Pressable onPress={() => {}} style={({ pressed }) => ({ borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "rgba(225, 105, 105, 0.08)", borderWidth: 1, borderColor: "rgba(225, 105, 105, 0.18)", opacity: pressed ? 0.84 : 1 })}>
                          <Text selectable variant="small" style={{ color: "#e16969" }}>
                            Remove
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </View>

            <Card style={{ borderRadius: 18, borderCurve: "continuous", borderWidth: 1, borderColor: "rgba(123, 109, 246, 0.24)", backgroundColor: "rgba(30, 26, 48, 0.96)", padding: 16, gap: 12 }}>
              <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: "#d7d1ff" }}>
                Ready to approve this plan?
              </Text>
              <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                {selectedPlanDay.count} on {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][selectedDay]} · 16 total across the week
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button title="Approve plan" onPress={() => router.push("/(tabs)/ai/resume-plan" as never)} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
                <Button title="Adjust" variant="outline" onPress={() => setStep(2)} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
              </View>
            </Card>
          </Animated.View>
        ) : null}
      </ScrollView>
    </View>
  );
}

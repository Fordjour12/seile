import { useState } from "react";
import { Alert as RNAlert, Pressable, ScrollView, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import Animated, { LinearTransition } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { Container } from "@/components/container";
import {
  AnimatedProgressBar,
  AnimatedStage,
} from "@/components/auth/onboarding-flow-motion";
import { useAuth } from "@/lib/auth-context";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type WeekDay = "day2" | "day3" | "day4" | "day5" | "day6" | "day7";

const DAY_META: Record<
  WeekDay,
  {
    badge: string;
    date: string;
    title: string;
    sub: string;
    aiLabel: string;
    aiText: string;
    progress: number;
    progressText: string;
    progressSub: string;
  }
> = {
  day2: {
    badge: "Day 2",
    date: "Tuesday · Mar 3",
    title: "Morning, Bobie.",
    sub: "I'm still building your picture. Keep logging.",
    aiLabel: "From AI · day 2",
    aiText: "Yesterday you logged prayer and completed 2 priorities. That is enough for me to know you are a morning person with a faith practice.",
    progress: 14,
    progressText: "Day 2 of 7",
    progressSub: "After 7 days I will have enough to generate your first full personalized week plan.",
  },
  day3: {
    badge: "Day 3",
    date: "Wednesday · Mar 4",
    title: "Two days down.",
    sub: "I noticed something already.",
    aiLabel: "First pattern",
    aiText: "Both mornings you logged prayer before 7 AM and your energy check-in was 7 or above. I will keep watching the pattern.",
    progress: 36,
    progressText: "Day 3 of 7",
    progressSub: "I am starting to see patterns and faith is becoming your anchor.",
  },
  day4: {
    badge: "Day 4",
    date: "Thursday · Mar 5",
    title: "Getting clearer.",
    sub: "I have enough to make a first real suggestion.",
    aiLabel: "First suggestion",
    aiText: "Your energy on prayer mornings averages 7.2. Want me to lock in morning prayer as a non-negotiable habit?",
    progress: 43,
    progressText: "Day 4 of 7",
    progressSub: "Three more days until your first full personalized week plan. I now understand your energy patterns and faith rhythm.",
  },
  day5: {
    badge: "Day 5",
    date: "Friday · Mar 6",
    title: "Something new today.",
    sub: "I want to make a change, but only with your permission.",
    aiLabel: "Your first AI proposal",
    aiText: "Based on 4 days of data, your morning spiritual routine is your strongest anchor. I would like to add it to your weekly plan as a recurring block.",
    progress: 57,
    progressText: "Day 5 of 7",
    progressSub: "This is your first approval moment. The AI will never make changes without showing you this first.",
  },
  day6: {
    badge: "Day 6",
    date: "Saturday · Mar 7",
    title: "Five days straight.",
    sub: "That's a real streak, not a lucky start.",
    aiLabel: "What I now know",
    aiText: "Morning faith practice is your anchor. Deep work is best between 9 and 11 AM. Energy dips after 2 PM.",
    progress: 71,
    progressText: "Day 6 of 7",
    progressSub: "You now have real streaks, real domains, and enough signal for stronger suggestions.",
  },
  day7: {
    badge: "Day 7 ✓",
    date: "Sunday · Mar 8",
    title: "One week in, Bobie.",
    sub: "I know you well enough now. Here's what I found.",
    aiLabel: "Week 2 plan · ready",
    aiText: "I've generated your first full personalized week plan. It's built around your real patterns, not templates.",
    progress: 100,
    progressText: "Complete ✓",
    progressSub: "Full personalized context active. Suggestions, plans, and insights now come from your actual patterns.",
  },
};

export function OnboardingWeek1Screen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const { completeOnboarding } = useAuth();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const [day, setDay] = useState<WeekDay>("day2");
  const current = DAY_META[day];

  function showStub(title: string, message: string) {
    RNAlert.alert(title, message);
  }

  async function handleFinishSetup() {
    await completeOnboarding();
    router.replace("/(tabs)");
  }

  return (
    <Container>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.lg,
          paddingBottom: 32,
          gap: 16,
        }}
      >
        <Animated.View
          layout={LinearTransition.springify().damping(20).stiffness(180)}
          style={{ gap: 10 }}
        >
          <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
            Onboarding week 1
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {([
              ["day2", "Day 2"],
              ["day3", "Day 3"],
              ["day4", "Day 4"],
              ["day5", "Day 5"],
              ["day6", "Day 6"],
              ["day7", "Day 7"],
            ] as Array<[WeekDay, string]>).map(([id, label]) => {
              const active = day === id;
              return (
                <Animated.View
                  key={id}
                  layout={LinearTransition.springify().damping(20).stiffness(180)}
                >
                  <Pressable
                    onPress={() => setDay(id)}
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
                      {label}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </ScrollView>
        </Animated.View>

        <AnimatedStage stageKey={`week-1-${day}`} style={{ gap: 16 }}>
          <View style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
              Today
            </Text>
            <Badge color="primary">{current.badge}</Badge>
          </View>
          <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
            {current.date}
          </Text>
          <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 26, fontWeight: "700", lineHeight: 32 }}>
            {current.title}
          </Text>
          <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
            {current.sub}
          </Text>
          </View>

          <Card
            style={{
              borderRadius: 20,
              borderCurve: "continuous",
              padding: 16,
              gap: 12,
              borderWidth: 1,
              borderColor: "rgba(61, 53, 112, 0.28)",
              backgroundColor: isDarkColorScheme ? "rgba(19, 19, 31, 0.96)" : "rgba(244, 242, 255, 0.98)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: "#9b8fff" }} />
              <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                {current.aiLabel}
              </Text>
            </View>
            <Text selectable variant="small" style={{ color: isDarkColorScheme ? "#b4b4c6" : "#5f5f7c", lineHeight: 22 }}>
              {current.aiText}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {day === "day2" ? (
                <>
                  <MiniChip label="Adjust timing" onPress={() => showStub("Adjust timing", "This preview would let the user move the default deep work block.")} />
                  <MiniChip label="Looks right" onPress={() => showStub("Looks right", "This preview would confirm the learned timing.")} />
                </>
              ) : null}
              {day === "day4" ? (
                <>
                  <MiniChip label="Yes · lock it in" onPress={() => showStub("Morning prayer", "This preview would create the recurring habit suggestion.")} />
                  <MiniChip label="Not yet" onPress={() => showStub("Observation mode", "The AI would keep watching before making it permanent.")} />
                </>
              ) : null}
              {day === "day7" ? (
                <>
                  <MiniChip label="Open week plan" onPress={() => showStub("Week 2 plan", "This preview would open the first personalized week plan.")} />
                  <MiniChip label="What you learned" onPress={() => showStub("Week 1 insights", "This preview would explain the full first-week learning summary.")} />
                </>
              ) : null}
            </View>
          </Card>

          <Card style={{ borderRadius: 16, borderCurve: "continuous", padding: 14, gap: 8, borderWidth: 1, borderColor: theme.border }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                AI context
              </Text>
              <Text selectable variant="muted" style={{ color: day === "day7" ? "#1d9e75" : theme.mutedForeground }}>
                {current.progressText}
              </Text>
            </View>
            <AnimatedProgressBar progress={current.progress} trackColor={theme.border} fillColor="#9b8fff" />
            <Text selectable variant="muted" style={{ color: theme.mutedForeground, lineHeight: 18 }}>
              {current.progressSub}
            </Text>
          </Card>

        {day === "day2" ? (
          <>
            <SectionTitle label="Today's priorities" />
            <PriorityCard title="Morning devotional + prayer" domain="Faith" domainColor="#b4adf5" domainBackground="#2a2040" note="6:00 AM · suggested" />
            <PriorityCard title="Log your morning check-in" domain="Wellness" domainColor="#ed93b1" domainBackground="#2a1020" note="Helps AI learn" />
            <PromptCard title="Check-in · 30 seconds" subtitle="Mood, energy, focus · feeds AI learning" accent="#d4537e" onPress={() => showStub("Morning check-in", "This preview would launch the day 2 morning check-in.")} />
          </>
        ) : null}

        {day === "day3" ? (
          <>
            <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 14, gap: 8, borderWidth: 1, borderColor: theme.border }}>
              <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                What I know so far
              </Text>
              {[
                { label: "Prayer logged both mornings · streak started", color: "#534AB7", isNew: false },
                { label: "Deep work active · 2 sessions logged", color: "#185FA5", isNew: false },
                { label: "Energy avg 7.0 · mood avg 7.5", color: "#9b8fff", isNew: true },
              ].map((item) => (
                <View key={item.label} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: item.color }} />
                  <Text selectable variant="small" style={{ color: theme.mutedForeground, flex: 1 }}>
                    {item.label}
                  </Text>
                  {item.isNew ? <Badge variant="outline" color="secondary">new</Badge> : null}
                </View>
              ))}
            </Card>
            <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 14, gap: 8, borderWidth: 1, borderColor: theme.border }}>
              <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                Today's habits
              </Text>
              {[
                ["Prayer", "#534AB7", "Faith"],
                ["Water · 2L", "#0F6E56", "Health"],
                ["Gratitude log", "#534AB7", "Faith"],
              ].map(([label, color, domain]) => (
                <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 }}>
                  <View style={{ width: 20, height: 20, borderRadius: 999, borderWidth: 1.5, borderColor: color as string }} />
                  <Text selectable variant="small" style={{ color: theme.foreground, flex: 1, fontFamily: "Geist", fontWeight: "700" }}>
                    {label}
                  </Text>
                  <Badge variant="outline" color="secondary">{domain}</Badge>
                </View>
              ))}
            </Card>
          </>
        ) : null}

        {day === "day4" ? (
          <>
            <SetupCard title="Set up Finance domain" subtitle="Add a budget cap to unlock spending insights" badge="+ Setup" accent="#6fcf97" background="#1a2a1e" onPress={() => showStub("Finance setup", "This preview would open the first Finance setup flow.")} />
            <SetupCard title="Log first training session" subtitle="Activate the Health domain" badge="+ Activate" accent="#f0997b" background="#2a1510" onPress={() => showStub("Health setup", "This preview would activate the Health domain.")} />
          </>
        ) : null}

        {day === "day5" ? (
          <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 16, gap: 10, borderWidth: 1, borderColor: "rgba(61, 53, 112, 0.28)", backgroundColor: isDarkColorScheme ? "rgba(26,26,36,0.98)" : "rgba(245,242,255,0.98)" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: "#2a2040" }}>
                <FontAwesome name="bullseye" size={13} color="#9b8fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text selectable variant="small" style={{ color: "#c8c0ff", fontFamily: "Geist", fontWeight: "700" }}>
                  Your first AI proposal
                </Text>
                <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                  Faith · schedule routine
                </Text>
              </View>
            </View>
            <Text selectable variant="small" style={{ color: isDarkColorScheme ? "#b4b4c6" : "#5f5f7c", lineHeight: 22 }}>
              Based on 4 days of data, your morning spiritual routine is your strongest anchor. I would like to add it to your weekly plan as a recurring block.
            </Text>
            <Card style={{ borderRadius: 12, borderCurve: "continuous", padding: 12, gap: 4, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card }}>
              <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                What will be added
              </Text>
              <Text selectable variant="small" style={{ color: theme.foreground }}>
                Prayer + devotional + Bible reading
              </Text>
              <Text selectable variant="small" style={{ color: theme.foreground }}>
                6:00–6:45 AM · Mon–Fri · recurring
              </Text>
              <Text selectable variant="small" style={{ color: theme.primary }}>
                Based on 4 days of check-in + faith log data
              </Text>
            </Card>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button title="Approve" onPress={() => showStub("Approved", "This preview would approve the first AI proposal.")} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
              <Button title="Not yet" variant="outline" onPress={() => showStub("Not yet", "This preview would defer the first AI proposal.")} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
            </View>
          </Card>
        ) : null}

        {day === "day6" ? (
          <>
            <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 18, gap: 8, alignItems: "center", borderWidth: 1, borderColor: "rgba(61, 53, 112, 0.28)", backgroundColor: isDarkColorScheme ? "rgba(30, 26, 48, 0.96)" : "rgba(245,242,255,0.98)" }}>
              <Text selectable style={{ fontSize: 30 }}>🔥</Text>
              <Text selectable style={{ color: "#c8c0ff", fontFamily: "Geist", fontWeight: "700" }}>
                5-day check-in streak
              </Text>
              <Text selectable variant="small" style={{ color: theme.primary, textAlign: "center", lineHeight: 20 }}>
                Every morning, every check-in. Your consistency is what makes the AI useful.
              </Text>
            </Card>
            <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 14, gap: 8, borderWidth: 1, borderColor: theme.border }}>
              <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                What I now know about you
              </Text>
              {[
                { label: "Morning faith practice is your anchor", color: "#534AB7", isNew: false },
                { label: "Deep work best 9–11 AM", color: "#185FA5", isNew: false },
                { label: "Energy pattern: high morning, dip after 2 PM", color: "#9b8fff", isNew: true },
                { label: "Finance domain active · budget set at GHc 4,000", color: "#0F6E56", isNew: true },
                { label: "Health domain: 1 training session logged", color: "#993C1D", isNew: true },
              ].map((item) => (
                <View key={item.label} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: item.color }} />
                  <Text selectable variant="small" style={{ color: theme.mutedForeground, flex: 1 }}>
                    {item.label}
                  </Text>
                  {item.isNew ? <Badge variant="outline" color="secondary">new</Badge> : null}
                </View>
              ))}
            </Card>
            <SetupCard title="Add to Relationships" subtitle="Who matters most to you right now?" badge="+ Add" accent="#85b7eb" background="#0e1420" onPress={() => showStub("Relationships", "This preview would open the first Relationships setup.")} />
          </>
        ) : null}

        {day === "day7" ? (
          <>
            <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 16, gap: 10, borderWidth: 1, borderColor: "rgba(61, 53, 112, 0.28)", backgroundColor: isDarkColorScheme ? "rgba(26,26,36,0.98)" : "rgba(245,242,255,0.98)" }}>
              <Text selectable style={{ color: "#c8c0ff", fontFamily: "Geist", fontWeight: "700" }}>
                Your first week
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <WeekStat value="7" label="Check-ins" color="#1d9e75" />
                <WeekStat value="6" label="Prayer days" color="#9b8fff" />
                <WeekStat value="14" label="Tasks done" color="#85b7eb" />
                <WeekStat value="1" label="Approval" color="#b4adf5" />
              </View>
              <Text selectable variant="small" style={{ color: theme.primary, lineHeight: 20 }}>
                Faith is your strongest domain. Career is your most active. Your morning is your best time and everything next week will protect it.
              </Text>
            </Card>
            <Button
              title="Finish setup"
              onPress={() => {
                void handleFinishSetup();
              }}
              style={{ borderRadius: 14, borderCurve: "continuous" }}
            />
          </>
        ) : null}
        </AnimatedStage>
      </ScrollView>
    </Container>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <Text selectable variant="muted" style={{ color: "#666", fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
      {label}
    </Text>
  );
}

function MiniChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: "#1e1a30", borderWidth: 1, borderColor: "#3d3570", opacity: pressed ? 0.84 : 1 })}>
      <Text selectable variant="small" style={{ color: "#9b8fff", fontFamily: "Geist", fontWeight: "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function PriorityCard({
  title,
  domain,
  domainColor,
  domainBackground,
  note,
}: {
  title: string;
  domain: string;
  domainColor: string;
  domainBackground: string;
  note: string;
}) {
  return (
    <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 14, borderWidth: 1, borderColor: "rgba(42,42,46,0.9)", flexDirection: "row", gap: 12 }}>
      <View style={{ width: 22, height: 22, borderRadius: 999, borderWidth: 1.5, borderColor: domainColor, marginTop: 2 }} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text selectable style={{ color: "#d0d0dc", fontFamily: "Geist", fontWeight: "700" }}>
          {title}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: domainBackground }}>
            <Text selectable variant="muted" style={{ color: domainColor, fontFamily: "Geist", fontWeight: "700" }}>
              {domain}
            </Text>
          </View>
          <Text selectable variant="muted" style={{ color: "#444" }}>
            {note}
          </Text>
        </View>
      </View>
    </Card>
  );
}

function PromptCard({
  title,
  subtitle,
  accent,
  onPress,
}: {
  title: string;
  subtitle: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      <Card style={{ borderRadius: 16, borderCurve: "continuous", padding: 14, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: `${accent}55`, backgroundColor: `${accent}12` }}>
        <View style={{ width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: `${accent}18` }}>
          <FontAwesome name="smile-o" size={14} color={accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text selectable variant="small" style={{ color: accent, fontFamily: "Geist", fontWeight: "700" }}>
            {title}
          </Text>
          <Text selectable variant="muted" style={{ color: "#666", marginTop: 2 }}>
            {subtitle}
          </Text>
        </View>
        <Text selectable style={{ color: "#555", fontSize: 16 }}>›</Text>
      </Card>
    </Pressable>
  );
}

function SetupCard({
  title,
  subtitle,
  badge,
  accent,
  background,
  onPress,
}: {
  title: string;
  subtitle: string;
  badge: string;
  accent: string;
  background: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      <Card style={{ borderRadius: 16, borderCurve: "continuous", padding: 14, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "rgba(30,30,34,0.9)" }}>
        <View style={{ width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: background }}>
          <View style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: accent }} />
        </View>
        <View style={{ flex: 1 }}>
          <Text selectable variant="small" style={{ color: "#ccccd8", fontFamily: "Geist", fontWeight: "700" }}>
            {title}
          </Text>
          <Text selectable variant="muted" style={{ color: "#555", marginTop: 2 }}>
            {subtitle}
          </Text>
        </View>
        <View style={{ borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: background }}>
          <Text selectable variant="muted" style={{ color: accent, fontFamily: "Geist", fontWeight: "700" }}>
            {badge}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

function WeekStat({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <Card style={{ flex: 1, borderRadius: 12, borderCurve: "continuous", padding: 10, alignItems: "center", backgroundColor: "rgba(20,20,32,0.96)" }}>
      <Text selectable style={{ color, fontFamily: "Geist", fontSize: 18, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
      <Text selectable variant="muted" style={{ color: "#666", textAlign: "center" }}>
        {label}
      </Text>
    </Card>
  );
}

import { useState } from "react";
import { Alert as RNAlert, Pressable, ScrollView, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type FirstRunState = "day1Morning" | "day1Evening" | "day3Morning";

const STATE_META: Record<
  FirstRunState,
  {
    label: string;
    chip: string;
    greeting: string;
    sub: string;
    aiLabel: string;
    aiBadge?: string;
    aiText: string;
    progressLabel: string;
    progressSub: string;
    progress: number;
  }
> = {
  day1Morning: {
    label: "Day 1 Morning",
    chip: "State 1 · First open",
    greeting: "Good morning,\nBobie.",
    sub: "Day 1. Let's start simply.",
    aiLabel: "Your AI · first message",
    aiBadge: "Day 1 of 7",
    aiText:
      "I do not know much about you yet, and that is the right place to start. Log your first check-in, complete one priority, and I will begin building your picture.",
    progressLabel: "AI learning",
    progressSub: "Complete your first check-in and priority to begin. Full personalized suggestions arrive after 7 days.",
    progress: 2,
  },
  day1Evening: {
    label: "Day 1 Evening",
    chip: "State 2 · End of day 1",
    greeting: "Good evening,\nBobie.",
    sub: "Day 1 wrapping up. You made a start.",
    aiLabel: "End of day 1",
    aiText:
      "You logged prayer, completed 2 priorities, and did your first check-in. That is enough for me to make my first small adjustment.",
    progressLabel: "AI learning",
    progressSub: "Good start. Six more days of check-ins and the full picture comes together.",
    progress: 14,
  },
  day3Morning: {
    label: "Day 3 Morning",
    chip: "State 3 · Day 3 morning",
    greeting: "Good morning,\nBobie.",
    sub: "Day 3. I noticed something.",
    aiLabel: "First pattern",
    aiBadge: "Day 3",
    aiText:
      "Both mornings you logged prayer before 7 AM and your energy was above 7. Yesterday when prayer was later, energy dropped to 5. Want me to protect that morning slot?",
    progressLabel: "AI learning",
    progressSub: "Four more days until your first full personalized plan. I am starting to see patterns and faith is your anchor.",
    progress: 36,
  },
};

export function FirstRunTodayScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [state, setState] = useState<FirstRunState>("day1Morning");
  const current = STATE_META[state];

  function showStub(title: string, message: string) {
    RNAlert.alert(title, message);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.lg,
          paddingBottom: 120,
          gap: 16,
        }}
      >
        <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 10 }}>
          <Text selectable variant="muted" style={{ color: theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
            {current.chip}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {([
              ["day1Morning", "Day 1 AM"],
              ["day1Evening", "Day 1 PM"],
              ["day3Morning", "Day 3"],
            ] as Array<[FirstRunState, string]>).map(([id, label]) => {
              const active = state === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => setState(id)}
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
              );
            })}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(40).duration(420)} style={{ gap: 6 }}>
          <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 28, fontWeight: "700", lineHeight: 32 }}>
            {current.greeting}
          </Text>
          <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
            {current.sub}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(420)}>
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
              {current.aiBadge ? <Badge variant="outline" color="secondary">{current.aiBadge}</Badge> : null}
            </View>
            <Text selectable variant="small" style={{ color: isDarkColorScheme ? "#b4b4c6" : "#5f5f7c", lineHeight: 22 }}>
              {current.aiText}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {state === "day1Morning" ? (
                <>
                  <MiniChip label="Start check-in" onPress={() => showStub("First check-in", "This preview will later open the real check-in flow.")} />
                  <MiniChip label="How you learn" onPress={() => showStub("AI learning", "This preview explains the seven-day ramp into personalized context.")} />
                </>
              ) : null}
              {state === "day1Evening" ? (
                <>
                  <MiniChip label="Looks right" onPress={() => showStub("Morning block", "The AI would keep the 6 AM default if you approve it.")} />
                  <MiniChip label="Adjust timing" onPress={() => showStub("Adjust timing", "This preview will later open the adjustment flow.")} />
                </>
              ) : null}
              {state === "day3Morning" ? (
                <>
                  <MiniChip label="Lock it in" onPress={() => showStub("Morning prayer", "This preview would create the recurring protected prayer block.")} />
                  <MiniChip label="Keep watching" onPress={() => showStub("Observation mode", "The AI would keep observing before turning the pattern into a suggestion.")} />
                </>
              ) : null}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(90).duration(420)}>
          <Card style={{ borderRadius: 16, borderCurve: "continuous", padding: 14, gap: 8, borderWidth: 1, borderColor: theme.border }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                {current.progressLabel}
              </Text>
              <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                {state === "day1Evening" ? "Day 1 complete" : state === "day3Morning" ? "Day 3 of 7" : "Day 1 of 7"}
              </Text>
            </View>
            <View style={{ height: 4, borderRadius: 999, backgroundColor: theme.border, overflow: "hidden" }}>
              <View style={{ width: `${current.progress}%`, height: "100%", borderRadius: 999, backgroundColor: "#9b8fff" }} />
            </View>
            <Text selectable variant="muted" style={{ color: theme.mutedForeground, lineHeight: 18 }}>
              {current.progressSub}
            </Text>
          </Card>
        </Animated.View>

        {state === "day1Morning" ? (
          <>
            <SectionTitle label="Suggested to start" subtitle="From your setup" />
            <TaskCard title="Morning devotional + prayer" domain="Faith" domainColor="#b4adf5" domainBackground="#2a2040" note="Suggested · from your setup" onPress={() => showStub("Faith start", "This would log the first Faith action.")} />
            <TaskCard title="Log your first check-in" domain="Wellness" domainColor="#ed93b1" domainBackground="#2a1020" note="Teaches AI your patterns" onPress={() => showStub("First check-in", "This would launch the first wellness check-in.")} />
            <TaskCard title="Set your first budget cap" domain="Finance" domainColor="#6fcf97" domainBackground="#1a2a1e" note="Unlocks Finance insights" onPress={() => showStub("Finance setup", "This would open the first Finance setup flow.")} />

            <SectionTitle label="Habits" />
            <Card style={{ borderRadius: 16, borderCurve: "continuous", padding: 14, flexDirection: "row", gap: 12, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card }}>
              <View style={{ width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: theme.border, borderStyle: "dashed", alignItems: "center", justifyContent: "center" }}>
                <FontAwesome name="plus" size={14} color={theme.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                  No habits yet
                </Text>
                <Text selectable variant="muted" style={{ color: theme.mutedForeground, marginTop: 2 }}>
                  Add a habit and it will appear here every day.
                </Text>
              </View>
            </Card>

            <SectionTitle label="Activate domains" />
            <SetupCard title="Career" subtitle="Add a project or goal to activate" badge="+ Setup" accent="#85b7eb" background="#1a1e2a" onPress={() => showStub("Career setup", "This would activate Career with the first project or goal.")} />
            <SetupCard title="Health" subtitle="Log a session to activate" badge="+ Setup" accent="#f0997b" background="#2a1510" onPress={() => showStub("Health setup", "This would activate Health with the first training session.")} />
          </>
        ) : null}

        {state === "day1Evening" ? (
          <>
            <SectionTitle label="Day 1 snapshot" />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <MetricBox value="2" label="Done" color="#1d9e75" />
              <MetricBox value="1" label="Check-in" color="#9b8fff" />
              <MetricBox value="1" label="Prayer" color="#b4adf5" />
              <MetricBox value="5" label="Days left" color="#ba7517" />
            </View>

            <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 16, gap: 10, borderWidth: 1, borderColor: "rgba(84, 16, 48, 0.6)", backgroundColor: "rgba(26, 16, 32, 0.96)" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#d4537e" }} />
                <Text selectable variant="small" style={{ color: "#d4537e", fontFamily: "Geist", fontWeight: "700" }}>
                  Evening check-in
                </Text>
                <Badge variant="outline" color="secondary">30 seconds</Badge>
              </View>
              <Text selectable variant="small" style={{ color: "#a08090", lineHeight: 20 }}>
                How did day 1 end? Your answer shapes tomorrow&apos;s suggestions.
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <MetricBox value="3/5" label="Mood" color="#ed93b1" dark />
                <MetricBox value="2/5" label="Energy" color="#ba7517" dark />
                <MetricBox value="4/5" label="Ready" color="#9b8fff" dark />
              </View>
              <Button title="Close the day" onPress={() => showStub("Day closed", "This preview would submit the first evening check-in.")} style={{ borderRadius: 12, borderCurve: "continuous" }} />
            </Card>
          </>
        ) : null}

        {state === "day3Morning" ? (
          <>
            <SectionTitle label="Today · 3 priorities" />
            <TaskCard title="Morning prayer" domain="Faith" domainColor="#b4adf5" domainBackground="#2a2040" note="AI-suggested · energy pattern" onPress={() => showStub("Morning prayer", "This would log the first AI-informed priority.")} />
            <TaskCard title="Life OS · schema design" domain="Career" domainColor="#85b7eb" domainBackground="#1a1e2a" note="9:00 AM · deep work" onPress={() => showStub("Career focus", "This would open the morning deep work block.")} />
            <TaskCard title="Morning check-in" domain="Wellness" domainColor="#ed93b1" domainBackground="#2a1020" note="Feeds AI learning · day 3" onPress={() => showStub("Morning check-in", "This would launch the day 3 morning check-in.")} />

            <SectionTitle label="Habits · 2 active" />
            <Card style={{ borderRadius: 16, borderCurve: "continuous", padding: 14, borderWidth: 1, borderColor: theme.border }}>
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {[
                  ["Prayer", "#534AB7"],
                  ["Water · 2L", "#0F6E56"],
                  ["+ Add habit", "#44444f"],
                ].map(([label, color]) => (
                  <Pressable
                    key={label}
                    onPress={() => showStub("Habit preview", "This preview would open the habit action for the selected item.")}
                    style={({ pressed }) => ({
                      borderRadius: 999,
                      borderCurve: "continuous",
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      backgroundColor: theme.card,
                      borderWidth: 1,
                      borderColor: theme.border,
                      opacity: pressed ? 0.84 : 1,
                    })}
                  >
                    <Text selectable variant="small" style={{ color, fontFamily: "Geist", fontWeight: "700" }}>
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Card>
          </>
        ) : null}
      </ScrollView>

      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: UI_PRESETS.spacing.section, paddingTop: 10, paddingBottom: 28, backgroundColor: theme.background, borderTopWidth: 1, borderTopColor: theme.border }}>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          {[
            { label: "Today", active: true },
            { label: "Planner", active: false },
            { label: "Domains", active: false },
            { label: "AI", active: false },
            { label: "Profile", active: false },
          ].map((item) => (
            <View key={item.label} style={{ alignItems: "center", gap: 4, opacity: item.active ? 1 : 0.42 }}>
              <View style={{ width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: item.active ? "rgba(123, 109, 246, 0.16)" : theme.card }}>
                <FontAwesome name={item.label === "Today" ? "th-large" : item.label === "Planner" ? "list-alt" : item.label === "Domains" ? "bullseye" : item.label === "AI" ? "commenting-o" : "user-o"} size={12} color={item.active ? "#9b8fff" : theme.mutedForeground} />
              </View>
              <Text selectable variant="muted" style={{ color: item.active ? "#9b8fff" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function SectionTitle({ label, subtitle }: { label: string; subtitle?: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <Text selectable variant="muted" style={{ color: "#666", fontFamily: "Geist", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
        {label}
      </Text>
      {subtitle ? <Text selectable variant="muted" style={{ color: "#555" }}>{subtitle}</Text> : null}
    </View>
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

function TaskCard({
  title,
  domain,
  domainColor,
  domainBackground,
  note,
  onPress,
}: {
  title: string;
  domain: string;
  domainColor: string;
  domainBackground: string;
  note: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 14, borderWidth: 1, borderColor: "rgba(42, 42, 46, 0.9)", flexDirection: "row", gap: 12 }}>
        <View style={{ width: 22, height: 22, borderRadius: 999, borderWidth: 1.5, borderColor: domainColor, opacity: 0.6, marginTop: 2 }} />
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
        <Text selectable style={{ color: "#333", fontSize: 16 }}>›</Text>
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

function MetricBox({
  value,
  label,
  color,
  dark = false,
}: {
  value: string;
  label: string;
  color: string;
  dark?: boolean;
}) {
  return (
    <Card style={{ flex: 1, borderRadius: 12, borderCurve: "continuous", padding: 10, alignItems: "center", backgroundColor: dark ? "rgba(30,16,32,0.96)" : "rgba(20,20,24,0.96)" }}>
      <Text selectable style={{ color, fontFamily: "Geist", fontSize: 18, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
      <Text selectable variant="muted" style={{ color: dark ? "#7a6270" : "#555", textAlign: "center" }}>
        {label}
      </Text>
    </Card>
  );
}

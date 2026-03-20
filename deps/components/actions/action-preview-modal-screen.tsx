import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button, Card, Text } from "@/components";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type PreviewScenario = "plan" | "budget" | "faith";

const SCENARIOS = {
  plan: {
    banner: "Generating your week plan",
    step: "3 of 5",
    statusColor: "#9b8fff",
    previewRows: [],
    context: [
      ["userContext.faith", "prayer streak, fasting pattern"],
      ["userContext.career", "deep work blocks, task backlog"],
      ["userContext.wellness", "avg energy 6.2 -> lighter load"],
      ["userContext.finance", "review deferred -> Monday slot"],
    ],
    steps: [
      { title: "Read userContext across all domains", detail: "7-day window - 8 domains - 53 tables", state: "done" },
      { title: "Scored domain health", detail: "Faith 85% - Career 90% - Finance 55% - Health 70%", state: "done" },
      { title: "Distributing priorities across 5 days", detail: "Balancing load - respecting energy budget - inserting deferred tasks", state: "active" },
      { title: "Slot habits and recurring items", detail: "Morning routines - fasting Wednesday - training 3x", state: "pending" },
      { title: "Generate week summary card", detail: "AI summary for Planner screen", state: "pending" },
    ],
  },
  budget: {
    banner: "Budget review complete",
    step: "Ready",
    statusColor: "#1d9e75",
    previewRows: [
      ["Review summary", "Finance health -> 80%"],
      ["Flagged category", "Subscriptions +8%"],
      ["Proposal 1", "Emergency fund savings goal"],
      ["Proposal 2", "Subscription audit"],
    ],
    context: [
      ["transactions.march", "42 transactions - GHc 2,760 total"],
      ["budget.summary", "surplus projection GHc 420"],
      ["subscriptions", "monthly spend variance up 8%"],
    ],
    steps: [
      { title: "Pulled March transactions", detail: "42 transactions - GHc 2,760 total", state: "done" },
      { title: "Categorised by domain + type", detail: "Housing 44% - Food 25% - Subscriptions 12% - Other 19%", state: "done" },
      { title: "Compared to Q1 variance", detail: "Subscriptions +8% vs Jan-Feb average", state: "done" },
      { title: "Generated review summary + 2 proposals", detail: "Savings goal - subscription audit", state: "done" },
    ],
  },
  faith: {
    banner: "Faith routine proposal ready",
    step: "Waiting",
    statusColor: "#ba7517",
    previewRows: [
      ["Routine", "Morning spiritual block"],
      ["Window", "6:00 - 6:45 AM"],
      ["Days", "Mon - Fri"],
      ["Linked to", "Planner + Today habits"],
    ],
    context: [
      ["faith.logs", "5 prayer mornings in 7 days"],
      ["planner.profile", "weekday mornings available"],
      ["wellness.checkins", "better energy on early prayer days"],
    ],
    steps: [
      { title: "Read faith logs", detail: "Prayer, reading, and devotional streaks", state: "done" },
      { title: "Matched recurring window", detail: "Found open weekday morning block", state: "done" },
      { title: "Built proposal", detail: "Morning spiritual block - 45 min", state: "done" },
      { title: "Waiting for approval", detail: "Ready to write once approved", state: "active" },
    ],
  },
} as const;

export function ActionPreviewModalScreen() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const [scenario, setScenario] = useState<PreviewScenario>("plan");
  const [complete, setComplete] = useState(false);

  const current = useMemo(() => SCENARIOS[scenario], [scenario]);

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", padding: 24 }}>
      <View style={{ position: "absolute", inset: 0, paddingHorizontal: 24, paddingTop: 120, opacity: 0.28 }}>
        {[0, 1, 2, 3].map((item) => (
          <View key={item} style={{ alignSelf: item % 2 === 0 ? "flex-end" : "flex-start", maxWidth: item % 2 === 0 ? "64%" : "78%", borderRadius: 14, backgroundColor: item % 2 === 0 ? "rgba(30,26,48,0.96)" : "rgba(26,26,36,0.96)", padding: 12, marginBottom: 8 }}>
            <View style={{ height: 9, borderRadius: 999, backgroundColor: "#30303a", marginBottom: 6, width: item % 2 === 0 ? 140 : 180 }} />
            <View style={{ height: 9, borderRadius: 999, backgroundColor: "#30303a", width: item % 2 === 0 ? 90 : 150 }} />
          </View>
        ))}
      </View>

      <Animated.View entering={FadeInDown.duration(420)}>
        <Card
          style={{
            borderRadius: 22,
            borderCurve: "continuous",
            padding: 0,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.background,
          }}
        >
          <View style={{ position: "absolute", top: 14, left: 0, right: 0, alignItems: "center", zIndex: 2 }}>
            <View style={{ flexDirection: "row", gap: 6, backgroundColor: "rgba(20,20,24,0.96)", borderRadius: 999, padding: 4, borderWidth: 1, borderColor: theme.border }}>
              {([
                ["plan", "Plan week"],
                ["budget", "Budget review"],
                ["faith", "Faith routine"],
              ] as Array<[PreviewScenario, string]>).map(([key, label]) => {
                const active = scenario === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => {
                      setScenario(key);
                      setComplete(false);
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
          </View>

          {complete ? (
            <View style={{ paddingHorizontal: 20, paddingTop: 96, paddingBottom: 24, gap: 16, alignItems: "center" }}>
              <View style={{ width: 54, height: 54, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(31, 169, 127, 0.14)", borderWidth: 1, borderColor: "#1d9e75" }}>
                <FontAwesome name="check" size={20} color="#1d9e75" />
              </View>
              <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700", fontSize: 18 }}>
                Action continued
              </Text>
              <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20, textAlign: "center" }}>
                This preview state is ready to hand off into the live agent flow when execution wiring lands.
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button title="Open AI" onPress={() => router.push("/(tabs)/ai" as never)} style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }} />
                <Button title="Close" variant="outline" onPress={() => router.back()} style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }} />
              </View>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingTop: 56, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: "rgba(15,15,20,0.96)" }}>
                <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: current.statusColor }} />
                <Text selectable variant="small" style={{ color: theme.mutedForeground, flex: 1 }}>
                  <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>{current.banner}</Text> - {current.step}
                </Text>
                <Pressable onPress={() => router.back()} style={{ width: 24, height: 24, borderRadius: 999, backgroundColor: theme.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.border }}>
                  <FontAwesome name="close" size={11} color={theme.mutedForeground} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 14 }}>
                <View style={{ gap: 10 }}>
                  {current.steps.map((step, index) => (
                    <View key={`${step.title}-${index}`} style={{ flexDirection: "row", gap: 10 }}>
                      <View style={{ width: 20, alignItems: "center" }}>
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 999,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: step.state === "done" ? "#1d9e75" : step.state === "active" ? "rgba(123, 109, 246, 0.12)" : theme.card,
                            borderWidth: 1.5,
                            borderColor: step.state === "done" ? "#1d9e75" : step.state === "active" ? "#9b8fff" : theme.border,
                          }}
                        >
                          {step.state === "done" ? (
                            <FontAwesome name="check" size={10} color="#ffffff" />
                          ) : (
                            <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: step.state === "active" ? "#9b8fff" : theme.mutedForeground }} />
                          )}
                        </View>
                        {index < current.steps.length - 1 ? (
                          <View style={{ width: 2, flex: 1, backgroundColor: step.state === "done" ? "#1d9e75" : theme.border, marginVertical: 2 }} />
                        ) : null}
                      </View>
                      <View style={{ flex: 1, paddingBottom: 12 }}>
                        <Text selectable variant="small" style={{ color: step.state === "pending" ? theme.mutedForeground : theme.foreground, fontFamily: "Geist", fontWeight: "700", marginBottom: 3 }}>
                          {step.title}
                        </Text>
                        <Text selectable variant="muted" style={{ color: step.state === "active" ? theme.foreground : theme.mutedForeground }}>
                          {step.detail}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {current.previewRows.length ? (
                  <Card style={{ borderRadius: 14, borderCurve: "continuous", padding: 14, borderWidth: 1, borderColor: theme.border, gap: 8 }}>
                    <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
                      Ready to show you
                    </Text>
                    {current.previewRows.map(([key, value]) => (
                      <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                        <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                          {key}
                        </Text>
                        <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700", textAlign: "right", flex: 1 }}>
                          {value}
                        </Text>
                      </View>
                    ))}
                  </Card>
                ) : null}

                <Card style={{ borderRadius: 14, borderCurve: "continuous", padding: 14, borderWidth: 1, borderColor: "rgba(123, 109, 246, 0.16)", backgroundColor: "rgba(123, 109, 246, 0.08)", gap: 8 }}>
                  <Text selectable variant="muted" style={{ color: theme.primary, textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
                    Context used so far
                  </Text>
                  {current.context.map(([source, used]) => (
                    <View key={source} style={{ flexDirection: "row", gap: 8 }}>
                      <Text selectable variant="small" style={{ color: theme.mutedForeground, fontFamily: "Geist", width: 128 }}>
                        {source}
                      </Text>
                      <Text selectable variant="small" style={{ color: theme.primary, flex: 1 }}>
                        {used}
                      </Text>
                    </View>
                  ))}
                </Card>
              </ScrollView>

              <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: theme.border, gap: 8, backgroundColor: "rgba(15,15,20,0.96)" }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Button title="Continue" onPress={() => setComplete(true)} style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }} />
                  <Button title="Pause" variant="outline" onPress={() => router.push("/(tabs)/ai/resume-plan" as never)} style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }} />
                </View>
                <Button title="Cancel" variant="ghost" onPress={() => router.back()} style={{ borderRadius: 14, borderCurve: "continuous" }} />
              </View>
            </>
          )}
        </Card>
      </Animated.View>
    </View>
  );
}

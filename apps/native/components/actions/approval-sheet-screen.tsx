import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type ApprovalScenario = "finance" | "faith" | "health";

const SCENARIOS = {
  finance: {
    domain: "Finance",
    domainColor: "#1d9e75",
    domainBackground: "#1a2a1e",
    title: "Create an emergency fund savings goal",
    why: "You consistently have GHc 380-520 unallocated at month-end. Channelling that into a structured goal puts it to work instead of letting it drift.",
    context: "Based on Finance data from the last 30 days - avg month-end surplus GHc 420",
    rows: [
      ["Goal name", "Emergency fund"],
      ["Monthly allocation", "GHc 400 / month"],
      ["Target amount", "GHc 8,000"],
      ["Est. completion", "~17 months"],
      ["Tracked in", "Finance domain"],
    ],
    impacts: ["+25% Finance health", "GHc 400 reserved", "Auto tracked"],
  },
  faith: {
    domain: "Faith",
    domainColor: "#9b8fff",
    domainBackground: "#2a2040",
    title: "Add a morning spiritual routine to your weekly plan",
    why: "You logged prayer and devotional on 5 of the last 7 mornings. Formalising it protects the streak and makes it plannable.",
    context: "Based on Faith domain logs - last 7 days - prayer streak 5 days",
    rows: [
      ["Routine name", "Morning spiritual block"],
      ["Includes", "Prayer - devotional - reading"],
      ["Time", "6:00 - 6:45 AM"],
      ["Days", "Mon - Fri"],
      ["Added to", "Planner + Today habits"],
    ],
    impacts: ["+5 habit slots", "45 min block", "Every weekday"],
  },
  health: {
    domain: "Health",
    domainColor: "#f0997b",
    domainBackground: "#2a1510",
    title: "Reduce training sessions from 4x to 3x this week",
    why: "Your average energy this week was 6.2. Pushing 4 sessions on a recovery week usually sets you back more than it helps.",
    context: "Based on Health + Wellness check-ins - last 7 days - avg energy 6.2 vs usual 7.4",
    rows: [
      ["Current target", "4 sessions / week"],
      ["Proposed target", "3 sessions / week"],
      ["Removed session", "Thursday training"],
      ["Duration", "This week only"],
      ["Next week", "Resets to 4x"],
    ],
    impacts: ["-1 session", "Temporary", "Thu freed up"],
  },
} as const;

export function ApprovalSheetScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const [scenario, setScenario] = useState<ApprovalScenario>("finance");
  const [editing, setEditing] = useState(false);
  const [done, setDone] = useState(false);

  const current = useMemo(() => SCENARIOS[scenario], [scenario]);

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View style={{ flex: 1 }} />
        <Card
          style={{
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            borderCurve: "continuous",
            padding: 24,
            gap: 14,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.background,
          }}
        >
          <View style={{ alignItems: "center", gap: 12 }}>
            <View style={{ width: 52, height: 52, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(31, 169, 127, 0.14)", borderWidth: 1, borderColor: "#1d9e75" }}>
              <FontAwesome name="check" size={20} color="#1d9e75" />
            </View>
            <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700", fontSize: 18 }}>
              Approved
            </Text>
            <Text selectable variant="small" style={{ color: theme.mutedForeground, textAlign: "center", lineHeight: 20 }}>
              The proposed action is approved and ready to be written back through the backend flow.
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button title="Open planner" onPress={() => router.push("/(tabs)/planner" as never)} style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }} />
            <Button title="Close" variant="outline" onPress={() => router.back()} style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }} />
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
      <View style={{ paddingHorizontal: 24, paddingBottom: 10, opacity: 0.35 }}>
        <Text selectable style={{ color: "#ffffff", fontFamily: "Geist", fontSize: 22, fontWeight: "700", marginBottom: 8 }}>
          Good morning, Bobie.
        </Text>
        {[0, 1, 2].map((item) => (
          <View key={item} style={{ borderRadius: 14, backgroundColor: "rgba(26,26,30,0.96)", padding: 14, marginBottom: 8 }}>
            <View style={{ height: 10, borderRadius: 999, backgroundColor: "#2a2a2e", marginBottom: 6, width: item === 0 ? "78%" : item === 1 ? "86%" : "68%" }} />
            <View style={{ height: 10, borderRadius: 999, backgroundColor: "#222226", width: item === 0 ? "50%" : item === 1 ? "58%" : "44%" }} />
          </View>
        ))}
      </View>

      <Animated.View entering={FadeInDown.duration(420)}>
        <Card
          style={{
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            borderCurve: "continuous",
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 32,
            gap: 14,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: isDarkColorScheme ? "rgba(20, 20, 24, 0.98)" : "rgba(250, 250, 252, 0.98)",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <View style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: theme.border }} />
          </View>

          <View style={{ flexDirection: "row", gap: 6, alignSelf: "center", backgroundColor: theme.card, borderRadius: 999, padding: 4, borderWidth: 1, borderColor: theme.border }}>
            {(["finance", "faith", "health"] as ApprovalScenario[]).map((item) => {
              const active = item === scenario;
              return (
                <Pressable
                  key={item}
                  onPress={() => {
                    setScenario(item);
                    setEditing(false);
                  }}
                  style={({ pressed }) => ({
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    backgroundColor: active ? "rgba(123, 109, 246, 0.16)" : "transparent",
                    opacity: pressed ? 0.84 : 1,
                  })}
                >
                  <Text selectable variant="small" style={{ color: active ? theme.foreground : theme.mutedForeground, textTransform: "capitalize", fontFamily: "Geist", fontWeight: "700" }}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: current.domainBackground, alignItems: "center", justifyContent: "center" }}>
                <FontAwesome name="magic" size={15} color={current.domainColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text selectable variant="small" style={{ color: current.domainColor, fontFamily: "Geist", fontWeight: "700" }}>
                  {current.domain}
                </Text>
                <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                  Agent approval request
                </Text>
              </View>
              <Pressable onPress={() => router.back()} style={{ width: 28, height: 28, borderRadius: 999, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, alignItems: "center", justifyContent: "center" }}>
                <FontAwesome name="close" size={13} color={theme.mutedForeground} />
              </Pressable>
            </View>

            <View style={{ gap: 8 }}>
              <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700", fontSize: 22, lineHeight: 28 }}>
                {current.title}
              </Text>
              <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 21 }}>
                {current.why}
              </Text>
            </View>

            <View style={{ borderRadius: 12, borderCurve: "continuous", padding: 12, backgroundColor: "rgba(123, 109, 246, 0.08)", borderWidth: 1, borderColor: "rgba(123, 109, 246, 0.16)", flexDirection: "row", gap: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#9b8fff", marginTop: 5 }} />
              <Text selectable variant="small" style={{ color: theme.primary, flex: 1, lineHeight: 18 }}>
                {current.context}
              </Text>
            </View>

            <Card style={{ borderRadius: 14, borderCurve: "continuous", padding: 0, overflow: "hidden", borderWidth: 1, borderColor: theme.border }}>
              <View style={{ padding: 12, backgroundColor: theme.card }}>
                <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
                  What will change
                </Text>
              </View>
              {current.rows.map(([key, value], index) => (
                <View key={`${key}-${index}`} style={{ flexDirection: "row", justifyContent: "space-between", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: index === 0 ? 0 : 1, borderTopColor: theme.border }}>
                  <Text selectable variant="small" style={{ color: theme.mutedForeground, width: 110 }}>
                    {key}
                  </Text>
                  <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700", flex: 1, textAlign: "right" }}>
                    {value}
                  </Text>
                </View>
              ))}
            </Card>

            <View style={{ flexDirection: "row", gap: 8 }}>
              {current.impacts.map((item) => (
                <Card key={item} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous", padding: 10, borderWidth: 1, borderColor: theme.border, alignItems: "center" }}>
                  <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700", textAlign: "center" }}>
                    {item}
                  </Text>
                </Card>
              ))}
            </View>

            {editing ? (
              <View style={{ gap: 8 }}>
                <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
                  Edit values
                </Text>
                {current.rows.slice(0, 3).map(([key, value]) => (
                  <View key={key} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text selectable variant="small" style={{ width: 96, color: theme.mutedForeground }}>
                      {key}
                    </Text>
                    <TextInput
                      defaultValue={value}
                      placeholderTextColor={theme.mutedForeground}
                      style={{
                        flex: 1,
                        minHeight: 42,
                        borderRadius: 10,
                        borderCurve: "continuous",
                        borderWidth: 1,
                        borderColor: theme.border,
                        backgroundColor: theme.card,
                        color: theme.foreground,
                        paddingHorizontal: 12,
                        fontFamily: "Figtree",
                        fontSize: 14,
                      }}
                    />
                  </View>
                ))}
              </View>
            ) : null}
          </ScrollView>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button title="Approve" onPress={() => setDone(true)} style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }} />
              <Button title={editing ? "Done editing" : "Edit"} variant="outline" onPress={() => setEditing((currentEditing) => !currentEditing)} style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }} />
            </View>
            <Button title="Reject - not now" variant="ghost" onPress={() => router.back()} style={{ borderRadius: 14, borderCurve: "continuous" }} />
          </View>
        </Card>
      </Animated.View>
    </View>
  );
}

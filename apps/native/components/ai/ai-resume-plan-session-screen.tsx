import { useState } from "react";
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

type PendingItem = {
  id: string;
  title: string;
  domain: string;
  time: string;
  why: string;
  color: string;
  badgeBg: string;
  badgeText: string;
};

const APPROVED_ITEMS = [
  { title: "Morning devotional + Bible reading - daily", domain: "Faith", time: "6:00 AM · Mon-Fri", color: "#7b6df6", badgeBg: "rgba(123, 109, 246, 0.14)", badgeText: "#b8abff" },
  { title: "Life OS deep work block - daily", domain: "Career", time: "9:00 AM · Mon-Fri", color: "#2f7dd1", badgeBg: "rgba(47, 125, 209, 0.14)", badgeText: "#91bfff" },
];

const INITIAL_PENDING: PendingItem[] = [
  {
    id: "pi0",
    title: "Q2 budget variance review",
    domain: "Finance",
    time: "Monday · deferred 4 days",
    why: "Deferred from last Monday. Finance health is at 55% this week — this is the highest-leverage item to address first.",
    color: "#1fa97f",
    badgeBg: "rgba(31, 169, 127, 0.14)",
    badgeText: "#7cd9aa",
  },
  {
    id: "pi1",
    title: "Fasting intention - Wednesday",
    domain: "Faith",
    time: "Wednesday · all day",
    why: "You have fasted 2 of the last 3 Wednesdays. Consistent pattern — worth keeping in the plan.",
    color: "#7b6df6",
    badgeBg: "rgba(123, 109, 246, 0.14)",
    badgeText: "#b8abff",
  },
  {
    id: "pi2",
    title: "Strength training - 3 sessions",
    domain: "Health",
    time: "Tue · Thu · Sat",
    why: "Health is at 70% this week. You also flagged wanting to maintain physical consistency next week.",
    color: "#d07a36",
    badgeBg: "rgba(208, 122, 54, 0.14)",
    badgeText: "#f0a07b",
  },
  {
    id: "pi3",
    title: "Evening decompression walk - 4x",
    domain: "Wellness",
    time: "Mon · Tue · Thu · Fri · 6:30 PM",
    why: "Mid-week energy averaged 6.2/10. Decompression still correlates with better next-morning energy in your logs.",
    color: "#d45689",
    badgeBg: "rgba(212, 86, 137, 0.14)",
    badgeText: "#f0a7c2",
  },
  {
    id: "pi4",
    title: "Reach out to one person - relationships check-in",
    domain: "Relationships",
    time: "Thursday afternoon",
    why: "Relationships had zero activity this week. One intentional touchpoint keeps the domain from going cold.",
    color: "#2f7dd1",
    badgeBg: "rgba(47, 125, 209, 0.14)",
    badgeText: "#91bfff",
  },
  {
    id: "pi5",
    title: "Clear 2 deferred tasks from this week",
    domain: "Tasks",
    time: "Monday afternoon",
    why: "Two tasks slipped this week without a home. Slotting them on Monday keeps them from compounding.",
    color: "#8a8f9c",
    badgeBg: "rgba(138, 143, 156, 0.14)",
    badgeText: "#b1b4bc",
  },
];

export function AiResumePlanSessionScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const [approvedCount, setApprovedCount] = useState(2);
  const [skippedCount, setSkippedCount] = useState(0);
  const [pendingItems, setPendingItems] = useState(INITIAL_PENDING);

  function approveItem(id: string) {
    setPendingItems((current) => current.filter((item) => item.id !== id));
    setApprovedCount((current) => current + 1);
  }

  function skipItem(id: string) {
    setPendingItems((current) => current.filter((item) => item.id !== id));
    setSkippedCount((current) => current + 1);
  }

  function approveAll() {
    setApprovedCount((current) => current + pendingItems.length);
    setPendingItems([]);
  }

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
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Pressable onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <FontAwesome name="chevron-left" size={12} color={theme.mutedForeground} />
              <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                AI · Plan
              </Text>
            </Pressable>
            <Badge variant="subtle" color="secondary">
              Resumed · Thu session
            </Badge>
          </View>

          <Card
            style={{
              borderRadius: 22,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: isDarkColorScheme ? "rgba(110, 98, 190, 0.28)" : "rgba(110, 98, 190, 0.18)",
              backgroundColor: isDarkColorScheme ? "rgba(19, 19, 26, 0.96)" : "rgba(244, 242, 255, 0.98)",
              padding: 16,
              gap: 12,
              boxShadow: theme.shadowSm,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#9b8fff" }} />
              <Text selectable variant="muted" style={{ color: theme.primary, textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700", flex: 1 }}>
                Picking up where you left off
              </Text>
              <Text selectable variant="muted">
                Started Thursday
              </Text>
            </View>
            <Text selectable variant="small" style={{ color: theme.foreground, lineHeight: 20 }}>
              You approved 2 of 11 priorities on Thursday before stepping away. The remaining items are ready for review and your context has been refreshed.
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <CounterCard value={approvedCount} label="Approved" color="#1fa97f" theme={theme} />
              <CounterCard value={pendingItems.length} label="Pending" color="#9b8fff" theme={theme} />
              <CounterCard value={skippedCount} label="Skipped" color={theme.mutedForeground} theme={theme} />
              <CounterCard value={approvedCount + pendingItems.length + skippedCount} label="Total" color="#d69030" theme={theme} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(420)} style={{ gap: 10 }}>
          <SectionHeader title="Already approved" actionLabel="View details" onAction={() => router.push("/(tabs)/planner" as never)} />
          {APPROVED_ITEMS.map((item) => (
            <Card key={item.title} style={{ borderRadius: 18, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 12, boxShadow: theme.shadowSm }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                <View style={{ width: 4, alignSelf: "stretch", borderRadius: 999, backgroundColor: item.color }} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                    {item.title}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                    <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: item.badgeBg }}>
                      <Text selectable variant="muted" style={{ color: item.badgeText, fontFamily: "Geist", fontWeight: "700" }}>
                        {item.domain}
                      </Text>
                    </View>
                    <Text selectable variant="muted">
                      {item.time}
                    </Text>
                  </View>
                </View>
                <View style={{ width: 18, height: 18, borderRadius: 999, backgroundColor: "#1fa97f", alignItems: "center", justifyContent: "center" }}>
                  <FontAwesome name="check" size={10} color="#ffffff" />
                </View>
              </View>
            </Card>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(420)} style={{ gap: 10 }}>
          <SectionHeader title="Pending your review" actionLabel="Approve all" onAction={approveAll} />
          {pendingItems.map((item) => (
            <Card key={item.id} style={{ borderRadius: 18, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 14, gap: 12, boxShadow: theme.shadowSm }}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ width: 4, alignSelf: "stretch", borderRadius: 999, backgroundColor: item.color }} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                    {item.title}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                    <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: item.badgeBg }}>
                      <Text selectable variant="muted" style={{ color: item.badgeText, fontFamily: "Geist", fontWeight: "700" }}>
                        {item.domain}
                      </Text>
                    </View>
                    <Text selectable variant="muted">
                      {item.time}
                    </Text>
                  </View>
                  <Text selectable variant="small" style={{ color: theme.mutedForeground, fontStyle: "italic", lineHeight: 19 }}>
                    {item.why}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button title="Approve" onPress={() => approveItem(item.id)} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous", minHeight: 40 }} />
                <Button title="Edit" variant="outline" onPress={() => router.push("/(tabs)/ai/classic" as never)} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous", minHeight: 40 }} />
                <Button title="Skip" variant="ghost" onPress={() => skipItem(item.id)} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous", minHeight: 40 }} />
              </View>
            </Card>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(420)}>
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
              <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: "#9b8fff", marginTop: 6 }} />
              <View style={{ flex: 1, gap: 10 }}>
                <Text selectable style={{ color: isDarkColorScheme ? "#c8c2ff" : "#5c54c9" }}>
                  Four of the pending items are faith or wellness, the same domains that most affected your energy this week. Approving those first gives the week a cleaner foundation.
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  <QuickChip label="Approve faith + wellness" onPress={() => {
                    setApprovedCount((current) => current + pendingItems.filter((item) => item.domain === "Faith" || item.domain === "Wellness").length);
                    setPendingItems((current) => current.filter((item) => item.domain !== "Faith" && item.domain !== "Wellness"));
                  }} theme={theme} />
                  <QuickChip label="Compare to last week" onPress={() => router.push("/(tabs)/ai/classic" as never)} theme={theme} />
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(420)} style={{ flexDirection: "row", gap: 8 }}>
          <Button title="Finish & save to Planner" onPress={() => router.push("/(tabs)/planner" as never)} style={{ flex: 1, borderRadius: 14, borderCurve: "continuous", minHeight: 46 }} />
          <Button title="Pause" variant="outline" onPress={() => router.back()} style={{ flex: 1, borderRadius: 14, borderCurve: "continuous", minHeight: 46 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function CounterCard({ value, label, color, theme }: { value: number; label: string; color: string; theme: typeof NAV_THEME.light | typeof NAV_THEME.dark }) {
  return (
    <Card style={{ flex: 1, borderRadius: 14, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 10, alignItems: "center" }}>
      <Text selectable style={{ fontFamily: "Geist", fontSize: 18, fontWeight: "700", color, fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
      <Text selectable variant="muted">
        {label}
      </Text>
    </Card>
  );
}

function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1.1, fontFamily: "Geist", fontWeight: "700" }}>
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <Text selectable variant="small" style={{ color: "#6b5fff", fontFamily: "Geist", fontWeight: "700" }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function QuickChip({ label, onPress, theme }: { label: string; onPress: () => void; theme: typeof NAV_THEME.light | typeof NAV_THEME.dark }) {
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

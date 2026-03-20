import { useState } from "react";
import {
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Card, Text } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type Mode = "plan" | "ask" | "review";
type AppTheme = (typeof NAV_THEME)[keyof typeof NAV_THEME];

export function AiClassicScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("plan");
  const [composer, setComposer] = useState("");
  const [messages, setMessages] = useState([
    { id: "ai-intro", role: "ai" as const, text: "Good morning, Bobie. I have read your last 7 days across all domains. What is on your mind?" },
    { id: "user-finance", role: "user" as const, text: "How is my finance domain looking this week?" },
    { id: "ai-finance", role: "ai" as const, text: "Your finances are generally on track, but the deferred budget review is the one thing worth clearing today." },
  ]);

  function sendComposer() {
    const text = composer.trim();
    if (!text) {
      return;
    }
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user" as const, text }]);
    setComposer("");
    setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `ai-${Date.now()}`,
          role: "ai" as const,
          text: "Thinking... open the full weekly or resume planning flows if you want structured plan generation instead of quick chat.",
        },
      ]);
    }, 600);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -46,
          right: -50,
          width: 220,
          height: 220,
          borderRadius: 999,
          backgroundColor: isDarkColorScheme ? "rgba(155, 143, 255, 0.12)" : "rgba(155, 143, 255, 0.1)",
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.xl,
          paddingBottom: 40,
          gap: 16,
        }}
      >
        <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 12 }}>
          <Text selectable style={{ fontFamily: "Geist", fontSize: 28, fontWeight: "700", color: theme.foreground }}>
            AI
          </Text>
          <Card
            style={{
              borderRadius: 16,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: isDarkColorScheme ? "rgba(110, 98, 190, 0.28)" : "rgba(110, 98, 190, 0.18)",
              backgroundColor: isDarkColorScheme ? "rgba(19, 19, 26, 0.96)" : "rgba(244, 242, 255, 0.98)",
              padding: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#9b8fff" }} />
              <Text selectable variant="small" style={{ color: theme.primary, flex: 1 }}>
                Reading last 7 days across all domains
              </Text>
              <Text selectable variant="muted">
                53 tables · UTC sync
              </Text>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(50).duration(420)}>
          <View style={{ flexDirection: "row", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 16, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 4, gap: 4 }}>
            {(["plan", "ask", "review"] as Mode[]).map((item) => {
              const active = item === mode;
              return (
                <Pressable
                  key={item}
                  onPress={() => setMode(item)}
                  style={({ pressed }) => ({
                    flex: 1,
                    borderRadius: 12,
                    borderCurve: "continuous",
                    paddingVertical: 10,
                    alignItems: "center",
                    backgroundColor: active ? "rgba(123, 109, 246, 0.16)" : "transparent",
                    borderWidth: active ? 1 : 0,
                    borderColor: active ? "rgba(123, 109, 246, 0.24)" : "transparent",
                    opacity: pressed ? 0.88 : 1,
                  })}
                >
                  <Text selectable variant="small" style={{ color: active ? "#c8b8ff" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700", textTransform: "capitalize" }}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {mode === "plan" ? (
          <Animated.View entering={FadeInDown.delay(110).duration(420)} style={{ gap: 16 }}>
            <Card style={{ borderRadius: 20, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 16, gap: 14, boxShadow: theme.shadowSm }}>
              <Text selectable variant="muted" style={{ color: theme.primary, textTransform: "uppercase", letterSpacing: 1.1, fontFamily: "Geist", fontWeight: "700" }}>
                Start a planning session
              </Text>
              <Text selectable style={{ color: theme.foreground, lineHeight: 22 }}>
                What would you like to plan? I will pull your current context and generate a draft you can adjust.
              </Text>
              <PlanOption
                label="Plan next week"
                icon="calendar"
                iconColor="#b8abff"
                iconBackground="rgba(123, 109, 246, 0.16)"
                onPress={() => router.push("/(tabs)/ai/weekly-plan" as never)}
                theme={theme}
              />
              <PlanOption
                label="Plan a domain"
                icon="bullseye"
                iconColor="#b8abff"
                iconBackground="rgba(123, 109, 246, 0.16)"
                onPress={() => router.push("/(tabs)/domains/faith" as never)}
                theme={theme}
              />
              <PlanOption
                label="Plan my finances"
                icon="money"
                iconColor="#7cd9aa"
                iconBackground="rgba(31, 169, 127, 0.14)"
                onPress={() => router.push("/(tabs)/domains/finance" as never)}
                theme={theme}
              />
              <PlanOption
                label="Adjust this week"
                icon="exchange"
                iconColor="#d69030"
                iconBackground="rgba(214, 144, 48, 0.14)"
                onPress={() => router.push("/(tabs)/ai/resume-plan" as never)}
                theme={theme}
              />
            </Card>

            <View style={{ gap: 10 }}>
              <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1.1, fontFamily: "Geist", fontWeight: "700" }}>
                Recent sessions
              </Text>
              <ThreadRow
                title="Week of Mar 10 plan"
                subtitle="Thu · 11 priorities generated · 2 approved"
                icon="calendar"
                iconColor="#b8abff"
                iconBackground="rgba(123, 109, 246, 0.16)"
                onPress={() => router.push("/(tabs)/ai/resume-plan" as never)}
                theme={theme}
              />
              <ThreadRow
                title="Finance — March budget"
                subtitle="Tue · Savings goal proposed · pending approval"
                icon="money"
                iconColor="#7cd9aa"
                iconBackground="rgba(31, 169, 127, 0.14)"
                onPress={() => router.push("/(tabs)/domains/finance" as never)}
                theme={theme}
              />
              <ThreadRow
                title="Faith rhythm — weekly intention"
                subtitle="Sun · Fasting + prayer schedule set"
                icon="bullseye"
                iconColor="#b8abff"
                iconBackground="rgba(123, 109, 246, 0.16)"
                onPress={() => router.push("/(tabs)/domains/faith" as never)}
                theme={theme}
              />
            </View>
          </Animated.View>
        ) : null}

        {mode === "ask" ? (
          <Animated.View entering={FadeInDown.delay(110).duration(420)} style={{ gap: 12 }}>
            {messages.map((message) => (
              <View key={message.id} style={{ flexDirection: message.role === "user" ? "row-reverse" : "row", alignItems: "flex-end", gap: 8 }}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: message.role === "user" ? "rgba(58, 46, 78, 0.9)" : "rgba(123, 109, 246, 0.14)",
                  }}
                >
                  <Text selectable variant="muted" style={{ color: message.role === "user" ? "#c8b8ff" : "#9b8fff", fontFamily: "Geist", fontWeight: "700" }}>
                    {message.role === "user" ? "B" : "AI"}
                  </Text>
                </View>
                <Card
                  style={{
                    maxWidth: "82%",
                    borderRadius: 18,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: message.role === "user" ? "rgba(123, 109, 246, 0.26)" : theme.border,
                    backgroundColor: message.role === "user" ? "rgba(30, 26, 48, 0.96)" : "rgba(26, 26, 36, 0.96)",
                    padding: 12,
                  }}
                >
                  <Text selectable style={{ color: message.role === "user" ? "#d7d1ff" : theme.foreground, lineHeight: 21 }}>
                    {message.text}
                  </Text>
                </Card>
              </View>
            ))}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {["Faith patterns", "Afternoon focus", "Burnout check", "Habit gaps"].map((chip) => (
                <Pressable
                  key={chip}
                  onPress={() => setComposer(chip)}
                  style={({ pressed }) => ({
                    borderRadius: 999,
                    borderCurve: "continuous",
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    backgroundColor: theme.card,
                    borderWidth: 1,
                    borderColor: theme.border,
                    opacity: pressed ? 0.84 : 1,
                  })}
                >
                  <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                    {chip}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <TextInput
                value={composer}
                onChangeText={setComposer}
                placeholder="Ask anything about your week..."
                placeholderTextColor={theme.mutedForeground}
                style={{
                  flex: 1,
                  minHeight: 44,
                  borderRadius: 22,
                  borderCurve: "continuous",
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                  color: theme.foreground,
                  paddingHorizontal: 16,
                  fontFamily: "Figtree",
                  fontSize: 14,
                }}
                onSubmitEditing={sendComposer}
              />
              <Pressable
                onPress={sendComposer}
                style={({ pressed }) => ({
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#9b8fff",
                  opacity: pressed ? 0.86 : 1,
                })}
              >
                <FontAwesome name="arrow-right" size={15} color="#0e0e10" />
              </Pressable>
            </View>
          </Animated.View>
        ) : null}

        {mode === "review" ? (
          <Animated.View entering={FadeInDown.delay(110).duration(420)} style={{ gap: 16 }}>
            <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
              Your week in numbers. Generated Friday at 6:00 AM from activity across all domains.
            </Text>
            <Card style={{ borderRadius: 20, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 16, gap: 12, boxShadow: theme.shadowSm }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <IconBadge icon="calendar" color="#b8abff" background="rgba(123, 109, 246, 0.16)" />
                <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground }}>
                  Week overview
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <ReviewStat value="68%" label="Completion" color="#1fa97f" theme={theme} />
                <ReviewStat value="11" label="Priorities" theme={theme} />
                <ReviewStat value="2" label="Deferred" color="#d69030" theme={theme} />
                <ReviewStat value="34" label="Habits" color="#b8abff" theme={theme} />
              </View>
            </Card>

            <Card style={{ borderRadius: 20, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 16, gap: 10, boxShadow: theme.shadowSm }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <IconBadge icon="heartbeat" color="#7cd9aa" background="rgba(31, 169, 127, 0.14)" />
                <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: theme.foreground }}>
                  Domain health
                </Text>
              </View>
              {[
                { name: "Faith", value: 85, color: "#7b6df6" },
                { name: "Career", value: 90, color: "#2f7dd1" },
                { name: "Finance", value: 55, color: "#1fa97f" },
                { name: "Health", value: 70, color: "#d07a36" },
              ].map((item) => (
                <DomainHealthRow key={item.name} name={item.name} value={item.value} color={item.color} theme={theme} />
              ))}
            </Card>

            <Pressable
              onPress={() => router.push("/(tabs)/ai/weekly-plan" as never)}
              style={({ pressed }) => ({
                borderRadius: 14,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: "rgba(123, 109, 246, 0.24)",
                backgroundColor: "rgba(30, 26, 48, 0.96)",
                minHeight: 46,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.86 : 1,
              })}
            >
              <Text selectable style={{ color: "#d7d1ff", fontFamily: "Geist", fontWeight: "700" }}>
                Start weekly review
              </Text>
            </Pressable>
          </Animated.View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function PlanOption({
  label,
  icon,
  iconColor,
  iconBackground,
  onPress,
  theme,
}: {
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  iconColor: string;
  iconBackground: string;
  onPress: () => void;
  theme: AppTheme;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 14,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: "rgba(19, 19, 31, 0.96)",
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        opacity: pressed ? 0.88 : 1,
      })}
    >
      <View style={{ width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: iconBackground }}>
        <FontAwesome name={icon} size={14} color={iconColor} />
      </View>
      <Text selectable variant="small" style={{ color: theme.foreground, flex: 1 }}>
        {label}
      </Text>
      <Text selectable variant="muted">
        ›
      </Text>
    </Pressable>
  );
}

function ThreadRow({
  title,
  subtitle,
  icon,
  iconColor,
  iconBackground,
  onPress,
  theme,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  iconColor: string;
  iconBackground: string;
  onPress: () => void;
  theme: AppTheme;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)" }}>
        <View style={{ width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: iconBackground }}>
          <FontAwesome name={icon} size={14} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
            {title}
          </Text>
          <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
            {subtitle}
          </Text>
        </View>
        <Text selectable variant="muted">
          ›
        </Text>
      </View>
    </Pressable>
  );
}

function IconBadge({ icon, color, background }: { icon: React.ComponentProps<typeof FontAwesome>["name"]; color: string; background: string }) {
  return (
    <View style={{ width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: background }}>
      <FontAwesome name={icon} size={12} color={color} />
    </View>
  );
}

function ReviewStat({ value, label, color, theme }: { value: string; label: string; color?: string; theme: AppTheme }) {
  return (
    <Card style={{ flex: 1, borderRadius: 14, borderCurve: "continuous", borderWidth: 1, borderColor: theme.border, padding: 10, alignItems: "center" }}>
      <Text selectable style={{ fontFamily: "Geist", fontSize: 20, fontWeight: "700", color: color ?? theme.foreground, fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
      <Text selectable variant="muted">
        {label}
      </Text>
    </Card>
  );
}

function DomainHealthRow({ name, value, color, theme }: { name: string; value: number; color: string; theme: AppTheme }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Text selectable variant="small" style={{ width: 70, color: theme.foreground }}>
        {name}
      </Text>
      <View style={{ flex: 1, height: 4, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <View style={{ width: `${value}%`, height: "100%", borderRadius: 999, backgroundColor: color }} />
      </View>
      <Text selectable variant="muted" style={{ width: 34, textAlign: "right" }}>
        {value}%
      </Text>
    </View>
  );
}

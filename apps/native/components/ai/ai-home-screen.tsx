import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Avatar, Badge, Card, Text } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { useColorScheme } from "@/lib/use-color-scheme";

type ThreadId = "new" | "week" | "finance" | "faith";
type AppTheme = (typeof NAV_THEME)[keyof typeof NAV_THEME];
type ChatMessage = {
  id: string;
  role: "ai" | "user";
  text: string;
  card?: Array<{ key: string; value: string; color?: string }>;
  chips?: Array<{ id: string; label: string; action: () => void; tone?: string }>;
};

const THREAD_CONTEXT: Record<ThreadId, string> = {
  new: "Reading all 8 domains · last 7 days",
  week: "Reading career, faith, finance, wellness context",
  finance: "Reading finance domain · March 2026",
  faith: "Reading faith domain · last 7 days",
};

export function AiHomeScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();

  const [activeThread, setActiveThread] = useState<ThreadId>("new");
  const [composerText, setComposerText] = useState("");
  const [messagesByThread, setMessagesByThread] = useState<Record<ThreadId, ChatMessage[]>>(() => ({
    new: [
      {
        id: "new-ai-1",
        role: "ai",
        text: "Morning, Bobie. I have read your week. What do you want to work on?",
      },
    ],
    week: [
      {
        id: "week-ai-1",
        role: "ai",
        text: "Here is what I am seeing heading into next week.",
      },
      {
        id: "week-ai-2",
        role: "ai",
        text: "Faith is strong at 85%, Career is your best domain at 90%, Finance needs the budget review, and average energy was 6.2. I would keep next week balanced rather than intensive.",
        card: [
          { key: "Faith", value: "85% · 5-day streak" },
          { key: "Career", value: "90% · sprint active" },
          { key: "Finance", value: "55% · review due", color: "#d69030" },
          { key: "Avg energy", value: "6.2 / 10" },
        ],
        chips: [
          { id: "week-faith", label: "Faith", tone: "faith", action: () => appendUserPrompt("Focus more on Faith next week") },
          { id: "week-career", label: "Career", tone: "career", action: () => appendUserPrompt("Keep Career momentum going next week") },
          { id: "week-finance", label: "Finance !", tone: "finance", action: () => appendUserPrompt("Fix my Finance domain next week") },
        ],
      },
      {
        id: "week-user-1",
        role: "user",
        text: "Balanced is right. Include the budget review on Monday.",
      },
      {
        id: "week-ai-3",
        role: "ai",
        text: "Done. Draft plan is ready — 16 priorities across 5 days, with finance review slotted Monday morning.",
        card: [
          { key: "Monday", value: "4 items · Finance first" },
          { key: "Tue-Thu", value: "3 items each" },
          { key: "Friday", value: "2 items · lighter" },
          { key: "Load", value: "Balanced", color: "#1fa97f" },
        ],
        chips: [
          { id: "week-approve", label: "Approve plan", tone: "primary", action: () => router.push("/(tabs)/ai/resume-plan" as never) },
          { id: "week-move", label: "Move review to Tue", action: () => appendUserPrompt("Move the budget review to Tuesday instead") },
          { id: "week-open", label: "Open in Planner", action: () => router.push("/(tabs)/planner" as never) },
        ],
      },
    ],
    finance: [
      {
        id: "finance-user-1",
        role: "user",
        text: "Review my finances this week",
      },
      {
        id: "finance-ai-1",
        role: "ai",
        text: "You are tracking well overall, but there is one flag that has been sitting since Monday. The consistent GHc 420 surplus is also why the savings goal was proposed.",
        card: [
          { key: "Budget used", value: "GHc 2,760 / 4,000" },
          { key: "Remaining", value: "GHc 1,240", color: "#1fa97f" },
          { key: "Surplus projection", value: "GHc 420", color: "#b8abff" },
          { key: "Budget review", value: "Overdue 4 days", color: "#e16969" },
        ],
        chips: [
          { id: "finance-run", label: "Run review", tone: "finance", action: () => router.push("/(tabs)/domains/finance" as never) },
          { id: "finance-approve", label: "Approve savings goal", action: () => appendUserPrompt("Approve the GHc 400 emergency fund savings goal") },
        ],
      },
    ],
    faith: [
      {
        id: "faith-user-1",
        role: "user",
        text: "Review my faith rhythm this week",
      },
      {
        id: "faith-ai-1",
        role: "ai",
        text: "This is the strongest faith week you have had this month. Prayer and reading are above your personal average, and fasting is holding steady.",
        card: [
          { key: "Prayer", value: "5 / 7 days", color: "#b8abff" },
          { key: "Bible reading", value: "6 / 7 days", color: "#91bfff" },
          { key: "Devotional", value: "4 / 7 days" },
          { key: "Fasting", value: "Wed ✓ · streak 3", color: "#c8b8ff" },
          { key: "Gratitude", value: "4 entries" },
        ],
        chips: [
          { id: "faith-fast", label: "Set fast intention", tone: "faith", action: () => router.push("/(tabs)/domains/faith" as never) },
          { id: "faith-prayer", label: "Lock in early prayer", action: () => appendUserPrompt("Add early morning prayer before 7AM to my recurring Faith routine") },
          { id: "faith-30", label: "30-day view", action: () => router.push("/(tabs)/domains/faith" as never) },
        ],
      },
    ],
  }));
  const [agentText, setAgentText] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  const displayName = user?.name?.trim()?.split(" ")[0] || "Bobie";
  const activeMessages = messagesByThread[activeThread];
  const compactCards = width < 390;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function appendUserPrompt(text: string) {
    const now = Date.now();
    setMessagesByThread((current) => ({
      ...current,
      [activeThread]: [
        ...current[activeThread],
        {
          id: `${activeThread}-user-${now}`,
          role: "user",
          text,
        },
      ],
    }));
    showAgent(text);
  }

  function showAgent(query: string) {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setAgentText(`Reading context for "${query.slice(0, 32)}${query.length > 32 ? "..." : ""}"`);
    timerRef.current = setTimeout(() => {
      const now = Date.now();
      setAgentText(null);
      setMessagesByThread((current) => ({
        ...current,
        [activeThread]: [
          ...current[activeThread],
          {
            id: `${activeThread}-ai-${now}`,
            role: "ai",
            text: "Thinking... continue in full chat if you want a deeper response thread.",
            chips: [
              {
                id: `${activeThread}-continue-${now}`,
                label: "Continue in full chat",
                action: () => router.push("/(tabs)/ai/classic" as never),
              },
            ],
          },
        ],
      }));
    }, 1500);
  }

  function sendMessage() {
    const value = composerText.trim();
    if (!value) {
      return;
    }
    setComposerText("");
    appendUserPrompt(value);
  }

  function openThread(thread: ThreadId) {
    setActiveThread(thread);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 0);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -40,
          right: -56,
          width: 220,
          height: 220,
          borderRadius: 999,
          backgroundColor: isDarkColorScheme ? "rgba(155, 143, 255, 0.12)" : "rgba(155, 143, 255, 0.1)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 280,
          left: -92,
          width: 240,
          height: 240,
          borderRadius: 999,
          backgroundColor: isDarkColorScheme ? "rgba(208, 122, 54, 0.08)" : "rgba(208, 122, 54, 0.08)",
        }}
      />

      <Animated.View entering={FadeInDown.duration(420)} style={{ paddingHorizontal: UI_PRESETS.spacing.section, paddingTop: UI_PRESETS.spacing.xl, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <Text selectable style={{ fontFamily: "Geist", fontSize: 28, fontWeight: "700", color: theme.foreground }}>
            AI
          </Text>
          <Avatar
            source={user?.image ? { uri: user.image } : undefined}
            fallback={user?.name ?? user?.email ?? displayName}
            size="sm"
            style={{
              borderWidth: 1,
              borderColor: "rgba(123, 109, 246, 0.28)",
              backgroundColor: "rgba(123, 109, 246, 0.12)",
            }}
          />
        </View>

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
              {THREAD_CONTEXT[activeThread]}
            </Text>
            <Text selectable variant="muted">
              6:00 AM sync
            </Text>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(50).duration(420)} style={{ paddingTop: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: UI_PRESETS.spacing.section, gap: 8 }}>
          {[
            { id: "new", label: "New" },
            { id: "week", label: "Week plan" },
            { id: "finance", label: "Finance" },
            { id: "faith", label: "Faith review" },
          ].map((thread) => {
            const selected = thread.id === activeThread;

            return (
              <Pressable
                key={thread.id}
                onPress={() => openThread(thread.id as ThreadId)}
                style={({ pressed }) => ({
                  borderRadius: 999,
                  borderCurve: "continuous",
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  backgroundColor: selected ? "rgba(123, 109, 246, 0.16)" : theme.card,
                  borderWidth: 1,
                  borderColor: selected ? "rgba(123, 109, 246, 0.28)" : theme.border,
                  opacity: pressed ? 0.84 : 1,
                })}
              >
                <Text selectable variant="small" style={{ color: selected ? "#c8b8ff" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                  {thread.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      {agentText ? (
        <Animated.View entering={FadeInDown.delay(80).duration(320)} style={{ paddingHorizontal: UI_PRESETS.spacing.section, paddingTop: 10 }}>
          <Card
            style={{
              borderRadius: 14,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: isDarkColorScheme ? "rgba(110, 98, 190, 0.28)" : "rgba(110, 98, 190, 0.18)",
              backgroundColor: isDarkColorScheme ? "rgba(26, 26, 36, 0.96)" : "rgba(244, 242, 255, 0.98)",
              padding: 10,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#9b8fff" }} />
              <Text selectable variant="small" style={{ color: theme.primary, flex: 1 }}>
                {agentText}
              </Text>
              <Pressable onPress={() => setAgentText(null)}>
                <Text selectable variant="muted">
                  Stop
                </Text>
              </Pressable>
            </View>
          </Card>
        </Animated.View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: 12,
          paddingBottom: 24,
          gap: 12,
        }}
      >
        {activeThread === "new" ? (
          <Animated.View entering={FadeInDown.delay(100).duration(420)} style={{ gap: 12 }}>
            {activeMessages.map((message) => (
              <ChatRow key={message.id} message={message} theme={theme} />
            ))}
            <Text selectable variant="muted" style={{ letterSpacing: 1, textTransform: "uppercase", fontFamily: "Geist", fontWeight: "700", marginTop: 8 }}>
              Start a session
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <ActionCard
                title="Plan next week"
                subtitle="Generate a balanced weekly plan from your context"
                featured
                icon="calendar"
                iconColor="#b8abff"
                iconBackground="rgba(123, 109, 246, 0.16)"
                onPress={() => router.push("/(tabs)/ai/weekly-plan" as never)}
                width={compactCards ? 174 : 188}
              />
              <ActionCard
                title="Finance review"
                subtitle="Budget status and suggestions"
                icon="money"
                iconColor="#7cd9aa"
                iconBackground="rgba(31, 169, 127, 0.14)"
                onPress={() => openThread("finance")}
                width={compactCards ? 152 : 164}
              />
              <ActionCard
                title="Faith rhythm"
                subtitle="Patterns and intentions"
                icon="bullseye"
                iconColor="#b8abff"
                iconBackground="rgba(123, 109, 246, 0.16)"
                onPress={() => openThread("faith")}
                width={compactCards ? 152 : 164}
              />
              <ActionCard
                title="Classic view"
                subtitle="Plan, ask, and review in one screen"
                icon="th-large"
                iconColor="#91bfff"
                iconBackground="rgba(47, 125, 209, 0.14)"
                onPress={() => router.push("/(tabs)/ai/classic" as never)}
                width={compactCards ? 152 : 164}
              />
            </ScrollView>

            <View style={{ gap: 10, marginTop: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <Text selectable variant="muted" style={{ letterSpacing: 1, textTransform: "uppercase", fontFamily: "Geist", fontWeight: "700" }}>
                  Recent plan sessions
                </Text>
                <Pressable onPress={() => router.push("/(tabs)/ai/classic" as never)}>
                  <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
                    View all
                  </Text>
                </Pressable>
              </View>

              <SessionCard
                title="Week of Mar 17 draft"
                subtitle="16 priorities across 5 days. Finance review slotted Monday morning."
                meta="Generated today · Draft plan"
                badgeLabel="Weekly Plan"
                badgeColor="#b8abff"
                badgeBackground="rgba(123, 109, 246, 0.16)"
                icon="calendar"
                iconColor="#b8abff"
                iconBackground="rgba(123, 109, 246, 0.16)"
                onPress={() => router.push("/(tabs)/ai/weekly-plan" as never)}
                theme={theme}
              />
              <SessionCard
                title="Paused approval session"
                subtitle="2 approved, 6 pending. Resume the item-by-item review and save into Planner."
                meta="Updated today · Resume flow"
                badgeLabel="Resume Plan"
                badgeColor="#7cd9aa"
                badgeBackground="rgba(31, 169, 127, 0.14)"
                icon="history"
                iconColor="#7cd9aa"
                iconBackground="rgba(31, 169, 127, 0.14)"
                onPress={() => router.push("/(tabs)/ai/resume-plan" as never)}
                theme={theme}
              />
            </View>

            <View style={{ gap: 10, marginTop: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <Text selectable variant="muted" style={{ letterSpacing: 1, textTransform: "uppercase", fontFamily: "Geist", fontWeight: "700" }}>
                  AI utilities
                </Text>
                <Pressable onPress={() => router.push("/search" as never)}>
                  <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
                    Search
                  </Text>
                </Pressable>
              </View>

              <View style={{ flexDirection: compactCards ? "column" : "row", gap: 10 }}>
                <SessionCard
                  title="Approval inbox"
                  subtitle="Review pending changes before AI updates anything."
                  meta="3 pending · Finance, Faith, Health"
                  badgeLabel="Inbox"
                  badgeColor="#f0a07b"
                  badgeBackground="rgba(208, 122, 54, 0.14)"
                  icon="check-square-o"
                  iconColor="#f0a07b"
                  iconBackground="rgba(208, 122, 54, 0.14)"
                  onPress={() => router.push("/(tabs)/ai/approvals" as never)}
                  theme={theme}
                />
                <SessionCard
                  title="Memory viewer"
                  subtitle="Inspect what the AI reads before generating suggestions."
                  meta="8 domains · 53 tables · 7-day window"
                  badgeLabel="Context"
                  badgeColor="#91bfff"
                  badgeBackground="rgba(47, 125, 209, 0.14)"
                  icon="database"
                  iconColor="#91bfff"
                  iconBackground="rgba(47, 125, 209, 0.14)"
                  onPress={() => router.push("/(tabs)/ai/memory" as never)}
                  theme={theme}
                />
              </View>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(100).duration(420)} style={{ gap: 12 }}>
            {activeMessages.map((message) => (
              <ChatRow key={message.id} message={message} theme={theme} />
            ))}
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(140).duration(420)} style={{ gap: 10, paddingTop: 6 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {[
              "Afternoon focus",
              "Burnout check",
              "Cross-domain patterns",
              "What slipped?",
              "Reflect",
            ].map((chip) => (
              <Pressable
                key={chip}
                onPress={() => appendUserPrompt(chip)}
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

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TextInput
              value={composerText}
              onChangeText={setComposerText}
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
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <Pressable
              onPress={sendMessage}
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
      </ScrollView>
    </View>
  );
}

function ChatRow({ message, theme }: { message: ChatMessage; theme: AppTheme }) {
  const isUser = message.role === "user";

  return (
    <View
      style={{
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isUser ? "rgba(58, 46, 78, 0.9)" : "rgba(123, 109, 246, 0.14)",
          borderWidth: isUser ? 0 : 1,
          borderColor: isUser ? "transparent" : "rgba(123, 109, 246, 0.26)",
        }}
      >
        <Text selectable variant="muted" style={{ color: isUser ? "#b8abff" : "#9b8fff", fontFamily: "Geist", fontWeight: "700" }}>
          {isUser ? "B" : "AI"}
        </Text>
      </View>
      <View style={{ maxWidth: "84%", gap: 8 }}>
        <Card
          style={{
            borderRadius: 18,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: isUser ? "rgba(123, 109, 246, 0.26)" : theme.border,
            backgroundColor: isUser ? "rgba(30, 26, 48, 0.96)" : "rgba(26, 26, 36, 0.96)",
            padding: 12,
          }}
        >
          <Text selectable style={{ color: isUser ? "#d7d1ff" : theme.foreground, lineHeight: 21 }}>
            {message.text}
          </Text>
          {message.card?.length ? (
            <Card
              style={{
                borderRadius: 14,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: isUser ? "rgba(123, 109, 246, 0.18)" : "rgba(110, 98, 190, 0.18)",
                backgroundColor: "rgba(19, 19, 31, 0.96)",
                padding: 12,
                marginTop: 10,
                gap: 4,
              }}
            >
              {message.card.map((row) => (
                <View key={`${message.id}-${row.key}`} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, paddingVertical: 4 }}>
                  <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                    {row.key}
                  </Text>
                  <Text selectable variant="small" style={{ color: row.color ?? theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                    {row.value}
                  </Text>
                </View>
              ))}
            </Card>
          ) : null}
        </Card>
        {message.chips?.length ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {message.chips.map((chip) => (
              <Pressable
                key={chip.id}
                onPress={chip.action}
                style={({ pressed }) => ({
                  borderRadius: 999,
                  borderCurve: "continuous",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor:
                    chip.tone === "primary"
                      ? "rgba(123, 109, 246, 0.16)"
                      : chip.tone === "finance"
                        ? "rgba(31, 169, 127, 0.12)"
                        : chip.tone === "faith"
                          ? "rgba(123, 109, 246, 0.16)"
                          : theme.card,
                  borderWidth: 1,
                  borderColor:
                    chip.tone === "primary" || chip.tone === "faith"
                      ? "rgba(123, 109, 246, 0.26)"
                      : chip.tone === "finance"
                        ? "rgba(31, 169, 127, 0.24)"
                        : theme.border,
                  opacity: pressed ? 0.84 : 1,
                })}
              >
                <Text
                  selectable
                  variant="small"
                  style={{
                    color: chip.tone === "finance" ? "#7cd9aa" : chip.tone === "faith" || chip.tone === "primary" ? "#b8abff" : theme.mutedForeground,
                    fontFamily: "Geist",
                    fontWeight: "700",
                  }}
                >
                  {chip.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function ActionCard({
  title,
  subtitle,
  icon,
  iconColor,
  iconBackground,
  onPress,
  width,
  featured = false,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  iconColor: string;
  iconBackground: string;
  onPress: () => void;
  width: number;
  featured?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width,
        borderRadius: 18,
        borderCurve: "continuous",
        padding: 14,
        backgroundColor: featured ? "rgba(26, 26, 36, 0.96)" : "rgba(26, 26, 30, 0.96)",
        borderWidth: 1,
        borderColor: featured ? "rgba(110, 98, 190, 0.2)" : "rgba(255,255,255,0.06)",
        opacity: pressed ? 0.88 : 1,
      })}
    >
      <View style={{ width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: iconBackground, marginBottom: 10 }}>
        <FontAwesome name={icon} size={14} color={iconColor} />
      </View>
      <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: "#e4e4ea", marginBottom: 4 }}>
        {title}
      </Text>
      <Text selectable variant="small" style={{ color: "#7a7f8c", lineHeight: 17 }}>
        {subtitle}
      </Text>
      <Text selectable variant="muted" style={{ color: "#5b6070", marginTop: 8 }}>
        Open
      </Text>
    </Pressable>
  );
}

function SessionCard({
  title,
  subtitle,
  meta,
  badgeLabel,
  badgeColor,
  badgeBackground,
  icon,
  iconColor,
  iconBackground,
  onPress,
  theme,
}: {
  title: string;
  subtitle: string;
  meta: string;
  badgeLabel: string;
  badgeColor: string;
  badgeBackground: string;
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
        borderRadius: 20,
        borderCurve: "continuous",
        padding: 14,
        backgroundColor: "rgba(26, 26, 36, 0.96)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        opacity: pressed ? 0.88 : 1,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <View style={{ width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: iconBackground }}>
          <FontAwesome name={icon} size={15} color={iconColor} />
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: badgeBackground }}>
              <Text selectable variant="muted" style={{ color: badgeColor, fontFamily: "Geist", fontWeight: "700" }}>
                {badgeLabel}
              </Text>
            </View>
            <Text selectable variant="muted" style={{ color: "#5b6070" }}>
              {meta}
            </Text>
          </View>
          <View style={{ gap: 4 }}>
            <Text selectable style={{ fontFamily: "Geist", fontWeight: "700", color: "#e4e4ea" }}>
              {title}
            </Text>
            <Text selectable variant="small" style={{ color: "#7a7f8c", lineHeight: 18 }}>
              {subtitle}
            </Text>
          </View>
          <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
            Open session
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

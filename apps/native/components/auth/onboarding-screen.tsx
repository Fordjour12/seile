import {
  Children,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Redirect, useRouter } from "expo-router";
import Animated, {
  Easing,
  FadeInDown,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { Container } from "@/components/container";
import {
  AnimatedProgressBar,
  AnimatedStage,
} from "@/components/auth/onboarding-flow-motion";
import { useAuth } from "@/lib/auth-context";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type PlanningStyle = "balanced" | "light" | "intensive";
type AiTone = "direct" | "coaching" | "minimal";

const STEP_PROGRESS: Record<Step, number> = {
  1: 14,
  2: 28,
  3: 43,
  4: 57,
  5: 71,
  6: 86,
  7: 100,
};

const MAX_PINNED_DOMAINS = 4;

const DOMAIN_OPTIONS = [
  {
    id: "faith",
    label: "Faith",
    subtitle: "Prayer, fasting, devotionals",
    color: "#534AB7",
    background: "#2a2040",
    icon: "bullseye",
  },
  {
    id: "career",
    label: "Career",
    subtitle: "Projects, skills, goals",
    color: "#185FA5",
    background: "#1a1e2a",
    icon: "briefcase",
  },
  {
    id: "finance",
    label: "Finance",
    subtitle: "Budget, savings, spending",
    color: "#0F6E56",
    background: "#1a2a1e",
    icon: "money",
  },
  {
    id: "health",
    label: "Health",
    subtitle: "Training, sleep, energy",
    color: "#993C1D",
    background: "#2a1510",
    icon: "heartbeat",
  },
  {
    id: "wellness",
    label: "Wellness",
    subtitle: "Mood, stress, rest",
    color: "#993556",
    background: "#2a1020",
    icon: "moon-o",
  },
  {
    id: "tasks",
    label: "Tasks",
    subtitle: "To-dos, projects, inbox",
    color: "#5F5E5A",
    background: "#252525",
    icon: "check-square-o",
  },
  {
    id: "relationships",
    label: "Relationships",
    subtitle: "Connections, family, friends",
    color: "#185FA5",
    background: "#0e1420",
    icon: "users",
  },
  {
    id: "space",
    label: "Space",
    subtitle: "Home, zones, decor",
    color: "#854F0B",
    background: "#1a1408",
    icon: "home",
  },
] as const;

const STYLE_OPTIONS = [
  {
    id: "balanced" as const,
    label: "Balanced",
    description:
      "3-4 priorities per day. Full habits. One deep work block. Sustainable and steady.",
    color: "#ba7517",
  },
  {
    id: "light" as const,
    label: "Light",
    description:
      "2-3 priorities per day. Habits only. Space for the unexpected and recovery.",
    color: "#1d9e75",
  },
  {
    id: "intensive" as const,
    label: "Intensive",
    description:
      "4-5 priorities per day. Multiple deep work blocks. Stretch goals included.",
    color: "#e24b4a",
  },
] as const;

const TONE_OPTIONS = [
  {
    id: "direct" as const,
    label: "Direct",
    example: '"Finance review is 4 days overdue. Do it today."',
  },
  {
    id: "coaching" as const,
    label: "Coaching",
    example:
      '"The finance review has been waiting - finishing it today would close the week cleanly."',
  },
  {
    id: "minimal" as const,
    label: "Minimal",
    example: '"Finance: review due. 4 days elapsed."',
  },
] as const;

const TONE_MESSAGES: Record<AiTone, string> = {
  direct:
    "I don't know much about you yet - and that's fine. I'll start light. Check-ins, habits, completions - I'll read them all. Nothing changes without your approval.",
  coaching:
    "I'm starting without much context, and that's okay. The best way I learn is by watching what you actually do. I'll offer gentle suggestions early on and sharpen them as the picture fills in.",
  minimal:
    "No data yet. Will build context from check-ins and completions. Approval required for all changes.",
};

const NOTIFICATION_OPTIONS = [
  {
    key: "morningBriefing",
    title: "Morning briefing",
    subtitle: "Today screen summary - 8:00 AM",
  },
  {
    key: "approvalAlerts",
    title: "Approval alerts",
    subtitle: "Notify when AI has a change to propose",
  },
  {
    key: "eveningCheckin",
    title: "Evening check-in",
    subtitle: "Quick mood + day rating - 9:00 PM",
  },
  {
    key: "weeklyReview",
    title: "Weekly review reminder",
    subtitle: "Friday evening - review unlocks",
  },
  {
    key: "habitReminders",
    title: "Habit reminders",
    subtitle: "Nudge for unchecked habits - evening",
  },
] as const;

export function OnboardingScreen() {
  const { user, hasCompletedOnboarding, hasHydrated } = useAuth();
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const { height } = useWindowDimensions();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [domains, setDomains] = useState<string[]>([
    "faith",
    "career",
    "finance",
    "health",
  ]);
  const [pinnedDomainIds, setPinnedDomainIds] = useState<string[]>(["faith"]);
  const [planningStyle, setPlanningStyle] = useState<PlanningStyle>("balanced");
  const [aiTone, setAiTone] = useState<AiTone>("direct");
  const [notifications, setNotifications] = useState({
    morningBriefing: true,
    approvalAlerts: true,
    eveningCheckin: true,
    weeklyReview: true,
    habitReminders: false,
  });

  const minHeight = Math.max(height - UI_PRESETS.spacing.screen * 2, 760);
  const displayName = name.trim() || "Bobie";

  const summaryDomains = useMemo(
    () =>
      DOMAIN_OPTIONS.filter((item) => domains.includes(item.id)).sort(
        (a, b) => {
          const aPinnedIndex = pinnedDomainIds.indexOf(a.id);
          const bPinnedIndex = pinnedDomainIds.indexOf(b.id);

          if (aPinnedIndex !== -1 && bPinnedIndex !== -1) {
            return aPinnedIndex - bPinnedIndex;
          }
          if (aPinnedIndex !== -1) {
            return -1;
          }
          if (bPinnedIndex !== -1) {
            return 1;
          }
          return domains.indexOf(a.id) - domains.indexOf(b.id);
        },
      ),
    [domains, pinnedDomainIds],
  );

  if (hasHydrated && user) {
    return (
      <Redirect
        href={
          hasCompletedOnboarding ? "/(tabs)/domains" : "/(auth)/first-run-today"
        }
      />
    );
  }

  function nextStep() {
    setStep((current) => Math.min(7, current + 1) as Step);
  }

  function previousStep() {
    setStep((current) => Math.max(1, current - 1) as Step);
  }

  function toggleDomain(id: string) {
    setDomains((current) => {
      const isSelected = current.includes(id);
      if (isSelected && current.length === 1) {
        return current;
      }

      const nextDomains = isSelected
        ? current.filter((item) => item !== id)
        : [...current, id];

      if (isSelected) {
        setPinnedDomainIds((currentPinned) =>
          currentPinned.filter((item) => item !== id),
        );
      }

      return nextDomains;
    });
  }

  function togglePinnedDomain(id: string) {
    if (!domains.includes(id)) {
      return;
    }

    setPinnedDomainIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= MAX_PINNED_DOMAINS) {
        return current;
      }
      return [...current, id];
    });
  }

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <Container>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          minHeight,
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.lg,
          paddingBottom: UI_PRESETS.spacing.section,
          gap: 20,
        }}
      >
        <AnimatedProgressBar
          progress={STEP_PROGRESS[step]}
          trackColor={theme.border}
          fillColor="#9b8fff"
          height={2}
        />

        {step === 1 ? (
          <AnimatedStage
            stageKey="onboarding-step-1"
            style={{
              flex: 1,
              justifyContent: "space-between",
              gap: 24,
              minHeight: minHeight - 120,
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                gap: 28,
                paddingBottom: 20,
              }}
            >
              <View style={{ alignItems: "center", gap: 18 }}>
                <OnboardingSignalMark />
                <View style={{ gap: 10, alignItems: "center" }}>
                  <Text
                    selectable
                    variant="muted"
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      color: theme.mutedForeground,
                      fontFamily: "Geist",
                      fontWeight: "700",
                    }}
                  >
                    Welcome to
                  </Text>
                  <Text
                    selectable
                    style={{
                      color: theme.foreground,
                      fontFamily: "Geist",
                      fontSize: 34,
                      fontWeight: "700",
                      paddingVertical: 16,
                    }}
                  >
                    Seila OS
                  </Text>
                  <Text
                    selectable
                    variant="small"
                    style={{
                      color: theme.mutedForeground,
                      textAlign: "center",
                      lineHeight: 22,
                      maxWidth: 300,
                    }}
                  >
                    One intelligent system for every domain of your life. Calm,
                    personal, yours.
                  </Text>
                </View>
              </View>

              <View style={{ gap: 8 }}>
                {[
                  ["#9b8fff", "Plans your week using your real patterns"],
                  ["#1d9e75", "Tracks 8 life domains in one place"],
                  ["#ba7517", "Never changes anything without your approval"],
                ].map(([color, label], index) => (
                  <Animated.View
                    key={label}
                    entering={FadeInDown.delay(120 + index * 80).duration(320)}
                    layout={LinearTransition.springify()
                      .damping(18)
                      .stiffness(180)}
                  >
                    <Card
                      style={{
                        borderRadius: 12,
                        borderCurve: "continuous",
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        borderWidth: 1,
                        borderColor: theme.border,
                        backgroundColor: theme.card,
                      }}
                    >
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 999,
                          backgroundColor: color,
                        }}
                      />
                      <Text
                        selectable
                        variant="small"
                        style={{ color: theme.foreground }}
                      >
                        {label}
                      </Text>
                    </Card>
                  </Animated.View>
                ))}
              </View>
            </View>

            <Button
              title="Get started"
              onPress={nextStep}
              style={{ borderRadius: 14, borderCurve: "continuous" }}
            />
          </AnimatedStage>
        ) : null}

        {step === 2 ? (
          <StepShell
            stepLabel="Step 1 of 6"
            title="What should I call you?"
            subtitle="This is your personal space. Just your first name is fine."
            onBack={previousStep}
            onNext={nextStep}
            nextDisabled={!name.trim()}
          >
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name..."
              placeholderTextColor={theme.mutedForeground}
              style={{
                minHeight: 54,
                borderRadius: 14,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.card,
                color: theme.foreground,
                paddingHorizontal: 16,
                fontFamily: "Figtree",
                fontSize: 18,
              }}
            />
            <Text
              selectable
              variant="muted"
              style={{ color: theme.mutedForeground }}
            >
              Used in greetings and planning sessions - nothing else.
            </Text>
          </StepShell>
        ) : null}

        {step === 3 ? (
          <StepShell
            stepLabel="Step 2 of 6"
            title="Which areas of life matter most to you?"
            subtitle="Select all that apply. You can change this any time."
            onBack={previousStep}
            onNext={nextStep}
          >
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {DOMAIN_OPTIONS.map((item, index) => {
                const selected = domains.includes(item.id);
                const isOnlySelected = selected && domains.length === 1;
                const isPinned = pinnedDomainIds.includes(item.id);
                const hasReachedPinLimit =
                  !isPinned && pinnedDomainIds.length >= MAX_PINNED_DOMAINS;
                return (
                  <Animated.View
                    key={item.id}
                    entering={FadeInDown.delay(90 + index * 45).duration(280)}
                    layout={LinearTransition.springify()
                      .damping(18)
                      .stiffness(180)}
                    style={{ width: "48.5%", minWidth: 150 }}
                  >
                    <Pressable
                      onPress={() => toggleDomain(item.id)}
                      style={({ pressed }) => ({
                        borderRadius: 16,
                        borderCurve: "continuous",
                        padding: 14,
                        borderWidth: selected ? 1.5 : 1,
                        borderColor: selected ? item.color : theme.border,
                        backgroundColor: selected
                          ? `${item.color}22`
                          : theme.card,
                        opacity: pressed ? 0.88 : 1,
                      })}
                    >
                      <View
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          borderWidth: 1.5,
                          borderColor: selected ? item.color : theme.border,
                          backgroundColor: selected
                            ? item.color
                            : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {selected ? (
                          <FontAwesome name="check" size={8} color="#ffffff" />
                        ) : null}
                      </View>
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: item.background,
                          marginBottom: 8,
                        }}
                      >
                        <FontAwesome
                          name={
                            item.icon as ComponentProps<
                              typeof FontAwesome
                            >["name"]
                          }
                          size={14}
                          color={item.color}
                        />
                      </View>
                      <Text
                        selectable
                        variant="small"
                        style={{
                          color: theme.foreground,
                          fontFamily: "Geist",
                          fontWeight: "700",
                          marginBottom: 2,
                        }}
                      >
                        {item.label}
                      </Text>
                      <Text
                        selectable
                        variant="muted"
                        style={{ color: theme.mutedForeground, lineHeight: 16 }}
                      >
                        {item.subtitle}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 8,
                          marginTop: 10,
                        }}
                      >
                        {selected ? (
                          <Pressable
                            onPress={(event) => {
                              event.stopPropagation();
                              togglePinnedDomain(item.id);
                            }}
                            style={({ pressed }) => ({
                              borderRadius: 999,
                              borderCurve: "continuous",
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              borderWidth: 1,
                              borderColor: isPinned
                                ? item.color
                                : hasReachedPinLimit
                                  ? theme.border
                                  : theme.border,
                              backgroundColor: isPinned
                                ? `${item.color}22`
                                : theme.card,
                              opacity: pressed
                                ? 0.82
                                : hasReachedPinLimit
                                  ? 0.56
                                  : 1,
                            })}
                          >
                            <Text
                              selectable
                              variant="muted"
                              style={{
                                color: isPinned
                                  ? item.color
                                  : theme.mutedForeground,
                                fontFamily: "Geist",
                                fontWeight: "700",
                              }}
                            >
                              {isPinned ? "Unpin" : "Pin"}
                            </Text>
                          </Pressable>
                        ) : null}
                        {isPinned ? (
                          <Badge variant="outline" color="secondary">
                            Pinned
                          </Badge>
                        ) : null}
                        {hasReachedPinLimit ? (
                          <Badge variant="outline" color="secondary">
                            Max 4
                          </Badge>
                        ) : null}
                        {isOnlySelected ? (
                          <Badge variant="outline" color="secondary">
                            Keep 1+
                          </Badge>
                        ) : null}
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
            <Text
              selectable
              variant="muted"
              style={{ color: theme.mutedForeground, textAlign: "center" }}
            >
              Pick the domains that matter most right now. Keep at least one
              selected, and pin up to four to feature them first.
            </Text>
          </StepShell>
        ) : null}

        {step === 4 ? (
          <StepShell
            stepLabel="Step 3 of 6"
            title="How do you like to plan?"
            subtitle="This shapes how the AI builds your weekly plan. You can change it any time."
            onBack={previousStep}
            onNext={nextStep}
          >
            <View style={{ gap: 8 }}>
              {STYLE_OPTIONS.map((item, index) => {
                const selected = planningStyle === item.id;
                return (
                  <Animated.View
                    key={item.id}
                    entering={FadeInDown.delay(90 + index * 70).duration(280)}
                    layout={LinearTransition.springify()
                      .damping(18)
                      .stiffness(180)}
                  >
                    <Pressable
                      onPress={() => setPlanningStyle(item.id)}
                      style={({ pressed }) => ({
                        borderRadius: 16,
                        borderCurve: "continuous",
                        padding: 16,
                        backgroundColor: selected
                          ? "rgba(30, 22, 40, 0.96)"
                          : theme.card,
                        borderWidth: 1,
                        borderColor: selected
                          ? "rgba(61, 53, 112, 0.9)"
                          : theme.border,
                        opacity: pressed ? 0.88 : 1,
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: 12,
                      })}
                    >
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          backgroundColor: item.color,
                          marginTop: 3,
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          selectable
                          style={{
                            color: theme.foreground,
                            fontFamily: "Geist",
                            fontWeight: "700",
                            marginBottom: 3,
                          }}
                        >
                          {item.label}
                        </Text>
                        <Text
                          selectable
                          variant="small"
                          style={{
                            color: theme.mutedForeground,
                            lineHeight: 18,
                          }}
                        >
                          {item.description}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 999,
                          borderWidth: 1.5,
                          borderColor: selected ? "#9b8fff" : theme.border,
                          backgroundColor: selected ? "#9b8fff" : "transparent",
                        }}
                      >
                        {selected ? (
                          <View
                            style={{
                              position: "absolute",
                              inset: 5,
                              borderRadius: 999,
                              backgroundColor: "#0e0e10",
                            }}
                          />
                        ) : null}
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </StepShell>
        ) : null}

        {step === 5 ? (
          <StepShell
            stepLabel="Step 4 of 6"
            title="How should the AI talk to you?"
            subtitle="This changes how suggestions, nudges, and summaries are written throughout the app."
            onBack={previousStep}
            onNext={nextStep}
          >
            <View style={{ gap: 8 }}>
              {TONE_OPTIONS.map((item, index) => {
                const selected = aiTone === item.id;
                return (
                  <Animated.View
                    key={item.id}
                    entering={FadeInDown.delay(90 + index * 70).duration(280)}
                    layout={LinearTransition.springify()
                      .damping(18)
                      .stiffness(180)}
                  >
                    <Pressable
                      onPress={() => setAiTone(item.id)}
                      style={({ pressed }) => ({
                        borderRadius: 14,
                        borderCurve: "continuous",
                        padding: 14,
                        backgroundColor: selected
                          ? "rgba(30, 22, 40, 0.96)"
                          : theme.card,
                        borderWidth: 1,
                        borderColor: selected
                          ? "rgba(61, 53, 112, 0.9)"
                          : theme.border,
                        opacity: pressed ? 0.88 : 1,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      })}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          selectable
                          variant="small"
                          style={{
                            color: theme.foreground,
                            fontFamily: "Geist",
                            fontWeight: "700",
                          }}
                        >
                          {item.label}
                        </Text>
                        <Text
                          selectable
                          variant="muted"
                          style={{
                            color: theme.mutedForeground,
                            marginTop: 2,
                            fontStyle: "italic",
                            lineHeight: 17,
                          }}
                        >
                          {item.example}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 999,
                          borderWidth: 1.5,
                          borderColor: selected ? "#9b8fff" : theme.border,
                          backgroundColor: selected ? "#9b8fff" : "transparent",
                        }}
                      >
                        {selected ? (
                          <View
                            style={{
                              position: "absolute",
                              inset: 3,
                              borderRadius: 999,
                              backgroundColor: "#0e0e10",
                            }}
                          />
                        ) : null}
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
            <Card
              style={{
                borderRadius: 10,
                borderCurve: "continuous",
                padding: 12,
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.card,
              }}
            >
              <Text
                selectable
                variant="muted"
                style={{ color: theme.mutedForeground, marginBottom: 4 }}
              >
                Also applies to
              </Text>
              <Text
                selectable
                variant="small"
                style={{ color: theme.foreground, lineHeight: 20 }}
              >
                Today suggestions - domain nudges - plan summaries - weekly
                review - approval language
              </Text>
            </Card>
          </StepShell>
        ) : null}

        {step === 6 ? (
          <StepShell
            stepLabel="Step 5 of 6"
            title="When should I check in with you?"
            subtitle="You can adjust timing later in Profile. These are just defaults."
            onBack={previousStep}
            onNext={nextStep}
          >
            <View style={{ gap: 8 }}>
              {NOTIFICATION_OPTIONS.map((item, index) => {
                const active = notifications[item.key];
                return (
                  <Animated.View
                    key={item.key}
                    entering={FadeInDown.delay(90 + index * 55).duration(280)}
                    layout={LinearTransition.springify()
                      .damping(18)
                      .stiffness(180)}
                  >
                    <Pressable
                      onPress={() => toggleNotification(item.key)}
                      style={({ pressed }) => ({
                        borderRadius: 14,
                        borderCurve: "continuous",
                        padding: 14,
                        backgroundColor: theme.card,
                        borderWidth: 1,
                        borderColor: theme.border,
                        opacity: pressed ? 0.88 : 1,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      })}
                    >
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(30, 26, 48, 0.96)",
                        }}
                      >
                        <FontAwesome name="clock-o" size={12} color="#9b8fff" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          selectable
                          variant="small"
                          style={{
                            color: theme.foreground,
                            fontFamily: "Geist",
                            fontWeight: "700",
                          }}
                        >
                          {item.title}
                        </Text>
                        <Text
                          selectable
                          variant="muted"
                          style={{ color: theme.mutedForeground, marginTop: 2 }}
                        >
                          {item.subtitle}
                        </Text>
                      </View>
                      <Switch
                        value={active}
                        onValueChange={() => toggleNotification(item.key)}
                        trackColor={{ false: "#252530", true: "#9b8fff" }}
                        thumbColor="#ffffff"
                      />
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </StepShell>
        ) : null}

        {step === 7 ? (
          <AnimatedStage
            stageKey="onboarding-step-7"
            style={{
              flex: 1,
              justifyContent: "space-between",
              gap: 20,
              minHeight: minHeight - 120,
            }}
          >
            <View style={{ gap: 16 }}>
              <View style={{ gap: 8 }}>
                <Text
                  selectable
                  variant="muted"
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: theme.mutedForeground,
                    fontFamily: "Geist",
                    fontWeight: "700",
                  }}
                >
                  Step 6 of 6
                </Text>
                <Text
                  selectable
                  style={{
                    color: theme.foreground,
                    fontFamily: "Geist",
                    fontSize: 28,
                    fontWeight: "700",
                    lineHeight: 34,
                  }}
                >
                  You're set up, {displayName}.
                </Text>
                <Text
                  selectable
                  variant="small"
                  style={{ color: theme.mutedForeground, lineHeight: 22 }}
                >
                  Here's what I know heading into your first week. I'll learn
                  more as you use the app.
                </Text>
              </View>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {summaryDomains.map((item) => (
                  <Animated.View
                    key={item.id}
                    layout={LinearTransition.springify()
                      .damping(18)
                      .stiffness(180)}
                    style={{
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      backgroundColor: item.background,
                      borderWidth: 1,
                      borderColor: `${item.color}66`,
                    }}
                  >
                    <Text
                      selectable
                      variant="muted"
                      style={{
                        color: item.color,
                        fontFamily: "Geist",
                        fontWeight: "700",
                      }}
                    >
                      {item.label}
                    </Text>
                  </Animated.View>
                ))}
              </View>

              <Card
                style={{
                  borderRadius: 16,
                  borderCurve: "continuous",
                  padding: 16,
                  gap: 10,
                  borderWidth: 1,
                  borderColor: "rgba(42, 42, 64, 0.9)",
                  backgroundColor: "rgba(19, 19, 31, 0.96)",
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <View
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      backgroundColor: "#9b8fff",
                    }}
                  />
                  <Text
                    selectable
                    variant="muted"
                    style={{
                      color: theme.primary,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      fontFamily: "Geist",
                      fontWeight: "700",
                    }}
                  >
                    First message
                  </Text>
                </View>
                <Text
                  selectable
                  variant="small"
                  style={{ color: "#b0b0c0", lineHeight: 22 }}
                >
                  {TONE_MESSAGES[aiTone]}
                </Text>
              </Card>

              <Card
                style={{
                  borderRadius: 14,
                  borderCurve: "continuous",
                  padding: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                }}
              >
                <Text
                  selectable
                  variant="muted"
                  style={{
                    color: theme.mutedForeground,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontFamily: "Geist",
                    fontWeight: "700",
                    marginBottom: 8,
                  }}
                >
                  What happens next
                </Text>
                <View style={{ gap: 8 }}>
                  {[
                    [
                      "#9b8fff",
                      "You'll land on Today - your daily command center",
                    ],
                    [
                      "#1d9e75",
                      "The AI will suggest your first priorities and habits",
                    ],
                    [
                      "#ba7517",
                      "Your first weekly plan generates after your first check-in",
                    ],
                    [
                      "#534AB7",
                      pinnedDomainIds.length > 0
                        ? `${pinnedDomainIds.length} pinned domain${pinnedDomainIds.length === 1 ? "" : "s"} will be featured first across the app`
                        : "Your selected domains shape the first week of suggestions",
                    ],
                  ].map(([color, label]) => (
                    <View
                      key={label}
                      style={{
                        flexDirection: "row",
                        gap: 8,
                        alignItems: "flex-start",
                      }}
                    >
                      <View
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: 999,
                          backgroundColor: color,
                          marginTop: 6,
                        }}
                      />
                      <Text
                        selectable
                        variant="small"
                        style={{
                          color: theme.foreground,
                          lineHeight: 18,
                          flex: 1,
                        }}
                      >
                        {label}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            </View>

            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button
                  title="Preview Day 1"
                  variant="outline"
                  onPress={() => router.push("/(auth)/first-run-today")}
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    borderCurve: "continuous",
                  }}
                />
                <Button
                  title="Preview Week 1"
                  variant="outline"
                  onPress={() => router.push("/(auth)/week-1")}
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    borderCurve: "continuous",
                  }}
                />
              </View>
              <Button
                title="Create account"
                onPress={() => router.push("/(auth)/sign-up")}
                style={{ borderRadius: 14, borderCurve: "continuous" }}
              />
              <Button
                title="I already have one"
                variant="outline"
                onPress={() => router.push("/(auth)/sign-in")}
                style={{ borderRadius: 14, borderCurve: "continuous" }}
              />
              <Button
                title="Back"
                variant="ghost"
                onPress={previousStep}
                style={{ borderRadius: 14, borderCurve: "continuous" }}
              />
            </View>
          </AnimatedStage>
        ) : null}
      </ScrollView>
    </Container>
  );
}

function StepShell({
  stepLabel,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextDisabled = false,
}: {
  stepLabel: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  const stepChildren = Children.toArray(children);

  return (
    <AnimatedStage
      stageKey={stepLabel}
      style={{ flex: 1, justifyContent: "space-between", gap: 20 }}
    >
      <View style={{ gap: 16 }}>
        <View style={{ gap: 10 }}>
          <Text
            selectable
            variant="muted"
            style={{
              textTransform: "uppercase",
              letterSpacing: 1,
              fontFamily: "Geist",
              fontWeight: "700",
              color: "#666",
            }}
          >
            {stepLabel}
          </Text>
          <Text
            selectable
            style={{
              color: "#ffffff",
              fontFamily: "Geist",
              fontSize: 28,
              fontWeight: "700",
              lineHeight: 34,
            }}
          >
            {title}
          </Text>
          <Text
            selectable
            variant="small"
            style={{ color: "#666", lineHeight: 22 }}
          >
            {subtitle}
          </Text>
        </View>
        {stepChildren.map((child, index) => (
          <Animated.View
            key={`${stepLabel}-child-${index}`}
            entering={FadeInDown.delay(90 + index * 70).duration(280)}
            layout={LinearTransition.springify().damping(18).stiffness(180)}
          >
            {child}
          </Animated.View>
        ))}
      </View>

      <Animated.View
        entering={FadeInDown.delay(180 + stepChildren.length * 50).duration(
          280,
        )}
        style={{ flexDirection: "row", gap: 8, paddingTop: 8 }}
      >
        <Button
          title="←"
          variant="outline"
          onPress={onBack}
          style={{
            paddingHorizontal: 18,
            borderRadius: 14,
            borderCurve: "continuous",
          }}
        />
        <Button
          title="Continue"
          onPress={onNext}
          disabled={nextDisabled}
          style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }}
        />
      </Animated.View>
    </AnimatedStage>
  );
}

function OnboardingSignalMark() {
  const shellScale = useSharedValue(1);
  const coreScale = useSharedValue(1);
  const dotScale = useSharedValue(1);
  const ringOneScale = useSharedValue(0.96);
  const ringOneOpacity = useSharedValue(0.7);
  const ringTwoScale = useSharedValue(0.88);
  const ringTwoOpacity = useSharedValue(0.5);

  useEffect(() => {
    shellScale.value = withRepeat(
      withSequence(
        withTiming(1.035, {
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(1, {
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );

    coreScale.value = withRepeat(
      withSequence(
        withTiming(1.08, {
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );

    dotScale.value = withRepeat(
      withSequence(
        withTiming(1.18, {
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0.94, {
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );

    ringOneScale.value = withRepeat(
      withSequence(
        withTiming(1.08, {
          duration: 2200,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(0.96, {
          duration: 2200,
          easing: Easing.inOut(Easing.cubic),
        }),
      ),
      -1,
      false,
    );
    ringOneOpacity.value = withRepeat(
      withSequence(
        withTiming(0.18, {
          duration: 2200,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(0.7, {
          duration: 2200,
          easing: Easing.inOut(Easing.cubic),
        }),
      ),
      -1,
      false,
    );

    ringTwoScale.value = withRepeat(
      withSequence(
        withTiming(1.16, {
          duration: 2600,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(0.88, {
          duration: 2600,
          easing: Easing.inOut(Easing.cubic),
        }),
      ),
      -1,
      false,
    );
    ringTwoOpacity.value = withRepeat(
      withSequence(
        withTiming(0.08, {
          duration: 2600,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(0.5, {
          duration: 2600,
          easing: Easing.inOut(Easing.cubic),
        }),
      ),
      -1,
      false,
    );
  }, [
    coreScale,
    dotScale,
    ringOneOpacity,
    ringOneScale,
    ringTwoOpacity,
    ringTwoScale,
    shellScale,
  ]);

  const shellStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shellScale.value }],
  }));
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coreScale.value }],
  }));
  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));
  const ringOneStyle = useAnimatedStyle(() => ({
    opacity: ringOneOpacity.value,
    transform: [{ scale: ringOneScale.value }],
  }));
  const ringTwoStyle = useAnimatedStyle(() => ({
    opacity: ringTwoOpacity.value,
    transform: [{ scale: ringTwoScale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 100,
          height: 100,
          alignItems: "center",
          justifyContent: "center",
        },
        shellStyle,
      ]}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            inset: -18,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "rgba(30, 30, 40, 0.8)",
          },
          ringTwoStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            inset: -8,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "rgba(45, 42, 64, 0.8)",
          },
          ringOneStyle,
        ]}
      />
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(26, 26, 36, 0.96)",
          borderWidth: 1,
          borderColor: "rgba(45, 42, 64, 0.8)",
        }}
      >
        <Animated.View
          style={[
            {
              width: 44,
              height: 44,
              borderRadius: 999,
              backgroundColor: "rgba(30, 26, 48, 0.96)",
              borderWidth: 1,
              borderColor: "rgba(61, 53, 112, 0.9)",
              alignItems: "center",
              justifyContent: "center",
            },
            coreStyle,
          ]}
        >
          <Animated.View
            style={[
              {
                width: 18,
                height: 18,
                borderRadius: 999,
                backgroundColor: "#9b8fff",
              },
              dotStyle,
            ]}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

import { useState, type ComponentProps, type ReactNode } from "react";
import {
  Alert as RNAlert,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Separator,
  Switch,
  Text,
} from "@/components";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { useColorScheme } from "@/lib/use-color-scheme";

type ToggleKey =
  | "proactiveSuggestions"
  | "approvalRequired"
  | "morningBriefing"
  | "approvalAlerts"
  | "habitReminders";

type DomainItem = {
  id: string;
  label: string;
  accent: string;
  status: "active" | "inactive" | "pinned";
};

const DOMAIN_ORDER: DomainItem[] = [
  { id: "faith", label: "Faith", accent: "#5b50d6", status: "pinned" },
  { id: "career", label: "Career", accent: "#2d8cff", status: "active" },
  { id: "finance", label: "Finance", accent: "#1fa97f", status: "active" },
  { id: "health", label: "Health", accent: "#da7a36", status: "active" },
  { id: "wellness", label: "Wellness", accent: "#d45689", status: "active" },
  { id: "tasks", label: "Tasks", accent: "#8a8f9c", status: "active" },
  {
    id: "relationships",
    label: "Relationships",
    accent: "#4b4f57",
    status: "inactive",
  },
  { id: "space", label: "Space", accent: "#4b4f57", status: "inactive" },
];

const CRON_ROWS = [
  {
    id: "context",
    name: "Daily context aggregation",
    time: "06:00 UTC",
    status: "ok" as const,
  },
  {
    id: "finance",
    name: "Finance summary",
    time: "06:05 UTC",
    status: "ok" as const,
  },
  {
    id: "faith",
    name: "Faith log rollup",
    time: "06:10 UTC",
    status: "ok" as const,
  },
  {
    id: "review",
    name: "Weekly review prep",
    time: "Fri 20:00 UTC",
    status: "warn" as const,
  },
  {
    id: "streak",
    name: "Habit streak calc",
    time: "23:55 UTC",
    status: "ok" as const,
  },
];

export function SettingsProfileScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user, signOut } = useAuth();

  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    proactiveSuggestions: true,
    approvalRequired: true,
    morningBriefing: true,
    approvalAlerts: true,
    habitReminders: false,
  });

  const compactMetrics = width < 380;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const displayName = user?.name?.trim() || "Life OS member";
  const identityLine = [
    user?.email?.trim() || "Private workspace",
    "Active since Jan 2026",
    timezone,
  ].join(" · ");

  const metrics = [
    { label: "Day streak", value: "47", color: "#b7afff" },
    { label: "Avg completion", value: "68%", color: "#45c58b" },
    { label: "Faith streak", value: "5", color: "#9f8fff" },
    { label: "Domains active", value: "8", color: "#ffaf63" },
  ];

  function toggleValue(key: ToggleKey) {
    setToggles((current) => ({ ...current, [key]: !current[key] }));
  }

  function showStubAction(title: string, message: string) {
    RNAlert.alert(title, message);
  }

  function confirmSignOut() {
    RNAlert.alert(
      "Sign out?",
      "You can sign back in anytime with your current account.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: () => {
            void signOut();
          },
        },
      ],
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -48,
          right: -72,
          width: 240,
          height: 240,
          borderRadius: 999,
          backgroundColor: isDarkColorScheme
            ? "rgba(155, 143, 255, 0.12)"
            : "rgba(91, 80, 214, 0.12)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 180,
          left: -80,
          width: 220,
          height: 220,
          borderRadius: 999,
          backgroundColor: isDarkColorScheme
            ? "rgba(31, 169, 127, 0.08)"
            : "rgba(31, 169, 127, 0.1)",
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.xl,
          paddingBottom: 48,
          gap: UI_PRESETS.spacing.section,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(450)}>
          <LinearGradient
            colors={
              isDarkColorScheme
                ? ["rgba(37, 34, 65, 0.98)", "rgba(16, 16, 24, 0.96)"]
                : ["rgba(239, 237, 255, 0.98)", "rgba(248, 249, 255, 0.98)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 28,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: isDarkColorScheme
                ? "rgba(110, 102, 176, 0.34)"
                : "rgba(133, 126, 210, 0.18)",
              padding: 18,
              gap: 16,
              boxShadow: theme.shadowLg,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <Badge variant="subtle" color="primary">
                Life OS profile
              </Badge>
              <Pressable
                onPress={() =>
                  showStubAction(
                    "Edit profile",
                    "Profile editing is next on the settings roadmap. The visual treatment is now in place.",
                  )
                }
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  variant="small"
                  style={{
                    color: theme.primary,
                    fontFamily: "Geist",
                    fontWeight: "600",
                  }}
                >
                  Edit
                </Text>
              </Pressable>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
            >
              <View
                style={{
                  borderRadius: 999,
                  padding: 3,
                  backgroundColor: isDarkColorScheme
                    ? "rgba(155, 143, 255, 0.22)"
                    : "rgba(91, 80, 214, 0.12)",
                }}
              >
                <Avatar
                  source={user?.image ? { uri: user.image } : undefined}
                  fallback={displayName}
                  size="lg"
                  style={{
                    backgroundColor: isDarkColorScheme
                      ? "rgba(46, 42, 76, 1)"
                      : "rgba(226, 222, 255, 1)",
                  }}
                />
              </View>

              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  selectable
                  style={{
                    ...Typography.titleLG,
                    color: theme.foreground,
                  }}
                >
                  {displayName}
                </Text>
                <Text
                  selectable
                  style={{
                    ...Typography.captionLG,
                    color: theme.mutedForeground,
                  }}
                >
                  {identityLine}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {metrics.map((metric) => (
                <View
                  key={metric.label}
                  style={{
                    flexGrow: 1,
                    flexBasis: compactMetrics ? "47%" : "22%",
                    minWidth: compactMetrics ? 130 : 0,
                    borderRadius: 18,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: isDarkColorScheme
                      ? "rgba(71, 72, 93, 0.8)"
                      : "rgba(203, 207, 224, 0.86)",
                    backgroundColor: isDarkColorScheme
                      ? "rgba(26, 26, 35, 0.86)"
                      : "rgba(255, 255, 255, 0.82)",
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    gap: 4,
                  }}
                >
                  <Text
                    selectable
                    style={{
                      fontFamily: "Figtree",
                      fontSize: 20,
                      fontWeight: "600",
                      lineHeight: 27,
                      fontVariant: ["tabular-nums"],
                      color: metric.color,
                    }}
                  >
                    {metric.value}
                  </Text>
                  <Text
                    style={{
                      ...Typography.captionSM,
                      color: theme.mutedForeground,
                    }}
                  >
                    {metric.label}
                  </Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(450)}>
          <SectionLabel label="AI behavior" />
          <Card
            style={{
              borderRadius: 20,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.card,
              boxShadow: theme.shadowSm,
              overflow: "hidden",
              padding: 0,
            }}
          >
            <SettingRow
              icon="sliders"
              iconColor="#a194ff"
              iconBackground={
                isDarkColorScheme
                  ? "rgba(86, 74, 188, 0.18)"
                  : "rgba(91, 80, 214, 0.12)"
              }
              title="Planning style"
              subtitle="How the AI structures your week"
              value="Balanced"
              onPress={() =>
                showStubAction(
                  "Planning style",
                  "This preference UI is visual-first for now.",
                )
              }
            />
            <Separator />
            <SettingRow
              icon="commenting-o"
              iconColor="#a194ff"
              iconBackground={
                isDarkColorScheme
                  ? "rgba(86, 74, 188, 0.18)"
                  : "rgba(91, 80, 214, 0.12)"
              }
              title="AI tone"
              subtitle="How the AI communicates with you"
              value="Direct"
              onPress={() =>
                showStubAction(
                  "AI tone",
                  "Tone presets will be wired next after the UI pass.",
                )
              }
            />
            <Separator />
            <SettingRow
              icon="sun-o"
              iconColor="#a194ff"
              iconBackground={
                isDarkColorScheme
                  ? "rgba(86, 74, 188, 0.18)"
                  : "rgba(91, 80, 214, 0.12)"
              }
              title="Proactive suggestions"
              subtitle="AI surfaces insights without being asked"
              right={
                <Switch
                  value={toggles.proactiveSuggestions}
                  onValueChange={() => toggleValue("proactiveSuggestions")}
                />
              }
            />
            <Separator />
            <SettingRow
              icon="lock"
              iconColor="#a194ff"
              iconBackground={
                isDarkColorScheme
                  ? "rgba(86, 74, 188, 0.18)"
                  : "rgba(91, 80, 214, 0.12)"
              }
              title="Approval required for all changes"
              subtitle="AI never writes to your plan without asking"
              right={
                <Switch
                  value={toggles.approvalRequired}
                  onValueChange={() => toggleValue("approvalRequired")}
                />
              }
            />
            <Separator />
            <SettingRow
              icon="clock-o"
              iconColor="#a194ff"
              iconBackground={
                isDarkColorScheme
                  ? "rgba(86, 74, 188, 0.18)"
                  : "rgba(91, 80, 214, 0.12)"
              }
              title="Insight refresh cadence"
              subtitle="How often cron jobs regenerate your context"
              value="Daily · 6 AM"
              onPress={() =>
                showStubAction(
                  "Insight refresh cadence",
                  "Cron scheduling controls are not wired yet.",
                )
              }
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(450)}>
          <SectionLabel label="Domain order" />
          <Text
            style={{
              ...Typography.bodySM,
              color: theme.mutedForeground,
              marginBottom: 10,
            }}
          >
            Drag-and-drop behavior can be added next. For now this screen
            mirrors the visual hierarchy and active state treatment from the
            design.
          </Text>
          <View style={{ gap: 8 }}>
            {DOMAIN_ORDER.map((domain) => (
              <Pressable
                key={domain.id}
                onPress={() =>
                  showStubAction(
                    domain.label,
                    domain.status === "inactive"
                      ? `${domain.label} is visible in the ordering model but not yet live in the product.`
                      : `Reordering interactions can be added after the visual pass.`,
                  )
                }
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 18,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor:
                    domain.status === "pinned"
                      ? isDarkColorScheme
                        ? "rgba(91, 80, 214, 0.55)"
                        : "rgba(91, 80, 214, 0.24)"
                      : theme.border,
                  backgroundColor:
                    domain.status === "pinned"
                      ? isDarkColorScheme
                        ? "rgba(29, 24, 52, 0.96)"
                        : "rgba(239, 237, 255, 0.92)"
                      : theme.card,
                  opacity: pressed
                    ? 0.88
                    : domain.status === "inactive"
                      ? 0.58
                      : 1,
                })}
              >
                <View style={{ gap: 3, opacity: 0.34 }}>
                  <View
                    style={{
                      width: 14,
                      height: 2,
                      borderRadius: 99,
                      backgroundColor: theme.mutedForeground,
                    }}
                  />
                  <View
                    style={{
                      width: 14,
                      height: 2,
                      borderRadius: 99,
                      backgroundColor: theme.mutedForeground,
                    }}
                  />
                  <View
                    style={{
                      width: 14,
                      height: 2,
                      borderRadius: 99,
                      backgroundColor: theme.mutedForeground,
                    }}
                  />
                </View>
                <View
                  style={{
                    width: 4,
                    alignSelf: "stretch",
                    borderRadius: 999,
                    backgroundColor: domain.accent,
                  }}
                />
                <Text
                  style={{
                    ...Typography.labelLG,
                    color: theme.foreground,
                    flex: 1,
                  }}
                >
                  {domain.label}
                </Text>
                {domain.status === "pinned" ? (
                  <Badge variant="outline" color="primary">
                    Pinned
                  </Badge>
                ) : domain.status === "inactive" ? (
                  <Badge variant="outline" color="secondary">
                    Inactive
                  </Badge>
                ) : (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      backgroundColor: domain.accent,
                    }}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(450)}>
          <SectionLabel label="AI memory" />
          <LinearGradient
            colors={
              isDarkColorScheme
                ? ["rgba(21, 20, 34, 0.98)", "rgba(14, 16, 26, 0.98)"]
                : ["rgba(243, 242, 255, 0.98)", "rgba(248, 250, 255, 0.98)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 22,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: isDarkColorScheme
                ? "rgba(84, 78, 140, 0.4)"
                : "rgba(91, 80, 214, 0.18)",
              padding: 16,
              gap: 14,
              boxShadow: theme.shadowMd,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: "#9d8dff",
                }}
              />
              <Text
                style={{
                  ...Typography.labelXS,
                  color: theme.primary,
                }}
              >
                Context layer
              </Text>
            </View>
            <Text
              style={{
                ...Typography.bodySM,
                color: theme.mutedForeground,
              }}
            >
              Your user-context rows are the pre-aggregated summaries the AI
              reads before generating anything. They update through cron jobs,
              not through ad hoc AI writes.
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {[
                { label: "Tables", value: "53" },
                { label: "Cron jobs", value: "24" },
                { label: "Timezone", value: "UTC" },
                { label: "Daily sync", value: "6 AM" },
              ].map((item) => (
                <View
                  key={item.label}
                  style={{
                    flexGrow: 1,
                    flexBasis: compactMetrics ? "47%" : "22%",
                    minWidth: compactMetrics ? 130 : 0,
                    borderRadius: 14,
                    borderCurve: "continuous",
                    backgroundColor: isDarkColorScheme
                      ? "rgba(31, 31, 45, 0.9)"
                      : "rgba(255, 255, 255, 0.78)",
                    borderWidth: 1,
                    borderColor: isDarkColorScheme
                      ? "rgba(76, 76, 96, 0.8)"
                      : "rgba(214, 218, 235, 0.8)",
                    padding: 12,
                    gap: 3,
                  }}
                >
                  <Text
                    selectable
                    style={{
                      fontFamily: "Figtree",
                      fontSize: 16,
                      fontWeight: "600",
                      lineHeight: 22,
                      fontVariant: ["tabular-nums"],
                      color: theme.foreground,
                    }}
                  >
                    {item.value}
                  </Text>
                  <Text
                    style={{
                      ...Typography.captionSM,
                      color: theme.mutedForeground,
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
            <View
              style={{ flexDirection: width < 420 ? "column" : "row", gap: 10 }}
            >
              <Button
                title="View my context"
                variant="outline"
                size="md"
                style={{ flex: 1 }}
                onPress={() => router.push("/(tabs)/ai/memory" as never)}
              />
              <Button
                title="Clear context"
                variant="ghost"
                size="md"
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: isDarkColorScheme
                    ? "rgba(181, 79, 99, 0.46)"
                    : "rgba(190, 76, 95, 0.26)",
                  backgroundColor: isDarkColorScheme
                    ? "rgba(41, 16, 22, 0.88)"
                    : "rgba(255, 238, 242, 0.86)",
                }}
                onPress={() =>
                  showStubAction(
                    "Clear context",
                    "The UI is in place. Context-reset behavior should be wired only after a backend-safe confirmation flow is defined.",
                  )
                }
              />
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(450)}>
          <SectionLabel label="Notifications" />
          <Card
            style={{
              borderRadius: 20,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.card,
              boxShadow: theme.shadowSm,
              overflow: "hidden",
              padding: 0,
            }}
          >
            <SettingRow
              icon="bell-o"
              iconColor="#45c58b"
              iconBackground={
                isDarkColorScheme
                  ? "rgba(29, 158, 117, 0.14)"
                  : "rgba(29, 158, 117, 0.12)"
              }
              title="Morning briefing"
              subtitle="Today screen summary on wake-up"
              right={
                <Switch
                  value={toggles.morningBriefing}
                  onValueChange={() => toggleValue("morningBriefing")}
                />
              }
            />
            <Separator />
            <SettingRow
              icon="bell-o"
              iconColor="#45c58b"
              iconBackground={
                isDarkColorScheme
                  ? "rgba(29, 158, 117, 0.14)"
                  : "rgba(29, 158, 117, 0.12)"
              }
              title="Approval alerts"
              subtitle="Notify when AI has a pending change"
              right={
                <Switch
                  value={toggles.approvalAlerts}
                  onValueChange={() => toggleValue("approvalAlerts")}
                />
              }
            />
            <Separator />
            <SettingRow
              icon="bell-o"
              iconColor="#45c58b"
              iconBackground={
                isDarkColorScheme
                  ? "rgba(29, 158, 117, 0.14)"
                  : "rgba(29, 158, 117, 0.12)"
              }
              title="Habit reminders"
              subtitle="Nudge for unchecked habits by evening"
              right={
                <Switch
                  value={toggles.habitReminders}
                  onValueChange={() => toggleValue("habitReminders")}
                />
              }
            />
            <Separator />
            <SettingRow
              icon="clock-o"
              iconColor="#45c58b"
              iconBackground={
                isDarkColorScheme
                  ? "rgba(29, 158, 117, 0.14)"
                  : "rgba(29, 158, 117, 0.12)"
              }
              title="Check-in reminder"
              subtitle="Daily mood + energy prompt"
              value="8:00 AM"
              onPress={() =>
                showStubAction(
                  "Check-in reminder",
                  "Reminder scheduling UI can be wired on top of this shell next.",
                )
              }
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(450)}>
          <SectionLabel label="Cron job status" />
          <Card
            style={{
              borderRadius: 20,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.card,
              boxShadow: theme.shadowSm,
              gap: 0,
            }}
          >
            {CRON_ROWS.map((row, index) => (
              <View key={row.id}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    paddingVertical: 12,
                  }}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text
                      style={{
                        ...Typography.captionLG,
                        color: theme.foreground,
                      }}
                    >
                      {row.name}
                    </Text>
                    <Text
                      selectable
                      style={{
                        ...Typography.codeSM,
                        color: theme.mutedForeground,
                      }}
                    >
                      {row.time}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      backgroundColor:
                        row.status === "ok" ? "#1fa97f" : "#ffb15f",
                    }}
                  />
                </View>
                {index < CRON_ROWS.length - 1 ? <Separator /> : null}
              </View>
            ))}

            <View
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: theme.border,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <Text
                style={{
                  ...Typography.captionLG,
                  color: theme.mutedForeground,
                }}
              >
                24 total · 23 healthy · 1 pending
              </Text>
              <Pressable
                onPress={() =>
                  showStubAction(
                    "Cron job status",
                    "A full job-health detail screen can be attached here later.",
                  )
                }
              >
                <Text style={{ ...Typography.labelSM, color: theme.primary }}>
                  View all
                </Text>
              </Pressable>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(360).duration(450)}>
          <SectionLabel label="Account" />
          <Card
            style={{
              borderRadius: 20,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.card,
              boxShadow: theme.shadowSm,
              overflow: "hidden",
              padding: 0,
            }}
          >
            <SettingRow
              icon="download"
              iconColor="#85b7eb"
              iconBackground={
                isDarkColorScheme
                  ? "rgba(45, 140, 255, 0.14)"
                  : "rgba(45, 140, 255, 0.12)"
              }
              title="Export my data"
              subtitle="Download everything as JSON or CSV"
              onPress={() =>
                showStubAction(
                  "Export my data",
                  "Export flows can be wired to a data package builder after the UI pass.",
                )
              }
            />
            <Separator />
            <SettingRow
              icon="shield"
              iconColor="#85b7eb"
              iconBackground={
                isDarkColorScheme
                  ? "rgba(45, 140, 255, 0.14)"
                  : "rgba(45, 140, 255, 0.12)"
              }
              title="Privacy"
              subtitle="What's stored, what's local only"
              onPress={() =>
                showStubAction(
                  "Privacy",
                  "Privacy detail content is a good next follow-up screen for the settings stack.",
                )
              }
            />
            <Separator />
            <SettingRow
              icon="history"
              iconColor="#85b7eb"
              iconBackground={
                isDarkColorScheme
                  ? "rgba(45, 140, 255, 0.14)"
                  : "rgba(45, 140, 255, 0.12)"
              }
              title="App version"
              subtitle="Life OS · v0.1.0 · build 47"
              onPress={() =>
                showStubAction(
                  "App version",
                  "Changelog and build metadata UI can plug into this row later.",
                )
              }
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(420).duration(450)}>
          <SectionLabel label="Danger zone" />
          <View style={{ gap: 10 }}>
            <Button
              title="Reset weekly plan"
              variant="ghost"
              size="md"
              style={{
                backgroundColor: isDarkColorScheme
                  ? "rgba(48, 17, 19, 0.9)"
                  : "rgba(255, 238, 239, 0.94)",
                borderWidth: 1,
                borderColor: isDarkColorScheme
                  ? "rgba(192, 86, 95, 0.36)"
                  : "rgba(192, 86, 95, 0.18)",
              }}
              onPress={() =>
                showStubAction(
                  "Reset weekly plan",
                  "This should stay behind a confirmation flow before any backend mutation is added.",
                )
              }
            />
            <Button
              title="Clear all AI context"
              variant="ghost"
              size="md"
              style={{
                backgroundColor: isDarkColorScheme
                  ? "rgba(48, 17, 19, 0.9)"
                  : "rgba(255, 238, 239, 0.94)",
                borderWidth: 1,
                borderColor: isDarkColorScheme
                  ? "rgba(192, 86, 95, 0.36)"
                  : "rgba(192, 86, 95, 0.18)",
              }}
              onPress={() =>
                showStubAction(
                  "Clear all AI context",
                  "This action should later route through the AI approval and memory safety model.",
                )
              }
            />
            <Button
              title="Sign out"
              variant="outline"
              size="md"
              onPress={confirmSignOut}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Text
      style={{
        ...Typography.labelXS,
        color: theme.mutedForeground,
        marginBottom: 8,
      }}
    >
      {label}
    </Text>
  );
}

function SettingRow({
  icon,
  iconColor,
  iconBackground,
  title,
  subtitle,
  value,
  right,
  onPress,
}: {
  icon: ComponentProps<typeof FontAwesome>["name"];
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
  value?: string;
  right?: ReactNode;
  onPress?: () => void;
}) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: pressed ? theme.muted : "transparent",
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          borderCurve: "continuous",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: iconBackground,
        }}
      >
        <FontAwesome name={icon} size={15} color={iconColor} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ ...Typography.labelMD, color: theme.foreground }}>
          {title}
        </Text>
        <Text style={{ ...Typography.captionLG, color: theme.mutedForeground }}>
          {subtitle}
        </Text>
      </View>
      {right ?? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {value ? (
            <Text
              style={{
                ...Typography.captionLG,
                color: theme.mutedForeground,
              }}
            >
              {value}
            </Text>
          ) : null}
          <FontAwesome
            name="angle-right"
            size={18}
            color={theme.mutedForeground}
          />
        </View>
      )}
    </Pressable>
  );
}

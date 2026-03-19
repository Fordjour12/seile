import type { ComponentProps, ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Alert as RNAlert,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Separator, Switch, Text } from "@/components";
import { Container } from "@/components/container";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type PlanningStyleId = "light" | "balanced" | "intensive";
type AiToneId = "direct" | "coaching" | "minimal";
type ExportFormat = "json" | "csv";
type ContextWindow = "3d" | "7d" | "14d" | "30d";

type ReminderDayId = "m" | "t" | "w" | "th" | "f" | "sa" | "su";

const PLANNING_STYLES: Array<{
  id: PlanningStyleId;
  title: string;
  description: string;
  example: string;
  accent: string;
}> = [
  {
    id: "light",
    title: "Light",
    description: "2 to 3 priorities per day. Habits only. Space for rest and the unexpected.",
    example: "Best for recovery weeks, low energy periods, or when life is unpredictable.",
    accent: "#1d9e75",
  },
  {
    id: "balanced",
    title: "Balanced",
    description: "3 to 4 priorities per day. Full habit stack. One deep work block daily.",
    example: "Your current setting. Sustainable pace with consistent progress.",
    accent: "#ba7517",
  },
  {
    id: "intensive",
    title: "Intensive",
    description: "4 to 5 priorities per day. Multiple deep work blocks. Stretch goals included.",
    example: "Best for sprint weeks when you are energized and have a clear goal.",
    accent: "#e24b4a",
  },
];

const AI_TONES: Array<{
  id: AiToneId;
  title: string;
  description: string;
  example: string;
}> = [
  {
    id: "direct",
    title: "Direct",
    description: "Short, clear, action-oriented. No softening.",
    example: "\"Finance review is 4 days overdue. Do it today.\"",
  },
  {
    id: "coaching",
    title: "Coaching",
    description: "Warmer framing. Context before action. Better for wellness and faith domains.",
    example:
      "\"The finance review has been waiting. Finishing it today would close the week cleanly.\"",
  },
  {
    id: "minimal",
    title: "Minimal",
    description: "Numbers and facts only. No interpretive language.",
    example: "\"Finance: review due. 4 days elapsed.\"",
  },
];

const MORNING_BRIEF_TIMES = ["5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "12:00 PM"];
const CHECK_IN_TIMES = ["7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM"];
const EVENING_TIMES = ["8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM"];
const QUIET_START_TIMES = ["9:00 PM", "10:00 PM", "11:00 PM"];
const QUIET_END_TIMES = ["6:00 AM", "7:00 AM", "8:00 AM"];
const REVIEW_TIME_OPTIONS = ["7:00 PM", "8:00 PM", "9:00 PM"];
const REMINDER_DAYS: Array<{ id: ReminderDayId; label: string; short: string }> = [
  { id: "m", label: "Monday", short: "M" },
  { id: "t", label: "Tuesday", short: "T" },
  { id: "w", label: "Wednesday", short: "W" },
  { id: "th", label: "Thursday", short: "T" },
  { id: "f", label: "Friday", short: "F" },
  { id: "sa", label: "Saturday", short: "S" },
  { id: "su", label: "Sunday", short: "S" },
];

const CRON_SCHEDULE = [
  {
    id: "daily-context",
    label: "Daily context sync",
    subtitle: "Aggregates all domain data",
    time: "06:00 UTC",
    color: "#1d9e75",
  },
  {
    id: "insight-refresh",
    label: "Insight refresh",
    subtitle: "Generates AI suggestions",
    time: "06:15 UTC",
    color: "#1d9e75",
  },
  {
    id: "habit-streak",
    label: "Habit streak calc",
    subtitle: "Updates streaks and completions",
    time: "23:55 UTC",
    color: "#88889a",
  },
  {
    id: "review-prep",
    label: "Weekly review prep",
    subtitle: "Generates Friday review data",
    time: "Fri 20:00 UTC",
    color: "#88889a",
  },
];

const EXPORT_OPTIONS = [
  {
    key: "allDomains",
    title: "All domains",
    subtitle: "Faith, Career, Finance, Health, Wellness, Tasks, Relationships, Space",
  },
  {
    key: "checkins",
    title: "Check-in history",
    subtitle: "Mood, energy, focus, stress · 47 entries",
  },
  {
    key: "contextSnapshots",
    title: "AI context snapshots",
    subtitle: "Pre-aggregated userContext rows and AI-ready summaries",
  },
  {
    key: "plannerHistory",
    title: "Planner history",
    subtitle: "All weekly plans, priorities, and completions",
  },
] as const;

export function PlanningStyleScreen() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [style, setStyle] = useState<PlanningStyleId>("balanced");

  return (
    <DetailScroll>
      <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 6 }}>
        <Text selectable style={{ ...Typography.titleLG, color: theme.foreground }}>
          Planning style
        </Text>
        <Text selectable style={{ ...Typography.bodySM, color: theme.mutedForeground, lineHeight: 20 }}>
          How the AI distributes priorities and habits across your week.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(420)} style={{ gap: 10 }}>
        {PLANNING_STYLES.map((item) => (
          <ChoiceCard
            key={item.id}
            selected={style === item.id}
            accent={item.accent}
            title={item.title}
            description={item.description}
            example={item.example}
            onPress={() => setStyle(item.id)}
          />
        ))}
      </Animated.View>

      <InfoNote text="This also controls how the AI responds to your energy check-ins. Lower energy days can still nudge the AI toward a lighter plan even when Intensive is selected." />

      <Button
        title="Save planning style"
        onPress={() => RNAlert.alert("Saved", `${labelForPlanningStyle(style)} planning style selected.`)}
        style={{ borderRadius: 14, borderCurve: "continuous" }}
      />
    </DetailScroll>
  );
}

export function AiToneScreen() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [tone, setTone] = useState<AiToneId>("direct");

  return (
    <DetailScroll>
      <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 6 }}>
        <Text selectable style={{ ...Typography.titleLG, color: theme.foreground }}>
          AI tone
        </Text>
        <Text selectable style={{ ...Typography.bodySM, color: theme.mutedForeground, lineHeight: 20 }}>
          How the AI communicates across suggestions, nudges, summaries, and weekly review moments.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(420)} style={{ gap: 10 }}>
        {AI_TONES.map((item) => (
          <ChoiceCard
            key={item.id}
            selected={tone === item.id}
            accent="#9b8fff"
            title={item.title}
            description={item.description}
            example={item.example}
            onPress={() => setTone(item.id)}
          />
        ))}
      </Animated.View>

      <InfoNote text="Applies to Today suggestions, domain nudges, plan summaries, weekly review language, approval descriptions, and cross-domain observations." />

      <Button
        title="Save AI tone"
        onPress={() => RNAlert.alert("Saved", `${labelForAiTone(tone)} tone selected.`)}
        style={{ borderRadius: 14, borderCurve: "continuous" }}
      />
    </DetailScroll>
  );
}

export function NotificationTimingScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const [morningBriefingEnabled, setMorningBriefingEnabled] = useState(true);
  const [morningBriefingTime, setMorningBriefingTime] = useState("8:00 AM");
  const [morningCheckInTime, setMorningCheckInTime] = useState("8:30 AM");
  const [eveningCheckInTime, setEveningCheckInTime] = useState("9:00 PM");
  const [reviewDay, setReviewDay] = useState<ReminderDayId>("f");
  const [reviewTime, setReviewTime] = useState("8:00 PM");
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietStart, setQuietStart] = useState("10:00 PM");
  const [quietEnd, setQuietEnd] = useState("7:00 AM");

  const reviewDayLabel = useMemo(
    () => REMINDER_DAYS.find((day) => day.id === reviewDay)?.label ?? "Friday",
    [reviewDay],
  );

  return (
    <DetailScroll>
      <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 6 }}>
        <Text selectable style={{ ...Typography.titleLG, color: theme.foreground }}>
          Notification timing
        </Text>
        <Text selectable style={{ ...Typography.bodySM, color: theme.mutedForeground, lineHeight: 20 }}>
          When Life OS checks in with you each day.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(50).duration(420)} style={{ gap: 14 }}>
        <SectionTag label="Morning briefing" />
        <Card style={detailCardStyle(theme)}>
          <ToggleDetailRow
            title="Enabled"
            subtitle="Today screen summary on wake-up"
            value={morningBriefingEnabled}
            onValueChange={setMorningBriefingEnabled}
          />
          <Separator />
          <ValueDetailRow
            title="Time"
            subtitle="When to send the morning briefing"
            value={morningBriefingTime}
          />
        </Card>

        <ChoiceChipRail
          label="Morning time"
          value={morningBriefingTime}
          options={MORNING_BRIEF_TIMES}
          onSelect={setMorningBriefingTime}
          accent="#9b8fff"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(90).duration(420)} style={{ gap: 14 }}>
        <SectionTag label="Check-in reminders" />
        <TimeOptionCard
          title="Morning check-in"
          subtitle="Mood, energy, focus prompt"
          options={CHECK_IN_TIMES}
          value={morningCheckInTime}
          onChange={setMorningCheckInTime}
        />
        <TimeOptionCard
          title="Evening check-in"
          subtitle="Day rating and reflection"
          options={EVENING_TIMES}
          value={eveningCheckInTime}
          onChange={setEveningCheckInTime}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(130).duration(420)} style={{ gap: 14 }}>
        <SectionTag label="Weekly review" />
        <Card style={detailCardStyle(theme)}>
          <ValueDetailRow
            title="Review day"
            subtitle="When the review unlocks and you are notified"
            value={reviewDayLabel}
          />
          <Separator />
          <ValueDetailRow title="Review time" subtitle="Evening reminder" value={reviewTime} />
        </Card>

        <DaySelector selected={reviewDay} onSelect={setReviewDay} />
        <ChoiceChipRail
          label="Review reminder time"
          value={reviewTime}
          options={REVIEW_TIME_OPTIONS}
          onSelect={setReviewTime}
          accent="#9b8fff"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(170).duration(420)} style={{ gap: 14 }}>
        <SectionTag label="Quiet hours" />
        <Card style={detailCardStyle(theme)}>
          <ToggleDetailRow
            title="Quiet hours"
            subtitle="No notifications during this window"
            value={quietHoursEnabled}
            onValueChange={setQuietHoursEnabled}
          />
          <Separator />
          <ValueDetailRow title="Start" value={quietStart} />
          <Separator />
          <ValueDetailRow title="End" value={quietEnd} />
        </Card>

        <View style={{ gap: 10 }}>
          <TimeOptionCard
            title="Quiet hours start"
            subtitle="When notifications stop"
            options={QUIET_START_TIMES}
            value={quietStart}
            onChange={setQuietStart}
          />
          <TimeOptionCard
            title="Quiet hours end"
            subtitle="When notifications resume"
            options={QUIET_END_TIMES}
            value={quietEnd}
            onChange={setQuietEnd}
          />
        </View>
      </Animated.View>

      <InfoNote text="These settings are visual for now. They define the intended timing model for Life OS nudges, reviews, and check-in prompts." />

      <Button
        title="Save notification timing"
        onPress={() => RNAlert.alert("Saved", "Notification timing preferences updated.")}
        style={{ borderRadius: 14, borderCurve: "continuous" }}
      />

      <Button
        title="Preview notifications"
        variant="outline"
        onPress={() => router.push("/notifications" as never)}
        style={{ borderRadius: 14, borderCurve: "continuous" }}
      />

      <View
        style={{
          borderRadius: 18,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: isDarkColorScheme ? "rgba(61, 53, 112, 0.3)" : "rgba(91, 80, 214, 0.18)",
          backgroundColor: isDarkColorScheme ? "rgba(19, 19, 31, 0.82)" : "rgba(244, 242, 255, 0.92)",
          padding: 14,
          gap: 8,
        }}
      >
        <Text selectable style={{ ...Typography.labelMD, color: theme.foreground }}>
          Current summary
        </Text>
        <Text selectable style={{ ...Typography.bodySM, color: theme.mutedForeground, lineHeight: 20 }}>
          Morning briefing {morningBriefingEnabled ? "on" : "off"} at {morningBriefingTime}. Check-ins at {morningCheckInTime} and {eveningCheckInTime}. Weekly review on {reviewDayLabel} at {reviewTime}. Quiet hours {quietHoursEnabled ? `${quietStart} to ${quietEnd}` : "off"}.
        </Text>
      </View>
    </DetailScroll>
  );
}

export function TimezoneSyncScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [contextWindow, setContextWindow] = useState<ContextWindow>("7d");

  return (
    <DetailScroll>
      <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 6 }}>
        <Text selectable style={{ ...Typography.titleLG, color: theme.foreground }}>
          Timezone and sync
        </Text>
        <Text selectable style={{ ...Typography.bodySM, color: theme.mutedForeground, lineHeight: 20 }}>
          All cron jobs run in UTC. Display times are converted to your local timezone.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(420)} style={{ gap: 14 }}>
        <SectionTag label="Timezone" />
        <Card style={detailCardStyle(theme)}>
          <ValueIconRow
            icon="globe"
            iconColor="#9b8fff"
            iconBackground={isDarkColorScheme ? "rgba(91, 80, 214, 0.18)" : "rgba(91, 80, 214, 0.12)"}
            title="Display timezone"
            subtitle="Times shown in the app"
            value="GMT+0 · Accra"
          />
          <Separator />
          <ValueIconRow
            icon="clock-o"
            iconColor="#9b8fff"
            iconBackground={isDarkColorScheme ? "rgba(91, 80, 214, 0.18)" : "rgba(91, 80, 214, 0.12)"}
            title="Cron timezone"
            subtitle="All jobs run in UTC and never change"
            value="UTC · locked"
          />
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(420)} style={{ gap: 14 }}>
        <SectionTag label="Cron schedule" />
        <Card style={detailCardStyle(theme)}>
          {CRON_SCHEDULE.map((item, index) => (
            <View key={item.id}>
              <ValueDetailRow title={item.label} subtitle={item.subtitle} value={item.time} valueColor={item.color} />
              {index < CRON_SCHEDULE.length - 1 ? <Separator /> : null}
            </View>
          ))}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(140).duration(420)} style={{ gap: 14 }}>
        <SectionTag label="Context window" />
        <PillRail
          options={[
            { id: "3d", label: "3 days" },
            { id: "7d", label: "7 days" },
            { id: "14d", label: "14 days" },
            { id: "30d", label: "30 days" },
          ]}
          value={contextWindow}
          onChange={(value) => setContextWindow(value as ContextWindow)}
        />
        <Text selectable style={{ ...Typography.bodySM, color: theme.mutedForeground, lineHeight: 20 }}>
          How far back cron jobs read when generating AI context. Longer windows surface deeper patterns, shorter windows keep focus closer to the present.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).duration(420)} style={{ gap: 14 }}>
        <SectionTag label="Manual sync" />
        <Pressable
          onPress={() => RNAlert.alert("Sync now", "This preview would manually trigger the daily context sync.")}
          style={({ pressed }) => ({
            opacity: pressed ? 0.88 : 1,
          })}
        >
          <Card
            style={{
              borderRadius: 16,
              borderCurve: "continuous",
              padding: 14,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.card,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                borderCurve: "continuous",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDarkColorScheme ? "rgba(91, 80, 214, 0.18)" : "rgba(91, 80, 214, 0.12)",
                borderWidth: 1,
                borderColor: isDarkColorScheme ? "rgba(91, 80, 214, 0.3)" : "rgba(91, 80, 214, 0.18)",
              }}
            >
              <FontAwesome name="refresh" size={14} color="#9b8fff" />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text selectable style={{ ...Typography.labelMD, color: theme.foreground }}>
                Sync now
              </Text>
              <Text selectable style={{ ...Typography.captionLG, color: theme.mutedForeground }}>
                Last synced today at 6:00 AM UTC
              </Text>
            </View>
            <FontAwesome name="external-link" size={14} color={theme.mutedForeground} />
          </Card>
        </Pressable>
      </Animated.View>
    </DetailScroll>
  );
}

export function DataExportScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [format, setFormat] = useState<ExportFormat>("json");
  const [selection, setSelection] = useState({
    allDomains: true,
    checkins: true,
    contextSnapshots: false,
    plannerHistory: true,
  });

  function toggleSelection(key: keyof typeof selection) {
    setSelection((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <DetailScroll>
      <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 6 }}>
        <Text selectable style={{ ...Typography.titleLG, color: theme.foreground }}>
          Export my data
        </Text>
        <Text selectable style={{ ...Typography.bodySM, color: theme.mutedForeground, lineHeight: 20 }}>
          Your data belongs to you. Download everything or select the parts you want included.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(420)} style={{ gap: 14 }}>
        <SectionTag label="Export format" />
        <Card style={detailCardStyle(theme)}>
          <RadioRow
            title="JSON"
            subtitle="Full structured data for developers or importing elsewhere"
            selected={format === "json"}
            onPress={() => setFormat("json")}
          />
          <Separator />
          <RadioRow
            title="CSV"
            subtitle="Spreadsheet-friendly for Excel or Google Sheets"
            selected={format === "csv"}
            onPress={() => setFormat("csv")}
          />
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(420)} style={{ gap: 14 }}>
        <SectionTag label="What to include" />
        <Card style={detailCardStyle(theme)}>
          {EXPORT_OPTIONS.map((item, index) => (
            <View key={item.key}>
              <ToggleDetailRow
                title={item.title}
                subtitle={item.subtitle}
                value={selection[item.key]}
                onValueChange={() => toggleSelection(item.key)}
              />
              {index < EXPORT_OPTIONS.length - 1 ? <Separator /> : null}
            </View>
          ))}
        </Card>
      </Animated.View>

      <InfoNote text="Your export will be prepared and sent to your account email. Larger exports can take a few minutes to generate." />

      <Animated.View entering={FadeInDown.delay(140).duration(420)} style={{ gap: 10 }}>
        <Button
          title="Generate export"
          onPress={() => RNAlert.alert("Export queued", `Preparing ${format.toUpperCase()} export with your selected data.`)}
          style={{ borderRadius: 14, borderCurve: "continuous" }}
        />
        <Text selectable style={{ ...Typography.captionLG, color: theme.mutedForeground, textAlign: "center" }}>
          Last export: never
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).duration(420)} style={{ gap: 10 }}>
        <SectionTag label="Danger zone" />
        <Button
          title="Delete account and all data"
          variant="ghost"
          onPress={() =>
            RNAlert.alert(
              "Delete account",
              "This is still a UI-only preview. The real delete flow should stay behind a destructive confirmation sequence.",
            )
          }
          style={{
            borderRadius: 14,
            borderCurve: "continuous",
            backgroundColor: isDarkColorScheme ? "rgba(48, 17, 19, 0.9)" : "rgba(255, 238, 239, 0.94)",
            borderWidth: 1,
            borderColor: isDarkColorScheme ? "rgba(192, 86, 95, 0.36)" : "rgba(192, 86, 95, 0.18)",
          }}
        />
      </Animated.View>
    </DetailScroll>
  );
}

function DetailScroll({ children }: { children: ReactNode }) {
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
        {children}
      </ScrollView>
    </Container>
  );
}

function ChoiceCard({
  selected,
  accent,
  title,
  description,
  example,
  onPress,
}: {
  selected: boolean;
  accent: string;
  title: string;
  description: string;
  example: string;
  onPress: () => void;
}) {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      <Card
        style={{
          borderRadius: 18,
          borderCurve: "continuous",
          padding: 16,
          gap: 10,
          borderWidth: 1,
          borderColor: selected ? "rgba(91, 80, 214, 0.34)" : theme.border,
          backgroundColor: selected
            ? isDarkColorScheme
              ? "rgba(30, 26, 48, 0.96)"
              : "rgba(239, 237, 255, 0.98)"
            : theme.card,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
          <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: accent, marginTop: 5 }} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text selectable style={{ ...Typography.labelLG, color: theme.foreground }}>
              {title}
            </Text>
            <Text selectable style={{ ...Typography.bodySM, color: theme.mutedForeground, lineHeight: 20 }}>
              {description}
            </Text>
            <View
              style={{
                alignSelf: "stretch",
                borderRadius: 12,
                borderCurve: "continuous",
                backgroundColor: isDarkColorScheme ? "rgba(20, 20, 24, 0.9)" : "rgba(248, 249, 253, 0.96)",
                paddingHorizontal: 10,
                paddingVertical: 8,
              }}
            >
              <Text selectable style={{ ...Typography.captionLG, color: theme.mutedForeground, fontStyle: "italic" }}>
                {example}
              </Text>
            </View>
          </View>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: selected ? "#9b8fff" : theme.border,
              backgroundColor: selected ? "#9b8fff" : "transparent",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 2,
            }}
          >
            {selected ? (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: isDarkColorScheme ? "#1e1a30" : "#ffffff",
                }}
              />
            ) : null}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

function SectionTag({ label }: { label: string }) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Text selectable style={{ ...Typography.labelXS, color: theme.mutedForeground }}>
      {label}
    </Text>
  );
}

function InfoNote({ text }: { text: string }) {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 8,
        padding: 12,
        borderRadius: 14,
        borderCurve: "continuous",
        backgroundColor: isDarkColorScheme ? "rgba(19, 19, 31, 0.92)" : "rgba(243, 242, 255, 0.96)",
        borderWidth: 1,
        borderColor: isDarkColorScheme ? "rgba(61, 53, 112, 0.22)" : "rgba(91, 80, 214, 0.16)",
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: theme.primary, marginTop: 6 }} />
      <Text selectable style={{ ...Typography.captionLG, color: theme.mutedForeground, flex: 1, lineHeight: 18 }}>
        {text}
      </Text>
    </View>
  );
}

function ChoiceChipRail({
  label,
  value,
  options,
  onSelect,
  accent,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  accent: string;
}) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Text selectable style={{ ...Typography.labelMD, color: theme.foreground }}>
          {label}
        </Text>
        <Badge variant="outline" color="secondary">
          {value}
        </Badge>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {options.map((option) => {
          const active = option === value;
          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              style={({ pressed }) => ({
                borderRadius: 999,
                borderCurve: "continuous",
                paddingHorizontal: 14,
                paddingVertical: 8,
                backgroundColor: active ? `${accent}22` : theme.card,
                borderWidth: 1,
                borderColor: active ? `${accent}55` : theme.border,
                opacity: pressed ? 0.84 : 1,
              })}
            >
              <Text selectable style={{ ...Typography.captionLG, color: active ? accent : theme.mutedForeground }}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function TimeOptionCard({
  title,
  subtitle,
  options,
  value,
  onChange,
}: {
  title: string;
  subtitle: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Card style={{ ...detailCardStyle(theme), gap: 12 }}>
      <View style={{ gap: 4 }}>
        <Text selectable style={{ ...Typography.labelMD, color: theme.foreground }}>
          {title}
        </Text>
        <Text selectable style={{ ...Typography.captionLG, color: theme.mutedForeground }}>
          {subtitle}
        </Text>
      </View>
      <ChoiceChipRail label="Selected time" value={value} options={options} onSelect={onChange} accent="#9b8fff" />
    </Card>
  );
}

function DaySelector({
  selected,
  onSelect,
}: {
  selected: ReminderDayId;
  onSelect: (day: ReminderDayId) => void;
}) {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {REMINDER_DAYS.map((day, index) => {
        const active = day.id === selected;
        return (
          <Pressable
            key={`${day.id}-${index}`}
            onPress={() => onSelect(day.id)}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 10,
              borderRadius: 12,
              borderCurve: "continuous",
              backgroundColor: active
                ? isDarkColorScheme
                  ? "rgba(30, 26, 48, 0.96)"
                  : "rgba(239, 237, 255, 0.98)"
                : theme.card,
              borderWidth: 1,
              borderColor: active ? "rgba(91, 80, 214, 0.34)" : theme.border,
              opacity: pressed ? 0.84 : 1,
            })}
          >
            <Text selectable style={{ ...Typography.labelMD, color: active ? "#c8c0ff" : theme.mutedForeground }}>
              {day.short}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PillRail({
  options,
  value,
  onChange,
}: {
  options: Array<{ id: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {options.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
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
            <Text selectable style={{ ...Typography.captionLG, color: active ? "#c8c0ff" : theme.mutedForeground }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function ValueDetailRow({
  title,
  subtitle,
  value,
  valueColor,
}: {
  title: string;
  subtitle?: string;
  value: string;
  valueColor?: string;
}) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 }}>
      <View style={{ flex: 1, gap: subtitle ? 2 : 0 }}>
        <Text selectable style={{ ...Typography.labelMD, color: theme.foreground }}>
          {title}
        </Text>
        {subtitle ? (
          <Text selectable style={{ ...Typography.captionLG, color: theme.mutedForeground }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Text selectable style={{ ...Typography.captionLG, color: valueColor ?? theme.primary }}>
        {value}
      </Text>
    </View>
  );
}

function ToggleDetailRow({
  title,
  subtitle,
  value,
  onValueChange,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 }}>
      <View style={{ flex: 1, gap: subtitle ? 2 : 0 }}>
        <Text selectable style={{ ...Typography.labelMD, color: theme.foreground }}>
          {title}
        </Text>
        {subtitle ? (
          <Text selectable style={{ ...Typography.captionLG, color: theme.mutedForeground }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

function ValueIconRow({
  icon,
  iconColor,
  iconBackground,
  title,
  subtitle,
  value,
}: {
  icon: ComponentProps<typeof FontAwesome>["name"];
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle?: string;
  value: string;
}) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 }}>
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
      <View style={{ flex: 1, gap: subtitle ? 2 : 0 }}>
        <Text selectable style={{ ...Typography.labelMD, color: theme.foreground }}>
          {title}
        </Text>
        {subtitle ? (
          <Text selectable style={{ ...Typography.captionLG, color: theme.mutedForeground }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Text selectable style={{ ...Typography.captionLG, color: theme.primary }}>
        {value}
      </Text>
    </View>
  );
}

function RadioRow({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text selectable style={{ ...Typography.labelMD, color: theme.foreground }}>
            {title}
          </Text>
          <Text selectable style={{ ...Typography.captionLG, color: theme.mutedForeground }}>
            {subtitle}
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
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selected ? (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: isDarkColorScheme ? "#1e1a30" : "#ffffff",
              }}
            />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function detailCardStyle(theme: typeof NAV_THEME.dark | typeof NAV_THEME.light) {
  return {
    borderRadius: 18,
    borderCurve: "continuous" as const,
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
  };
}

function labelForPlanningStyle(value: PlanningStyleId) {
  return PLANNING_STYLES.find((item) => item.id === value)?.title ?? "Balanced";
}

function labelForAiTone(value: AiToneId) {
  return AI_TONES.find((item) => item.id === value)?.title ?? "Direct";
}

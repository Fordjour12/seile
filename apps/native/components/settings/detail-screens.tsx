import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";

import { Chip, Button, Card, Separator, Switch, Text } from "@/components/ui";
import { Container } from "@/components/container";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type PlanningStyleId = "light" | "balanced" | "intensive";
type AiToneId = "direct" | "coaching" | "minimal";
type ContextWindow = "3d" | "7d" | "14d" | "30d";
type ReminderDayId = "m" | "t" | "w" | "th" | "f" | "sa" | "su";

const PLANNING_STYLES = [
  {
    id: "light",
    title: "Light",
    description: "2-3 priorities per day. Habits only. Space for rest and the unexpected.",
    example: "Best for recovery weeks, low-energy periods, or volatile schedules.",
    accent: "#1d9e75",
  },
  {
    id: "balanced",
    title: "Balanced",
    description: "3-4 priorities per day. Full habit stack. One deep work block daily.",
    example: "Your current setting. Sustainable pace with consistent progress.",
    accent: "#ba7517",
  },
  {
    id: "intensive",
    title: "Intensive",
    description: "4-5 priorities per day. Multiple deep work blocks. Stretch goals included.",
    example: "Best for sprint weeks when you are energized and have one clear target.",
    accent: "#e24b4a",
  },
] as const satisfies ReadonlyArray<{
  id: PlanningStyleId;
  title: string;
  description: string;
  example: string;
  accent: string;
}>;

const AI_TONES = [
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
] as const satisfies ReadonlyArray<{
  id: AiToneId;
  title: string;
  description: string;
  example: string;
}>;

const MORNING_BRIEF_TIMES = ["5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "12:00 PM"];
const CHECK_IN_TIMES = ["7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM"];
const EVENING_TIMES = ["8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM"];
const QUIET_START_TIMES = ["9:00 PM", "10:00 PM", "11:00 PM"];
const QUIET_END_TIMES = ["6:00 AM", "7:00 AM", "8:00 AM"];
const REVIEW_TIME_OPTIONS = ["7:00 PM", "8:00 PM", "9:00 PM"];
const REMINDER_DAYS = [
  { id: "m", short: "M", label: "Monday" },
  { id: "t", short: "T", label: "Tuesday" },
  { id: "w", short: "W", label: "Wednesday" },
  { id: "th", short: "T", label: "Thursday" },
  { id: "f", short: "F", label: "Friday" },
  { id: "sa", short: "S", label: "Saturday" },
  { id: "su", short: "S", label: "Sunday" },
] as const satisfies ReadonlyArray<{
  id: ReminderDayId;
  short: string;
  label: string;
}>;

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
] as const;

function useSettingsDetailTheme() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  return { theme, isDarkColorScheme };
}

function DetailScroll({ children }: { children: React.ReactNode }) {
  return (
    <Container>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {children}
      </ScrollView>
    </Container>
  );
}

function DetailHeader({
  title,
  subtitle,
  saveLabel,
}: {
  title: string;
  subtitle: string;
  saveLabel?: string;
}) {
  const router = useRouter();
  const { theme } = useSettingsDetailTheme();

  return (
    <View style={styles.headerWrap}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="angle-left" size={16} color={theme.mutedForeground} />
          <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
            Settings
          </Text>
        </Pressable>
        {saveLabel ? (
          <Pressable
            onPress={() => Alert.alert("Saved", `${saveLabel} updated.`)}
          >
            <Text selectable variant="small" style={styles.saveText}>
              Save
            </Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.headerText}>
        <Text selectable variant="h3">
          {title}
        </Text>
        <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function SectionTag({ label }: { label: string }) {
  const { theme } = useSettingsDetailTheme();
  return (
    <Text selectable variant="muted" style={[styles.sectionTag, { color: theme.mutedForeground }]}>
      {label}
    </Text>
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
  const { theme } = useSettingsDetailTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceCard,
        {
          backgroundColor: selected ? "#1e1a30" : theme.card,
          borderColor: selected ? "#3d3570" : theme.border,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.choiceDot, { backgroundColor: accent }]} />
      <View style={styles.choiceBody}>
        <Text selectable variant="small" style={styles.choiceTitle}>
          {title}
        </Text>
        <Text selectable variant="muted" style={{ color: theme.mutedForeground, lineHeight: 18 }}>
          {description}
        </Text>
        <View style={styles.exampleBox}>
          <Text selectable variant="muted" style={styles.exampleText}>
            {example}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.choiceRadio,
          {
            backgroundColor: selected ? "#9b8fff" : "transparent",
            borderColor: selected ? "#9b8fff" : "#333333",
          },
        ]}
      />
    </Pressable>
  );
}

function ValueRow({
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
  const { theme } = useSettingsDetailTheme();
  return (
    <View style={styles.valueRow}>
      <View style={styles.valueBody}>
        <Text selectable variant="small" style={styles.choiceTitle}>
          {title}
        </Text>
        {subtitle ? (
          <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Text selectable variant="small" style={{ color: valueColor ?? theme.mutedForeground }}>
        {value}
      </Text>
    </View>
  );
}

function ToggleRow({
  title,
  subtitle,
  value,
  onChange,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const { theme } = useSettingsDetailTheme();
  return (
    <View style={styles.valueRow}>
      <View style={styles.valueBody}>
        <Text selectable variant="small" style={styles.choiceTitle}>
          {title}
        </Text>
        {subtitle ? (
          <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onChange} />
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
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const { theme } = useSettingsDetailTheme();
  return (
    <Card style={[styles.timeCard, { borderColor: theme.border }]}>
      <ValueRow title={title} subtitle={subtitle} value={value} valueColor="#9b8fff" />
      <View style={styles.pillRail}>
        {options.map((option) => (
          <Chip
            key={option}
            label={option}
            selected={value === option}
            onSelect={() => onChange(option)}
          />
        ))}
      </View>
    </Card>
  );
}

function InfoNote({ text }: { text: string }) {
  const { theme } = useSettingsDetailTheme();
  return (
    <Card style={styles.infoCard}>
      <View style={styles.infoRow}>
        <View style={styles.infoDot} />
        <Text selectable variant="muted" style={{ color: theme.mutedForeground, flex: 1, lineHeight: 18 }}>
          {text}
        </Text>
      </View>
    </Card>
  );
}

export function PlanningStyleScreen() {
  const [style, setStyle] = useState<PlanningStyleId>("balanced");

  return (
    <DetailScroll>
      <DetailHeader
        title="Planning style"
        subtitle="How the AI distributes priorities and habits across your week."
        saveLabel="Planning style"
      />
      <View style={styles.sectionBlock}>
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
      </View>
      <InfoNote text="This also controls how the AI responds to energy check-ins. Low-energy days can still nudge the planner toward a lighter day even when Intensive is selected." />
    </DetailScroll>
  );
}

export function AiToneScreen() {
  const [tone, setTone] = useState<AiToneId>("direct");

  return (
    <DetailScroll>
      <DetailHeader
        title="AI tone"
        subtitle="How the AI communicates across suggestions, nudges, summaries, and the weekly review."
        saveLabel="AI tone"
      />
      <View style={styles.sectionBlock}>
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
      </View>
      <InfoNote text="Applies to Today suggestions, domain nudges, weekly review language, approval descriptions, and cross-domain observations." />
    </DetailScroll>
  );
}

export function NotificationTimingScreen() {
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
      <DetailHeader
        title="Notification timing"
        subtitle="When Life OS checks in with you each day."
        saveLabel="Notification timing"
      />

      <View style={styles.sectionBlock}>
        <SectionTag label="Morning briefing" />
        <Card style={styles.detailCard}>
          <ToggleRow
            title="Enabled"
            subtitle="Today screen summary on wake-up"
            value={morningBriefingEnabled}
            onChange={setMorningBriefingEnabled}
          />
          <Separator />
          <ValueRow
            title="Time"
            subtitle="When to send the morning briefing"
            value={morningBriefingTime}
            valueColor="#9b8fff"
          />
        </Card>
        <TimeOptionCard
          title="Morning time"
          subtitle="Wake-up summary"
          options={MORNING_BRIEF_TIMES}
          value={morningBriefingTime}
          onChange={setMorningBriefingTime}
        />
      </View>

      <View style={styles.sectionBlock}>
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
      </View>

      <View style={styles.sectionBlock}>
        <SectionTag label="Weekly review" />
        <Card style={styles.detailCard}>
          <ValueRow
            title="Review day"
            subtitle="When the review unlocks and you are notified"
            value={reviewDayLabel}
            valueColor="#9b8fff"
          />
          <Separator />
          <ValueRow title="Review time" subtitle="Evening reminder" value={reviewTime} />
        </Card>
        <View style={styles.dayRow}>
          {REMINDER_DAYS.map((day) => (
            <Chip
              key={day.id}
              label={day.short}
              selected={reviewDay === day.id}
              onSelect={() => setReviewDay(day.id)}
            />
          ))}
        </View>
        <TimeOptionCard
          title="Review reminder time"
          subtitle="Evening reminder"
          options={REVIEW_TIME_OPTIONS}
          value={reviewTime}
          onChange={setReviewTime}
        />
      </View>

      <View style={styles.sectionBlock}>
        <SectionTag label="Quiet hours" />
        <Card style={styles.detailCard}>
          <ToggleRow
            title="Quiet hours"
            subtitle="No notifications during this window"
            value={quietHoursEnabled}
            onChange={setQuietHoursEnabled}
          />
          <Separator />
          <ValueRow title="Start" value={quietStart} />
          <Separator />
          <ValueRow title="End" value={quietEnd} />
        </Card>
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

      <InfoNote
        text={`Morning briefing ${morningBriefingEnabled ? "on" : "off"} at ${morningBriefingTime}. Check-ins at ${morningCheckInTime} and ${eveningCheckInTime}. Weekly review on ${reviewDayLabel} at ${reviewTime}. Quiet hours ${quietHoursEnabled ? `${quietStart} to ${quietEnd}` : "off"}.`}
      />
      <Button
        title="Preview notifications"
        variant="outline"
        onPress={() => Alert.alert("Preview notifications", "Notification previews can hang off this screen once the notification center route is added.")}
      />
      <Button
        title="Open AI memory"
        variant="ghost"
        onPress={() => router.push("/(tabs)/settings/memory-viewer")}
      />
    </DetailScroll>
  );
}

export function TimezoneSyncScreen() {
  const [contextWindow, setContextWindow] = useState<ContextWindow>("7d");
  const { theme, isDarkColorScheme } = useSettingsDetailTheme();

  return (
    <DetailScroll>
      <DetailHeader
        title="Timezone & sync"
        subtitle="All cron jobs run in UTC. Display times are converted to your local timezone."
      />

      <View style={styles.sectionBlock}>
        <SectionTag label="Timezone" />
        <Card style={styles.detailCard}>
          <ValueRow
            title="Display timezone"
            subtitle="Times shown in the app"
            value="GMT+0 · Accra"
            valueColor="#9b8fff"
          />
          <Separator />
          <ValueRow
            title="Cron timezone"
            subtitle="All jobs run in UTC and never change"
            value="UTC · locked"
          />
        </Card>
      </View>

      <View style={styles.sectionBlock}>
        <SectionTag label="Cron schedule" />
        <Card style={styles.detailCard}>
          {CRON_SCHEDULE.map((item, index) => (
            <View key={item.id}>
              <ValueRow
                title={item.label}
                subtitle={item.subtitle}
                value={item.time}
                valueColor={item.color}
              />
              {index < CRON_SCHEDULE.length - 1 ? <Separator /> : null}
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.sectionBlock}>
        <SectionTag label="Context window" />
        <View style={styles.pillRail}>
          {[
            { id: "3d", label: "3 days" },
            { id: "7d", label: "7 days" },
            { id: "14d", label: "14 days" },
            { id: "30d", label: "30 days" },
          ].map((option) => (
            <Chip
              key={option.id}
              label={option.label}
              selected={contextWindow === option.id}
              onSelect={() => setContextWindow(option.id as ContextWindow)}
            />
          ))}
        </View>
        <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
          Longer windows surface deeper patterns. Shorter windows keep the AI focused closer to the present.
        </Text>
      </View>

      <View style={styles.sectionBlock}>
        <SectionTag label="Manual sync" />
        <Pressable
          onPress={() =>
            Alert.alert(
              "Sync now",
              "This preview would manually trigger the daily context sync.",
            )
          }
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Card style={styles.syncCard}>
            <View
              style={[
                styles.syncIcon,
                {
                  backgroundColor: isDarkColorScheme
                    ? "rgba(91, 80, 214, 0.18)"
                    : "rgba(91, 80, 214, 0.12)",
                  borderColor: isDarkColorScheme
                    ? "rgba(91, 80, 214, 0.3)"
                    : "rgba(91, 80, 214, 0.18)",
                },
              ]}
            >
              <FontAwesome name="refresh" size={14} color="#9b8fff" />
            </View>
            <View style={styles.valueBody}>
              <Text selectable variant="small" style={styles.choiceTitle}>
                Sync now
              </Text>
              <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                Last synced today at 6:00 AM UTC
              </Text>
            </View>
            <FontAwesome name="external-link" size={14} color={theme.mutedForeground} />
          </Card>
        </Pressable>
      </View>
    </DetailScroll>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  choiceBody: {
    flex: 1,
    gap: 4,
  },
  choiceCard: {
    alignItems: "flex-start",
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  choiceDot: {
    borderRadius: 999,
    height: 10,
    marginTop: 4,
    width: 10,
  },
  choiceRadio: {
    borderRadius: 999,
    borderWidth: 1.5,
    height: 18,
    marginTop: 2,
    width: 18,
  },
  choiceTitle: {
    fontFamily: "Geist",
    fontWeight: "700",
  },
  dayRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  detailCard: {
    borderColor: "#2a2a2e",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 0,
  },
  exampleBox: {
    backgroundColor: "#141418",
    borderRadius: 7,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  exampleText: {
    color: "#4f5060",
    fontStyle: "italic",
    lineHeight: 16,
  },
  headerText: {
    gap: 6,
  },
  headerWrap: {
    gap: 10,
  },
  infoCard: {
    backgroundColor: "#13131f",
    borderColor: "#1e1e28",
    borderCurve: "continuous",
    borderRadius: 10,
    borderWidth: 1,
  },
  infoDot: {
    backgroundColor: "#555555",
    borderRadius: 999,
    height: 5,
    marginTop: 4,
    width: 5,
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
  },
  pillRail: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pressed: {
    opacity: 0.86,
  },
  saveText: {
    color: "#9b8fff",
    fontFamily: "Geist",
    fontWeight: "700",
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 48,
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: UI_PRESETS.spacing.lg,
  },
  sectionBlock: {
    gap: 12,
  },
  sectionTag: {
    fontFamily: "Geist",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  syncCard: {
    alignItems: "center",
    borderColor: "#2a2a2e",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
  },
  syncIcon: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  timeCard: {
    borderColor: "#2a2a2e",
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  valueBody: {
    flex: 1,
    gap: 2,
  },
  valueRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});

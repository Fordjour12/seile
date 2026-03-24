import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { router } from "expo-router";

import FontAwesome from "@expo/vector-icons/FontAwesome";

import {
  AnimatedProgressBar,
  AnimatedStage,
} from "@/components/auth/onboarding-flow-motion";
import { Badge, Card, Chip, Text } from "@/components/ui";
import { UI_PRESETS, Typography } from "@/lib/constants";
import type {
  ActionItem,
  ContextItem,
  InsightAction,
  MetricItem,
  SetupItem,
} from "@/components/first-run-v2/data";
import { useFirstRunV2Theme } from "@/components/first-run-v2/tokens";

type PickerOption<T extends string> = {
  id: T;
  label: string;
};

export function showPreview(label: string, message: string) {
  Alert.alert(label, message);
}

export function FirstRunScroll({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {children}
    </ScrollView>
  );
}

export function StatePicker<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: PickerOption<T>[];
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pickerContent}
    >
      {options.map((option) => (
        <Chip
          key={option.id}
          label={option.label}
          selected={value === option.id}
          onSelect={() => onChange(option.id)}
        />
      ))}
    </ScrollView>
  );
}

export function PhasePill({ phase }: { phase: "seed" | "learn" | "act" }) {
  const { tokens } = useFirstRunV2Theme();

  const phaseConfig = {
    seed: { colors: tokens.phaseSeed, label: "Seed" },
    learn: { colors: tokens.phaseLearn, label: "Learning" },
    act: { colors: tokens.phaseAct, label: "Active" },
  }[phase];

  return (
    <View
      style={[
        styles.phasePill,
        {
          backgroundColor: phaseConfig.colors.bg,
          borderColor: phaseConfig.colors.border,
        },
      ]}
    >
      <Text
        selectable
        style={[styles.phasePillText, { color: phaseConfig.colors.text }]}
      >
        {phaseConfig.label}
      </Text>
    </View>
  );
}

export function InsightCard({
  label,
  badge,
  body,
  actions,
}: {
  label: string;
  badge?: string;
  body: string;
  actions: InsightAction[];
}) {
  const { tokens } = useFirstRunV2Theme();

  return (
    <Card
      style={[
        styles.insightCard,
        {
          borderColor: tokens.insightBorder,
          backgroundColor: tokens.insightBg,
        },
      ]}
    >
      <View style={styles.insightHeader}>
        <View style={[styles.signalDot, { backgroundColor: tokens.primary }]} />
        <Text
          selectable
          variant="small"
          style={[styles.insightLabel, { color: tokens.primary }]}
        >
          {label}
        </Text>
        {badge ? (
          <Badge color="secondary" variant="outline">
            {badge}
          </Badge>
        ) : null}
      </View>
      <Text
        selectable
        variant="small"
        style={[styles.insightBody, { color: tokens.insightText }]}
      >
        {body}
      </Text>
      <View style={styles.actionChips}>
        {actions.map((action) => (
          <Chip
            key={action.label}
            label={action.label}
            onSelect={() => showPreview(action.label, action.message)}
          />
        ))}
      </View>
    </Card>
  );
}

export function ProgressCard({
  label,
  progress,
  subtitle,
}: {
  label: string;
  progress: number;
  subtitle: string;
}) {
  const { theme, tokens } = useFirstRunV2Theme();

  return (
    <Card style={[styles.progressCard, { borderColor: tokens.cardBorder }]}>
      <View style={styles.progressHeader}>
        <Text
          selectable
          variant="small"
          style={[styles.sectionTitleText, { color: tokens.textPrimary }]}
        >
          AI context
        </Text>
        <Text
          selectable
          variant="muted"
          style={{
            color:
              progress === 100 ? tokens.completionGreen : tokens.textSecondary,
          }}
        >
          {label}
        </Text>
      </View>
      <AnimatedProgressBar
        progress={progress}
        trackColor={theme.border}
        fillColor={tokens.progressFill}
      />
      <Text
        selectable
        variant="muted"
        style={[styles.progressSubtitle, { color: tokens.textSecondary }]}
      >
        {subtitle}
      </Text>
    </Card>
  );
}

export function ScreenHeader({
  eyebrow,
  badge,
  dateLabel,
  title,
  subtitle,
  phase,
}: {
  eyebrow?: string;
  badge?: string;
  dateLabel?: string;
  title: string;
  subtitle: string;
  phase?: "seed" | "learn" | "act";
}) {
  const { tokens } = useFirstRunV2Theme();

  return (
    <View style={styles.headerBlock}>
      {eyebrow ? (
        <Text
          selectable
          variant="muted"
          style={[styles.eyebrow, { color: tokens.textSecondary }]}
        >
          {eyebrow}
        </Text>
      ) : null}
      {badge ? (
        <View style={styles.topline}>
          <View style={styles.toplineLeft}>
            <Text
              selectable
              variant="small"
              style={{ color: tokens.textSecondary }}
            >
              Today
            </Text>
            <Badge color="secondary">{badge}</Badge>
            {phase ? <PhasePill phase={phase} /> : null}
          </View>
        </View>
      ) : null}
      {dateLabel ? (
        <Text
          selectable
          variant="muted"
          style={[styles.eyebrow, { color: tokens.textSecondary }]}
        >
          {dateLabel}
        </Text>
      ) : null}
      <Text
        selectable
        variant="h3"
        style={[styles.title, { color: tokens.textPrimary }]}
      >
        {title}
      </Text>
      <Text
        selectable
        variant="small"
        style={[styles.subtitle, { color: tokens.textSecondary }]}
      >
        {subtitle}
      </Text>
    </View>
  );
}

export function SectionTitle({
  label,
  subtitle,
}: {
  label: string;
  subtitle?: string;
}) {
  const { tokens } = useFirstRunV2Theme();

  return (
    <View style={styles.sectionHeader}>
      <Text
        selectable
        variant="muted"
        style={[styles.eyebrow, { color: tokens.textSecondary }]}
      >
        {label}
      </Text>
      {subtitle ? (
        <Text
          selectable
          variant="muted"
          style={{ color: tokens.textSecondary }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function ActionCard({
  item,
  previewTitle,
}: {
  item: ActionItem;
  previewTitle: string;
}) {
  const { tokens } = useFirstRunV2Theme();

  return (
    <Pressable
      onPress={() => showPreview(previewTitle, `${item.title}\n\n${item.note}`)}
      style={({ pressed }) => [
        styles.actionCard,
        { borderColor: tokens.cardBorder, backgroundColor: tokens.card },
        pressed && { opacity: tokens.pressedOpacity },
      ]}
    >
      <View style={[styles.actionRing, { borderColor: item.accentColor }]} />
      <View style={styles.actionBody}>
        <Text
          selectable
          variant="small"
          style={[styles.actionTitle, { color: tokens.textPrimary }]}
        >
          {item.title}
        </Text>
        <View style={styles.actionMeta}>
          <View
            style={[
              styles.domainPill,
              { backgroundColor: item.tone.backgroundColor },
            ]}
          >
            <Text selectable variant="muted" style={{ color: item.tone.color }}>
              {item.tone.label}
            </Text>
          </View>
          <Text
            selectable
            variant="muted"
            style={{ color: tokens.textSecondary }}
          >
            {item.note}
          </Text>
        </View>
      </View>
      <FontAwesome name="angle-right" size={16} color={tokens.textSecondary} />
    </Pressable>
  );
}

export function EmptyHabitCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const { tokens } = useFirstRunV2Theme();

  return (
    <Card style={[styles.emptyHabitCard, { borderColor: tokens.cardBorder }]}>
      <View style={[styles.emptyHabitIcon, { borderColor: tokens.cardBorder }]}>
        <FontAwesome name="plus" size={14} color={tokens.textSecondary} />
      </View>
      <View style={styles.emptyHabitBody}>
        <Text
          selectable
          variant="small"
          style={[styles.actionTitle, { color: tokens.textPrimary }]}
        >
          {title}
        </Text>
        <Text
          selectable
          variant="muted"
          style={{ color: tokens.textSecondary }}
        >
          {subtitle}
        </Text>
      </View>
    </Card>
  );
}

export function PromptCard({
  title,
  subtitle,
  accentColor,
}: {
  title: string;
  subtitle: string;
  accentColor: string;
}) {
  const { tokens } = useFirstRunV2Theme();

  return (
    <Card
      style={[
        styles.promptCard,
        {
          borderColor: `${accentColor}66`,
          backgroundColor: `${accentColor}14`,
        },
      ]}
    >
      <View style={styles.insightHeader}>
        <View style={[styles.signalDot, { backgroundColor: accentColor }]} />
        <Text
          selectable
          variant="small"
          style={[styles.sectionTitleText, { color: accentColor }]}
        >
          {title}
        </Text>
      </View>
      <Text
        selectable
        variant="small"
        style={[styles.insightBody, { color: tokens.checkinAccent }]}
      >
        {subtitle}
      </Text>
      <View style={styles.promptActions}>
        <Pressable
          onPress={() => showPreview(title, subtitle)}
          style={({ pressed }) => [
            styles.promptPill,
            styles.promptPillAccept,
            {
              borderColor: `${accentColor}55`,
              backgroundColor: `${accentColor}22`,
            },
            pressed && { opacity: tokens.pressedOpacity },
          ]}
        >
          <Text
            selectable
            variant="small"
            style={[styles.promptPillText, { color: accentColor }]}
          >
            Open
          </Text>
        </Pressable>
        <Pressable
          onPress={() =>
            showPreview("Dismiss", "This preview would dismiss the prompt.")
          }
          style={({ pressed }) => [
            styles.promptPill,
            { borderColor: `${accentColor}33`, backgroundColor: "transparent" },
            pressed && { opacity: tokens.pressedOpacity },
          ]}
        >
          <Text
            selectable
            variant="small"
            style={[styles.promptPillText, { color: tokens.textSecondary }]}
          >
            Dismiss
          </Text>
        </Pressable>
        <Pressable
          onPress={() =>
            showPreview("Snooze", "This preview would snooze the prompt.")
          }
          style={({ pressed }) => [
            styles.promptPill,
            { borderColor: `${accentColor}33`, backgroundColor: "transparent" },
            pressed && { opacity: tokens.pressedOpacity },
          ]}
        >
          <Text
            selectable
            variant="small"
            style={[styles.promptPillText, { color: tokens.textSecondary }]}
          >
            Snooze
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

export function SetupCard({ item }: { item: SetupItem }) {
  const { tokens } = useFirstRunV2Theme();

  return (
    <Pressable
      onPress={() => showPreview(item.title, item.subtitle)}
      style={({ pressed }) => [
        styles.setupCard,
        { borderColor: tokens.cardBorder, backgroundColor: tokens.card },
        pressed && { opacity: tokens.pressedOpacity },
      ]}
    >
      <View
        style={[
          styles.setupIcon,
          {
            backgroundColor: item.backgroundColor,
            borderColor: `${item.accentColor}33`,
          },
        ]}
      >
        <Text
          selectable
          style={[styles.setupIconLetter, { color: item.accentColor }]}
        >
          {item.title.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.actionBody}>
        <Text
          selectable
          variant="small"
          style={[styles.actionTitle, { color: tokens.textPrimary }]}
        >
          {item.title}
        </Text>
        <Text
          selectable
          variant="muted"
          style={{ color: tokens.textSecondary }}
        >
          {item.subtitle}
        </Text>
      </View>
      <View
        style={[
          styles.setupBadge,
          {
            backgroundColor: item.backgroundColor,
            borderColor: `${item.accentColor}33`,
          },
        ]}
      >
        <Text selectable variant="muted" style={{ color: item.accentColor }}>
          {item.badge}
        </Text>
      </View>
    </Pressable>
  );
}

export function MetricsRow({ items }: { items: MetricItem[] }) {
  const { tokens } = useFirstRunV2Theme();

  return (
    <View style={styles.metricsRow}>
      {items.map((item) => (
        <View
          key={item.label}
          style={[styles.metricCard, { backgroundColor: tokens.card }]}
        >
          <Text selectable style={[styles.metricValue, { color: item.color }]}>
            {item.value}
          </Text>
          <Text
            selectable
            variant="muted"
            style={{ color: tokens.textSecondary }}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function HabitRail({ items }: { items: string[] }) {
  const { tokens } = useFirstRunV2Theme();

  return (
    <Card style={[styles.habitRail, { borderColor: tokens.cardBorder }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.habitRailContent}
      >
        {items.map((item) => (
          <View
            key={item}
            style={[styles.habitChip, { backgroundColor: tokens.background }]}
          >
            <View style={[styles.habitDot, { borderColor: tokens.primary }]} />
            <Text
              selectable
              variant="small"
              style={{ color: tokens.textSecondary }}
            >
              {item}
            </Text>
          </View>
        ))}
        <Chip
          label="+ Add habit"
          onSelect={() =>
            showPreview(
              "Add habit",
              "This preview would add another habit to the first-run routine.",
            )
          }
        />
      </ScrollView>
    </Card>
  );
}

export function ContextCard({ items }: { items: ContextItem[] }) {
  const { tokens } = useFirstRunV2Theme();

  return (
    <Card style={[styles.contextCard, { borderColor: tokens.cardBorder }]}>
      <Text
        selectable
        variant="muted"
        style={[styles.eyebrow, { color: tokens.textSecondary }]}
      >
        What I know so far
      </Text>
      <View style={styles.contextList}>
        {items.map((item) => (
          <View key={item.label} style={styles.contextRow}>
            <View
              style={[styles.contextDot, { backgroundColor: item.color }]}
            />
            <Text
              selectable
              variant="small"
              style={[styles.contextText, { color: tokens.textPrimary }]}
            >
              {item.label}
            </Text>
            {item.isNew ? (
              <View
                style={[
                  styles.newBadge,
                  {
                    backgroundColor: tokens.newBadgeBg,
                    borderColor: tokens.newBadgeBorder,
                  },
                ]}
              >
                <Text
                  selectable
                  variant="muted"
                  style={{ color: tokens.newBadgeText }}
                >
                  new
                </Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </Card>
  );
}

export function CelebrationCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const { tokens } = useFirstRunV2Theme();

  return (
    <Card
      style={[
        styles.celebrationCard,
        {
          backgroundColor: tokens.celebrationBg,
          borderColor: tokens.celebrationBorder,
        },
      ]}
    >
      <Text selectable style={styles.celebrationEmoji}>
        {"\uD83D\uDD25"}
      </Text>
      <Text
        selectable
        variant="small"
        style={[styles.celebrationTitle, { color: tokens.celebrationTitle }]}
      >
        {title}
      </Text>
      <Text
        selectable
        variant="muted"
        style={[styles.celebrationSubtitle, { color: tokens.celebrationSub }]}
      >
        {subtitle}
      </Text>
    </Card>
  );
}

export function ApprovalCard({
  title,
  subtitle,
  details,
}: {
  title: string;
  subtitle: string;
  details: string[];
}) {
  const { theme, tokens } = useFirstRunV2Theme();

  return (
    <Card
      style={[
        styles.approvalCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <Text
        selectable
        variant="small"
        style={[styles.approvalTitle, { color: tokens.textSecondary }]}
      >
        {title}
      </Text>
      <Text
        selectable
        variant="small"
        style={[styles.approvalSubtitle, { color: tokens.textPrimary }]}
      >
        {subtitle}
      </Text>
      <View style={styles.approvalDetails}>
        {details.map((detail) => (
          <Text
            key={detail}
            selectable
            variant="muted"
            style={[
              styles.approvalDetailTextStyle,
              { color: tokens.approvalDetailText },
            ]}
          >
            {detail}
          </Text>
        ))}
      </View>
    </Card>
  );
}

export function ConfidenceCard({
  items,
}: {
  items: Array<{
    label: string;
    score: number;
    tier: "observe" | "suggest" | "recommend" | "act";
  }>;
}) {
  const { tokens } = useFirstRunV2Theme();

  const tierConfig = {
    observe: { label: "Observing", color: tokens.textSecondary },
    suggest: { label: "Suggesting", color: tokens.phaseLearn.text },
    recommend: { label: "Recommending", color: tokens.phaseSeed.text },
    act: { label: "Acting", color: tokens.phaseAct.text },
  };

  return (
    <Card
      style={[
        styles.confidenceCard,
        { borderColor: tokens.cardBorder, backgroundColor: tokens.card },
      ]}
    >
      <Text
        selectable
        variant="muted"
        style={[styles.eyebrow, { color: tokens.textSecondary }]}
      >
        Confidence per category
      </Text>
      <View style={styles.confidenceList}>
        {items.map((item) => {
          const config = tierConfig[item.tier];
          return (
            <View key={item.label} style={styles.confidenceRow}>
              {/* Label row: name left, score + tier right */}
              <View style={styles.confidenceLabelRow}>
                <Text
                  selectable
                  variant="small"
                  style={[styles.actionTitle, { color: tokens.textPrimary }]}
                >
                  {item.label}
                </Text>
                <View style={styles.confidenceRight}>
                  <Text
                    selectable
                    style={[styles.confidenceScore, { color: config.color }]}
                  >
                    {item.score}
                  </Text>
                  <Text
                    selectable
                    style={[
                      styles.confidenceTierLabel,
                      { color: tokens.textSecondary },
                    ]}
                  >
                    {config.label}
                  </Text>
                </View>
              </View>
              {/* Progress track */}
              <View
                style={[
                  styles.confidenceTrack,
                  { backgroundColor: tokens.cardBorder },
                ]}
              >
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      width: `${item.score}%`,
                      backgroundColor: config.color,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

export function DomainSuggestedCard({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions: Array<{
    label: string;
    onPress: () => void;
    variant: "primary" | "ghost";
  }>;
}) {
  const { tokens } = useFirstRunV2Theme();

  return (
    <Card
      style={[
        styles.domainSuggestedCard,
        {
          borderColor: tokens.insightBorder,
          backgroundColor: tokens.insightBg,
        },
      ]}
    >
      <View>
        <Text
          selectable
          variant="small"
          style={[styles.domainSuggestedTitle, { color: tokens.textPrimary }]}
        >
          {title}
        </Text>
        <Text
          selectable
          variant="small"
          style={[styles.insightBody, { color: tokens.insightText }]}
        >
          {subtitle}
        </Text>
      </View>
      <View style={styles.domainSuggestedActions}>
        {actions.map((action) =>
          action.variant === "primary" ? (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              style={({ pressed }) => [
                styles.domainActionPrimary,
                { backgroundColor: tokens.primary },
                pressed && { opacity: tokens.pressedOpacity },
              ]}
            >
              <Text
                selectable
                style={[
                  styles.domainActionPrimaryText,
                  { color: tokens.textInverse },
                ]}
              >
                {action.label}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              style={({ pressed }) => [
                styles.domainActionGhost,
                { borderColor: tokens.cardBorder },
                pressed && { opacity: tokens.pressedOpacity },
              ]}
            >
              <Text
                selectable
                style={[
                  styles.domainActionGhostText,
                  { color: tokens.textSecondary },
                ]}
              >
                {action.label}
              </Text>
            </Pressable>
          ),
        )}
      </View>
    </Card>
  );
}

export function ExperienceStage({
  stageKey,
  children,
}: {
  stageKey: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatedStage stageKey={stageKey} style={styles.stage}>
      {children}
    </AnimatedStage>
  );
}

// ─── DayActivityCard ───────────────────────────────────────────────────────

export function DayActivityCard({
  item,
  status,
  startedAt,
  durationMinutes,
  onToggle,
  onStart,
  onSkip,
}: {
  item: import("./data").DayActivityItem;
  status: "pending" | "started" | "done" | "skipped";
  startedAt?: number;
  durationMinutes?: number;
  onToggle: () => void;
  onStart?: () => void;
  onSkip?: () => void;
}) {
  const { tokens } = useFirstRunV2Theme();
  const hasSheet = !!onStart;
  const isDone = status === "done";
  const isStarted = status === "started";
  const isSkipped = status === "skipped";
  const handleSkip = onSkip ?? onToggle;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isStarted || !startedAt || !durationMinutes) {
      return;
    }

    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [durationMinutes, isStarted, startedAt]);

  const remainingSeconds =
    isStarted && startedAt && durationMinutes
      ? Math.max(
          durationMinutes * 60 - Math.floor((now - startedAt) / 1000),
          0,
        )
      : null;
  const remainingLabel =
    remainingSeconds == null
      ? "In progress"
      : remainingSeconds > 0
        ? `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(
            remainingSeconds % 60,
          ).padStart(2, "0")} remaining`
        : "Timer elapsed";

  return (
    <View
      style={[
        styles.dayActivityCard,
        { borderColor: tokens.cardBorder, backgroundColor: tokens.card },
      ]}
    >
      {/* ── Top row: icon + title + status ── */}
      <View style={styles.dayActivityHead}>
        <View
          style={[
            styles.dayActivityIcon,
            {
              backgroundColor: tokens.primaryMuted,
              borderColor: tokens.cardBorder,
            },
          ]}
        >
          <Text selectable style={styles.dayActivityEmoji}>
            {item.icon}
          </Text>
        </View>
        <View style={styles.dayActivityBody}>
          <Text
            selectable
            variant="small"
            style={[styles.actionTitle, { color: tokens.textPrimary }]}
          >
            {item.title}
          </Text>
          {item.meta ? (
            <Text
              selectable
              variant="muted"
              style={{ color: tokens.textSecondary }}
            >
              {item.meta}
            </Text>
          ) : null}
          {isStarted ? (
            <Text
              selectable
              variant="muted"
              style={{ color: tokens.primary }}
            >
              {remainingLabel}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={onToggle}
          hitSlop={8}
          style={({ pressed }) => [
            styles.dayActivityStatus,
            isDone
              ? {
                  backgroundColor: tokens.completionGreen,
                  borderColor: tokens.completionGreen,
                }
              : isSkipped
                ? {
                    backgroundColor: tokens.completionGreen + "26",
                    borderColor: tokens.completionGreen,
                  }
                : isStarted
                  ? {
                      backgroundColor: tokens.primaryMuted,
                      borderColor: tokens.primary,
                    }
                  : {
                      borderColor: tokens.cardBorder,
                      backgroundColor: "transparent",
                    },
            pressed && { opacity: tokens.pressedOpacity },
          ]}
        >
          {isDone ? (
            <Text selectable style={styles.dayActivityCheck}>
              ✓
            </Text>
          ) : isSkipped ? (
            <Text
              selectable
              style={[
                styles.dayActivityCheck,
                { color: tokens.completionGreen, fontSize: 13, lineHeight: 15 },
              ]}
            >
              —
            </Text>
          ) : isStarted ? (
            <Text
              selectable
              style={[
                styles.dayActivityCheck,
                { color: tokens.primary, fontSize: 11, lineHeight: 13 },
              ]}
            >
              •••
            </Text>
          ) : null}
        </Pressable>
      </View>

      {/* ── Description + actions ── */}
      {item.body ? (
        <View style={styles.dayActivityExpanded}>
          <Text
            selectable
            variant="muted"
            style={[
              styles.dayActivityBodyText,
              { color: tokens.textSecondary },
            ]}
          >
            {item.body}
          </Text>
          {hasSheet && !isDone && !isSkipped ? (
            <View style={styles.dayActivityActions}>
              <Pressable
                onPress={onStart}
                style={({ pressed }) => [
                  styles.dayActivityStartBtn,
                  {
                    backgroundColor: isStarted
                      ? tokens.primary
                      : tokens.textPrimary,
                  },
                  pressed && { opacity: tokens.pressedOpacity },
                ]}
              >
                <Text
                  selectable
                  style={[
                    styles.dayActivityBtnText,
                    { color: tokens.textInverse },
                  ]}
                >
                  {isStarted ? "Resume" : "Start"}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSkip}
                style={({ pressed }) => [
                  styles.dayActivitySkipBtn,
                  { borderColor: tokens.cardBorder },
                  pressed && { opacity: tokens.pressedOpacity },
                ]}
              >
                <Text
                  selectable
                  style={[
                    styles.dayActivityBtnText,
                    { color: tokens.textSecondary },
                  ]}
                >
                  Skip
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

// ─── AISuggestionCard ──────────────────────────────────────────────────────

export function AISuggestionCard({
  item,
  onAccept,
  onDismiss,
  onSnooze,
}: {
  item: import("./data").AISuggestionItem;
  onAccept?: () => void;
  onDismiss?: () => void;
  onSnooze?: () => void;
}) {
  const { tokens } = useFirstRunV2Theme();

  const variantColors = {
    purple: tokens.phaseLearn,
    teal: tokens.phaseAct,
    amber: tokens.phaseSeed,
  }[item.variant];

  return (
    <Card
      style={[
        styles.aiSuggestionCard,
        {
          backgroundColor: variantColors.bg,
          borderColor: variantColors.border,
        },
      ]}
    >
      <View style={styles.aiSuggestionHeader}>
        <Text
          selectable
          variant="muted"
          style={[styles.eyebrow, styles.aiSuggestionEyebrow, { color: variantColors.text }]}
        >
          {item.eyebrow}
        </Text>
        <View
          style={[
            styles.aiConfidenceBadge,
            { backgroundColor: variantColors.text },
          ]}
        >
          <Text
            selectable
            style={[styles.aiConfidenceBadgeText, { color: tokens.textInverse }]}
          >
            {item.confidence}%
          </Text>
        </View>
      </View>
      <Text
        selectable
        variant="small"
        style={[styles.aiSuggestionText, { color: tokens.textPrimary }]}
      >
        {item.text}
      </Text>
      <View style={styles.aiSuggestionActions}>
        <Pressable
          onPress={onAccept ?? (() => showPreview(item.eyebrow, item.text))}
          style={({ pressed }) => [
            styles.aiActionButton,
            styles.aiActionAccept,
            { backgroundColor: variantColors.text },
            pressed && { opacity: tokens.pressedOpacity },
          ]}
        >
          <Text
            selectable
            style={[styles.aiActionButtonText, { color: tokens.textInverse }]}
          >
            {item.acceptLabel}
          </Text>
        </Pressable>
        <View style={styles.aiActionSecondaryRow}>
          <Pressable
            onPress={onDismiss ?? (() => showPreview("Dismiss", "Suggestion dismissed."))}
            style={({ pressed }) => [
              styles.aiActionButton,
              styles.aiActionDismiss,
              { borderColor: variantColors.border, flex: 1 },
              pressed && { opacity: tokens.pressedOpacity },
            ]}
          >
            <Text
              selectable
              style={[styles.aiActionButtonText, { color: variantColors.text }]}
            >
              {item.dismissLabel}
            </Text>
          </Pressable>
          {item.snoozeLabel ? (
            <Pressable
              onPress={onSnooze ?? (() => showPreview("Snooze", "Suggestion snoozed."))}
              style={({ pressed }) => [
                styles.aiActionButton,
                styles.aiActionSnooze,
                { borderColor: variantColors.border, flex: 1 },
                pressed && { opacity: tokens.pressedOpacity },
              ]}
            >
              <Text
                selectable
                style={[
                  styles.aiActionButtonText,
                  { color: variantColors.text },
                ]}
              >
                {item.snoozeLabel}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

// ─── DomainUnlockCard ─────────────────────────────────────────────────────

export function DomainUnlockCard({
  item,
}: {
  item: import("./data").DomainUnlockItem;
}) {
  const { tokens } = useFirstRunV2Theme();

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/settings/activate-domains`)}
      style={({ pressed }) => [
        styles.domainUnlockCard,
        {
          borderColor: tokens.cardBorder,
          backgroundColor: tokens.card,
        },
        pressed && { opacity: tokens.pressedOpacity },
      ]}
    >
      <View
        style={[
          styles.domainUnlockIcon,
          {
            backgroundColor: tokens.primaryMuted,
            borderColor: tokens.cardBorder,
          },
        ]}
      >
        <Text selectable style={styles.domainUnlockEmoji}>
          {item.icon}
        </Text>
      </View>
      <View style={styles.domainUnlockBody}>
        <Text
          selectable
          variant="small"
          style={[styles.actionTitle, { color: tokens.textPrimary }]}
        >
          {item.title}
        </Text>
        <Text
          selectable
          variant="muted"
          style={{ color: tokens.textSecondary }}
        >
          {item.subtitle}
        </Text>
      </View>
      <FontAwesome name="angle-right" size={16} color={tokens.textSecondary} />
    </Pressable>
  );
}

// ─── RecapCard ────────────────────────────────────────────────────────────

export function RecapCard({
  recap,
  onCta,
}: {
  recap: NonNullable<import("./data").CompleteDay["recap"]>;
  onCta?: () => void;
}) {
  const { tokens, isDark } = useFirstRunV2Theme();

  const recapData = recap;

  const recapBg = isDark ? `${tokens.completionGreen}18` : "#E8F5EE";
  const recapBorder = isDark ? `${tokens.completionGreen}33` : "#B7DEC9";

  return (
    <Card
      style={[
        styles.recapCard,
        { backgroundColor: recapBg, borderColor: recapBorder },
      ]}
    >
      <Text
        selectable
        style={[styles.recapTitle, { color: tokens.textPrimary }]}
      >
        {recapData.title}
      </Text>
      <View style={styles.recapList}>
        {recapData.items.map((item) => (
          <View key={item.text} style={styles.recapRow}>
            <Text
              selectable
              style={[
                styles.recapItemPrefix,
                { color: tokens.completionGreen },
              ]}
            >
              {item.kind === "check" ? "✓" : "→"}
            </Text>
            <View style={styles.recapItemBody}>
              <Text
                selectable
                style={[styles.recapItemText, { color: tokens.textPrimary }]}
              >
                {item.text}
              </Text>
              <Text
                selectable
                variant="muted"
                style={{ color: tokens.textSecondary }}
              >
                {item.sub}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <Pressable
        onPress={onCta}
        style={({ pressed }) => [
          styles.recapCta,
          { backgroundColor: tokens.completionGreen },
          pressed && { opacity: tokens.pressedOpacity },
        ]}
      >
        <Text selectable style={[styles.recapCtaText, { color: "#ffffff" }]}>
          {recapData.ctaLabel}
        </Text>
      </Pressable>
    </Card>
  );
}

// ─── CheckInCard ─────────────────────────────────────────────────────────

const CHECK_IN_METRICS: Array<{ label: string; value: number; max: number }> = [
  { label: "Energy", value: 3, max: 5 },
  { label: "Focus", value: 4, max: 5 },
  { label: "Mood", value: 3, max: 5 },
];

export function CheckInCard() {
  const { tokens } = useFirstRunV2Theme();

  return (
    <Card
      style={[
        styles.checkInCard,
        {
          backgroundColor: tokens.phaseAct.bg,
          borderColor: tokens.phaseAct.border,
        },
      ]}
    >
      <Text
        selectable
        variant="muted"
        style={[styles.eyebrow, { color: tokens.phaseAct.text }]}
      >
        Daily check-in
      </Text>
      <View style={styles.checkInList}>
        {CHECK_IN_METRICS.map((metric) => (
          <View key={metric.label} style={styles.checkInRow}>
            <Text
              selectable
              variant="small"
              style={[styles.checkInLabel, { color: tokens.textPrimary }]}
            >
              {metric.label}
            </Text>
            <View style={styles.checkInDots}>
              {Array.from({ length: metric.max }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.checkInDot,
                    {
                      backgroundColor:
                        i < metric.value
                          ? tokens.phaseAct.text
                          : tokens.cardBorder,
                    },
                  ]}
                />
              ))}
            </View>
            <Text
              selectable
              variant="muted"
              style={{ color: tokens.textSecondary }}
            >
              {metric.value}/{metric.max}
            </Text>
          </View>
        ))}
      </View>
      <Pressable
        onPress={() =>
          showPreview(
            "Daily check-in",
            "This preview would open the check-in flow.",
          )
        }
        style={({ pressed }) => [
          styles.checkInButton,
          {
            backgroundColor: tokens.phaseAct.text,
            borderColor: tokens.phaseAct.border,
          },
          pressed && { opacity: tokens.pressedOpacity },
        ]}
      >
        <Text
          selectable
          style={[styles.checkInButtonText, { color: "#ffffff" }]}
        >
          Start check-in
        </Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: UI_PRESETS.spacing.xxxl,
    paddingBottom: 120,
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: UI_PRESETS.spacing.lg,
  },
  pickerContent: {
    gap: UI_PRESETS.spacing.md,
  },
  stage: {
    gap: UI_PRESETS.spacing.xxxl,
  },
  headerBlock: {
    gap: UI_PRESETS.spacing.sm,
  },
  topline: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toplineLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
  },
  eyebrow: {
    fontFamily: "Geist",
    fontWeight: "700",
    letterSpacing: Typography.eyebrow.letterSpacing,
    fontSize: Typography.eyebrow.fontSize,
    lineHeight: Typography.eyebrow.lineHeight,
    textTransform: "uppercase",
  },
  title: {
    fontWeight: "700",
    lineHeight: 32,
  },
  subtitle: {
    lineHeight: 20,
  },
  insightCard: {
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.modal,
    borderWidth: 1,
    gap: UI_PRESETS.spacing.xl,
    padding: UI_PRESETS.spacing.xxxl,
  },
  insightHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
  },
  signalDot: {
    borderRadius: UI_PRESETS.radius.full,
    height: 7,
    width: 7,
  },
  insightLabel: {
    fontFamily: "Geist",
    fontWeight: "700",
    letterSpacing: Typography.eyebrow.letterSpacing,
    textTransform: "uppercase",
    fontSize: Typography.bodySM.fontSize,
  },
  insightBody: {
    lineHeight: Typography.bodyMD.lineHeight,
    fontSize: Typography.bodyMD.fontSize,
  },
  actionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.md,
  },
  progressCard: {
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.xl,
    borderWidth: 1,
    gap: UI_PRESETS.spacing.md,
    padding: UI_PRESETS.spacing.xxl,
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: UI_PRESETS.spacing.lg,
    justifyContent: "space-between",
  },
  progressSubtitle: {
    lineHeight: Typography.bodySM.lineHeight,
    fontSize: Typography.bodySM.fontSize,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitleText: {
    fontFamily: "Geist",
    fontWeight: "700",
    fontSize: Typography.bodySM.fontSize,
  },
  actionCard: {
    alignItems: "flex-start",
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: UI_PRESETS.spacing.xl,
    padding: UI_PRESETS.spacing.xxl,
  },
  actionRing: {
    borderRadius: UI_PRESETS.radius.full,
    borderWidth: 1.5,
    height: 22,
    marginTop: 2,
    width: 22,
  },
  actionBody: {
    flex: 1,
    gap: 3,
  },
  actionTitle: {
    fontFamily: "Geist",
    fontWeight: "700",
    fontSize: Typography.bodyMD.fontSize,
  },
  actionMeta: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.sm,
  },
  domainPill: {
    borderRadius: UI_PRESETS.radius.full,
    paddingHorizontal: UI_PRESETS.spacing.md,
    paddingVertical: 2,
  },
  emptyHabitCard: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: UI_PRESETS.spacing.xl,
  },
  emptyHabitIcon: {
    alignItems: "center",
    borderRadius: UI_PRESETS.radius.sm,
    borderStyle: "dashed",
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  emptyHabitBody: {
    flex: 1,
    gap: 2,
  },
  promptCard: {
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.xxl,
    borderWidth: 1,
    gap: UI_PRESETS.spacing.lg,
  },
  promptActions: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
    flexWrap: "wrap",
  },
  promptPill: {
    borderRadius: UI_PRESETS.radius.full,
    borderWidth: 1,
    paddingHorizontal: UI_PRESETS.spacing.xl,
    paddingVertical: UI_PRESETS.spacing.sm,
  },
  promptPillAccept: {},
  promptPillText: {
    fontFamily: "Figtree",
    fontWeight: "600",
    fontSize: Typography.buttonSM.fontSize,
    lineHeight: Typography.buttonSM.lineHeight,
  },
  setupCard: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: UI_PRESETS.spacing.xl,
    padding: UI_PRESETS.spacing.xxl,
  },
  setupIcon: {
    alignItems: "center",
    borderRadius: UI_PRESETS.radius.sm,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  setupIconLetter: {
    fontFamily: "Geist",
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 18,
  },
  setupBadge: {
    borderRadius: UI_PRESETS.radius.full,
    borderWidth: 1,
    paddingHorizontal: UI_PRESETS.spacing.lg,
    paddingVertical: UI_PRESETS.spacing.xs,
  },
  metricsRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
  },
  metricCard: {
    borderRadius: UI_PRESETS.radius.sm,
    flex: 1,
    gap: 2,
    padding: UI_PRESETS.spacing.lg,
  },
  metricValue: {
    fontFamily: "Geist",
    fontSize: Typography.numericLG.fontSize,
    fontWeight: "700",
    textAlign: "center",
  },
  habitRail: {
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.lg,
    borderWidth: 1,
    padding: UI_PRESETS.spacing.xl,
  },
  habitRailContent: {
    gap: UI_PRESETS.spacing.md,
  },
  habitChip: {
    alignItems: "center",
    borderRadius: UI_PRESETS.radius.full,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: UI_PRESETS.spacing.xl,
    paddingVertical: UI_PRESETS.spacing.md,
  },
  habitDot: {
    borderRadius: UI_PRESETS.radius.full,
    borderWidth: 1.5,
    height: 16,
    width: 16,
  },
  contextCard: {
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.lg,
    borderWidth: 1,
    gap: UI_PRESETS.spacing.lg,
  },
  contextList: {
    gap: UI_PRESETS.spacing.md,
  },
  contextRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
  },
  contextDot: {
    borderRadius: UI_PRESETS.radius.full,
    height: 6,
    width: 6,
  },
  contextText: {
    flex: 1,
    lineHeight: Typography.bodySM.lineHeight,
    fontSize: Typography.bodySM.fontSize,
  },
  newBadge: {
    borderRadius: UI_PRESETS.radius.full,
    borderWidth: 1,
    paddingHorizontal: UI_PRESETS.spacing.sm,
    paddingVertical: 2,
  },
  celebrationCard: {
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.xl,
    borderWidth: 1,
    gap: UI_PRESETS.spacing.xs,
    paddingVertical: 18,
  },
  celebrationEmoji: {
    fontSize: 28,
    textAlign: "center",
  },
  celebrationTitle: {
    fontFamily: "Geist",
    fontWeight: "700",
    textAlign: "center",
    fontSize: Typography.bodyMD.fontSize,
  },
  celebrationSubtitle: {
    lineHeight: Typography.bodySM.lineHeight,
    textAlign: "center",
    fontSize: Typography.bodySM.fontSize,
  },
  approvalCard: {
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.md,
    borderWidth: 1,
    gap: UI_PRESETS.spacing.md,
  },
  approvalTitle: {
    fontFamily: "Geist",
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: Typography.bodySM.fontSize,
  },
  approvalSubtitle: {
    lineHeight: Typography.bodyMD.lineHeight,
    fontSize: Typography.bodyMD.fontSize,
  },
  approvalDetails: {
    gap: UI_PRESETS.spacing.xs,
  },
  approvalDetailTextStyle: {
    fontSize: Typography.bodySM.fontSize,
    lineHeight: Typography.bodySM.lineHeight,
  },
  phasePill: {
    borderRadius: UI_PRESETS.radius.full,
    borderWidth: 1,
    paddingHorizontal: UI_PRESETS.spacing.md,
    paddingVertical: 2,
  },
  phasePillText: {
    fontFamily: "Geist",
    fontWeight: "600",
    fontSize: Typography.labelXS.fontSize,
    letterSpacing: Typography.labelXS.letterSpacing,
    textTransform: "uppercase",
  },
  confidenceCard: {
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.xl,
    borderWidth: 1,
    gap: UI_PRESETS.spacing.xl,
    padding: UI_PRESETS.spacing.xxxl,
  },
  confidenceList: {
    gap: UI_PRESETS.spacing.xl,
  },
  confidenceRow: {
    gap: UI_PRESETS.spacing.sm,
  },
  confidenceLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: UI_PRESETS.spacing.md,
  },
  confidenceRight: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
  confidenceScore: {
    fontFamily: "Geist",
    fontWeight: "700",
    fontSize: Typography.labelSM.fontSize,
    lineHeight: Typography.labelSM.lineHeight,
  },
  confidenceTierLabel: {
    fontFamily: "Geist",
    fontWeight: "400",
    fontSize: Typography.labelXS.fontSize,
    lineHeight: Typography.labelSM.lineHeight,
  },
  confidenceTrack: {
    borderRadius: UI_PRESETS.radius.full,
    height: 4,
    overflow: "hidden",
  },
  confidenceFill: {
    borderRadius: UI_PRESETS.radius.full,
    height: "100%",
  },
  domainSuggestedCard: {
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.modal,
    borderWidth: 1,
    gap: UI_PRESETS.spacing.xxl,
    padding: UI_PRESETS.spacing.xxxl,
  },
  domainSuggestedTitle: {
    fontFamily: "Geist",
    fontWeight: "700",
    fontSize: Typography.titleSM.fontSize,
    lineHeight: Typography.titleSM.lineHeight,
    marginBottom: UI_PRESETS.spacing.xs,
  },
  domainSuggestedActions: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
    flexWrap: "wrap",
  },
  domainActionPrimary: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.md,
    justifyContent: "center",
    paddingHorizontal: UI_PRESETS.spacing.xxxl,
    paddingVertical: UI_PRESETS.spacing.lg,
    minHeight: UI_PRESETS.size.controlMd,
  },
  domainActionPrimaryText: {
    fontFamily: "Figtree",
    fontWeight: "600",
    fontSize: Typography.buttonMD.fontSize,
    lineHeight: Typography.buttonMD.lineHeight,
  },
  domainActionGhost: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.md,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: UI_PRESETS.spacing.xxl,
    paddingVertical: UI_PRESETS.spacing.lg,
    minHeight: UI_PRESETS.size.controlMd,
  },
  domainActionGhostText: {
    fontFamily: "Figtree",
    fontWeight: "600",
    fontSize: Typography.buttonMD.fontSize,
    lineHeight: Typography.buttonMD.lineHeight,
  },
  // ─── DayActivityCard ─────────────────────────────────────────────────────
  dayActivityCard: {
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  dayActivityHead: {
    alignItems: "center",
    flexDirection: "row",
    gap: UI_PRESETS.spacing.xl,
    padding: UI_PRESETS.spacing.xxl,
  },
  dayActivityExpanded: {
    paddingHorizontal: UI_PRESETS.spacing.xxl,
    paddingBottom: UI_PRESETS.spacing.xxl,
    gap: UI_PRESETS.spacing.xl,
  },
  dayActivityActions: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
  },
  dayActivityStartBtn: {
    borderRadius: UI_PRESETS.radius.md,
    paddingHorizontal: UI_PRESETS.spacing.xxxl,
    paddingVertical: UI_PRESETS.spacing.lg,
  },
  dayActivitySkipBtn: {
    borderRadius: UI_PRESETS.radius.md,
    borderWidth: 1,
    paddingHorizontal: UI_PRESETS.spacing.xl,
    paddingVertical: UI_PRESETS.spacing.lg,
  },
  dayActivityBtnText: {
    fontFamily: "Figtree",
    fontWeight: "600",
    fontSize: Typography.buttonSM.fontSize,
    lineHeight: Typography.buttonSM.lineHeight,
  },
  dayActivityIcon: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  dayActivityEmoji: {
    fontSize: 17,
    lineHeight: 22,
  },
  dayActivityBody: {
    flex: 1,
    gap: 3,
  },
  dayActivityBodyText: {
    fontSize: Typography.bodySM.fontSize,
    lineHeight: Typography.bodySM.lineHeight,
  },
  dayActivityStatus: {
    alignItems: "center",
    borderRadius: 11,
    borderWidth: 1.5,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  dayActivityCheck: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },
  // ─── AISuggestionCard ────────────────────────────────────────────────────
  aiSuggestionCard: {
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.xl,
    borderWidth: 1,
    gap: UI_PRESETS.spacing.xl,
    padding: UI_PRESETS.spacing.xxxl,
  },
  aiSuggestionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: UI_PRESETS.spacing.md,
  },
  aiSuggestionEyebrow: {
    flex: 1,
  },
  aiConfidenceBadge: {
    borderRadius: UI_PRESETS.radius.full,
    paddingHorizontal: UI_PRESETS.spacing.md,
    paddingVertical: 3,
  },
  aiConfidenceBadgeText: {
    fontFamily: "Geist",
    fontWeight: "700",
    fontSize: Typography.labelXS.fontSize,
    letterSpacing: Typography.labelXS.letterSpacing,
  },
  aiSuggestionText: {
    lineHeight: Typography.bodyMD.lineHeight,
    fontSize: Typography.bodyMD.fontSize,
  },
  aiSuggestionActions: {
    flexDirection: "column",
    gap: UI_PRESETS.spacing.sm,
  },
  aiActionSecondaryRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
  aiActionButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.md,
    height: 40,
    justifyContent: "center",
    paddingHorizontal: UI_PRESETS.spacing.lg,
  },
  aiActionAccept: {},
  aiActionDismiss: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  aiActionSnooze: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  aiActionButtonText: {
    fontFamily: "Figtree",
    fontWeight: "600",
    fontSize: Typography.buttonSM.fontSize,
    lineHeight: Typography.buttonSM.lineHeight,
  },
  // ─── DomainUnlockCard ────────────────────────────────────────────────────
  domainUnlockCard: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: UI_PRESETS.spacing.xl,
    padding: UI_PRESETS.spacing.xxl,
  },
  domainUnlockIcon: {
    alignItems: "center",
    borderRadius: UI_PRESETS.radius.sm,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  domainUnlockEmoji: {
    fontSize: 18,
    lineHeight: 22,
  },
  domainUnlockBody: {
    flex: 1,
    gap: 3,
  },
  // ─── RecapCard ───────────────────────────────────────────────────────────
  recapCard: {
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    gap: UI_PRESETS.spacing.xl,
    padding: 16,
  },
  recapTitle: {
    fontFamily: "Geist",
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 22,
  },
  recapList: {
    gap: UI_PRESETS.spacing.lg,
  },
  recapRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
  },
  recapItemPrefix: {
    fontFamily: "Geist",
    fontWeight: "700",
    fontSize: 13,
    lineHeight: 20,
    width: 14,
  },
  recapItemBody: {
    flex: 1,
    gap: 1,
  },
  recapItemText: {
    fontFamily: "Geist",
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 20,
  },
  recapCta: {
    alignItems: "center",
    borderRadius: 10,
    height: 44,
    justifyContent: "center",
    width: "100%",
  },
  recapCtaText: {
    fontFamily: "Figtree",
    fontWeight: "600",
    fontSize: Typography.buttonMD.fontSize,
    lineHeight: Typography.buttonMD.lineHeight,
  },
  // ─── CheckInCard ─────────────────────────────────────────────────────────
  checkInCard: {
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.xl,
    borderWidth: 1,
    gap: UI_PRESETS.spacing.xl,
    padding: UI_PRESETS.spacing.xxxl,
  },
  checkInList: {
    gap: UI_PRESETS.spacing.lg,
  },
  checkInRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: UI_PRESETS.spacing.xl,
  },
  checkInLabel: {
    fontFamily: "Geist",
    fontWeight: "600",
    fontSize: Typography.bodyMD.fontSize,
    width: 56,
  },
  checkInDots: {
    flex: 1,
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
  checkInDot: {
    borderRadius: UI_PRESETS.radius.full,
    flex: 1,
    height: 8,
  },
  checkInButton: {
    alignItems: "center",
    borderRadius: UI_PRESETS.radius.md,
    height: UI_PRESETS.size.controlMd,
    justifyContent: "center",
    width: "100%",
  },
  checkInButtonText: {
    fontFamily: "Figtree",
    fontWeight: "600",
    fontSize: Typography.buttonMD.fontSize,
    lineHeight: Typography.buttonMD.lineHeight,
  },
});

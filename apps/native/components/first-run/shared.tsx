import { ScrollView, StyleSheet, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";

import { AnimatedProgressBar, AnimatedStage } from "@/components/auth/onboarding-flow-motion";
import { Badge, Button, Card, Text } from "@/components/ui";
import type {
  FirstRunActivityViewModel,
  FirstRunCheckInViewModel,
  FirstRunConfidenceViewModel,
  FirstRunDomainSetupViewModel,
  FirstRunEmptyStateViewModel,
  FirstRunHeaderViewModel,
  FirstRunInsightViewModel,
  FirstRunProfileViewModel,
  FirstRunProgressViewModel,
  FirstRunSnapshotViewModel,
  FirstRunSuggestionActionViewModel,
  FirstRunSuggestionViewModel,
  FirstRunWeekTwoViewModel,
} from "@/components/first-run/data";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

function useFirstRunTheme() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return { theme, isDarkColorScheme };
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

export function ExperienceStage({
  stageKey,
  children,
}: {
  stageKey: string;
  children: React.ReactNode;
}) {
  return <AnimatedStage stageKey={stageKey} style={styles.stage}>{children}</AnimatedStage>;
}

export function ScreenHeader({ header }: { header: FirstRunHeaderViewModel }) {
  const { theme } = useFirstRunTheme();

  return (
    <View style={styles.headerBlock}>
      <Text selectable variant="muted" style={[styles.eyebrow, { color: theme.mutedForeground }]}>
        {header.eyebrow}
      </Text>
      <View style={styles.headerTopline}>
        <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
          Seven-day ramp
        </Text>
        <Badge color="secondary">{header.badge}</Badge>
      </View>
      <Text selectable variant="h3" style={[styles.title, { color: theme.foreground }]}>
        {header.title}
      </Text>
      <Text selectable variant="small" style={[styles.subtitle, { color: theme.mutedForeground }]}>
        {header.subtitle}
      </Text>
    </View>
  );
}

export function ProgressCard({ progress }: { progress: FirstRunProgressViewModel }) {
  const { theme } = useFirstRunTheme();

  return (
    <Card style={[styles.progressCard, { borderColor: theme.border }]}>
      <View style={styles.progressHeader}>
        <Text selectable variant="small" style={[styles.cardTitle, { color: theme.foreground }]}>
          AI context
        </Text>
        <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
          {progress.label}
        </Text>
      </View>
      <AnimatedProgressBar progress={progress.progress} trackColor={theme.border} fillColor="#9b8fff" />
      <Text selectable variant="muted" style={[styles.progressSubtitle, { color: theme.mutedForeground }]}>
        {progress.subtitle}
      </Text>
    </Card>
  );
}

export function InsightCard({ insight }: { insight: FirstRunInsightViewModel }) {
  const { isDarkColorScheme, theme } = useFirstRunTheme();

  return (
    <Card
      style={[
        styles.insightCard,
        {
          borderColor: "rgba(61, 53, 112, 0.28)",
          backgroundColor: isDarkColorScheme
            ? "rgba(19, 19, 31, 0.96)"
            : "rgba(244, 242, 255, 0.98)",
        },
      ]}
    >
      <View style={styles.insightHeader}>
        <View style={styles.signalDot} />
        <Text selectable variant="small" style={[styles.insightLabel, { color: theme.primary }]}>
          {insight.title}
        </Text>
        {insight.badge ? (
          <Badge color="secondary" variant="outline">
            {insight.badge}
          </Badge>
        ) : null}
      </View>
      <Text
        selectable
        variant="small"
        style={[
          styles.insightBody,
          { color: isDarkColorScheme ? "#b4b4c6" : "#5f5f7c" },
        ]}
      >
        {insight.body}
      </Text>
    </Card>
  );
}

export function SectionTitle({
  label,
  subtitle,
  action,
}: {
  label: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const { theme } = useFirstRunTheme();

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderText}>
        <Text selectable variant="muted" style={[styles.eyebrow, { color: theme.mutedForeground }]}>
          {label}
        </Text>
        {subtitle ? (
          <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? <View>{action}</View> : null}
    </View>
  );
}

export function SnapshotCard({ snapshot }: { snapshot: FirstRunSnapshotViewModel }) {
  const { theme } = useFirstRunTheme();

  return (
    <Card style={[styles.sectionCard, { borderColor: theme.border }]}>
      <Text selectable variant="small" style={[styles.cardTitle, { color: theme.foreground }]}>
        {snapshot.title}
      </Text>
      <Text selectable variant="small" style={[styles.cardBody, { color: theme.mutedForeground }]}>
        {snapshot.subtitle}
      </Text>
      <View style={styles.snapshotRow}>
        {snapshot.metrics.map((metric) => (
          <View key={metric.id} style={[styles.snapshotMetric, { backgroundColor: theme.background }]}>
            <Text selectable variant="h3" style={{ color: metric.color, fontVariant: ["tabular-nums"] }}>
              {metric.value}
            </Text>
            <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
              {metric.label}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function CheckInCard({
  checkIn,
  mood,
  energy,
  readiness,
  busy,
  onSetMood,
  onSetEnergy,
  onSetReadiness,
  onSubmit,
}: {
  checkIn: FirstRunCheckInViewModel;
  mood: number;
  energy: number;
  readiness: number;
  busy: boolean;
  onSetMood: (value: number) => void;
  onSetEnergy: (value: number) => void;
  onSetReadiness: (value: number) => void;
  onSubmit: () => void;
}) {
  return (
    <Card style={styles.checkInCard}>
      <View style={styles.checkInHeader}>
        <View style={styles.checkInDot} />
        <Text selectable variant="small" style={styles.checkInLabel}>
          {checkIn.title}
        </Text>
        <Badge color="secondary">{checkIn.badge}</Badge>
      </View>
      <Text selectable variant="small" style={styles.checkInBody}>
        {checkIn.subtitle}
      </Text>

      <CheckInScale label="Mood" value={mood} onSelect={onSetMood} />
      <CheckInScale label="Energy" value={energy} onSelect={onSetEnergy} />
      <CheckInScale label="Ready" value={readiness} onSelect={onSetReadiness} />

      <Button
        title={checkIn.completed ? "Check-in already logged" : "Save check-in"}
        disabled={busy || checkIn.completed}
        onPress={onSubmit}
      />
    </Card>
  );
}

export function ProfileSummaryCard({ profile }: { profile: FirstRunProfileViewModel }) {
  const { theme } = useFirstRunTheme();

  return (
    <Card style={[styles.sectionCard, { borderColor: theme.border }]}>
      <Text selectable variant="small" style={[styles.cardTitle, { color: theme.foreground }]}>
        {profile.title}
      </Text>
      <Text selectable variant="small" style={[styles.cardBody, { color: theme.mutedForeground }]}>
        {profile.subtitle}
      </Text>
      <View style={styles.profileGrid}>
        {profile.items.map((item) => (
          <View key={item.label} style={[styles.profileItem, { backgroundColor: theme.background }]}>
            <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
              {item.label}
            </Text>
            <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function DomainSetupCard({
  domain,
  onPress,
}: {
  domain: FirstRunDomainSetupViewModel;
  onPress: () => void;
}) {
  const { theme } = useFirstRunTheme();

  return (
    <Card style={[styles.sectionCard, styles.domainCard, { borderColor: theme.border }]}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.domainHeader}>
          <View style={[styles.domainIconWrap, { backgroundColor: domain.backgroundColor }]}>
            <FontAwesome name={domain.icon} size={14} color={domain.accentColor} />
          </View>
          <View style={styles.cardHeaderText}>
            <Text selectable variant="small" style={[styles.cardTitle, { color: theme.foreground }]}>
              {domain.title}
            </Text>
            <Text selectable variant="small" style={[styles.cardBody, { color: theme.mutedForeground }]}>
              {domain.subtitle}
            </Text>
            <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
              {domain.statusLine}
            </Text>
          </View>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: domain.backgroundColor }]}>
          <Text selectable variant="muted" style={{ color: domain.accentColor }}>
            {domain.badge}
          </Text>
        </View>
      </View>
      <Button title={`Open ${domain.title}`} size="sm" variant="outline" onPress={onPress} />
    </Card>
  );
}

export type ActivityCardProps = {
  activity: FirstRunActivityViewModel;
  busy: boolean;
  onAction: (actionId: "start" | "done" | "skip") => void;
  onReflection: (option: FirstRunActivityViewModel["reflectionOptions"][number]) => void;
};

export function ActivityCard({
  activity,
  busy,
  onAction,
  onReflection,
}: ActivityCardProps) {
  const { theme } = useFirstRunTheme();

  return (
    <Card style={[styles.sectionCard, styles.activityCard, { borderColor: theme.border }]}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderText}>
          <Text selectable variant="small" style={[styles.cardTitle, { color: theme.foreground }]}>
            {activity.title}
          </Text>
          <Text selectable variant="small" style={[styles.cardBody, { color: theme.mutedForeground }]}>
            {activity.instructions}
          </Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: activity.categoryBackground }]}>
          <Text selectable variant="muted" style={{ color: activity.categoryColor }}>
            {activity.categoryLabel}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Badge variant="outline" color="secondary">
          {activity.statusLabel}
        </Badge>
        <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
          {activity.durationLabel} · {activity.phaseLabel}
        </Text>
      </View>

      {activity.actions.length > 0 ? (
        <View style={styles.actionRow}>
          {activity.actions.map((action) => (
            <Button
              key={action.id}
              title={action.label}
              size="sm"
              variant={action.variant}
              disabled={busy || action.disabled}
              onPress={() => onAction(action.id)}
            />
          ))}
        </View>
      ) : null}

      {activity.reflectionSummary ? (
        <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
          {activity.reflectionSummary}
        </Text>
      ) : null}

      {activity.showReflection ? (
        <View style={styles.reflectionBlock}>
          <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
            Quick reflection
          </Text>
          <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
            One tap is enough. Reflection is high-value signal for the model.
          </Text>
          <View style={styles.actionRow}>
            {activity.reflectionOptions.map((option) => (
              <Button
                key={option.id}
                title={option.label}
                size="sm"
                variant="outline"
                disabled={busy}
                onPress={() => onReflection(option)}
              />
            ))}
          </View>
        </View>
      ) : null}
    </Card>
  );
}

export type SuggestionCardProps = {
  suggestion: FirstRunSuggestionViewModel;
  busy: boolean;
  onAction: (actionId: FirstRunSuggestionActionViewModel["id"]) => void;
};

export function SuggestionCard({
  suggestion,
  busy,
  onAction,
}: SuggestionCardProps) {
  const { theme } = useFirstRunTheme();

  return (
    <Card style={[styles.sectionCard, { borderColor: theme.border }]}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderText}>
          <Text selectable variant="small" style={[styles.cardTitle, { color: theme.foreground }]}>
            {suggestion.categoryLabel}
          </Text>
          <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
            {suggestion.confidenceLabel}
          </Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: suggestion.categoryBackground }]}>
          <Text selectable variant="muted" style={{ color: suggestion.categoryColor }}>
            AI
          </Text>
        </View>
      </View>

      <Text selectable variant="small" style={[styles.cardBody, { color: theme.foreground }]}>
        {suggestion.content}
      </Text>

      {suggestion.feedbackLabel ? (
        <Badge color="success" variant="subtle">
          {suggestion.feedbackLabel}
        </Badge>
      ) : (
        <View style={styles.actionRow}>
          {suggestion.actions.map((action) => (
            <Button
              key={action.id}
              title={action.label}
              size="sm"
              variant={action.variant}
              disabled={busy || action.disabled}
              onPress={() => onAction(action.id)}
            />
          ))}
        </View>
      )}
    </Card>
  );
}

export function ConfidenceCard({ items }: { items: FirstRunConfidenceViewModel[] }) {
  const { theme } = useFirstRunTheme();

  return (
    <Card style={[styles.sectionCard, { borderColor: theme.border }]}>
      {items.map((item) => (
        <View key={item.id} style={styles.confidenceRow}>
          <View style={styles.confidenceHeader}>
            <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
              {item.label}
            </Text>
            <Badge variant="outline" color="secondary">
              {item.tierLabel}
            </Badge>
          </View>
          <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
            Score {item.score} · {item.signalCount} signals · {item.completions} done · {item.skips} skipped
          </Text>
          <View style={[styles.scoreRail, { backgroundColor: theme.background }]}>
            <View
              style={[
                styles.scoreFill,
                {
                  backgroundColor: item.color,
                  width: `${Math.max(4, Math.min(item.score, 100))}%`,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </Card>
  );
}

export function WeekTwoPlanCard({ plan }: { plan: FirstRunWeekTwoViewModel }) {
  return (
    <Card style={styles.weekTwoCard}>
      <Text selectable variant="small" style={styles.weekTwoTitle}>
        {plan.title}
      </Text>
      <Text selectable variant="small" style={styles.weekTwoBody}>
        {plan.subtitle}
      </Text>
    </Card>
  );
}

export type EmptyStateCardProps = {
  state: FirstRunEmptyStateViewModel;
  busy?: boolean;
  onPressCta?: () => void;
};

export function EmptyStateCard({
  state,
  busy = false,
  onPressCta,
}: EmptyStateCardProps) {
  const { theme } = useFirstRunTheme();

  return (
    <Card style={[styles.sectionCard, { borderColor: theme.border }]}>
      <Text selectable variant="small" style={[styles.cardTitle, { color: theme.foreground }]}>
        {state.title}
      </Text>
      <Text selectable variant="small" style={[styles.cardBody, { color: theme.mutedForeground }]}>
        {state.subtitle}
      </Text>
      {state.ctaLabel && onPressCta ? (
        <Button title={state.ctaLabel} variant="outline" size="sm" disabled={busy} onPress={onPressCta} />
      ) : null}
    </Card>
  );
}

export function LoadingState() {
  const { isDarkColorScheme } = useFirstRunTheme();

  return (
    <Card
      style={[
        styles.loadingCard,
        {
          backgroundColor: isDarkColorScheme
            ? "rgba(19, 19, 31, 0.96)"
            : "rgba(244, 242, 255, 0.98)",
        },
      ]}
    >
      <Text selectable variant="small" style={styles.loadingEyebrow}>
        First run
      </Text>
      <Text selectable variant="h3" style={styles.loadingTitle}>
        Building today&apos;s context...
      </Text>
      <Text selectable variant="small" style={styles.loadingBody}>
        Pulling your current assignments, signals, and suggestion state from Convex.
      </Text>
    </Card>
  );
}

export function ErrorState({
  message,
  onRetry,
  busy = false,
}: {
  message: string;
  onRetry?: () => void;
  busy?: boolean;
}) {
  return (
    <Card style={styles.errorCard}>
      <Text selectable variant="small" style={styles.errorTitle}>
        First-run action failed
      </Text>
      <Text selectable variant="small" style={styles.errorBody}>
        {message}
      </Text>
      {onRetry ? (
        <Button title="Try again" variant="outline" size="sm" disabled={busy} onPress={onRetry} />
      ) : null}
    </Card>
  );
}

function CheckInScale({
  label,
  value,
  onSelect,
}: {
  label: string;
  value: number;
  onSelect: (value: number) => void;
}) {
  return (
    <View style={styles.scaleBlock}>
      <Text selectable variant="muted" style={styles.scaleLabel}>
        {label}
      </Text>
      <View style={styles.scaleRow}>
        {[1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.scaleButtonWrap}>
            <Button
              title={String(item)}
              size="sm"
              variant={value === item ? "primary" : "outline"}
              onPress={() => onSelect(item)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 16,
    paddingBottom: 120,
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: UI_PRESETS.spacing.lg,
  },
  stage: {
    gap: 16,
  },
  headerBlock: {
    gap: 6,
  },
  headerTopline: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  eyebrow: {
    fontFamily: "Geist",
    fontWeight: "700",
    letterSpacing: 1,
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
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  insightHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  signalDot: {
    backgroundColor: "#9b8fff",
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  insightLabel: {
    fontFamily: "Geist",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  insightBody: {
    lineHeight: 22,
  },
  progressCard: {
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  progressSubtitle: {
    lineHeight: 18,
  },
  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionHeaderText: {
    flex: 1,
    gap: 2,
  },
  sectionCard: {
    borderCurve: "continuous",
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  checkInCard: {
    backgroundColor: "#1a1020",
    borderColor: "#3d1535",
    borderCurve: "continuous",
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  checkInHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  checkInDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#d4537e",
  },
  checkInLabel: {
    color: "#f0abc0",
    fontFamily: "Geist",
    fontWeight: "700",
  },
  checkInBody: {
    color: "#c89cb1",
    lineHeight: 20,
  },
  scaleBlock: {
    gap: 6,
  },
  scaleLabel: {
    color: "#8e7081",
    fontFamily: "Geist",
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  scaleRow: {
    flexDirection: "row",
    gap: 8,
  },
  scaleButtonWrap: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: "Geist",
    fontWeight: "700",
  },
  cardBody: {
    lineHeight: 20,
  },
  profileGrid: {
    gap: 8,
  },
  snapshotRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  snapshotMetric: {
    borderRadius: 14,
    flexGrow: 1,
    minWidth: "47%",
    padding: 12,
    gap: 2,
  },
  profileItem: {
    borderRadius: 14,
    gap: 4,
    padding: 12,
  },
  activityCard: {
    gap: 10,
  },
  domainCard: {
    gap: 10,
  },
  domainHeader: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  domainIconWrap: {
    alignItems: "center",
    borderRadius: 10,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
    gap: 4,
  },
  categoryBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  reflectionBlock: {
    gap: 8,
    paddingTop: 4,
  },
  confidenceRow: {
    gap: 6,
  },
  confidenceHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  scoreRail: {
    borderRadius: 999,
    height: 8,
    overflow: "hidden",
  },
  scoreFill: {
    borderRadius: 999,
    height: "100%",
  },
  weekTwoCard: {
    backgroundColor: "#20182d",
    borderColor: "#3d3570",
    borderCurve: "continuous",
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
  },
  weekTwoTitle: {
    color: "#efe9ff",
    fontFamily: "Geist",
    fontWeight: "700",
  },
  weekTwoBody: {
    color: "#cfc4f8",
    lineHeight: 20,
  },
  loadingCard: {
    borderCurve: "continuous",
    borderRadius: 22,
    gap: 10,
    padding: 18,
  },
  loadingEyebrow: {
    color: "#9b8fff",
    fontFamily: "Geist",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  loadingTitle: {
    color: "#efe9ff",
    fontWeight: "700",
  },
  loadingBody: {
    color: "#b9b2d7",
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: "#2b1418",
    borderColor: "#8f3d4b",
    borderCurve: "continuous",
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  errorTitle: {
    color: "#ffd6db",
    fontFamily: "Geist",
    fontWeight: "700",
  },
  errorBody: {
    color: "#ffbcc6",
    lineHeight: 20,
  },
});

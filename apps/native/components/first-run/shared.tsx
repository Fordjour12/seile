import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";

import { AnimatedProgressBar, AnimatedStage } from "@/components/auth/onboarding-flow-motion";
import { Badge, Button, Card, Chip, Text } from "@/components/ui";
import type {
  ActionItem,
  ContextItem,
  InsightAction,
  MetricItem,
  SetupItem,
} from "@/components/first-run/data";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type PickerOption<T extends string> = {
  id: T;
  label: string;
};

export function showPreview(label: string, message: string) {
  Alert.alert(label, message);
}

export function useFirstRunTheme() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return { colorScheme, isDarkColorScheme, theme };
}

export function FirstRunScroll({
  children,
}: {
  children: React.ReactNode;
}) {
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
        style={[
          styles.insightBody,
          { color: isDarkColorScheme ? "#b4b4c6" : "#5f5f7c" },
        ]}
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
  const { theme } = useFirstRunTheme();

  return (
    <Card style={[styles.progressCard, { borderColor: theme.border }]}>
      <View style={styles.progressHeader}>
        <Text selectable variant="small" style={[styles.sectionTitleText, { color: theme.foreground }]}>
          AI context
        </Text>
        <Text
          selectable
          variant="muted"
          style={{
            color: progress === 100 ? "#1d9e75" : theme.mutedForeground,
          }}
        >
          {label}
        </Text>
      </View>
      <AnimatedProgressBar
        progress={progress}
        trackColor={theme.border}
        fillColor="#9b8fff"
      />
      <Text selectable variant="muted" style={[styles.progressSubtitle, { color: theme.mutedForeground }]}>
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
}: {
  eyebrow?: string;
  badge?: string;
  dateLabel?: string;
  title: string;
  subtitle: string;
}) {
  const { theme } = useFirstRunTheme();

  return (
    <View style={styles.headerBlock}>
      {eyebrow ? (
        <Text selectable variant="muted" style={[styles.eyebrow, { color: theme.mutedForeground }]}>
          {eyebrow}
        </Text>
      ) : null}
      {badge ? (
        <View style={styles.topline}>
          <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
            Today
          </Text>
          <Badge color="secondary">{badge}</Badge>
        </View>
      ) : null}
      {dateLabel ? (
        <Text selectable variant="muted" style={[styles.eyebrow, { color: theme.mutedForeground }]}>
          {dateLabel}
        </Text>
      ) : null}
      <Text selectable variant="h3" style={[styles.title, { color: theme.foreground }]}>
        {title}
      </Text>
      <Text selectable variant="small" style={[styles.subtitle, { color: theme.mutedForeground }]}>
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
  const { theme } = useFirstRunTheme();

  return (
    <View style={styles.sectionHeader}>
      <Text selectable variant="muted" style={[styles.eyebrow, { color: theme.mutedForeground }]}>
        {label}
      </Text>
      {subtitle ? (
        <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
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
  const { theme } = useFirstRunTheme();

  return (
    <Pressable
      onPress={() => showPreview(previewTitle, `${item.title}\n\n${item.note}`)}
      style={({ pressed }) => [
        styles.actionCard,
        { borderColor: theme.border, backgroundColor: theme.card },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.actionRing, { borderColor: item.accentColor }]} />
      <View style={styles.actionBody}>
        <Text selectable variant="small" style={[styles.actionTitle, { color: theme.foreground }]}>
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
          <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
            {item.note}
          </Text>
        </View>
      </View>
      <FontAwesome name="angle-right" size={16} color={theme.mutedForeground} />
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
  const { theme } = useFirstRunTheme();

  return (
    <Card style={[styles.emptyHabitCard, { borderColor: theme.border }]}>
      <View style={[styles.emptyHabitIcon, { borderColor: theme.border }]}>
        <FontAwesome name="plus" size={14} color={theme.mutedForeground} />
      </View>
      <View style={styles.emptyHabitBody}>
        <Text selectable variant="small" style={[styles.actionTitle, { color: theme.foreground }]}>
          {title}
        </Text>
        <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
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
        <Text selectable variant="small" style={[styles.sectionTitleText, { color: accentColor }]}>
          {title}
        </Text>
      </View>
      <Text selectable variant="small" style={[styles.insightBody, { color: "#a08090" }]}>
        {subtitle}
      </Text>
      <Button
        title="Open preview"
        onPress={() => showPreview(title, subtitle)}
      />
    </Card>
  );
}

export function SetupCard({ item }: { item: SetupItem }) {
  const { theme } = useFirstRunTheme();

  return (
    <Pressable
      onPress={() => showPreview(item.title, item.subtitle)}
      style={({ pressed }) => [
        styles.setupCard,
        { borderColor: theme.border, backgroundColor: theme.card },
        pressed && styles.pressed,
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
      />
      <View style={styles.actionBody}>
        <Text selectable variant="small" style={[styles.actionTitle, { color: theme.foreground }]}>
          {item.title}
        </Text>
        <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
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
  const { theme } = useFirstRunTheme();

  return (
    <View style={styles.metricsRow}>
      {items.map((item) => (
        <View key={item.label} style={[styles.metricCard, { backgroundColor: theme.card }]}>
          <Text selectable style={[styles.metricValue, { color: item.color }]}>
            {item.value}
          </Text>
          <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function HabitRail({ items }: { items: string[] }) {
  const { theme } = useFirstRunTheme();

  return (
    <Card style={[styles.habitRail, { borderColor: theme.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.habitRailContent}>
        {items.map((item) => (
          <View key={item} style={[styles.habitChip, { backgroundColor: theme.background }]}>
            <View style={[styles.habitDot, { borderColor: "#534AB7" }]} />
            <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
              {item}
            </Text>
          </View>
        ))}
        <Chip label="+ Add habit" onSelect={() => showPreview("Add habit", "This preview would add another habit to the first-run routine.")} />
      </ScrollView>
    </Card>
  );
}

export function ContextCard({ items }: { items: ContextItem[] }) {
  const { theme } = useFirstRunTheme();

  return (
    <Card style={[styles.contextCard, { borderColor: theme.border }]}>
      <Text selectable variant="muted" style={[styles.eyebrow, { color: theme.mutedForeground }]}>
        What I know so far
      </Text>
      <View style={styles.contextList}>
        {items.map((item) => (
          <View key={item.label} style={styles.contextRow}>
            <View style={[styles.contextDot, { backgroundColor: item.color }]} />
            <Text selectable variant="small" style={[styles.contextText, { color: theme.foreground }]}>
              {item.label}
            </Text>
            {item.isNew ? (
              <View style={styles.newBadge}>
                <Text selectable variant="muted" style={{ color: "#9b8fff" }}>
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
  return (
    <Card style={styles.celebrationCard}>
      <Text selectable style={styles.celebrationEmoji}>
        {"\uD83D\uDD25"}
      </Text>
      <Text selectable variant="small" style={styles.celebrationTitle}>
        {title}
      </Text>
      <Text selectable variant="muted" style={styles.celebrationSubtitle}>
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
  return (
    <Card style={styles.approvalCard}>
      <Text selectable variant="small" style={styles.approvalTitle}>
        {title}
      </Text>
      <Text selectable variant="small" style={styles.approvalSubtitle}>
        {subtitle}
      </Text>
      <View style={styles.approvalDetails}>
        {details.map((detail) => (
          <Text key={detail} selectable variant="muted" style={styles.approvalDetailText}>
            {detail}
          </Text>
        ))}
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
  return <AnimatedStage stageKey={stageKey} style={styles.stage}>{children}</AnimatedStage>;
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 16,
    paddingBottom: 120,
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: UI_PRESETS.spacing.lg,
  },
  pickerContent: {
    gap: 8,
  },
  stage: {
    gap: 16,
  },
  headerBlock: {
    gap: 6,
  },
  topline: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
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
  actionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
    gap: 10,
    justifyContent: "space-between",
  },
  progressSubtitle: {
    lineHeight: 18,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitleText: {
    fontFamily: "Geist",
    fontWeight: "700",
  },
  actionCard: {
    alignItems: "flex-start",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  actionRing: {
    borderRadius: 999,
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
  },
  actionMeta: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  domainPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  emptyHabitCard: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
  },
  emptyHabitIcon: {
    alignItems: "center",
    borderRadius: 10,
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
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  setupCard: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  setupIcon: {
    borderRadius: 10,
    borderWidth: 1,
    height: 30,
    width: 30,
  },
  setupBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
  },
  metricCard: {
    borderRadius: 10,
    flex: 1,
    gap: 2,
    padding: 10,
  },
  metricValue: {
    fontFamily: "Geist",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  habitRail: {
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  habitRailContent: {
    gap: 8,
  },
  habitChip: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  habitDot: {
    borderRadius: 999,
    borderWidth: 1.5,
    height: 16,
    width: 16,
  },
  contextCard: {
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  contextList: {
    gap: 8,
  },
  contextRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  contextDot: {
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  contextText: {
    flex: 1,
    lineHeight: 18,
  },
  newBadge: {
    backgroundColor: "#1e1a30",
    borderColor: "#3d3570",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  celebrationCard: {
    backgroundColor: "#1f1a30",
    borderColor: "#3d3570",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    paddingVertical: 18,
  },
  celebrationEmoji: {
    fontSize: 28,
    textAlign: "center",
  },
  celebrationTitle: {
    color: "#c8c0ff",
    fontFamily: "Geist",
    fontWeight: "700",
    textAlign: "center",
  },
  celebrationSubtitle: {
    color: "#9b8fff",
    lineHeight: 18,
    textAlign: "center",
  },
  approvalCard: {
    backgroundColor: "#141418",
    borderCurve: "continuous",
    borderRadius: 12,
    gap: 8,
  },
  approvalTitle: {
    color: "#888",
    fontFamily: "Geist",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  approvalSubtitle: {
    color: "#d0d0dc",
    lineHeight: 20,
  },
  approvalDetails: {
    gap: 4,
  },
  approvalDetailText: {
    color: "#6b5fff",
  },
  pressed: {
    opacity: 0.84,
  },
});

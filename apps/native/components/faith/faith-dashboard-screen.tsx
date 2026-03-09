import { useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";

import { Badge, Button, Card, EmptyState, ListItem, SectionHeader, Text, View } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { formatGoalTarget, formatSpiritualDate, useSpiritualDashboard } from "@/lib/spiritual";

import { FaithMetricCard, FaithQuickLinkCard } from "./faith-shared";

export function FaithDashboardScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const dashboard = useSpiritualDashboard();

  if (!dashboard) {
    return (
      <ScrollView
        style={styles.screen}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <SectionHeader title="Faith" subtitle="Spiritual rhythm and reflection" />
        <Card style={styles.heroCard}>
          <Text variant="muted">Loading</Text>
          <Text variant="h2">Building your spiritual dashboard</Text>
          <Text variant="small" style={{ color: theme.mutedForeground }}>
            Pulling goals, prayers, practices, readings, and reflections.
          </Text>
        </Card>
      </ScrollView>
    );
  }

  const goalPreview = dashboard.goals.slice(0, 3);
  const prayerPreview = dashboard.prayers.slice(0, 3);
  const readingPreview = dashboard.readings.slice(0, 2);
  const reflectionPreview = dashboard.reflections.slice(0, 2);

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <SectionHeader title="Faith" subtitle="Spiritual rhythm and reflection" />

      <Card
        style={[
          styles.heroCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderWidth: 1,
          },
        ]}
      >
        <Badge color="secondary">Compassionate consistency</Badge>
        <Text variant="h2">Keep prayer, reflection, and study inside your real week.</Text>
        <Text variant="small" style={{ color: theme.mutedForeground }}>
          This workspace keeps spiritual practices lightweight, visible, and connected to the planner.
        </Text>
        <View style={styles.heroActions}>
          <Button title="Open Practices" onPress={() => router.push("/faith/practices")} />
          <Button title="Prayer Journal" variant="outline" onPress={() => router.push("/faith/prayers")} />
        </View>
      </Card>

      <View style={styles.metricsGrid}>
        <FaithMetricCard
          label="Active Practices"
          value={dashboard.summary.activePractices}
          detail={`${dashboard.summary.plannerLinkedPractices} linked to planner`}
        />
        <FaithMetricCard
          label="Prayer Journal"
          value={dashboard.summary.activePrayers}
          detail={`${dashboard.summary.answeredPrayers} answered`}
        />
      </View>
      <View style={styles.metricsGrid}>
        <FaithMetricCard
          label="Weekly Reflection"
          value={dashboard.summary.reflectionsThisWeek}
          detail={`${dashboard.summary.gratitudeEntriesThisWeek} gratitude entries`}
        />
        <FaithMetricCard
          label="Reading Rhythm"
          value={dashboard.summary.readingsThisWeek}
          detail={`${dashboard.planner.spiritualGoals} goals mirrored into planner`}
        />
      </View>

      <View style={styles.quickLinks}>
        <FaithQuickLinkCard
          title="Goals"
          subtitle="Track growth without turning it into guilt."
          href="/faith/goals"
          badge={`${dashboard.summary.activeGoals} active`}
        />
        <FaithQuickLinkCard
          title="Practices"
          subtitle="Prayer, reading, gratitude, meditation, and service."
          href="/faith/practices"
          badge={`${dashboard.summary.activePractices} running`}
        />
        <FaithQuickLinkCard
          title="Readings"
          subtitle="Capture scripture, devotionals, and study notes."
          href="/faith/readings"
        />
        <FaithQuickLinkCard
          title="Reflections"
          subtitle="Store insights, gratitude, and weekly review notes."
          href="/faith/reflections"
        />
      </View>

      <Card variant="outline" style={{ gap: UI_PRESETS.spacing.sm, borderColor: theme.border }}>
        <Text variant="h3">Planner connection</Text>
        <Text variant="small" style={{ color: theme.mutedForeground }}>
          {dashboard.planner.latestWeekPlanTitle
            ? `Latest weekly plan: ${dashboard.planner.latestWeekPlanTitle}`
            : "No weekly plan yet. Spiritual practices can still sync into the planner."}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: UI_PRESETS.spacing.xs }}>
          <Badge color="secondary">{dashboard.planner.spiritualGoals} spiritual goals synced</Badge>
          <Badge color="secondary">{dashboard.planner.spiritualHabits} practices scheduled</Badge>
        </View>
        <Button title="Open Planner" variant="outline" onPress={() => router.push("/planner")} />
      </Card>

      <View style={styles.section}>
        <SectionHeader title="Current Goals" subtitle="GROWTH TRACKER" actionLabel="View all" onActionPress={() => router.push("/faith/goals")} />
        {goalPreview.length ? (
          <View style={styles.list}>
            {goalPreview.map((goal) => (
              <ListItem
                key={goal.id}
                title={goal.title}
                subtitle={goal.description ?? `${goal.goalType} goal`}
                meta={formatGoalTarget(goal)}
                right={<Badge color={goal.status === "completed" ? "success" : "secondary"}>{goal.status}</Badge>}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No spiritual goals yet"
            message="Start with one growth goal you can sustain this season."
            actionLabel="Add goal"
            onActionPress={() => router.push("/faith/goals")}
          />
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Prayer Journal" subtitle="REQUESTS AND ANSWERS" actionLabel="View all" onActionPress={() => router.push("/faith/prayers")} />
        {prayerPreview.length ? (
          <View style={styles.list}>
            {prayerPreview.map((entry) => (
              <ListItem
                key={entry.id}
                title={entry.title}
                subtitle={entry.description ?? entry.category ?? "Prayer entry"}
                meta={new Date(entry.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                right={<Badge color={entry.status === "answered" ? "success" : "secondary"}>{entry.status}</Badge>}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No prayer entries yet"
            message="Use the journal for requests, intercession, and answered prayers."
            actionLabel="Add prayer"
            onActionPress={() => router.push("/faith/prayers")}
          />
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Recent Study" subtitle="READING AND REFLECTION" />
        <View style={styles.list}>
          {readingPreview.map((reading) => (
            <ListItem
              key={reading.id}
              title={reading.title}
              subtitle={reading.source ?? reading.passage ?? "Reading note"}
              meta={formatSpiritualDate(reading.date)}
            />
          ))}
          {reflectionPreview.map((reflection) => (
            <ListItem
              key={reflection.id}
              title={reflection.reflectionType}
              subtitle={reflection.content}
              meta={formatSpiritualDate(reflection.date)}
              right={reflection.mood ? <Badge variant="outline" color="secondary">{reflection.mood}</Badge> : undefined}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.lg,
  },
  heroCard: {
    gap: UI_PRESETS.spacing.sm,
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.sm,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.md,
  },
  quickLinks: {
    gap: UI_PRESETS.spacing.sm,
  },
  section: {
    gap: UI_PRESETS.spacing.sm,
  },
  list: {
    gap: UI_PRESETS.spacing.sm,
  },
});

import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { SchedulerAlertCard } from "@/components/scheduler-alert-card";
import { Text } from "@/components/text";
import { View } from "@/components/view";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { formatShortDate, formatTimeLabel } from "@/lib/scheduler";
import { useSchedulerData } from "@/lib/scheduler/use-scheduler-data";

import { SchedulerLoadingState } from "./scheduler-shared";

export function SchedulerAlertsScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const scheduler = useSchedulerData();
  const hasAlerts =
    scheduler.alerts.overdue.length > 0 ||
    scheduler.alerts.today.length > 0 ||
    scheduler.alerts.upcoming.length > 0;

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <View style={styles.topRow}>
        <Text style={[Typography.bodyMD, { color: theme.mutedForeground }]} selectable>
          Review everything overdue, due today, or coming up soon.
        </Text>
        <Button
          title="New Task"
          size="sm"
          onPress={() => router.push("/(tabs)/scheduler/tasks/create")}
        />
      </View>

      {scheduler.error ? (
        <Banner
          variant="error"
          title="Alerts may be stale"
          message={scheduler.error}
          actionLabel="Retry"
          onActionPress={() => void scheduler.refresh()}
        />
      ) : null}

      {scheduler.loading && scheduler.tasks.length === 0 ? (
        <SchedulerLoadingState theme={theme} label="Loading alerts..." />
      ) : null}

      {!scheduler.loading && !hasAlerts ? (
        <EmptyState
          title="All clear!"
          message="No alerts at the moment."
          icon={<Text style={Typography.displaySM}>✅</Text>}
        />
      ) : null}

      {scheduler.alerts.overdue.length > 0 ? (
        <View style={styles.alertSection}>
          <Text style={[Typography.labelXS, { color: theme.destructive }]} selectable>
            🔴 Overdue
          </Text>
          <View style={styles.listGroup}>
            {scheduler.alerts.overdue.map((task) => (
              <SchedulerAlertCard
                key={task.id}
                task={task}
                color={theme.destructive}
                icon="⚠️"
                subtitle={`Was due ${task.dueDate}`}
                onPress={() => router.push(`/(tabs)/scheduler/${task.id}`)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {scheduler.alerts.today.length > 0 ? (
        <View style={styles.alertSection}>
          <Text style={[Typography.labelXS, { color: theme.chart4 }]} selectable>
            🟡 Due Today
          </Text>
          <View style={styles.listGroup}>
            {scheduler.alerts.today.map((task) => (
              <SchedulerAlertCard
                key={task.id}
                task={task}
                color={theme.chart4}
                icon="📋"
                subtitle={
                  task.time
                    ? `${formatTimeLabel(task.time)}${task.dependencyIds.length ? ` · ${task.dependencyIds.length} deps` : ""}`
                    : task.dependencyIds.length
                      ? `${task.dependencyIds.length} dependencies`
                      : "Due before today ends"
                }
                onPress={() => router.push(`/(tabs)/scheduler/${task.id}`)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {scheduler.alerts.upcoming.length > 0 ? (
        <View style={styles.alertSection}>
          <Text style={[Typography.labelXS, { color: theme.chart2 }]} selectable>
            🟢 Coming Up
          </Text>
          <View style={styles.listGroup}>
            {scheduler.alerts.upcoming.map((task) => (
              <SchedulerAlertCard
                key={task.id}
                task={task}
                color={theme.chart2}
                icon="⏳"
                subtitle={`Due ${formatShortDate(task.dueDate)}`}
                onPress={() => router.push(`/(tabs)/scheduler/${task.id}`)}
              />
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingTop: UI_PRESETS.spacing.screen,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: UI_PRESETS.spacing.md,
  },
  alertSection: {
    gap: UI_PRESETS.spacing.sm,
  },
  listGroup: {
    gap: UI_PRESETS.spacing.sm,
  },
});

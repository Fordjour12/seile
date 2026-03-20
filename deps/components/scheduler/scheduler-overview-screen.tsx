import React from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { type Href, useRouter } from "expo-router";

import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { Text } from "@/components/text";
import { View } from "@/components/view";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { formatCurrentDate, getTasksForDate, toDateKey } from "@/lib/scheduler";
import { getOutstandingDependencyCount } from "@/lib/scheduler/helpers";
import { useSchedulerData } from "@/lib/scheduler/use-scheduler-data";

import {
  SchedulerLoadingState,
  SchedulerStatsCard,
} from "./scheduler-shared";
import { SchedulerTaskRow } from "@/components/scheduler-task-row";

const OVERVIEW_ACTIONS: Array<{
  title: string;
  subtitle: string;
  href: Href;
}> = [
  {
    title: "Calendar",
    subtitle: "Browse month, week, day, and agenda views.",
    href: "/(tabs)/scheduler/calendar",
  },
  {
    title: "Tasks",
    subtitle: "Review open work with focused filters.",
    href: "/(tabs)/scheduler/tasks",
  },
  {
    title: "Alerts",
    subtitle: "See overdue, today, and upcoming items.",
    href: "/(tabs)/scheduler/alerts",
  },
  {
    title: "Add Task",
    subtitle: "Create a new task as a full page flow.",
    href: "/(tabs)/scheduler/tasks/create",
  },
];

export function SchedulerOverviewScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const scheduler = useSchedulerData();
  const todayDate = toDateKey(new Date());
  const todayTasks = getTasksForDate(scheduler.tasks, todayDate)
    .filter((task) => task.status !== "done")
    .slice(0, 3);
  const overdueTasks = scheduler.alerts.overdue.slice(0, 3);

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <View style={styles.intro}>
        <Text style={[Typography.bodyMD, { color: theme.foreground }]} selectable>
          Centralize deadlines, alerts, and timed work without crowding a single screen.
        </Text>
        <Text style={[Typography.captionLG, { color: theme.mutedForeground }]} selectable>
          {formatCurrentDate()}
        </Text>
      </View>

      {scheduler.error ? (
        <Banner
          variant="error"
          title="Scheduler data is out of date"
          message={scheduler.error}
          actionLabel="Retry"
          onActionPress={() => void scheduler.refresh()}
        />
      ) : null}

      <View style={styles.statsRow}>
        <SchedulerStatsCard label="Overdue" value={scheduler.stats.overdue} color={theme.destructive} />
        <SchedulerStatsCard label="Today" value={scheduler.stats.today} color={theme.chart4} />
        <SchedulerStatsCard label="Upcoming" value={scheduler.stats.upcoming} color={theme.chart2} />
      </View>

      <View style={styles.actionGrid}>
        {OVERVIEW_ACTIONS.map((item) => (
          <Pressable
            key={item.title}
            onPress={() => router.push(item.href)}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Card variant="outline" style={[styles.actionCard, { borderColor: theme.border }]}>
              <Text style={[Typography.titleSM, { color: theme.foreground }]} selectable>
                {item.title}
              </Text>
              <Text style={[Typography.bodySM, { color: theme.mutedForeground }]} selectable>
                {item.subtitle}
              </Text>
            </Card>
          </Pressable>
        ))}
      </View>

      {scheduler.loading && scheduler.tasks.length === 0 ? (
        <SchedulerLoadingState theme={theme} label="Loading scheduler overview..." />
      ) : null}

      {!scheduler.loading && scheduler.tasks.length === 0 ? (
        <EmptyState
          title="No scheduled work yet"
          message="Start with one task, then branch into calendar, task, and alert flows."
          actionLabel="Create task"
          onActionPress={() => router.push("/(tabs)/scheduler/tasks/create")}
          icon={<Text style={Typography.displaySM}>🗂️</Text>}
        />
      ) : null}

      {todayTasks.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[Typography.titleSM, { color: theme.foreground }]} selectable>
              Today
            </Text>
            <Button
              title="Open Tasks"
              size="sm"
              variant="ghost"
              onPress={() => router.push("/(tabs)/scheduler/tasks")}
            />
          </View>
          <View style={styles.listGroup}>
            {todayTasks.map((task) => (
              <SchedulerTaskRow
                key={task.id}
                task={task}
                theme={theme}
                dependencyCount={getOutstandingDependencyCount(task, scheduler.tasksById)}
                onPress={() => router.push(`/(tabs)/scheduler/${task.id}`)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {overdueTasks.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[Typography.titleSM, { color: theme.foreground }]} selectable>
              Needs Attention
            </Text>
            <Button
              title="Open Alerts"
              size="sm"
              variant="ghost"
              onPress={() => router.push("/(tabs)/scheduler/alerts")}
            />
          </View>
          <View style={styles.listGroup}>
            {overdueTasks.map((task) => (
              <SchedulerTaskRow
                key={task.id}
                task={task}
                theme={theme}
                dependencyCount={getOutstandingDependencyCount(task, scheduler.tasksById)}
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
  intro: {
    gap: UI_PRESETS.spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
  actionGrid: {
    gap: UI_PRESETS.spacing.sm,
  },
  actionCard: {
    gap: UI_PRESETS.spacing.xs,
  },
  section: {
    gap: UI_PRESETS.spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
  listGroup: {
    gap: UI_PRESETS.spacing.sm,
  },
  pressed: {
    opacity: UI_PRESETS.opacity.pressed,
  },
});

import React, { useState } from "react";
import { FlatList, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import { Chip } from "@/components/chip";
import { EmptyState } from "@/components/empty-state";
import { Text } from "@/components/text";
import { View } from "@/components/view";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import {
  filterSchedulerTasks,
  toDateKey,
  type SchedulerFilter,
} from "@/lib/scheduler";
import { getOutstandingDependencyCount } from "@/lib/scheduler/helpers";
import { useSchedulerData } from "@/lib/scheduler/use-scheduler-data";

import { SchedulerLoadingState } from "./scheduler-shared";
import { SchedulerTaskRow } from "@/components/scheduler-task-row";

type SchedulerTasksScreenProps = {
  initialFilter?: SchedulerFilter;
};

const TASK_FILTERS: SchedulerFilter[] = ["all", "overdue", "today", "upcoming"];

export function SchedulerTasksScreen({
  initialFilter = "all",
}: SchedulerTasksScreenProps) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const scheduler = useSchedulerData();
  const [taskFilter, setTaskFilter] = useState<SchedulerFilter>(initialFilter);
  const todayDate = toDateKey(new Date());
  const filteredTasks = filterSchedulerTasks(scheduler.tasks, taskFilter, todayDate);
  const showLoadingState = scheduler.loading && scheduler.tasks.length === 0;
  const showEmptyState = !scheduler.loading && filteredTasks.length === 0;

  return (
    <FlatList
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      data={filteredTasks}
      keyExtractor={(task) => task.id}
      renderItem={({ item }) => (
        <SchedulerTaskRow
          task={item}
          theme={theme}
          dependencyCount={getOutstandingDependencyCount(item, scheduler.tasksById)}
          onPress={() => router.push(`/(tabs)/scheduler/${item.id}`)}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      initialNumToRender={8}
      windowSize={5}
      ListHeaderComponent={
        <>
          <View style={styles.topRow}>
            <Text style={[Typography.bodyMD, { color: theme.mutedForeground }]} selectable>
              Work through active tasks with focused filters.
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
              title="Tasks may be stale"
              message={scheduler.error}
              actionLabel="Retry"
              onActionPress={() => void scheduler.refresh()}
            />
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {TASK_FILTERS.map((filter) => {
              const label =
                filter === "overdue"
                  ? `Overdue${scheduler.stats.overdue ? ` (${scheduler.stats.overdue})` : ""}`
                  : filter.charAt(0).toUpperCase() + filter.slice(1);
              return (
                <Chip
                  key={filter}
                  label={label}
                  selected={taskFilter === filter}
                  onSelect={() => setTaskFilter(filter)}
                />
              );
            })}
          </ScrollView>
        </>
      }
      ListEmptyComponent={
        showLoadingState ? (
          <SchedulerLoadingState theme={theme} label="Loading tasks..." />
        ) : showEmptyState ? (
          <EmptyState
            title="No tasks here"
            message="Try another filter or add a fresh task."
            actionLabel="Create task"
            onActionPress={() => router.push("/(tabs)/scheduler/tasks/create")}
            icon={<Text style={Typography.displaySM}>🎉</Text>}
          />
        ) : null
      }
    />
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
  filterRow: {
    gap: UI_PRESETS.spacing.xs,
  },
  separator: {
    height: UI_PRESETS.spacing.sm,
  },
});

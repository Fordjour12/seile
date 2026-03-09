import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { toast } from "sonner-native";

import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Text } from "@/components/text";
import { View } from "@/components/view";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { formatShortDate, formatTimeLabel } from "@/lib/scheduler";
import { useSchedulerData } from "@/lib/scheduler/use-scheduler-data";

import {
  SchedulerLoadingState,
  SchedulerTaskNotFoundState,
} from "./scheduler-shared";

type SchedulerTaskDeleteScreenProps = {
  taskId: string;
};

export function SchedulerTaskDeleteScreen({
  taskId,
}: SchedulerTaskDeleteScreenProps) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const scheduler = useSchedulerData();
  const task = scheduler.tasksById.get(taskId);
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete() {
    setSubmitting(true);
    try {
      await scheduler.deleteTask(taskId);
      toast.success("Task deleted");
      router.replace("/(tabs)/scheduler/tasks");
    } catch (error) {
      toast.error("Could not delete task", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (scheduler.loading && !task) {
    return (
      <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <SchedulerLoadingState theme={theme} label="Loading task..." />
      </ScrollView>
    );
  }

  if (!task) {
    return (
      <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <SchedulerTaskNotFoundState theme={theme} />
        <Button
          title="Back to tasks"
          variant="outline"
          onPress={() => router.replace("/(tabs)/scheduler/tasks")}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <Text style={[Typography.bodyMD, { color: theme.mutedForeground }]} selectable>
        Review the task details before removing it permanently.
      </Text>

      {scheduler.error ? (
        <Banner
          variant="error"
          title="Task data may be stale"
          message={scheduler.error}
          actionLabel="Retry"
          onActionPress={() => void scheduler.refresh()}
        />
      ) : null}

      <Card variant="outline" style={[styles.summaryCard, { borderColor: theme.border }]}>
        <Text style={[Typography.titleSM, { color: theme.foreground }]} selectable>
          {task.title}
        </Text>
        <Text style={[Typography.bodySM, { color: theme.mutedForeground }]} selectable>
          {`${formatShortDate(task.dueDate)}${task.time ? ` · ${formatTimeLabel(task.time)}` : ""}`}
        </Text>
        <Text style={[Typography.bodySM, { color: theme.mutedForeground }]} selectable>
          {`Priority: ${task.priority} · Recurrence: ${task.recurrence}`}
        </Text>
        {task.notes ? (
          <Text style={[Typography.bodySM, { color: theme.foreground }]} selectable>
            {task.notes}
          </Text>
        ) : null}
      </Card>

      <View style={styles.actions}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={() => router.replace(`/(tabs)/scheduler/${taskId}`)}
          style={styles.flexButton}
        />
        <Button
          title={submitting ? "Deleting..." : "Delete Task"}
          variant="destructive"
          onPress={() => void handleDelete()}
          disabled={submitting}
          style={styles.flexButton}
        />
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
    paddingTop: UI_PRESETS.spacing.screen,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.md,
  },
  summaryCard: {
    gap: UI_PRESETS.spacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
});

import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { toast } from "sonner-native";

import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { type UpdateSchedulerTaskPayload } from "@/lib/scheduler";
import { useSchedulerData } from "@/lib/scheduler/use-scheduler-data";

import {
  SchedulerLoadingState,
  SchedulerTaskNotFoundState,
} from "./scheduler-shared";
import { SchedulerTaskForm, type SchedulerTaskFormValues } from "./scheduler-task-form";

type SchedulerTaskUpdateScreenProps = {
  taskId: string;
};

export function SchedulerTaskUpdateScreen({
  taskId,
}: SchedulerTaskUpdateScreenProps) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const scheduler = useSchedulerData();
  const task = scheduler.tasksById.get(taskId);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: SchedulerTaskFormValues) {
    setSubmitting(true);
    try {
      const payload: UpdateSchedulerTaskPayload = {
        title: values.title,
        notes: values.notes,
        priority: values.priority,
        dueDate: values.dueDate,
        time: values.time,
        recurrence: values.recurrence,
      };
      await scheduler.updateTask(taskId, payload);
      toast.success("Task updated");
      router.replace(`/(tabs)/scheduler/${taskId}`);
    } catch (error) {
      toast.error("Could not update task", {
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
        Edit timing, recurrence, and supporting notes without leaving the scheduler flow.
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

      <SchedulerTaskForm
        initialValues={{
          title: task.title,
          notes: task.notes ?? null,
          dueDate: task.dueDate,
          time: task.time ?? null,
          priority: task.priority,
          recurrence: task.recurrence,
        }}
        submitLabel="Save Changes"
        loading={submitting}
        onSubmit={handleSubmit}
        onCancel={() => router.replace(`/(tabs)/scheduler/${taskId}`)}
      />
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
});

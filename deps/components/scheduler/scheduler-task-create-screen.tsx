import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { toast } from "sonner-native";

import { Banner } from "@/components/banner";
import { Text } from "@/components/text";
import { View } from "@/components/view";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { type CreateSchedulerTaskPayload } from "@/lib/scheduler";
import { useSchedulerData } from "@/lib/scheduler/use-scheduler-data";

import { SchedulerTaskForm } from "./scheduler-task-form";

export function SchedulerTaskCreateScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const scheduler = useSchedulerData();
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(values: CreateSchedulerTaskPayload) {
    setSubmitting(true);
    try {
      const createdTask = await scheduler.createTask(values);
      toast.success("Task created");
      router.replace(`/(tabs)/scheduler/${createdTask.id}`);
    } catch (error) {
      toast.error("Could not create task", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <View style={styles.intro}>
        <Text style={[Typography.bodyMD, { color: theme.mutedForeground }]} selectable>
          Create a task with a due date, priority, and optional recurrence.
        </Text>
      </View>

      {scheduler.error ? (
        <Banner
          variant="error"
          title="Scheduler data is stale"
          message={scheduler.error}
          actionLabel="Retry"
          onActionPress={() => void scheduler.refresh()}
        />
      ) : null}

      <SchedulerTaskForm
        submitLabel="Create Task"
        loading={submitting}
        onSubmit={handleCreate}
        onCancel={() => router.replace("/(tabs)/scheduler/tasks")}
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
  intro: {
    gap: UI_PRESETS.spacing.xs,
  },
});

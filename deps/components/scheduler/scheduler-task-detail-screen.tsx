import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { toast } from "sonner-native";

import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { SchedulerProgressBar } from "@/components/scheduler-progress-bar";
import { SchedulerTag } from "@/components/scheduler-tag";
import { Text } from "@/components/text";
import { View } from "@/components/view";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { formatShortDate, formatTimeLabel } from "@/lib/scheduler";
import {
  getDependencyTasks,
  getOutstandingDependencyCount,
  getTaskProgress,
} from "@/lib/scheduler/helpers";
import {
  getSchedulerPriorityColor,
  getSchedulerStatusColor,
  withAlpha,
} from "@/lib/scheduler/palette";
import type { SchedulerTaskStatus } from "@/lib/scheduler/types";
import { useSchedulerData } from "@/lib/scheduler/use-scheduler-data";

import {
  SchedulerLoadingState,
  SchedulerTaskNotFoundState,
} from "./scheduler-shared";

const STATUS_OPTIONS: Array<{
  label: string;
  value: SchedulerTaskStatus;
}> = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" },
  { label: "Overdue", value: "overdue" },
];

type SchedulerTaskDetailScreenProps = {
  taskId: string;
};

export function SchedulerTaskDetailScreen({
  taskId,
}: SchedulerTaskDetailScreenProps) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const scheduler = useSchedulerData();
  const task = scheduler.tasksById.get(taskId);
  const [notesDraft, setNotesDraft] = useState("");

  useEffect(() => {
    setNotesDraft(task?.notes ?? "");
  }, [task?.id, task?.notes]);

  const dependencies = useMemo(
    () => (task ? getDependencyTasks(task, scheduler.tasksById) : []),
    [task, scheduler.tasksById],
  );
  const outstandingDependencies = task
    ? getOutstandingDependencyCount(task, scheduler.tasksById)
    : 0;

  if (scheduler.loading && !task) {
    return (
      <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <SchedulerLoadingState theme={theme} label="Loading task detail..." />
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

  const currentTask = task;
  const priorityColor = getSchedulerPriorityColor(theme, currentTask.priority);
  const statusColor = getSchedulerStatusColor(theme, currentTask.status);
  const progress = getTaskProgress(currentTask);

  async function handleStatusChange(status: SchedulerTaskStatus) {
    try {
      await scheduler.updateTask(currentTask.id, { status });
      toast.success("Task updated");
    } catch (error) {
      toast.error("Could not update task", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  async function handleToggleSubtask(subtaskId: string, done: boolean) {
    try {
      await scheduler.toggleSubtask(currentTask.id, subtaskId, done);
    } catch (error) {
      toast.error("Could not update subtask", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  async function handleNotesBlur() {
    if (notesDraft === (currentTask.notes ?? "")) {
      return;
    }

    try {
      await scheduler.updateTask(currentTask.id, {
        notes: notesDraft.trim() || null,
      });
    } catch (error) {
      toast.error("Could not update notes", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      {scheduler.error ? (
        <Banner
          variant="error"
          title="Task data may be stale"
          message={scheduler.error}
          actionLabel="Retry"
          onActionPress={() => void scheduler.refresh()}
        />
      ) : null}

      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[Typography.bodyMD, { color: theme.mutedForeground }]} selectable>
            Manage status, progress, and dependencies from a dedicated task page.
          </Text>
          <Text style={[Typography.titleLG, { color: theme.foreground }]} selectable>
            {currentTask.title}
          </Text>
          <View style={styles.tagRow}>
            <SchedulerTag label={currentTask.status.replace("_", " ")} color={statusColor} />
            <SchedulerTag label={currentTask.priority} color={priorityColor} />
            {currentTask.recurrence !== "none" ? (
              <SchedulerTag label={currentTask.recurrence} color={theme.primary} />
            ) : null}
          </View>
        </View>

        {currentTask.status !== "done" ? (
          <Button
            title="Mark Done"
            onPress={() => void handleStatusChange("done")}
          />
        ) : null}
      </View>

      <View style={styles.actionRow}>
        <Button
          title="Edit Task"
          variant="outline"
          onPress={() => router.push(`/(tabs)/scheduler/${currentTask.id}/update`)}
          style={styles.flexButton}
        />
        <Button
          title="Delete Task"
          variant="destructive"
          onPress={() => router.push(`/(tabs)/scheduler/${currentTask.id}/delete`)}
          style={styles.flexButton}
        />
      </View>

      <View style={[styles.sectionCard, { borderColor: theme.border }]}>
        <Text style={[Typography.labelXS, { color: theme.mutedForeground }]} selectable>
          Due Date
        </Text>
        <Text
          style={[
            Typography.bodyMD,
            {
              color: currentTask.status === "overdue" ? theme.destructive : theme.foreground,
            },
          ]}
          selectable
        >
          {`${formatShortDate(currentTask.dueDate)}${currentTask.time ? ` · ${formatTimeLabel(currentTask.time)}` : ""}`}
        </Text>
      </View>

      {outstandingDependencies > 0 ? (
        <Banner
          variant="warning"
          title="Dependencies pending"
          message={`${outstandingDependencies} dependency ${outstandingDependencies === 1 ? "is" : "are"} still incomplete.`}
        />
      ) : null}

      <View style={styles.fieldGroup}>
        <Text style={[Typography.labelXS, { color: theme.mutedForeground }]} selectable>
          Status
        </Text>
        <View style={styles.statusGrid}>
          {STATUS_OPTIONS.map((item) => {
            const active = currentTask.status === item.value;
            const color = getSchedulerStatusColor(theme, item.value);
            return (
              <Pressable
                key={item.value}
                onPress={() => void handleStatusChange(item.value)}
                style={[
                  styles.statusPill,
                  {
                    borderColor: active ? color : theme.border,
                    backgroundColor: active ? withAlpha(color, 0.18) : theme.card,
                  },
                ]}
              >
                <Text style={[Typography.captionSM, { color: active ? color : theme.foreground }]} selectable>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {currentTask.subtasks.length > 0 ? (
        <View style={styles.fieldGroup}>
          <Text style={[Typography.labelXS, { color: theme.mutedForeground }]} selectable>
            Subtasks
          </Text>
          <SchedulerProgressBar
            progress={progress}
            fillColor={theme.primary}
            trackColor={theme.border}
            textColor={theme.mutedForeground}
          />
          <View style={styles.checklist}>
            {currentTask.subtasks.map((subtask) => (
              <Pressable
                key={subtask.id}
                onPress={() => void handleToggleSubtask(subtask.id, !subtask.done)}
                style={styles.checkboxRow}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: subtask.done ? theme.primary : theme.border,
                      backgroundColor: subtask.done ? theme.primary : "transparent",
                    },
                  ]}
                >
                  {subtask.done ? (
                    <Text style={[Typography.captionSM, { color: theme.card }]} selectable>
                      ✓
                    </Text>
                  ) : null}
                </View>
                <Text
                  style={[
                    Typography.bodySM,
                    {
                      color: subtask.done ? theme.mutedForeground : theme.foreground,
                      textDecorationLine: subtask.done ? "line-through" : "none",
                    },
                  ]}
                  selectable
                >
                  {subtask.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {dependencies.length > 0 ? (
        <View style={styles.fieldGroup}>
          <Text style={[Typography.labelXS, { color: theme.mutedForeground }]} selectable>
            Depends On
          </Text>
          <View style={styles.dependencyList}>
            {dependencies.map((dependency) => (
              <Pressable
                key={dependency.id}
                onPress={() => router.push(`/(tabs)/scheduler/${dependency.id}`)}
                style={[styles.dependencyRow, { borderColor: theme.border }]}
              >
                <View
                  style={[
                    styles.dependencyDot,
                    {
                      backgroundColor: getSchedulerStatusColor(theme, dependency.status),
                    },
                  ]}
                />
                <View style={styles.dependencyCopy}>
                  <Text style={Typography.bodySM} numberOfLines={1} selectable>
                    {dependency.title}
                  </Text>
                  <SchedulerTag
                    label={dependency.status.replace("_", " ")}
                    color={getSchedulerStatusColor(theme, dependency.status)}
                    size="small"
                  />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.fieldGroup}>
        <Text style={[Typography.labelXS, { color: theme.mutedForeground }]} selectable>
          Notes
        </Text>
        <Input
          value={notesDraft}
          onChangeText={setNotesDraft}
          onBlur={() => {
            void handleNotesBlur();
          }}
          multiline
          style={styles.notesInput}
          placeholder="No notes yet"
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
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: UI_PRESETS.spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: UI_PRESETS.spacing.sm,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.xs,
  },
  actionRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.lg,
    paddingHorizontal: UI_PRESETS.spacing.xl,
    paddingVertical: UI_PRESETS.spacing.lg,
    gap: UI_PRESETS.spacing.xs,
  },
  fieldGroup: {
    gap: UI_PRESETS.spacing.sm,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.xs,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.full,
    paddingHorizontal: UI_PRESETS.spacing.lg,
    paddingVertical: UI_PRESETS.spacing.sm,
  },
  checklist: {
    gap: UI_PRESETS.spacing.sm,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  dependencyList: {
    gap: UI_PRESETS.spacing.sm,
  },
  dependencyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.md,
    paddingHorizontal: UI_PRESETS.spacing.lg,
    paddingVertical: UI_PRESETS.spacing.md,
  },
  dependencyDot: {
    width: 10,
    height: 10,
    borderRadius: UI_PRESETS.radius.full,
  },
  dependencyCopy: {
    flex: 1,
    gap: UI_PRESETS.spacing.xs,
  },
  notesInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
});

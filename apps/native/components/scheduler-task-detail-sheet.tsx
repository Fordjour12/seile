import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";

import { Banner } from "@/components/banner";
import { BottomSheet } from "@/components/bottom-sheet";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Text } from "@/components/text";
import { View } from "@/components/view";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { formatShortDate, formatTimeLabel } from "@/lib/scheduler/date";
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
import type {
  SchedulerTask,
  SchedulerTaskStatus,
} from "@/lib/scheduler/types";

import { SchedulerProgressBar } from "./scheduler-progress-bar";
import { SchedulerTag } from "./scheduler-tag";

const STATUS_OPTIONS: Array<{
  label: string;
  value: SchedulerTaskStatus;
}> = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" },
  { label: "Overdue", value: "overdue" },
];

type SchedulerTaskDetailSheetProps = {
  visible: boolean;
  task: SchedulerTask | null;
  tasksById: Map<string, SchedulerTask>;
  theme: typeof NAV_THEME.light;
  onClose: () => void;
  onUpdateTask: (taskId: string, patch: Partial<SchedulerTask>) => Promise<void>;
  onToggleSubtask: (taskId: string, subtaskId: string, done: boolean) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onOpenTask: (taskId: string) => void;
};

export function SchedulerTaskDetailSheet({
  visible,
  task,
  tasksById,
  theme,
  onClose,
  onUpdateTask,
  onToggleSubtask,
  onDeleteTask,
  onOpenTask,
}: SchedulerTaskDetailSheetProps) {
  const [notesDraft, setNotesDraft] = useState("");

  useEffect(() => {
    setNotesDraft(task?.notes ?? "");
  }, [task?.id, task?.notes]);

  const dependencies = useMemo(
    () => (task ? getDependencyTasks(task, tasksById) : []),
    [task, tasksById],
  );
  const outstandingDependencies = task
    ? getOutstandingDependencyCount(task, tasksById)
    : 0;

  if (!task) {
    return null;
  }

  const priorityColor = getSchedulerPriorityColor(theme, task.priority);
  const statusColor = getSchedulerStatusColor(theme, task.status);
  const progress = getTaskProgress(task);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Task Detail"
      subtitle="Update status, notes, and progress."
      snapPoints={["82%"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={Typography.titleLG} selectable>
              {task.title}
            </Text>
            <View style={styles.tagRow}>
              <SchedulerTag label={task.status.replace("_", " ")} color={statusColor} />
              <SchedulerTag label={task.priority} color={priorityColor} />
              {task.recurrence !== "none" ? (
                <SchedulerTag label={task.recurrence} color={theme.primary} />
              ) : null}
            </View>
          </View>

          {task.status !== "done" ? (
            <Button
              title="Done"
              onPress={() => void onUpdateTask(task.id, { status: "done" })}
            />
          ) : null}
        </View>

        <View style={[styles.sectionCard, { borderColor: theme.border }]}>
          <Text style={[Typography.labelXS, { color: theme.mutedForeground }]} selectable>
            Due Date
          </Text>
          <Text
            style={[
              Typography.bodyMD,
              {
                color: task.status === "overdue" ? theme.destructive : theme.foreground,
              },
            ]}
            selectable
          >
            {`${formatShortDate(task.dueDate)}${task.time ? ` · ${formatTimeLabel(task.time)}` : ""}`}
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
              const active = task.status === item.value;
              const color = getSchedulerStatusColor(theme, item.value);
              return (
                <Pressable
                  key={item.value}
                  onPress={() => void onUpdateTask(task.id, { status: item.value })}
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

        {task.subtasks.length > 0 ? (
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
              {task.subtasks.map((subtask) => (
                <Pressable
                  key={subtask.id}
                  onPress={() => void onToggleSubtask(task.id, subtask.id, !subtask.done)}
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
                  onPress={() => onOpenTask(dependency.id)}
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
              if (notesDraft !== (task.notes ?? "")) {
                void onUpdateTask(task.id, { notes: notesDraft || null });
              }
            }}
            multiline
            style={styles.notesInput}
            placeholder="No notes yet"
          />
        </View>

        <Button
          title="Delete Task"
          variant="destructive"
          onPress={() => void onDeleteTask(task.id)}
        />
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: UI_PRESETS.spacing.md,
    paddingBottom: UI_PRESETS.spacing.section,
  },
  header: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
    alignItems: "flex-start",
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

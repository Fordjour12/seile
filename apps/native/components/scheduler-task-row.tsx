import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { Text } from "@/components/text";
import { View } from "@/components/view";
import { Typography, UI_PRESETS } from "@/lib/constants";
import { formatTimeLabel } from "@/lib/scheduler/date";
import { getTaskDateSummary, getTaskProgress } from "@/lib/scheduler/helpers";
import {
  getSchedulerPriorityColor,
  getSchedulerStatusColor,
  withAlpha,
} from "@/lib/scheduler/palette";
import type { SchedulerTask } from "@/lib/scheduler/types";
import type { ThemeScale } from "@/lib/constants/types";

import { SchedulerPriorityBar } from "./scheduler-priority-bar";
import { SchedulerProgressBar } from "./scheduler-progress-bar";
import { SchedulerTag } from "./scheduler-tag";

type SchedulerTaskRowProps = {
  task: SchedulerTask;
  theme: ThemeScale;
  dependencyCount: number;
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SchedulerTaskRow({ task, theme, dependencyCount, onPress }: SchedulerTaskRowProps) {
  const scale = useSharedValue(1);
  const priorityColor = getSchedulerPriorityColor(theme, task.priority);
  const statusColor = getSchedulerStatusColor(theme, task.status);
  const progress = getTaskProgress(task);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value === 1 ? 1 : 0.84,
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: 150 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 });
      }}
      style={[
        styles.container,
        animatedStyle,
        {
          backgroundColor:
            task.status === "overdue" ? withAlpha(theme.destructive, 0.12) : theme.card,
          borderColor:
            task.status === "overdue" ? withAlpha(theme.destructive, 0.38) : theme.border,
        },
      ]}
    >
      <SchedulerPriorityBar
        priority={task.priority}
        color={priorityColor}
        borderColor={theme.border}
      />

      <View style={styles.content}>
        <Text
          style={[
            Typography.labelMD,
            {
              color: task.status === "done" ? theme.mutedForeground : theme.foreground,
              textDecorationLine: task.status === "done" ? "line-through" : "none",
            },
          ]}
          numberOfLines={2}
          selectable
        >
          {task.title}
        </Text>

        <View style={styles.metaRow}>
          <SchedulerTag label={task.status.replace("_", " ")} color={statusColor} size="small" />
          {task.recurrence !== "none" ? (
            <SchedulerTag label={task.recurrence} color={theme.primary} size="small" />
          ) : null}
          {task.time ? (
            <SchedulerTag
              label={formatTimeLabel(task.time) ?? task.time}
              color={priorityColor}
              size="small"
            />
          ) : null}
          {dependencyCount > 0 ? (
            <SchedulerTag
              label={`${dependencyCount} dep`}
              color={theme.mutedForeground}
              size="small"
            />
          ) : null}
        </View>

        {task.subtasks.length > 0 ? (
          <SchedulerProgressBar
            progress={progress}
            fillColor={theme.primary}
            trackColor={theme.border}
            textColor={theme.mutedForeground}
          />
        ) : null}
      </View>

      <View style={styles.rightCol}>
        <Text
          style={[
            Typography.captionSM,
            {
              color: task.status === "overdue" ? theme.destructive : theme.mutedForeground,
              fontVariant: ["tabular-nums"],
            },
          ]}
          selectable
        >
          {getTaskDateSummary(task)}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: UI_PRESETS.spacing.md,
    paddingHorizontal: UI_PRESETS.spacing.xl,
    paddingVertical: UI_PRESETS.spacing.lg,
    borderRadius: UI_PRESETS.radius.lg,
    borderWidth: 1,
  },
  content: {
    flex: 1,
    gap: UI_PRESETS.spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.xs,
  },
  rightCol: {
    minWidth: 54,
    alignItems: "flex-end",
  },
});

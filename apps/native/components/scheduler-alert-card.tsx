import React from "react";
import { Pressable, StyleSheet } from "react-native";

import { Text } from "@/components/text";
import { View } from "@/components/view";
import { Typography, UI_PRESETS } from "@/lib/constants";
import { formatTimeLabel } from "@/lib/scheduler/date";
import { withAlpha } from "@/lib/scheduler/palette";
import type { SchedulerTask } from "@/lib/scheduler/types";

import { SchedulerTag } from "./scheduler-tag";

type SchedulerAlertCardProps = {
  task: SchedulerTask;
  color: string;
  icon: string;
  subtitle: string;
  onPress?: () => void;
};

export function SchedulerAlertCard({
  task,
  color,
  icon,
  subtitle,
  onPress,
}: SchedulerAlertCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: withAlpha(color, 0.12),
          borderColor: withAlpha(color, 0.32),
        },
      ]}
    >
      <Text style={[Typography.titleSM, { color }]} selectable>
        {icon}
      </Text>
      <View style={styles.content}>
        <Text style={Typography.labelMD} numberOfLines={2} selectable>
          {task.title}
        </Text>
        <Text style={Typography.captionSM} selectable>
          {subtitle}
        </Text>
        <View style={styles.tags}>
          <SchedulerTag label={task.priority} color={color} size="small" />
          {task.time ? (
            <SchedulerTag
              label={formatTimeLabel(task.time) ?? task.time}
              color={color}
              size="small"
            />
          ) : null}
        </View>
      </View>
    </Pressable>
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
    gap: UI_PRESETS.spacing.xs,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.xs,
  },
});

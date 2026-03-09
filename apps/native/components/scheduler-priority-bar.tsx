import React from "react";
import { StyleSheet } from "react-native";

import { View } from "@/components/view";
import { UI_PRESETS } from "@/lib/constants";
import { SCHEDULER_PRIORITY_LEVEL } from "@/lib/scheduler/helpers";

type SchedulerPriorityBarProps = {
  priority: "low" | "medium" | "high";
  color: string;
  borderColor: string;
};

export function SchedulerPriorityBar({
  priority,
  color,
  borderColor,
}: SchedulerPriorityBarProps) {
  const level = SCHEDULER_PRIORITY_LEVEL[priority];

  return (
    <View style={styles.container}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={[
            styles.segment,
            {
              backgroundColor: index < level ? color : borderColor,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
    alignItems: "center",
  },
  segment: {
    width: 4,
    height: 14,
    borderRadius: UI_PRESETS.radius.full,
  },
});

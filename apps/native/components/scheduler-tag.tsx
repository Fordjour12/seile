import React from "react";
import { StyleSheet } from "react-native";

import { Text } from "@/components/text";
import { View } from "@/components/view";
import { Typography, UI_PRESETS } from "@/lib/constants";
import { withAlpha } from "@/lib/scheduler/palette";

type SchedulerTagProps = {
  label: string;
  color: string;
  size?: "default" | "small";
};

export function SchedulerTag({
  label,
  color,
  size = "default",
}: SchedulerTagProps) {
  return (
    <View
      style={[
        styles.base,
        size === "default" ? styles.defaultSize : styles.smallSize,
        {
          backgroundColor: withAlpha(color, 0.13),
          borderColor: withAlpha(color, 0.26),
        },
      ]}
    >
      <Text
        style={[
          size === "default" ? Typography.labelSM : Typography.captionSM,
          { color, fontWeight: "600", letterSpacing: 0.3 },
        ]}
        selectable
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.full,
    flexDirection: "row",
    alignItems: "center",
  },
  defaultSize: {
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  smallSize: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
});

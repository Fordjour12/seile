import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface ProgressProps extends ViewProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
}

export function Progress({ value, max = 100, size = "md", style, ...props }: ProgressProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const progress = Math.min(Math.max(value / max, 0), 1);

  const heights = {
    sm: 4,
    md: 8,
    lg: 12,
  };

  return (
    <View
      style={[
        styles.track,
        {
          height: heights[size],
          backgroundColor: theme.muted,
          borderRadius: heights[size] / 2,
        },
        style,
      ]}
      {...props}
    >
      <View
        style={[
          styles.indicator,
          {
            width: `${progress * 100}%`,
            height: heights[size],
            backgroundColor: theme.primary,
            borderRadius: heights[size] / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
  indicator: {
    position: "absolute",
    left: 0,
    top: 0,
  },
});

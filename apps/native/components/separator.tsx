import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface SeparatorProps extends ViewProps {
  orientation?: "horizontal" | "vertical";
}

export function Separator({ orientation = "horizontal", style, ...props }: SeparatorProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View
      style={[
        styles.separator,
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        { backgroundColor: theme.border },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  separator: {},
  horizontal: {
    height: 1,
    width: "100%",
  },
  vertical: {
    width: 1,
    height: "100%",
  },
});

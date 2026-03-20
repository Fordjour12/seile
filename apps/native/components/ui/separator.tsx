import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type SeparatorProps = ViewProps & {
  orientation?: "horizontal" | "vertical";
};

export function Separator({
  orientation = "horizontal",
  style,
  ...props
}: SeparatorProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View
      style={[
        styles.base,
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        { backgroundColor: theme.border },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {},
  horizontal: {
    height: 1,
    width: "100%",
  },
  vertical: {
    width: 1,
    height: "100%",
  },
});

import React from "react";
import { View as RNView, ViewProps, StyleSheet } from "react-native";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface ThemedViewProps extends ViewProps {
  variant?: "default" | "card" | "popover" | "muted" | "accent";
}

export function ThemedView({
  variant = "default",
  style,
  ...props
}: ThemedViewProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const variantStyles = {
    default: { backgroundColor: theme.background },
    card: { backgroundColor: theme.card },
    popover: { backgroundColor: theme.popover },
    muted: { backgroundColor: theme.muted },
    accent: { backgroundColor: theme.accent },
  };
  const flattenedStyle = StyleSheet.flatten([variantStyles[variant], style]);

  return <RNView style={flattenedStyle} {...props} />;
}

export { ThemedView as View };

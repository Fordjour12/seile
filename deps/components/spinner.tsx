import React from "react";
import { ActivityIndicator, ActivityIndicatorProps, View, StyleSheet } from "react-native";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface SpinnerProps extends ActivityIndicatorProps {
  size?: "small" | "large";
}

export function Spinner({ size = "small", style, ...props }: SpinnerProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <ActivityIndicator
      size={size}
      color={theme.primary}
      style={style}
      {...props}
    />
  );
}

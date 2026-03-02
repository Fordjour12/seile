import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { CardTokens, NAV_THEME, UI_ELEMENT_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface SurfaceProps extends ViewProps {
  elevation?: "flat" | "sm" | "md" | "lg";
  tone?: "default" | "muted" | "card";
}

export function Surface({
  elevation = "sm",
  tone = "default",
  style,
  ...props
}: SurfaceProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const palette = colorScheme === "dark" ? UI_ELEMENT_THEME.dark : UI_ELEMENT_THEME.light;

  const tones = {
    default: palette.surface.background,
    muted: palette.surface.muted,
    card: palette.surface.card,
  };

  const boxShadow = {
    flat: "none",
    sm: theme.shadowSm,
    md: theme.shadowMd,
    lg: theme.shadowLg,
  }[elevation];

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: tones[tone],
          borderRadius: CardTokens.base.borderRadius,
          borderColor: palette.card.border,
          borderWidth: 1,
          boxShadow,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    padding: CardTokens.base.padding,
  },
});

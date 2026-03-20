import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { CardTokens, NAV_THEME, UI_ELEMENT_THEME } from "@/lib/constants";
import { resolveThemeShadow } from "@/lib/constants/theme";
import type { ShadowLevel } from "@/lib/constants/types";
import { useColorScheme } from "@/lib/use-color-scheme";

type SurfaceProps = ViewProps & {
  elevation?: "flat" | "sm" | "md" | "lg";
  tone?: "default" | "muted" | "card";
};

type SurfaceElevation = NonNullable<SurfaceProps["elevation"]>;
type SurfaceTone = NonNullable<SurfaceProps["tone"]>;

const ELEVATION_TO_SHADOW_LEVEL = {
  sm: CardTokens.filled.shadowLevel,
  md: CardTokens.elevated.shadowLevel,
  lg: "shadowLg",
} as const satisfies Record<Exclude<SurfaceElevation, "flat">, ShadowLevel>;

export function Surface({
  elevation = "sm",
  tone = "default",
  style,
  ...props
}: SurfaceProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const palette = colorScheme === "dark" ? UI_ELEMENT_THEME.dark : UI_ELEMENT_THEME.light;

  const tones: Record<SurfaceTone, string> = {
    default: palette.surface.background,
    muted: palette.surface.muted,
    card: palette.surface.card,
  };

  const boxShadow =
    elevation === "flat"
      ? "none"
      : resolveThemeShadow(theme, ELEVATION_TO_SHADOW_LEVEL[elevation]);

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

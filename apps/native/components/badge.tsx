import React from "react";
import { View, Text, ViewProps, StyleSheet } from "react-native";
import { NAV_THEME, BadgeTokens, UI_ELEMENT_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: "solid" | "subtle" | "outline";
  color?: "default" | "primary" | "secondary" | "destructive" | "success" | "warning";
}

type BadgeVariant = NonNullable<BadgeProps["variant"]>;
type BadgeColor = NonNullable<BadgeProps["color"]>;

export function Badge({
  children,
  variant = "solid",
  color = "default",
  style,
  ...props
}: BadgeProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const palette = colorScheme === "dark" ? UI_ELEMENT_THEME.dark : UI_ELEMENT_THEME.light;

  const colorStyles: Record<BadgeColor, { backgroundColor: string; foregroundColor: string }> = {
    default: {
      backgroundColor: palette.badge.solidBg,
      foregroundColor: palette.badge.solidText,
    },
    primary: {
      backgroundColor: palette.badge.solidBg,
      foregroundColor: palette.badge.solidText,
    },
    secondary: {
      backgroundColor: theme.secondary,
      foregroundColor: theme.secondaryForeground,
    },
    destructive: {
      backgroundColor: palette.badge.dangerBg,
      foregroundColor: theme.destructiveForeground,
    },
    success: {
      backgroundColor: palette.badge.successBg,
      foregroundColor: "#fff",
    },
    warning: {
      backgroundColor: palette.badge.warningBg,
      foregroundColor: "#000",
    },
  };

  const variantStyles: Record<
    BadgeVariant,
    (tone: { backgroundColor: string; foregroundColor: string }) => {
      backgroundColor: string;
      borderWidth: number;
      borderColor?: string;
      color: string;
    }
  > = {
    solid: (tone) => ({
      backgroundColor: tone.backgroundColor,
      borderWidth: 0,
      color: tone.foregroundColor,
    }),
    subtle: (tone) => ({
      backgroundColor: palette.badge.subtleBg,
      borderWidth: 0,
      color: palette.badge.subtleText,
    }),
    outline: (tone) => ({
      backgroundColor: "transparent",
      borderWidth: BadgeTokens.outline.borderWidth,
      borderColor: tone.backgroundColor,
      color: tone.backgroundColor,
    }),
  };

  const tone = colorStyles[color];
  const badgeTextToken = BadgeTokens[variant].text;
  const resolvedVariantStyle = variantStyles[variant](tone);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: resolvedVariantStyle.backgroundColor,
          borderColor: resolvedVariantStyle.borderColor,
          borderWidth: resolvedVariantStyle.borderWidth,
          paddingHorizontal: BadgeTokens.base.paddingHorizontal,
          paddingVertical: BadgeTokens.base.paddingVertical,
          minHeight: BadgeTokens.base.minHeight,
          borderRadius: BadgeTokens.base.borderRadius,
        },
        style,
      ]}
      {...props}
    >
      <Text style={[styles.text, badgeTextToken, { color: resolvedVariantStyle.color }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
  },
  text: {
    textAlign: "center",
  },
});

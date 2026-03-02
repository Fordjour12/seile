import React from "react";
import { View, Text, ViewProps, StyleSheet } from "react-native";
import { NAV_THEME, BadgeTokens } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: "solid" | "subtle" | "outline";
  color?: "default" | "primary" | "secondary" | "destructive" | "success" | "warning";
}

export function Badge({
  children,
  variant = "solid",
  color = "default",
  style,
  ...props
}: BadgeProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const colorMap = {
    default: theme.primary,
    primary: theme.primary,
    secondary: theme.secondary,
    destructive: theme.destructive,
    success: theme.chart2,
    warning: theme.chart4,
  };

  const textColorMap = {
    default: theme.primaryForeground,
    primary: theme.primaryForeground,
    secondary: theme.secondaryForeground,
    destructive: theme.destructiveForeground,
    success: "#fff",
    warning: "#000",
  };

  const bgColor = colorMap[color];
  const text = textColorMap[color];

  const getVariantStyles = () => {
    if (variant === "solid") {
      return {
        backgroundColor: bgColor,
        borderWidth: 0,
        color: text,
      };
    }
    if (variant === "subtle") {
      return {
        backgroundColor: `${bgColor}20`,
        borderWidth: 0,
        color: text,
      };
    }
    return {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: bgColor,
      color: bgColor,
    };
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variantStyles.borderWidth,
          paddingHorizontal: BadgeTokens.base.paddingHorizontal,
          paddingVertical: BadgeTokens.base.paddingVertical,
          minHeight: BadgeTokens.base.minHeight,
          borderRadius: BadgeTokens.base.borderRadius,
        },
        style,
      ]}
      {...props}
    >
      <Text style={[styles.text, { color: variantStyles.color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "500",
  },
});

import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { NAV_THEME, ButtonTokens } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface IconButtonProps {
  icon: React.ReactNode;
  onPress?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  style?: ViewStyle;
}

const SIZE_KEYS = {
  sm: "sm" as const,
  md: "md" as const,
  lg: "lg" as const,
};

const OPACITY = {
  pressed: 0.84,
  disabled: 0.45,
};

export function IconButton({
  icon,
  onPress,
  variant = "default",
  size = "md",
  disabled,
  style,
}: IconButtonProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const iconSize = ButtonTokens.icon[SIZE_KEYS[size]];

  const variantStyles = {
    default: {
      backgroundColor: theme.primary,
      borderWidth: 0,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.border,
    },
    ghost: {
      backgroundColor: "transparent",
      borderWidth: 0,
    },
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          width: iconSize.width,
          height: iconSize.height,
          borderRadius: iconSize.borderRadius,
          ...variantStyles[variant],
        },
        pressed && { opacity: OPACITY.pressed },
        disabled && { opacity: OPACITY.disabled },
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
});

import React from "react";
import {
  Pressable,
  PressableProps,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { NAV_THEME, ButtonTokens } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface ButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  style?: ViewStyle;
}

const SIZE_KEYS = {
  sm: "ghost" as const,
  md: "secondary" as const,
  lg: "primary" as const,
};

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const buttonToken = ButtonTokens[SIZE_KEYS[size]];

  const variantStyles = {
    primary: {
      backgroundColor: theme.primary,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: theme.secondary,
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
    destructive: {
      backgroundColor: theme.destructive,
      borderWidth: 0,
    },
  };

  const getTextColor = () => {
    if (variant === "primary") return theme.primaryForeground;
    if (variant === "secondary") return theme.secondaryForeground;
    if (variant === "outline") return theme.foreground;
    if (variant === "ghost") return theme.foreground;
    if (variant === "destructive") return theme.destructiveForeground;
    return theme.foreground;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          borderRadius: ButtonTokens.base.borderRadius,
          minHeight: buttonToken.minHeight,
          paddingHorizontal: buttonToken.paddingHorizontal,
          paddingVertical: buttonToken.paddingVertical,
        },
        variantStyles[variant],
        pressed && { opacity: ButtonTokens.state.pressedOpacity },
        disabled && { opacity: ButtonTokens.state.disabledOpacity },
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: buttonToken.text.fontSize,
              lineHeight: buttonToken.text.lineHeight,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: ButtonTokens.base.gap,
  },
  text: {
    fontWeight: "600",
  },
});

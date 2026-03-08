import React from "react";
import {
  Pressable,
  PressableProps,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from "react-native";
import { NAV_THEME, ButtonTokens } from "@/lib/constants";
import type { ButtonVariantToken, ThemeScale } from "@/lib/constants/types";
import { useColorScheme } from "@/lib/use-color-scheme";

interface ButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

type ButtonVariant = NonNullable<ButtonProps["variant"]>;
type ButtonSize = NonNullable<ButtonProps["size"]>;

const SIZE_TO_TOKEN_KEY = {
  sm: "ghost",
  md: "secondary",
  lg: "primary",
} as const satisfies Record<ButtonSize, "ghost" | "secondary" | "primary">;

const BUTTON_VARIANT_STYLES: Record<ButtonVariant, (theme: ThemeScale) => ViewStyle> = {
  primary: (theme) => ({
    backgroundColor: theme.primary,
    borderWidth: 0,
  }),
  secondary: (theme) => ({
    backgroundColor: theme.secondary,
    borderWidth: 0,
  }),
  outline: (theme) => ({
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.border,
  }),
  ghost: () => ({
    backgroundColor: "transparent",
    borderWidth: 0,
  }),
  destructive: (theme) => ({
    backgroundColor: theme.destructive,
    borderWidth: 0,
  }),
};

const BUTTON_TEXT_COLORS: Record<ButtonVariant, (theme: ThemeScale) => string> = {
  primary: (theme) => theme.primaryForeground,
  secondary: (theme) => theme.secondaryForeground,
  outline: (theme) => theme.foreground,
  ghost: (theme) => theme.foreground,
  destructive: (theme) => theme.destructiveForeground,
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
  const buttonToken: ButtonVariantToken = ButtonTokens[SIZE_TO_TOKEN_KEY[size]];
  const textColor = BUTTON_TEXT_COLORS[variant](theme);

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
        BUTTON_VARIANT_STYLES[variant](theme),
        pressed && { opacity: ButtonTokens.state.pressedOpacity },
        disabled && { opacity: ButtonTokens.state.disabledOpacity },
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            buttonToken.text,
            { color: textColor },
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
    textAlign: "center",
  },
});

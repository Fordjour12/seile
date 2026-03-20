import React from "react";
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { NAV_THEME, ButtonTokens } from "@/lib/constants";
import type { ThemeScale } from "@/lib/constants/types";
import { useColorScheme } from "@/lib/use-color-scheme";

interface IconButtonProps extends Omit<PressableProps, "style"> {
  icon: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  style?: StyleProp<ViewStyle>;
}

type IconButtonVariant = NonNullable<IconButtonProps["variant"]>;
type IconButtonSize = NonNullable<IconButtonProps["size"]>;

const SIZE_TO_ICON_TOKEN = {
  sm: "sm",
  md: "md",
  lg: "lg",
} as const satisfies Record<IconButtonSize, keyof typeof ButtonTokens.icon>;

const ICON_BUTTON_VARIANTS: Record<IconButtonVariant, (theme: ThemeScale) => ViewStyle> = {
  default: (theme) => ({
    backgroundColor: theme.primary,
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
};

export function IconButton({
  icon,
  onPress,
  variant = "default",
  size = "md",
  disabled,
  style,
  ...props
}: IconButtonProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const iconSize = ButtonTokens.icon[SIZE_TO_ICON_TOKEN[size]];

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
          ...ICON_BUTTON_VARIANTS[variant](theme),
        },
        pressed && { opacity: ButtonTokens.state.pressedOpacity },
        disabled && { opacity: ButtonTokens.state.disabledOpacity },
        style,
      ]}
      {...props}
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

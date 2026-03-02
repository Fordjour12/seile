import React from "react";
import { Pressable, StyleSheet, Text, View, ViewProps } from "react-native";
import { AlertTokens, UI_ELEMENT_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface AlertProps extends ViewProps {
  title?: string;
  message: string;
  variant?: "info" | "success" | "warning" | "error";
  actionLabel?: string;
  onActionPress?: () => void;
}

export function Alert({
  title,
  message,
  variant = "info",
  actionLabel,
  onActionPress,
  style,
  ...props
}: AlertProps) {
  const { colorScheme } = useColorScheme();
  const palette = colorScheme === "dark" ? UI_ELEMENT_THEME.dark : UI_ELEMENT_THEME.light;

  const variantStyle = {
    info: {
      backgroundColor: palette.alert.infoBg,
      color: palette.alert.infoText,
      borderColor: palette.alert.infoBorder,
    },
    success: {
      backgroundColor: palette.alert.successBg,
      color: palette.alert.accentText,
      borderColor: palette.alert.successBg,
    },
    warning: {
      backgroundColor: palette.alert.warningBg,
      color: palette.alert.accentText,
      borderColor: palette.alert.warningBg,
    },
    error: {
      backgroundColor: palette.alert.errorBg,
      color: palette.alert.accentText,
      borderColor: palette.alert.errorBg,
    },
  }[variant];

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius: AlertTokens.container.borderRadius,
          paddingHorizontal: AlertTokens.container.paddingHorizontal,
          paddingVertical: AlertTokens.container.paddingVertical,
          gap: AlertTokens.container.gap,
          borderWidth: AlertTokens.container.borderWidth,
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
        },
        style,
      ]}
      {...props}
    >
      {title ? (
        <Text style={[styles.title, AlertTokens.title, { color: variantStyle.color }]}>{title}</Text>
      ) : null}
      <Text style={[styles.message, AlertTokens.message, { color: variantStyle.color }]}>{message}</Text>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} style={({ pressed }) => [pressed && styles.pressed]}>
          <Text style={[styles.action, AlertTokens.action, { color: variantStyle.color }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    fontFamily: "Geist",
  },
  message: {
    fontFamily: "Geist",
  },
  action: {
    fontFamily: "Geist",
    textDecorationLine: "underline",
  },
  pressed: {
    opacity: 0.8,
  },
});

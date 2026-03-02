import React from "react";
import { StyleSheet, Text, View, ViewProps } from "react-native";
import { ToastTokens, UI_ELEMENT_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface ToastProps extends ViewProps {
  title: string;
  message?: string;
  variant?: "info" | "success" | "warning" | "error";
  actionLabel?: string;
}

export function Toast({
  title,
  message,
  variant = "info",
  actionLabel,
  style,
  ...props
}: ToastProps) {
  const { colorScheme } = useColorScheme();
  const palette = colorScheme === "dark" ? UI_ELEMENT_THEME.dark : UI_ELEMENT_THEME.light;

  const variantStyle = {
    info: { backgroundColor: palette.toast.infoBg, color: palette.toast.infoText },
    success: { backgroundColor: palette.toast.successBg, color: palette.toast.onAccent },
    warning: { backgroundColor: palette.toast.warningBg, color: palette.toast.onAccent },
    error: { backgroundColor: palette.toast.errorBg, color: palette.toast.onAccent },
  }[variant];

  return (
    <View
      style={[
        styles.container,
        {
          minHeight: ToastTokens.container.minHeight,
          borderRadius: ToastTokens.container.borderRadius,
          paddingHorizontal: ToastTokens.container.paddingHorizontal,
          paddingVertical: ToastTokens.container.paddingVertical,
          gap: ToastTokens.container.gap,
          backgroundColor: variantStyle.backgroundColor,
          borderColor: palette.toast.border,
          borderWidth: 1,
        },
        style,
      ]}
      {...props}
    >
      <View style={styles.content}>
        <Text style={[styles.title, ToastTokens.title, { color: variantStyle.color }]}>{title}</Text>
        {message ? (
          <Text style={[styles.message, ToastTokens.message, { color: variantStyle.color }]}>
            {message}
          </Text>
        ) : null}
      </View>
      {actionLabel ? (
        <Text style={[styles.action, ToastTokens.action, { color: variantStyle.color }]}>{actionLabel}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: "Geist",
  },
  message: {
    fontFamily: "Geist",
    marginTop: 2,
  },
  action: {
    fontFamily: "Geist",
    marginLeft: 8,
  },
});

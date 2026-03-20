import React from "react";
import { Pressable, StyleSheet, Text, View, ViewProps } from "react-native";
import { BannerTokens, UI_ELEMENT_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface BannerProps extends ViewProps {
  title: string;
  message?: string;
  variant?: "info" | "success" | "warning" | "error";
  actionLabel?: string;
  onActionPress?: () => void;
}

export function Banner({
  title,
  message,
  variant = "info",
  actionLabel,
  onActionPress,
  style,
  ...props
}: BannerProps) {
  const { colorScheme } = useColorScheme();
  const palette = colorScheme === "dark" ? UI_ELEMENT_THEME.dark : UI_ELEMENT_THEME.light;

  const variantStyle = {
    info: {
      backgroundColor: palette.banner.infoBg,
      color: palette.banner.infoText,
      borderColor: palette.banner.infoBorder,
    },
    success: {
      backgroundColor: palette.banner.successBg,
      color: palette.banner.accentText,
      borderColor: palette.banner.successBg,
    },
    warning: {
      backgroundColor: palette.banner.warningBg,
      color: palette.banner.accentText,
      borderColor: palette.banner.warningBg,
    },
    error: {
      backgroundColor: palette.banner.errorBg,
      color: palette.banner.accentText,
      borderColor: palette.banner.errorBg,
    },
  }[variant];

  return (
    <View
      style={[
        styles.container,
        {
          minHeight: BannerTokens.container.minHeight,
          borderRadius: BannerTokens.container.borderRadius,
          paddingHorizontal: BannerTokens.container.paddingHorizontal,
          paddingVertical: BannerTokens.container.paddingVertical,
          gap: BannerTokens.container.gap,
          borderWidth: BannerTokens.container.borderWidth,
          borderColor: variantStyle.borderColor,
          backgroundColor: variantStyle.backgroundColor,
        },
        style,
      ]}
      {...props}
    >
      <View style={styles.content}>
        <Text style={[styles.title, BannerTokens.title, { color: variantStyle.color }]}>{title}</Text>
        {message ? (
          <Text style={[styles.message, BannerTokens.message, { color: variantStyle.color }]}>{message}</Text>
        ) : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} style={({ pressed }) => [pressed && styles.pressed]}>
          <Text style={[styles.action, BannerTokens.action, { color: variantStyle.color }]}>{actionLabel}</Text>
        </Pressable>
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
    textDecorationLine: "underline",
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.8,
  },
});

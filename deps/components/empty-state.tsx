import React from "react";
import { StyleSheet, Text, View, ViewProps } from "react-native";
import { EmptyStateTokens, UI_ELEMENT_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { Button } from "./button";

interface EmptyStateProps extends ViewProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onActionPress,
  icon,
  style,
  ...props
}: EmptyStateProps) {
  const { colorScheme } = useColorScheme();
  const palette = colorScheme === "dark" ? UI_ELEMENT_THEME.dark : UI_ELEMENT_THEME.light;

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: EmptyStateTokens.container.paddingHorizontal,
          paddingVertical: EmptyStateTokens.container.paddingVertical,
          gap: EmptyStateTokens.container.gap,
        },
        style,
      ]}
      {...props}
    >
      {icon ? <View>{icon}</View> : null}
      <Text style={[styles.title, EmptyStateTokens.title, { color: palette.text.primary }]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, EmptyStateTokens.message, { color: palette.text.secondary }]}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onActionPress ? (
        <Button title={actionLabel} onPress={onActionPress} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Geist",
    textAlign: "center",
  },
  message: {
    fontFamily: "Geist",
    textAlign: "center",
    maxWidth: 320,
  },
});

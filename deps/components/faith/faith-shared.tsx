import React from "react";
import { Pressable, StyleSheet, type ViewStyle } from "react-native";
import { type Href, useRouter } from "expo-router";

import { Badge, Card, Input, Text, View } from "@/components";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export function FaithMetricCard({
  label,
  value,
  detail,
  accent,
  style,
}: {
  label: string;
  value: string | number;
  detail?: string;
  accent?: string;
  style?: ViewStyle;
}) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Card
      variant="outline"
      style={[
        styles.metricCard,
        {
          borderColor: theme.border,
        },
        style,
      ]}
    >
      <Text variant="muted">{label}</Text>
      <Text variant="h3" style={accent ? { color: accent } : undefined}>
        {String(value)}
      </Text>
      {detail ? (
        <Text variant="small" style={{ color: theme.mutedForeground }}>
          {detail}
        </Text>
      ) : null}
    </Card>
  );
}

export function FaithQuickLinkCard({
  title,
  subtitle,
  href,
  badge,
}: {
  title: string;
  subtitle: string;
  href: Href;
  badge?: string;
}) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Pressable onPress={() => router.push(href)} style={({ pressed }) => [pressed && styles.pressed]}>
      <Card
        variant="outline"
        style={{
          gap: UI_PRESETS.spacing.xs,
          borderColor: theme.border,
        }}
      >
        {badge ? <Badge color="secondary">{badge}</Badge> : null}
        <Text variant="h3">{title}</Text>
        <Text variant="small" style={{ color: theme.mutedForeground }}>
          {subtitle}
        </Text>
      </Card>
    </Pressable>
  );
}

export function FaithField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  helper,
  children,
  style,
}: {
  label: string;
  value?: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  helper?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View style={[styles.fieldGroup, style]}>
      <Text style={[Typography.labelMD, { color: theme.foreground }]}>{label}</Text>
      {helper ? (
        <Text style={[Typography.captionLG, { color: theme.mutedForeground }]}>{helper}</Text>
      ) : null}
      {children ?? (
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline={multiline}
          style={multiline ? { minHeight: 88, textAlignVertical: "top" } : undefined}
        />
      )}
    </View>
  );
}

export const faithSharedStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.lg,
  },
  card: {
    gap: UI_PRESETS.spacing.sm,
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.md,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.sm,
  },
  section: {
    gap: UI_PRESETS.spacing.md,
  },
  list: {
    gap: UI_PRESETS.spacing.sm,
  },
  itemActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.sm,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
});

const styles = StyleSheet.create({
  metricCard: {
    flex: 1,
    gap: UI_PRESETS.spacing.xs,
  },
  fieldGroup: {
    gap: UI_PRESETS.spacing.xs,
  },
  pressed: {
    opacity: UI_PRESETS.opacity.pressed,
  },
});

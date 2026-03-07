import React from "react";
import { StyleSheet } from "react-native";

import { CardTokens, NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

import { Text } from "./text";
import { View } from "./view";

type Props = {
  totalTarget: number;
  totalCurrent: number;
  percentComplete: number;
  goalsCount: number;
};

export function SavingsSummaryCard({ totalTarget, totalCurrent, percentComplete, goalsCount }: Props) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[Typography.titleSM, { color: theme.text }]}>Savings Summary</Text>
      <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>GOALS OVERVIEW</Text>
      <Text style={[Typography.bodyMD, { color: theme.text }]}>Current: {totalCurrent.toFixed(2)}</Text>
      <Text style={[Typography.bodyMD, { color: theme.text }]}>Target: {totalTarget.toFixed(2)}</Text>
      <Text style={[Typography.bodyMD, { color: theme.text }]}>Progress: {percentComplete.toFixed(0)}%</Text>
      <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Goals: {goalsCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: CardTokens.base.borderRadius,
    borderWidth: 1,
    paddingHorizontal: UI_PRESETS.spacing.md,
    paddingVertical: UI_PRESETS.spacing.lg,
    gap: UI_PRESETS.spacing.xs,
  },
});

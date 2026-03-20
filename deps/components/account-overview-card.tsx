import React from "react";
import { Pressable, StyleSheet, ViewProps } from "react-native";

import { CardTokens, NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

import { Progress } from "./progress";
import { Text } from "./text";
import { View } from "./view";

export interface AccountOverviewMetrics {
  totalCash: number;
  moneyInMtd: number;
  moneyOutMtd: number;
  accountsCount: number;
  periodLabel?: string;
}

interface AccountOverviewCardProps extends ViewProps {
  metrics: AccountOverviewMetrics;
  currencySymbol?: string;
  title?: string;
  subtitle?: string;
  onViewAccountsPress?: () => void;
}

function formatCurrency(amount: number, currencySymbol: string): string {
  return `${currencySymbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function AccountOverviewCard({
  metrics,
  currencySymbol = "GH₵",
  title = "Accounts Overview",
  subtitle = "CASH POSITION",
  onViewAccountsPress,
  style,
  ...props
}: AccountOverviewCardProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const netFlowMtd = metrics.moneyInMtd - metrics.moneyOutMtd;
  const flowBase = Math.max(metrics.moneyInMtd + metrics.moneyOutMtd, 1);
  const inRatio = Math.max(0, Math.min(1, metrics.moneyInMtd / flowBase));
  const outRatio = Math.max(0, Math.min(1, metrics.moneyOutMtd / flowBase));
  const periodLabel = metrics.periodLabel ?? "Current Month (MTD)";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        style,
      ]}
      {...props}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[Typography.titleSM, { color: theme.text }]}>{title}</Text>
          <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>{subtitle}</Text>
        </View>
        {onViewAccountsPress ? (
          <Pressable onPress={onViewAccountsPress}>
            <Text style={[Typography.labelSM, { color: theme.primary }]}>View Accounts</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.totalWrap}>
        <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Total Cash</Text>
        <Text style={[Typography.displaySM, { color: theme.text }]}>
          {formatCurrency(metrics.totalCash, currencySymbol)}
        </Text>
        <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>
          Accounts tracked: {metrics.accountsCount}
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={[styles.metricTile, { borderColor: theme.border, backgroundColor: theme.background }]}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Money In</Text>
          <Text style={[Typography.titleSM, { color: theme.chart2 }]}>
            {formatCurrency(metrics.moneyInMtd, currencySymbol)}
          </Text>
          <Progress value={inRatio * 100} size="sm" />
        </View>

        <View style={[styles.metricTile, { borderColor: theme.border, backgroundColor: theme.background }]}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Money Out</Text>
          <Text style={[Typography.titleSM, { color: theme.destructive }]}>
            {formatCurrency(metrics.moneyOutMtd, currencySymbol)}
          </Text>
          <Progress value={outRatio * 100} size="sm" />
        </View>
      </View>

      <View
        style={[
          styles.netFlowRow,
          {
            borderColor: theme.border,
            backgroundColor: theme.background,
          },
        ]}
      >
        <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Net Flow</Text>
        <Text
          style={[
            Typography.titleSM,
            {
              color: netFlowMtd >= 0 ? theme.chart2 : theme.destructive,
            },
          ]}
        >
          {netFlowMtd >= 0 ? "+" : "-"}
          {formatCurrency(Math.abs(netFlowMtd), currencySymbol)}
        </Text>
      </View>

      <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>{periodLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: CardTokens.base.borderRadius,
    borderWidth: 1,
    paddingHorizontal: UI_PRESETS.spacing.md,
    paddingVertical: UI_PRESETS.spacing.lg,
    gap: UI_PRESETS.spacing.sm,
    marginTop: UI_PRESETS.spacing.section,
    marginBottom: UI_PRESETS.spacing.section
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: UI_PRESETS.spacing.sm,
  },
  totalWrap: {
    gap: 2,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
  metricTile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.sm,
    padding: UI_PRESETS.spacing.sm,
    gap: UI_PRESETS.spacing.xs,
  },
  netFlowRow: {
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.sm,
    paddingHorizontal: UI_PRESETS.spacing.sm,
    paddingVertical: UI_PRESETS.spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

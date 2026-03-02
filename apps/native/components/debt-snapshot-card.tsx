import React, { useMemo } from "react";
import { Pressable, StyleSheet, ViewProps } from "react-native";

import { CardTokens, NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

import { Progress } from "./progress";
import { Text } from "./text";
import { View } from "./view";

export type DebtType = "installment" | "revolving";

export interface DebtItem {
  id: string;
  name: string;
  type: DebtType;
  originalBalance: number;
  currentBalance: number;
  monthlyDue: number;
  nextDueDate?: string;
  apr?: number;
}

interface DebtSnapshotCardProps extends ViewProps {
  debts: DebtItem[];
  currencySymbol?: string;
  title?: string;
  subtitle?: string;
  onViewAllPress?: () => void;
}

function formatCurrency(amount: number, currencySymbol: string): string {
  return `${currencySymbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function toPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function DebtSnapshotCard({
  debts,
  currencySymbol = "GH₵",
  title = "Debt Snapshot",
  subtitle = "MONTHLY PAYOFF TRACKER",
  onViewAllPress,
  style,
  ...props
}: DebtSnapshotCardProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const metrics = useMemo(() => {
    const totalOriginal = debts.reduce(
      (sum, debt) => sum + Math.max(0, debt.originalBalance),
      0,
    );
    const totalCurrent = debts.reduce(
      (sum, debt) => sum + Math.max(0, debt.currentBalance),
      0,
    );
    const totalMonthlyDue = debts.reduce(
      (sum, debt) => sum + Math.max(0, debt.monthlyDue),
      0,
    );
    const overallProgress =
      totalOriginal > 0
        ? clamp01((totalOriginal - totalCurrent) / totalOriginal)
        : 0;
    const topDebts = [...debts]
      .sort((a, b) => b.currentBalance - a.currentBalance)
      .slice(0, 3)
      .map((debt) => ({
        ...debt,
        progress:
          debt.originalBalance > 0
            ? clamp01(
                (debt.originalBalance - debt.currentBalance) /
                  debt.originalBalance,
              )
            : 0,
      }));

    return {
      totalCurrent,
      totalMonthlyDue,
      overallProgress,
      topDebts,
    };
  }, [debts]);

  if (debts.length === 0) {
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
            <Text style={[Typography.titleSM, { color: theme.text }]}>
              {title}
            </Text>
            <Text
              style={[Typography.captionSM, { color: theme.mutedForeground }]}
            >
              {subtitle}
            </Text>
          </View>
        </View>
        <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>
          No debt entries yet. Add your first debt to track payoff progress.
        </Text>
      </View>
    );
  }

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
          <Text style={[Typography.titleSM, { color: theme.text }]}>
            {title}
          </Text>
          <Text
            style={[Typography.captionSM, { color: theme.mutedForeground }]}
          >
            {subtitle}
          </Text>
        </View>
        {onViewAllPress ? (
          <Pressable onPress={onViewAllPress}>
            <Text style={[Typography.labelSM, { color: theme.primary }]}>
              View All
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiBlock}>
          <Text
            style={[Typography.captionSM, { color: theme.mutedForeground }]}
          >
            Total Debt
          </Text>
          <Text style={[Typography.titleLG, { color: theme.text }]}>
            {formatCurrency(metrics.totalCurrent, currencySymbol)}
          </Text>
        </View>
        <View style={styles.kpiBlock}>
          <Text
            style={[Typography.captionSM, { color: theme.mutedForeground }]}
          >
            Monthly Due
          </Text>
          <Text style={[Typography.titleSM, { color: theme.text }]}>
            {formatCurrency(metrics.totalMonthlyDue, currencySymbol)}
          </Text>
        </View>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>
            Payoff Progress
          </Text>
          <Text style={[Typography.labelSM, { color: theme.primary }]}>
            {toPercent(metrics.overallProgress)}
          </Text>
        </View>
        <Progress value={metrics.overallProgress * 100} size="md" />
      </View>

      <View style={styles.listWrap}>
        {metrics.topDebts.map((debt) => (
          <View
            key={debt.id}
            style={[
              styles.debtRow,
              {
                borderColor: theme.border,
                backgroundColor: theme.background,
              },
            ]}
          >
            <View style={styles.debtRowTop}>
              <View style={styles.debtIdentity}>
                <Text style={[Typography.bodyMD, { color: theme.text }]}>
                  {debt.name}
                </Text>
                <View
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor:
                        debt.type === "installment"
                          ? theme.chart2
                          : theme.chart4,
                    },
                  ]}
                >
                  <Text
                    style={[Typography.labelXS, { color: theme.background }]}
                  >
                    {debt.type === "installment" ? "INSTALLMENT" : "REVOLVING"}
                  </Text>
                </View>
              </View>
              <Text style={[Typography.labelSM, { color: theme.text }]}>
                {formatCurrency(debt.currentBalance, currencySymbol)}
              </Text>
            </View>

            <View style={styles.debtRowMeta}>
              <Text
                style={[Typography.captionSM, { color: theme.mutedForeground }]}
              >
                Monthly due: {formatCurrency(debt.monthlyDue, currencySymbol)}
              </Text>
              <Text style={[Typography.captionSM, { color: theme.primary }]}>
                {toPercent(debt.progress)}
              </Text>
            </View>
            <Progress value={debt.progress * 100} size="sm" />
          </View>
        ))}
      </View>
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
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: UI_PRESETS.spacing.sm,
  },
  kpiRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
  kpiBlock: {
    flex: 1,
    gap: 2,
  },
  progressWrap: {
    gap: UI_PRESETS.spacing.xs,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listWrap: {
    gap: UI_PRESETS.spacing.xs,
  },
  debtRow: {
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.sm,
    padding: UI_PRESETS.spacing.sm,
    gap: UI_PRESETS.spacing.xs,
  },
  debtRowTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: UI_PRESETS.spacing.sm,
  },
  debtIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.xs,
    flexWrap: "wrap",
    flex: 1,
  },
  typeBadge: {
    borderRadius: UI_PRESETS.radius.full,
    paddingHorizontal: UI_PRESETS.spacing.xs,
    paddingVertical: 2,
  },
  debtRowMeta: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

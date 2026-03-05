import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter, type Href } from "expo-router";

import {
  Banner,
  Button,
  Card,
  DebtSnapshotCard,
  EmptyState,
  ListItem,
  SectionHeader,
  Spinner,
  Text,
  View,
} from "@/components";
import {
  formatDebtAmount,
  formatDebtApr,
  formatDebtStatus,
  getDebtSnapshot,
  listDebtPlans,
  mapDebtListItem,
  type DebtPlan,
  type DebtSnapshot,
} from "@/lib/debt";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

const EMPTY_SNAPSHOT: DebtSnapshot = {
  totalCurrentBalance: 0,
  totalMonthlyDue: 0,
  countByStatus: {},
};

export default function DebtIndexScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [items, setItems] = useState<DebtPlan[]>([]);
  const [snapshot, setSnapshot] = useState<DebtSnapshot>(EMPTY_SNAPSHOT);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const refreshDebt = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);

    try {
      const [plans, nextSnapshot] = await Promise.all([listDebtPlans(), getDebtSnapshot()]);
      setItems(plans);
      setSnapshot(nextSnapshot);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshDebt();
  }, [refreshDebt]);

  const draftCount = snapshot.countByStatus.draft ?? 0;
  const activeCount = snapshot.countByStatus.active ?? 0;
  const archivedCount = snapshot.countByStatus.archived ?? 0;

  const averageApr = useMemo(() => {
    const debtsWithApr = items.filter((item) => item.apr !== undefined);
    if (debtsWithApr.length === 0) {
      return undefined;
    }

    return debtsWithApr.reduce((sum, item) => sum + (item.apr ?? 0), 0) / debtsWithApr.length;
  }, [items]);

  const showEmptyState = !isLoading && !hasError && items.length === 0;

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <SectionHeader
        title="Debt"
        subtitle="Track balances, due amounts, and payoff momentum"
        actionLabel="New"
        onActionPress={() => router.push("/(tabs)/finance/debt/create" as Href)}
      />

      <DebtSnapshotCard
        debts={items.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.debtType,
          originalBalance: item.originalBalance,
          currentBalance: item.currentBalance,
          monthlyDue: item.monthlyDue,
          apr: item.apr,
        }))}
      />

      <View style={styles.metricsRow}>
        <Card variant="outline" style={[styles.metricCard, { borderColor: theme.border }]}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Current Balance</Text>
          <Text style={[Typography.titleSM, { color: theme.text }]}>
            {formatDebtAmount(snapshot.totalCurrentBalance, "GHS")}
          </Text>
        </Card>
        <Card variant="outline" style={[styles.metricCard, { borderColor: theme.border }]}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Monthly Due</Text>
          <Text style={[Typography.titleSM, { color: theme.text }]}>
            {formatDebtAmount(snapshot.totalMonthlyDue, "GHS")}
          </Text>
        </Card>
      </View>

      <Card variant="outline" style={[styles.statusCard, { borderColor: theme.border }]}>
        <Text style={[Typography.titleSM, { color: theme.text }]}>Portfolio Mix</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <Text style={[Typography.labelSM, { color: theme.text }]}>Active</Text>
            <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>{activeCount}</Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={[Typography.labelSM, { color: theme.text }]}>Draft</Text>
            <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>{draftCount}</Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={[Typography.labelSM, { color: theme.text }]}>Archived</Text>
            <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>{archivedCount}</Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={[Typography.labelSM, { color: theme.text }]}>Average APR</Text>
            <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>
              {averageApr === undefined ? "No APR" : `${averageApr.toFixed(2)}%`}
            </Text>
          </View>
        </View>
      </Card>

      {hasError ? (
        <Banner
          variant="error"
          title="Unable to load debt plans"
          message="Please check your connection and try again."
          actionLabel="Retry"
          onActionPress={() => {
            void refreshDebt();
          }}
        />
      ) : null}

      {isLoading ? (
        <View style={styles.loadingState}>
          <Spinner size="large" />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading debt plans…</Text>
        </View>
      ) : null}

      {showEmptyState ? (
        <EmptyState
          title="No debt plans yet"
          message="Create your first debt plan to track balances and monthly obligations."
          actionLabel="Create debt plan"
          onActionPress={() => router.push("/(tabs)/finance/debt/create" as Href)}
        />
      ) : null}

      {!isLoading && !hasError && items.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="Debt Plans" subtitle="CURRENT PORTFOLIO" />
          <View style={styles.list}>
            {items.map((item) => {
              const listItem = mapDebtListItem(item);
              return (
                <ListItem
                  key={item.id}
                  title={listItem.title}
                  subtitle={`${listItem.subtitle} · ${formatDebtApr(item.apr)}`}
                  meta={listItem.balanceLabel}
                  onPress={() => router.push(`/(tabs)/finance/debt/${item.id}/update` as Href)}
                  right={
                    <Text style={[Typography.labelSM, { color: theme.primary }]}>
                      {formatDebtStatus(item.status)}
                    </Text>
                  }
                />
              );
            })}
          </View>
        </View>
      ) : null}

      {!isLoading && !hasError ? (
        <Button title="Create debt plan" onPress={() => router.push("/(tabs)/finance/debt/create" as Href)} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.lg,
  },
  metricsRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
  },
  metricCard: {
    flex: 1,
    gap: UI_PRESETS.spacing.sm,
  },
  statusCard: {
    gap: UI_PRESETS.spacing.md,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.md,
  },
  statusPill: {
    minWidth: 110,
    gap: UI_PRESETS.spacing.xs,
  },
  loadingState: {
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
    paddingVertical: UI_PRESETS.spacing.xl,
  },
  section: {
    gap: UI_PRESETS.spacing.md,
  },
  list: {
    gap: UI_PRESETS.spacing.sm,
  },
});

import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter, type Href } from "expo-router";

import { Banner, Button, Card, EmptyState, ListItem, SectionHeader, Spinner, Text, View } from "@/components";
import {
  formatBudgetAmount,
  formatBudgetStatus,
  getActivePeriod,
  listEnvelopes,
  mapBudgetEnvelopeListItem,
  type BudgetEnvelopeWithComputed,
  type BudgetPeriodWithComputed,
} from "@/lib/budget";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function BudgetScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [activePeriod, setActivePeriod] = useState<BudgetPeriodWithComputed | null>(null);
  const [envelopes, setEnvelopes] = useState<BudgetEnvelopeWithComputed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const refresh = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const period = await getActivePeriod();
      setActivePeriod(period);
      if (period) {
        const rows = await listEnvelopes(period.id);
        setEnvelopes(rows);
      } else {
        setEnvelopes([]);
      }
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const showEmptyState = !isLoading && !hasError && !activePeriod;

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <SectionHeader
        title="Budget"
        subtitle="Manage your monthly budget period and envelopes"
        actionLabel="New"
        onActionPress={() => router.push("/(tabs)/finance/budget/create" as Href)}
      />

      {hasError ? (
        <Banner
          variant="error"
          title="Unable to load budget"
          message="Please check your connection and try again."
          actionLabel="Retry"
          onActionPress={() => {
            void refresh();
          }}
        />
      ) : null}

      {isLoading ? (
        <View style={styles.loadingState}>
          <Spinner size="large" />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading budget…</Text>
        </View>
      ) : null}

      {showEmptyState ? (
        <EmptyState
          title="No active budget"
          message="Create a budget period to start planning envelope allocations."
          actionLabel="Create budget period"
          onActionPress={() => router.push("/(tabs)/finance/budget/create" as Href)}
        />
      ) : null}

      {!isLoading && activePeriod ? (
        <>
          <Card variant="outline" style={[styles.summaryCard, { borderColor: theme.border }]}> 
            <Text style={[Typography.titleSM, { color: theme.text }]}>Active Period</Text>
            <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>
              {`${activePeriod.year}-${String(activePeriod.month).padStart(2, "0")} · ${formatBudgetStatus(activePeriod.status)}`}
            </Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricBlock}>
                <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Income Target</Text>
                <Text style={[Typography.bodyMD, { color: theme.text }]}>{formatBudgetAmount(activePeriod.incomeTarget, activePeriod.currencyCode)}</Text>
              </View>
              <View style={styles.metricBlock}>
                <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Allocated</Text>
                <Text style={[Typography.bodyMD, { color: theme.text }]}>{formatBudgetAmount(activePeriod.totalAllocated, activePeriod.currencyCode)}</Text>
              </View>
              <View style={styles.metricBlock}>
                <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Unallocated</Text>
                <Text style={[Typography.bodyMD, { color: activePeriod.unallocated < 0 ? theme.destructive : theme.text }]}>
                  {formatBudgetAmount(activePeriod.unallocated, activePeriod.currencyCode)}
                </Text>
              </View>
            </View>
          </Card>

          <View style={styles.actionsRow}>
            <Button title="Manage Period" variant="outline" onPress={() => router.push(`/(tabs)/finance/budget/${activePeriod.id}/update` as Href)} style={styles.flexButton} />
            <Button title="Add Envelope" onPress={() => router.push(`/(tabs)/finance/budget/${activePeriod.id}/envelopes/create` as Href)} style={styles.flexButton} />
          </View>

          <View style={styles.section}>
            <SectionHeader title="Envelopes" subtitle="ACTIVE PERIOD" />
            <View style={styles.list}>
              {envelopes.map((envelope) => {
                const item = mapBudgetEnvelopeListItem(envelope, activePeriod.currencyCode);
                return (
                  <ListItem
                    key={envelope.id}
                    title={item.title}
                    subtitle={`${item.subtitle} · Spent ${formatBudgetAmount(envelope.actualSpend, activePeriod.currencyCode)}`}
                    meta={item.balanceLabel}
                    onPress={() => router.push(`/(tabs)/finance/budget/envelopes/${envelope.id}/update` as Href)}
                    right={<Text style={[Typography.labelSM, { color: envelope.overspent ? theme.destructive : theme.primary }]}>{Math.round(envelope.spendPercent)}%</Text>}
                  />
                );
              })}
            </View>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.lg,
  },
  loadingState: {
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
    paddingVertical: UI_PRESETS.spacing.xl,
  },
  summaryCard: {
    gap: UI_PRESETS.spacing.md,
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.md,
  },
  metricBlock: {
    minWidth: 120,
    gap: UI_PRESETS.spacing.xs,
  },
  actionsRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
  },
  flexButton: {
    flex: 1,
  },
  section: {
    gap: UI_PRESETS.spacing.md,
  },
  list: {
    gap: UI_PRESETS.spacing.sm,
  },
});

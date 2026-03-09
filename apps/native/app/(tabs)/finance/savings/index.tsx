import React, { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter, type Href } from "expo-router";

import { Button, Card, EmptyState, ListItem, SavingsSummaryCard, SectionHeader, Spinner, Text, View } from "@/components";
import {
  formatSavingsAmount,
  formatSavingsStatus,
  mapSavingsListItem,
  useSavingsGoals,
  useSavingsSummary,
} from "@/lib/savings";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function SavingsIndexScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const goals = useSavingsGoals();
  const summary = useSavingsSummary();
  const isLoading = goals === undefined || summary === undefined;

  const goalCount = useMemo(
    () => Object.values(summary?.countByStatus ?? {}).reduce((sum, count) => sum + count, 0),
    [summary?.countByStatus],
  );

  const showEmptyState = !isLoading && (goals?.length ?? 0) === 0;

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <SectionHeader
        title="Savings"
        subtitle="Track goal progress and monthly contributions"
        actionLabel="New"
        onActionPress={() => router.push("/(tabs)/finance/savings/create" as Href)}
      />

      <SavingsSummaryCard
        totalTarget={summary?.totalTarget ?? 0}
        totalCurrent={summary?.totalCurrent ?? 0}
        percentComplete={summary?.percentComplete ?? 0}
        goalsCount={goalCount}
      />

      <View style={styles.metricsRow}>
        <Card variant="outline" style={[styles.metricCard, { borderColor: theme.border }]}> 
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Monthly Commitment</Text>
          <Text style={[Typography.titleSM, { color: theme.text }]}> 
            {formatSavingsAmount(summary?.totalMonthlyCommitment ?? 0, "GHS")}
          </Text>
        </Card>
        <Card variant="outline" style={[styles.metricCard, { borderColor: theme.border }]}> 
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Completion</Text>
          <Text style={[Typography.titleSM, { color: theme.text }]}>{(summary?.percentComplete ?? 0).toFixed(0)}%</Text>
        </Card>
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <Spinner size="large" />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading savings goals…</Text>
        </View>
      ) : null}

      {showEmptyState ? (
        <EmptyState
          title="No savings goals yet"
          message="Create your first goal to track progress toward future plans."
          actionLabel="Create savings goal"
          onActionPress={() => router.push("/(tabs)/finance/savings/create" as Href)}
        />
      ) : null}

      {!isLoading && (goals?.length ?? 0) > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="Goals" subtitle="CURRENT PORTFOLIO" />
          <View style={styles.list}>
            {goals?.map((goal) => {
              const item = mapSavingsListItem(goal);
              const targetDateLabel = goal.targetDate ? new Date(goal.targetDate).toLocaleDateString("en-US") : "No date";
              return (
                <ListItem
                  key={goal.id}
                  title={item.title}
                  subtitle={`${item.subtitle} · ${targetDateLabel}`}
                  meta={item.balanceLabel}
                  onPress={() => router.push(`/(tabs)/finance/savings/${goal.id}/update` as Href)}
                  right={<Text style={[Typography.labelSM, { color: theme.primary }]}>{formatSavingsStatus(goal.status)}</Text>}
                />
              );
            })}
          </View>
        </View>
      ) : null}

      {!isLoading ? (
        <Button title="Create savings goal" onPress={() => router.push("/(tabs)/finance/savings/create" as Href)} />
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
  metricsRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
  },
  metricCard: {
    flex: 1,
    gap: UI_PRESETS.spacing.sm,
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

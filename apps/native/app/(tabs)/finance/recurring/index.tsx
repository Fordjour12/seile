import React from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter, type Href } from "expo-router";

import { Button, Card, EmptyState, SectionHeader, Spinner, Text, View } from "@/components";
import { useRecurringTransactions } from "@/lib/recurring";
import {
  useMonthlySubscriptionSpend,
  useUpcomingRenewals,
} from "@/lib/subscriptions";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

function formatCurrency(amount: number): string {
  return `GH₵${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function RecurringIndexScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const items = useRecurringTransactions(true);
  const upcomingRenewals = useUpcomingRenewals(30);
  const monthlySubscriptionSpend = useMonthlySubscriptionSpend();
  const isLoading =
    items === undefined ||
    upcomingRenewals === undefined ||
    monthlySubscriptionSpend === undefined;
  const monthlySubscriptionTotal = monthlySubscriptionSpend?.monthlyTotal ?? 0;

  const activeCount = (items ?? []).filter((item) => item.isActive).length;
  const subscriptionsCount = (items ?? []).filter(
    (item) => item.isSubscription,
  ).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader
        title="Schedules"
        subtitle={`Active: ${activeCount} · Subscriptions: ${subscriptionsCount}`}
      />

      <View style={styles.actionsRow}>
        <Button
          title="Create schedule"
          onPress={() => router.push("/(tabs)/finance/recurring/create" as Href)}
          style={styles.actionButton}
        />
        <Button
          title="Add subscription"
          variant="outline"
          onPress={() => router.push("/(tabs)/finance/recurring/subscriptions/create" as Href)}
          style={styles.actionButton}
        />
      </View>

      {!isLoading ? (
        <Card variant="outline" style={[styles.summaryCard, { borderColor: theme.border }]}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Subscription Layer</Text>
          <View style={styles.summaryMetrics}>
            <View style={styles.metricBlock}>
              <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Monthly spend</Text>
              <Text style={[Typography.titleSM, { color: theme.foreground }]}>
                {formatCurrency(monthlySubscriptionTotal)}
              </Text>
            </View>
            <View style={styles.metricBlock}>
              <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Upcoming renewals</Text>
              <Text style={[Typography.titleSM, { color: theme.foreground }]}>{upcomingRenewals.length}</Text>
            </View>
          </View>
          {upcomingRenewals.length > 0 ? (
            <View style={styles.renewalsList}>
              {upcomingRenewals.slice(0, 3).map((item) => (
                <View key={`renewal-${item.id}`} style={styles.renewalRow}>
                  <Text style={[Typography.bodySM, { color: theme.foreground }]}>
                    {item.subscriptionMeta.serviceName}
                  </Text>
                  <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>
                    {new Date(item.nextRunAt).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>
              No subscription renewals in the next 30 days.
            </Text>
          )}
        </Card>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingState}>
          <Spinner />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading schedules…</Text>
        </View>
      ) : null}

      {!isLoading && (items?.length ?? 0) === 0 ? (
        <EmptyState
          title="No schedules yet"
          message="Create a recurring schedule for automatic tracking."
          actionLabel="Create schedule"
          onActionPress={() => router.push("/(tabs)/finance/recurring/create" as Href)}
        />
      ) : null}

      {!isLoading
        ? items?.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/(tabs)/finance/recurring/${item.id}` as Href)}
            >
              <Card variant="outline" style={[styles.card, { borderColor: theme.border }]}>
                <View style={styles.rowBetween}>
                  <Text style={[Typography.titleSM, { color: theme.foreground }]}>
                    {item.isSubscription ? item.subscriptionMeta?.serviceName : item.note || item.kind}
                  </Text>
                  <View style={styles.statusGroup}>
                    {item.isSubscription ? (
                      <Text
                        style={[
                          Typography.labelSM,
                          {
                            color: theme.chart4,
                            textTransform: "uppercase",
                          },
                        ]}
                      >
                        Subscription
                      </Text>
                    ) : null}
                    <Text
                      style={[
                        Typography.labelSM,
                        { color: item.isActive ? theme.chart2 : theme.mutedForeground, textTransform: "uppercase" },
                      ]}
                    >
                      {item.isActive ? "Active" : "Paused"}
                    </Text>
                  </View>
                </View>

                <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>
                  {item.isSubscription
                    ? `${formatCurrency(item.amount)} · ${item.scheduleType} · Next renewal ${new Date(item.nextRunAt).toLocaleDateString()}`
                    : `${item.scheduleType} every ${item.interval} · Next run ${new Date(item.nextRunAt).toLocaleDateString()}`}
                </Text>
              </Card>
            </Pressable>
          )) ?? null
        : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingTop: UI_PRESETS.spacing.screen,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.md,
  },
  actionsRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  loadingState: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
  summaryCard: {
    gap: UI_PRESETS.spacing.md,
  },
  summaryMetrics: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
  },
  metricBlock: {
    flex: 1,
    gap: UI_PRESETS.spacing.xs,
  },
  renewalsList: {
    gap: UI_PRESETS.spacing.xs,
  },
  renewalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
  card: { gap: UI_PRESETS.spacing.xs },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
  statusGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
});

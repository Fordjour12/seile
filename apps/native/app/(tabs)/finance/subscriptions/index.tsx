import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter, type Href } from "expo-router";

import { Banner, Button, Card, EmptyState, SectionHeader, Spinner, Text, View } from "@/components";
import {
  getMonthlySubscriptionSpend,
  listSubscriptions,
  listUpcomingRenewals,
  type Subscription,
} from "@/lib/subscriptions";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function SubscriptionsIndexScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [items, setItems] = useState<Subscription[]>([]);
  const [upcoming, setUpcoming] = useState<Subscription[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const [subscriptions, upcomingRows, spend] = await Promise.all([
        listSubscriptions(true),
        listUpcomingRenewals(30),
        getMonthlySubscriptionSpend(),
      ]);

      setItems(subscriptions);
      setUpcoming(upcomingRows);
      setMonthlyTotal(spend.monthlyTotal);
    } catch {
      setItems([]);
      setUpcoming([]);
      setMonthlyTotal(0);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader
        title="Subscriptions"
        subtitle={`Monthly total: GH₵${monthlyTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      />

      <Button title="Add subscription" onPress={() => router.push("/(tabs)/finance/subscriptions/create" as Href)} />

      {hasError ? (
        <Banner
          variant="error"
          title="Could not load subscriptions"
          message="Please try again."
          actionLabel="Retry"
          onActionPress={() => void refresh()}
        />
      ) : null}

      {isLoading ? (
        <View style={styles.loadingState}>
          <Spinner />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading subscriptions…</Text>
        </View>
      ) : null}

      {!isLoading && items.length === 0 ? (
        <EmptyState
          title="No subscriptions yet"
          message="Create your first subscription to track renewals."
          actionLabel="Add subscription"
          onActionPress={() => router.push("/(tabs)/finance/subscriptions/create" as Href)}
        />
      ) : null}

      {!isLoading && upcoming.length > 0 ? (
        <Card variant="outline" style={[styles.panel, { borderColor: theme.border }]}> 
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Upcoming renewals (30 days)</Text>
          {upcoming.slice(0, 3).map((item) => (
            <Text key={`upcoming-${item.id}`} style={[Typography.bodySM, { color: theme.foreground }]}>
              {item.subscriptionMeta.serviceName} · {new Date(item.nextRunAt).toLocaleDateString()}
            </Text>
          ))}
        </Card>
      ) : null}

      {!isLoading
        ? items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/(tabs)/finance/subscriptions/${item.id}` as Href)}
            >
              <Card variant="outline" style={[styles.panel, { borderColor: theme.border }]}> 
                <View style={styles.rowBetween}>
                  <Text style={[Typography.titleSM, { color: theme.foreground }]}>
                    {item.subscriptionMeta.serviceName}
                  </Text>
                  <Text
                    style={[
                      Typography.labelSM,
                      {
                        color: item.isActive ? theme.chart2 : theme.mutedForeground,
                        textTransform: "uppercase",
                      },
                    ]}
                  >
                    {item.subscriptionMeta.status}
                  </Text>
                </View>
                <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}> 
                  GH₵{item.amount.toFixed(2)} · {item.scheduleType} · next {new Date(item.nextRunAt).toLocaleDateString()}
                </Text>
              </Card>
            </Pressable>
          ))
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
  loadingState: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
  panel: { gap: UI_PRESETS.spacing.xs },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
});

import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter, type Href } from "expo-router";

import { Banner, Button, Card, EmptyState, SectionHeader, Spinner, Text, View } from "@/components";
import { listRecurringTransactions, type RecurringTransaction } from "@/lib/recurring";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function RecurringIndexScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const rows = await listRecurringTransactions(true);
      setItems(rows);
    } catch {
      setItems([]);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activeCount = items.filter((item) => item.isActive).length;
  const subscriptionsCount = items.filter((item) => item.isSubscription).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader
        title="Schedules"
        subtitle={`Active: ${activeCount} · Subscriptions: ${subscriptionsCount}`}
      />

      <Button title="Create schedule" onPress={() => router.push("/(tabs)/finance/recurring/create" as Href)} />

      {hasError ? (
        <Banner
          variant="error"
          title="Could not load schedules"
          message="Please try again."
          actionLabel="Retry"
          onActionPress={() => void refresh()}
        />
      ) : null}

      {isLoading ? (
        <View style={styles.loadingState}>
          <Spinner />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading schedules…</Text>
        </View>
      ) : null}

      {!isLoading && items.length === 0 ? (
        <EmptyState
          title="No schedules yet"
          message="Create a recurring schedule for automatic tracking."
          actionLabel="Create schedule"
          onActionPress={() => router.push("/(tabs)/finance/recurring/create" as Href)}
        />
      ) : null}

      {!isLoading
        ? items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/(tabs)/finance/recurring/${item.id}` as Href)}
            >
              <Card variant="outline" style={[styles.card, { borderColor: theme.border }]}> 
                <View style={styles.rowBetween}>
                  <Text style={[Typography.titleSM, { color: theme.foreground }]}>{item.note || item.kind}</Text>
                  <Text
                    style={[
                      Typography.labelSM,
                      { color: item.isActive ? theme.chart2 : theme.mutedForeground, textTransform: "uppercase" },
                    ]}
                  >
                    {item.isActive ? "Active" : "Paused"}
                  </Text>
                </View>

                <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}> 
                  {item.scheduleType} every {item.interval} · Next run {new Date(item.nextRunAt).toLocaleDateString()}
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
  card: { gap: UI_PRESETS.spacing.xs },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
});

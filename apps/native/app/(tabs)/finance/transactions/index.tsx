import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter, type Href } from "expo-router";

import { Banner, Button, Card, EmptyState, SectionHeader, Spinner, Text, View } from "@/components";
import { formatTransactionAmount, formatTransactionTime, listTransactions, type TransactionRecord } from "@/lib/transactions";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

const OPACITY = {
  pressed: 0.84,
};

export default function TransactionsIndexScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [items, setItems] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const refresh = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);

    try {
      const next = await listTransactions({ limit: 40 });
      setItems(next);
    } catch {
      setHasError(true);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader title="Transactions" subtitle="Latest activity across your accounts" />

      <Button title="Add transaction" onPress={() => router.push("/(tabs)/finance/transactions/create" as Href)} />

      {hasError ? (
        <Banner
          variant="error"
          title="Could not load transactions"
          message="Please check your connection and try again."
          actionLabel="Retry"
          onActionPress={() => void refresh()}
        />
      ) : null}

      {isLoading ? (
        <View style={styles.loadingState}>
          <Spinner />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading transactions…</Text>
        </View>
      ) : null}

      {!isLoading && items.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          message="Create your first transaction to start tracking account activity."
          actionLabel="Add transaction"
          onActionPress={() => router.push("/(tabs)/finance/transactions/create" as Href)}
        />
      ) : null}

      {!isLoading && items.length > 0
        ? items.map((transaction) => (
            <Pressable
              key={transaction.id}
              style={({ pressed }) => [styles.cardPressable, { opacity: pressed ? OPACITY.pressed : 1 }]}
              onPress={() => router.push(`/(tabs)/finance/transactions/${transaction.id}` as Href)}
            >
              <Card variant="outline" style={[styles.card, { borderColor: theme.border }]}> 
                <View style={styles.rowBetween}>
                  <Text style={[Typography.titleSM, { color: theme.foreground }]}>{transaction.title}</Text>
                  <Text
                    style={[
                      Typography.titleSM,
                      { color: transaction.direction === "in" ? theme.chart2 : theme.destructive },
                    ]}
                  >
                    {formatTransactionAmount(transaction.amount, transaction.direction, transaction.currencyCode)}
                  </Text>
                </View>

                <View style={styles.rowBetween}>
                  <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>
                    {transaction.category}
                  </Text>
                  <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}> 
                    {formatTransactionTime(transaction.occurredAt)}
                  </Text>
                </View>
              </Card>
            </Pressable>
          ))
        : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
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
  cardPressable: {
    borderRadius: UI_PRESETS.radius.lg,
  },
  card: {
    gap: UI_PRESETS.spacing.xs,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
});

import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";

import { Banner, Button, Card, SectionHeader, Spinner, Text, View } from "@/components";
import { formatTransactionAmount, formatTransactionTime, getTransaction, type TransactionRecord } from "@/lib/transactions";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [transaction, setTransaction] = useState<TransactionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) {
        setLoading(false);
        return;
      }

      const found = await getTransaction(id);
      setTransaction(found);
      setLoading(false);
    }

    void load();
  }, [id]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader title="Transaction Detail" subtitle={`ID: ${id ?? "unknown"}`} />

      {loading ? (
        <View style={styles.loadingState}>
          <Spinner />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading transaction…</Text>
        </View>
      ) : null}

      {!loading && !transaction ? (
        <Banner
          variant="error"
          title="Transaction not found"
          message="This transaction may have been removed or never existed."
        />
      ) : null}

      {!loading && transaction ? (
        <Card variant="outline" style={[styles.card, { borderColor: theme.border }]}> 
          <Text style={[Typography.titleSM, { color: theme.text }]}>{transaction.title}</Text>
          <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Category: {transaction.category}</Text>
          <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Account: {transaction.accountName}</Text>
          <Text
            style={[
              Typography.titleSM,
              {
                color: transaction.direction === "in" ? theme.chart2 : theme.destructive,
              },
            ]}
          >
            {formatTransactionAmount(transaction.amount, transaction.direction, transaction.currencyCode)}
          </Text>
          <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>
            {formatTransactionTime(transaction.createdAt)}
          </Text>
        </Card>
      ) : null}

      <Button title="Back to Accounts" variant="outline" onPress={() => router.replace("/(tabs)/finance/accounts" as Href)} />
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
    gap: UI_PRESETS.spacing.md,
    paddingTop: UI_PRESETS.spacing.screen,
  },
  loadingState: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
  card: {
    gap: UI_PRESETS.spacing.xs,
  },
});

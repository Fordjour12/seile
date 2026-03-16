import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";

import { toast } from "sonner-native";
import { Banner, Button, Card, SectionHeader, Spinner, Text, View } from "@/components";
import {
  formatTransactionAmount,
  formatTransactionTime,
  useDeleteTransaction,
  useReverseTransaction,
  useTransaction,
} from "@/lib/transactions";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const transaction = useTransaction(id);
  const deleteTransaction = useDeleteTransaction();
  const reverseTransaction = useReverseTransaction();
  const loading = Boolean(id) && transaction === undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleReverse() {
    if (!id) {
      return;
    }
    setIsSubmitting(true);
    try {
      await reverseTransaction(id);
      toast.success("Transaction reversed");
      router.replace("/(tabs)/finance/transactions" as Href);
    } catch (error) {
      toast.error("Could not reverse transaction", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!id) {
      return;
    }
    setIsSubmitting(true);
    try {
      await deleteTransaction(id, true);
      toast.success("Transaction deleted");
      router.replace("/(tabs)/finance/transactions" as Href);
    } catch (error) {
      toast.error("Could not delete transaction", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

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
          <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>
            Account: {transaction.accountName ?? transaction.accountId ?? "N/A"}
          </Text>
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

      {!loading && transaction ? (
        <Button
          title={isSubmitting ? "Reversing..." : "Reverse transaction"}
          onPress={handleReverse}
          disabled={isSubmitting}
        />
      ) : null}

      {!loading && transaction ? (
        <Button
          title={isSubmitting ? "Deleting..." : "Delete transaction"}
          variant="destructive"
          onPress={handleDelete}
          disabled={isSubmitting}
        />
      ) : null}

      <Button
        title="Back to Transactions"
        variant="outline"
        onPress={() => router.replace("/(tabs)/finance/transactions" as Href)}
      />
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

import { EmptyState, Text, View, Badge } from "@/components";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";

import { NAV_THEME, Typography } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { listDebtPlans, type DebtPlan } from "@/lib/debt";
import { useRouter, type Href } from "expo-router";

export default function Index() {
  const [items, setItems] = useState<DebtPlan[]>([]);
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();

  useEffect(() => {
    void listDebtPlans().then(setItems).catch(() => setItems([]));
  }, []);

  if (items.length === 0) {
    return (
      <EmptyState
        title="No debt plans yet"
        message="Create and edit debt plans is coming soon."
        actionLabel="Coming soon"
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {items.map((item) => (
        <View key={item.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <View style={styles.row}>
            <Text style={[Typography.titleSM, { color: theme.text }]}>{item.name}</Text>
            <Text style={[Typography.labelSM, { color: theme.text }]}>{item.debtType}</Text>
          </View>
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Current: {item.currentBalance.toFixed(2)}</Text>
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Original: {item.originalBalance.toFixed(2)}</Text>
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Monthly due: {item.monthlyDue.toFixed(2)}</Text>
          {item.apr !== undefined ? <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>APR: {item.apr}%</Text> : null}
          {item.balanceExceedsOriginal ? <Badge color="warning" variant="subtle">Balance exceeds original</Badge> : null}
          <View style={styles.row}>
            <Pressable onPress={() => router.push(`/(tabs)/finance/debt/${item.id}/update` as Href)}>
              <Text style={[Typography.labelSM, { color: theme.primary }]}>Edit (coming soon)</Text>
            </Pressable>
            <Pressable onPress={() => router.push(`/(tabs)/finance/debt/${item.id}/delete` as Href)}>
              <Text style={[Typography.labelSM, { color: theme.chart4 }]}>Delete (coming soon)</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

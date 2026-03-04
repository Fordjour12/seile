import { EmptyState, Text, View, BudgetEnvelopesList, type BudgetEnvelope, SectionHeader } from "@/components";
import { getActivePeriod, listEnvelopes } from "@/lib/budget";
import { NAV_THEME, Typography } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function BudgetScreen() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [periodLabel, setPeriodLabel] = useState<string | null>(null);
  const [incomeTarget, setIncomeTarget] = useState(0);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [unallocated, setUnallocated] = useState(0);
  const [envelopes, setEnvelopes] = useState<BudgetEnvelope[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const active = await getActivePeriod();
        if (!active) {
          setPeriodLabel(null);
          setEnvelopes([]);
          return;
        }

        setPeriodLabel(`${active.year}-${String(active.month).padStart(2, "0")}`);
        setIncomeTarget(active.incomeTarget);
        setTotalAllocated(active.totalAllocated);
        setUnallocated(active.unallocated);

        const rows = await listEnvelopes(active.id);
        setEnvelopes(
          rows.map((row) => ({
            id: row.id,
            name: row.name,
            budgeted: row.effectiveAllocation,
            spent: row.actualSpend,
            color: row.color ?? theme.chart2,
            icon: row.icon,
          })),
        );
      } catch {
        setEnvelopes([]);
      }
    }

    void load();
  }, [theme.chart2]);

  if (!periodLabel) {
    return (
      <EmptyState
        title="No active budget"
        message="Create and activate a period to start envelope budgeting."
        actionLabel="Coming soon"
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionHeader title="Budget Period" subtitle={periodLabel} />
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> 
        <Text style={[Typography.bodyMD, { color: theme.text }]}>Income target: {incomeTarget.toFixed(2)}</Text>
        <Text style={[Typography.bodyMD, { color: theme.text }]}>Allocated: {totalAllocated.toFixed(2)}</Text>
        <Text style={[Typography.labelSM, { color: unallocated < 0 ? theme.destructive : unallocated === 0 ? theme.chart4 : theme.chart2 }]}>
          Unallocated: {unallocated.toFixed(2)}
        </Text>
      </View>
      <SectionHeader title="Envelopes" subtitle="ACTIVE PERIOD" />
      <BudgetEnvelopesList envelopes={envelopes} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
});

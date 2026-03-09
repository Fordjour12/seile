import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";

import { BudgetPeriodForm, SectionHeader, type BudgetPeriodFormValues } from "@/components";
import {
  type CreateBudgetPeriodPayload,
  useActivateBudgetPeriod,
  useCreateBudgetPeriod,
} from "@/lib/budget";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function CreateBudgetPeriodScreen() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const createBudgetPeriod = useCreateBudgetPeriod();
  const activateBudgetPeriod = useActivateBudgetPeriod();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (values: BudgetPeriodFormValues) => {
    setLoading(true);
    try {
      const payload: CreateBudgetPeriodPayload = {
        year: Number(values.year),
        month: Number(values.month),
        currencyCode: "GHS",
        incomeTarget: Number(values.incomeTarget),
        notes: values.notes || undefined,
      };
      const period = await createBudgetPeriod(payload);
      await activateBudgetPeriod(period.id);
      toast.success("Budget period created", {
        description: `${payload.year}-${String(payload.month).padStart(2, "0")} is now active.`,
      });
      router.replace("/(tabs)/finance/budget" as Href);
    } catch (error) {
      toast.error("Could not create budget period", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.background }]} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <SectionHeader title="Create Budget Period" subtitle="Start a monthly budget and set the income target" />
      <BudgetPeriodForm mode="create" submitLabel="Create budget period" loading={loading} onSubmit={handleCreate} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingTop: UI_PRESETS.spacing.lg,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.md,
  },
});

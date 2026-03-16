import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";

import { DebtForm, type DebtFormValues, SectionHeader } from "@/components";
import { type CreateDebtPlanPayload, type DebtPlanStatus, useCreateDebtPlan } from "@/lib/debt";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function CreateDebtScreen() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const createDebtPlan = useCreateDebtPlan();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (values: DebtFormValues) => {
    setLoading(true);

    try {
      const payload: CreateDebtPlanPayload & { status: DebtPlanStatus } = {
        name: values.name,
        debtType: values.debtType,
        currencyCode: "GHS",
        originalBalance: Number(values.originalBalance),
        currentBalance: Number(values.currentBalance),
        monthlyDue: Number(values.monthlyDue),
        apr: values.apr.trim() ? Number(values.apr) : undefined,
        status: values.isActive ? "active" : "draft",
      };

      await createDebtPlan(payload);
      toast.success("Debt plan created", {
        description: `${payload.name} is ready to track.`,
      });
      router.replace("/(tabs)/finance/debt" as Href);
    } catch (error) {
      toast.error("Could not create debt plan", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <SectionHeader title="Create Debt" subtitle="Set up a debt plan with balances and payoff details" />
      <DebtForm mode="create" submitLabel="Create debt plan" loading={loading} onSubmit={handleCreate} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingTop: UI_PRESETS.spacing.lg,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.md,
  },
});

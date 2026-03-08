import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";

import { SavingsForm, SectionHeader, type SavingsFormValues } from "@/components";
import { listAccounts } from "@/lib/accounts";
import { listCategories } from "@/lib/categories";
import { createSavingsGoal, type CreateSavingsGoalPayload } from "@/lib/savings";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function CreateSavingsScreen() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([] as Awaited<ReturnType<typeof listAccounts>>);
  const [categories, setCategories] = useState([] as Awaited<ReturnType<typeof listCategories>>);

  useEffect(() => {
    void Promise.all([listAccounts(), listCategories()]).then(([nextAccounts, nextCategories]) => {
      setAccounts(nextAccounts);
      setCategories(nextCategories);
    });
  }, []);

  const handleCreate = async (values: SavingsFormValues) => {
    setLoading(true);
    try {
      const payload: CreateSavingsGoalPayload = {
        name: values.name,
        status: values.isActive ? "active" : "draft",
        currencyCode: "GHS",
        targetAmount: Number(values.targetAmount),
        currentAmount: Number(values.currentAmount),
        monthlyContribution: values.monthlyContribution ? Number(values.monthlyContribution) : undefined,
        targetDate: values.targetDate,
        linkedAccountId: values.linkedAccountId,
        categoryId: values.categoryId,
        notes: values.notes || undefined,
      };
      const goal = await createSavingsGoal(payload);
      toast.success("Savings goal created", { description: `${goal.name} is ready to track.` });
      router.replace("/(tabs)/finance/savings" as Href);
    } catch (error) {
      toast.error("Could not create savings goal", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.background }]} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <SectionHeader title="Create Savings Goal" subtitle="Set your target, progress, and monthly plan" />
      <SavingsForm
        mode="create"
        accounts={accounts}
        categories={categories}
        submitLabel="Create savings goal"
        loading={loading}
        onSubmit={handleCreate}
      />
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

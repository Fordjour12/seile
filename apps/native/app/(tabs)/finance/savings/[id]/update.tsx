import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";

import { Banner, Button, SavingsForm, SectionHeader, Spinner, Text, View, type SavingsFormValues } from "@/components";
import { listAccounts } from "@/lib/accounts";
import { listCategories } from "@/lib/categories";
import { getSavingsGoalById, updateSavingsGoal, type SavingsGoal, type UpdateSavingsGoalPayload } from "@/lib/savings";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function UpdateSavingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [accounts, setAccounts] = useState([] as Awaited<ReturnType<typeof listAccounts>>);
  const [categories, setCategories] = useState([] as Awaited<ReturnType<typeof listCategories>>);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) {
        setError("Savings goal ID is missing.");
        setIsLoading(false);
        return;
      }
      try {
        const [found, nextAccounts, nextCategories] = await Promise.all([
          getSavingsGoalById(id),
          listAccounts(),
          listCategories(),
        ]);
        setGoal(found);
        setAccounts(nextAccounts);
        setCategories(nextCategories);
      } catch {
        setError("Savings goal not found.");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [id]);

  const handleUpdate = async (values: SavingsFormValues) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const payload: UpdateSavingsGoalPayload = {
        name: values.name,
        status: values.isActive ? "active" : "draft",
        targetAmount: Number(values.targetAmount),
        currentAmount: Number(values.currentAmount),
        monthlyContribution: values.monthlyContribution ? Number(values.monthlyContribution) : undefined,
        targetDate: values.targetDate,
        linkedAccountId: values.linkedAccountId,
        categoryId: values.categoryId,
        notes: values.notes || undefined,
      };
      const updated = await updateSavingsGoal(id, payload);
      setGoal(updated);
      toast.success("Savings goal updated", { description: `${updated.name} has been saved.` });
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : "That savings goal could not be updated.";
      setError(message);
      toast.error("Update failed", { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.background }]} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <SectionHeader title="Update Savings Goal" subtitle={id ? `Goal ID: ${id}` : "Savings goal"} />
      {error ? (
        <Banner variant="error" title="Update issue" message={error} actionLabel="Back" onActionPress={() => router.replace("/(tabs)/finance/savings" as Href)} />
      ) : null}
      {isLoading ? (
        <View style={styles.loadingState}>
          <Spinner />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading savings goal…</Text>
        </View>
      ) : null}
      {!isLoading && goal ? (
        <SavingsForm
          mode="update"
          accounts={accounts}
          categories={categories}
          submitLabel="Save changes"
          loading={loading}
          initialValues={{
            name: goal.name,
            targetAmount: `${goal.targetAmount}`,
            currentAmount: `${goal.currentAmount}`,
            monthlyContribution: goal.monthlyContribution !== undefined ? `${goal.monthlyContribution}` : "",
            targetDate: goal.targetDate,
            linkedAccountId: goal.linkedAccountId,
            categoryId: goal.categoryId,
            notes: goal.notes ?? "",
            isActive: goal.status === "active",
          }}
          onSubmit={handleUpdate}
        />
      ) : null}
      {!isLoading && goal ? (
        <Button
          title="Delete savings goal"
          variant="destructive"
          onPress={() => router.push(`/(tabs)/finance/savings/${goal.id}/delete` as Href)}
          disabled={loading}
          style={styles.actionButton}
        />
      ) : null}
      <Button title="Back to savings" variant="outline" onPress={() => router.replace("/(tabs)/finance/savings" as Href)} style={styles.actionButton} />
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
  loadingState: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
    paddingHorizontal: UI_PRESETS.spacing.section,
  },
  actionButton: {
    marginHorizontal: UI_PRESETS.spacing.section,
  },
});

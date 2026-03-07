import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";

import { Banner, Button, DebtForm, Spinner, Text, View, type DebtFormValues, SectionHeader } from "@/components";
import { getDebtPlanById, updateDebtPlan, type DebtPlan, type UpdateDebtPlanPayload } from "@/lib/debt";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function UpdateDebtScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [debtPlan, setDebtPlan] = useState<DebtPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) {
        setError("Debt plan ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const found = await getDebtPlanById(id);
        setDebtPlan(found);
      } catch {
        setError("Debt plan not found.");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [id]);

  const handleUpdate = async (values: DebtFormValues) => {
    if (!id) {
      setError("Debt plan ID is missing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: UpdateDebtPlanPayload = {
        name: values.name,
        debtType: values.debtType,
        originalBalance: Number(values.originalBalance),
        currentBalance: Number(values.currentBalance),
        monthlyDue: Number(values.monthlyDue),
        apr: values.apr.trim() ? Number(values.apr) : undefined,
        status: values.isActive ? "active" : "draft",
      };

      const updated = await updateDebtPlan(id, payload);
      setDebtPlan(updated);
      toast.success("Debt plan updated", {
        description: `${updated.name} has been saved.`,
      });
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : "That debt plan could not be updated.";
      setError(message);
      toast.error("Update failed", {
        description: message,
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
      <SectionHeader title="Update Debt" subtitle={id ? `Debt plan ID: ${id}` : "Debt plan"} />

      {error ? (
        <Banner
          variant="error"
          title="Update issue"
          message={error}
          actionLabel="Back"
          onActionPress={() => router.replace("/(tabs)/finance/debt" as Href)}
        />
      ) : null}

      {isLoading ? (
        <View style={styles.loadingState}>
          <Spinner />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading debt plan…</Text>
        </View>
      ) : null}

      {!isLoading && debtPlan ? (
        <DebtForm
          mode="update"
          submitLabel="Save changes"
          loading={loading}
          initialValues={{
            name: debtPlan.name,
            debtType: debtPlan.debtType,
            originalBalance: `${debtPlan.originalBalance}`,
            currentBalance: `${debtPlan.currentBalance}`,
            monthlyDue: `${debtPlan.monthlyDue}`,
            apr: debtPlan.apr !== undefined ? `${debtPlan.apr}` : "",
            isActive: debtPlan.status === "active",
          }}
          onSubmit={handleUpdate}
        />
      ) : null}

      {!isLoading && debtPlan ? (
        <Button
          title="Delete debt plan"
          variant="destructive"
          onPress={() => router.push(`/(tabs)/finance/debt/${debtPlan.id}/delete` as Href)}
          disabled={loading}
          style={styles.actionButton}
        />
      ) : null}

      <Button
        title="Back to debt"
        variant="outline"
        onPress={() => router.replace("/(tabs)/finance/debt" as Href)}
        style={styles.actionButton}
      />
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

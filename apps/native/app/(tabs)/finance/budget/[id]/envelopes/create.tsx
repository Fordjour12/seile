import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";

import { BudgetEnvelopeForm, SectionHeader, type BudgetEnvelopeFormValues } from "@/components";
import { useCategories } from "@/lib/categories";
import {
  type CreateBudgetEnvelopePayload,
  useCreateEnvelope,
} from "@/lib/budget";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function CreateBudgetEnvelopeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const categories = useCategories() ?? [];
  const createEnvelope = useCreateEnvelope();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (values: BudgetEnvelopeFormValues) => {
    if (!id || !values.categoryId) return;
    setLoading(true);
    try {
      const payload: CreateBudgetEnvelopePayload = {
        periodId: id,
        categoryId: values.categoryId,
        allocatedAmount: Number(values.allocatedAmount),
        rolloverEnabled: values.rolloverEnabled,
        notes: values.notes || undefined,
      };
      await createEnvelope(payload);
      toast.success("Envelope created");
      router.replace(`/(tabs)/finance/budget/${id}/update` as Href);
    } catch (error) {
      toast.error("Could not create envelope", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.background }]} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <SectionHeader title="Create Envelope" subtitle="Add a new budget envelope to this period" />
      <BudgetEnvelopeForm
        mode="create"
        categories={categories}
        submitLabel="Create envelope"
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

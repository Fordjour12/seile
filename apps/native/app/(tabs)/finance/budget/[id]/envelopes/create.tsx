import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";

import { BudgetEnvelopeForm, SectionHeader, type BudgetEnvelopeFormValues } from "@/components";
import { listCategories } from "@/lib/categories";
import { createEnvelope, type CreateBudgetEnvelopePayload } from "@/lib/budget";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function CreateBudgetEnvelopeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([] as Awaited<ReturnType<typeof listCategories>>);

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategories(await listCategories());
      } catch (error) {
        toast.error("Could not load categories", {
          description: error instanceof Error ? error.message : "Please try again.",
        });
      }
    }

    void loadCategories();
  }, []);

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
      const envelope = await createEnvelope(payload);
      toast.success("Envelope created", { description: `${envelope.name} is ready to track.` });
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

import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";

import { Banner, BudgetEnvelopeForm, Button, SectionHeader, Spinner, Text, View, type BudgetEnvelopeFormValues } from "@/components";
import { getEnvelopeById, updateEnvelope, type BudgetEnvelopeWithComputed, type UpdateBudgetEnvelopePayload } from "@/lib/budget";
import { listCategories } from "@/lib/categories";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function UpdateBudgetEnvelopeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [envelope, setEnvelope] = useState<BudgetEnvelopeWithComputed | null>(null);
  const [categories, setCategories] = useState([] as Awaited<ReturnType<typeof listCategories>>);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) {
        setError("Envelope ID is missing.");
        setIsLoading(false);
        return;
      }
      try {
        const [found, nextCategories] = await Promise.all([getEnvelopeById(id), listCategories()]);
        setEnvelope(found);
        setCategories(nextCategories);
      } catch {
        setError("Envelope not found.");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [id]);

  const handleUpdate = async (values: BudgetEnvelopeFormValues) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const payload: UpdateBudgetEnvelopePayload = {
        allocatedAmount: Number(values.allocatedAmount),
        rolloverEnabled: values.rolloverEnabled,
        notes: values.notes || undefined,
      };
      const updated = await updateEnvelope(id, payload);
      setEnvelope(updated);
      toast.success("Envelope updated", { description: `${updated.name} has been saved.` });
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : "That envelope could not be updated.";
      setError(message);
      toast.error("Update failed", { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.background }]} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <SectionHeader title="Update Envelope" subtitle={id ? `Envelope ID: ${id}` : "Envelope"} />
      {error ? <Banner variant="error" title="Envelope issue" message={error} actionLabel="Back" onActionPress={() => router.replace("/(tabs)/finance/budget" as Href)} /> : null}
      {isLoading ? (
        <View style={styles.loadingState}>
          <Spinner />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading envelope…</Text>
        </View>
      ) : null}
      {!isLoading && envelope ? (
        <BudgetEnvelopeForm
          mode="update"
          categories={categories}
          submitLabel="Save changes"
          loading={loading}
          initialValues={{
            categoryId: envelope.categoryId,
            allocatedAmount: `${envelope.allocatedAmount}`,
            rolloverEnabled: envelope.rolloverEnabled,
            notes: envelope.notes ?? "",
          }}
          onSubmit={handleUpdate}
        />
      ) : null}
      {!isLoading && envelope ? (
        <Button title="Delete envelope" variant="destructive" onPress={() => router.push(`/(tabs)/finance/budget/envelopes/${envelope.id}/delete` as Href)} style={styles.backButton} />
      ) : null}
      <Button title="Back to budget" variant="outline" onPress={() => router.replace("/(tabs)/finance/budget" as Href)} style={styles.backButton} />
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
  backButton: {
    marginHorizontal: UI_PRESETS.spacing.section,
  },
});

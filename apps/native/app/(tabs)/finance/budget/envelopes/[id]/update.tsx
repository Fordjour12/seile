import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";

import { Banner, BudgetEnvelopeForm, Button, SectionHeader, Spinner, Text, View, type BudgetEnvelopeFormValues } from "@/components";
import {
  type UpdateBudgetEnvelopePayload,
  useBudgetEnvelope,
  useUpdateEnvelope,
} from "@/lib/budget";
import { useCategories } from "@/lib/categories";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function UpdateBudgetEnvelopeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const categories = useCategories() ?? [];
  const envelope = useBudgetEnvelope(id);
  const updateEnvelope = useUpdateEnvelope();
  const isLoading = Boolean(id) && envelope === undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const derivedError =
    error ??
    (!id
      ? "Envelope ID is missing."
      : !isLoading && !envelope
        ? "Envelope not found."
        : null);

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
      await updateEnvelope(id, payload);
      toast.success("Envelope updated", { description: `${envelope?.name ?? "Envelope"} has been saved.` });
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
      {derivedError ? <Banner variant="error" title="Envelope issue" message={derivedError} actionLabel="Back" onActionPress={() => router.replace("/(tabs)/finance/budget" as Href)} /> : null}
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

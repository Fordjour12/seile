import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";

import { Alert, Banner, Button, Card, Dialog, EmptyState, SectionHeader, Spinner, Text, View } from "@/components";
import {
  formatBudgetAmount,
  useBudgetEnvelope,
  useDeleteEnvelope,
} from "@/lib/budget";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function DeleteBudgetEnvelopeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const envelope = useBudgetEnvelope(id);
  const deleteEnvelope = useDeleteEnvelope();
  const isLoading = Boolean(id) && envelope === undefined;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const derivedError =
    error ??
    (!id
      ? "Envelope ID is missing."
      : !isLoading && !envelope
        ? "Envelope not found."
        : null);

  const onDelete = async () => {
    if (!id) return;
    setShowDialog(false);
    setIsDeleting(true);
    setError(null);
    try {
      const result = await deleteEnvelope(id);
      toast.success("Envelope deleted", {
        description: result.softArchived ? "Envelope spend activity prevented full deletion." : `${envelope?.name ?? "Envelope"} was removed.`,
      });
      router.replace("/(tabs)/finance/budget" as Href);
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Deletion failed. Try again.";
      setError(message);
      toast.error("Delete failed", { description: message });
    } finally {
      setIsDeleting(false);
    }
  };

  const notFound = !isLoading && !envelope;

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <SectionHeader title="Delete Envelope" subtitle={`Envelope ID: ${id ?? "unknown"}`} />
      {derivedError ? <Banner variant="error" title="Delete failed" message={derivedError} actionLabel="Dismiss" onActionPress={() => setError(null)} /> : null}
      {isLoading ? (
        <View style={styles.stateRow}>
          <Spinner />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading envelope…</Text>
        </View>
      ) : null}
      {notFound ? (
        <EmptyState title="Envelope not found" message="This envelope no longer exists." actionLabel="Back to budget" onActionPress={() => router.replace("/(tabs)/finance/budget" as Href)} />
      ) : null}
      {!isLoading && envelope ? (
        <Card variant="outline" style={[styles.confirmCard, { borderColor: theme.border }]}> 
          <Text style={[Typography.titleSM, { color: theme.text }]}>Delete {envelope.name}?</Text>
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Delete this envelope if it is no longer needed in the current period.</Text>
          <Alert
            variant="error"
            title="Spend activity may block full deletion"
            message={`Allocated amount: ${formatBudgetAmount(envelope.allocatedAmount, "GHS")}. If spending exists, the backend will keep the envelope and zero out the allocation.`}
          />
          {isDeleting ? (
            <View style={styles.stateRow}>
              <Spinner />
              <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Deleting envelope…</Text>
            </View>
          ) : null}
          <View style={styles.actions}>
            <Button title="Cancel" variant="outline" onPress={() => router.back()} />
            <Button title="Delete Envelope" variant="destructive" onPress={() => setShowDialog(true)} loading={isDeleting} />
          </View>
        </Card>
      ) : null}
      <Dialog
        visible={showDialog}
        title="Confirm deletion"
        description="Deleting removes the envelope if it has no spend activity in the period."
        confirmLabel="Yes, delete"
        cancelLabel="Keep envelope"
        tone="destructive"
        onCancel={() => setShowDialog(false)}
        onConfirm={onDelete}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.lg,
  },
  confirmCard: { gap: UI_PRESETS.spacing.md },
  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
  actions: {
    gap: UI_PRESETS.spacing.sm,
    marginTop: UI_PRESETS.spacing.sm,
  },
});

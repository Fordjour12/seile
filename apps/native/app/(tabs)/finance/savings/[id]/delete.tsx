import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";

import { Alert, Banner, Button, Card, Dialog, EmptyState, SectionHeader, Spinner, Text, View } from "@/components";
import { archiveSavingsGoal, formatSavingsAmount, getSavingsGoalById, type SavingsGoal } from "@/lib/savings";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function DeleteSavingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) {
        setError("Savings goal ID is missing.");
        setIsLoading(false);
        return;
      }
      try {
        const found = await getSavingsGoalById(id);
        setGoal(found);
      } catch {
        setError("Savings goal not found.");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [id]);

  const onDelete = async () => {
    if (!id) return;
    setShowDialog(false);
    setIsDeleting(true);
    setError(null);
    try {
      const success = await archiveSavingsGoal(id);
      if (!success) {
        throw new Error("Archiving failed. Try again.");
      }
      toast.success("Savings goal archived", { description: `${goal?.name ?? "Savings goal"} was archived.` });
      router.replace("/(tabs)/finance/savings" as Href);
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Archiving failed. Try again.";
      setError(message);
      toast.error("Archive failed", { description: message });
    } finally {
      setIsDeleting(false);
    }
  };

  const notFound = !isLoading && !goal;

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <SectionHeader title="Delete Savings Goal" subtitle={`Goal ID: ${id ?? "unknown"}`} />
      {error ? <Banner variant="error" title="Archive failed" message={error} actionLabel="Dismiss" onActionPress={() => setError(null)} /> : null}
      {isLoading ? (
        <View style={styles.stateRow}>
          <Spinner />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading savings goal…</Text>
        </View>
      ) : null}
      {notFound ? (
        <EmptyState
          title="Savings goal not found"
          message="This goal no longer exists, so there is nothing to archive."
          actionLabel="Back to savings"
          onActionPress={() => router.replace("/(tabs)/finance/savings" as Href)}
        />
      ) : null}
      {!isLoading && goal ? (
        <Card variant="outline" style={[styles.confirmCard, { borderColor: theme.border }]}> 
          <Text style={[Typography.titleSM, { color: theme.text }]}>Archive {goal.name}?</Text>
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>This removes the goal from active planning while keeping historical data.</Text>
          <Alert
            variant="error"
            title="This action cannot be undone"
            message={`Savings goal with ${formatSavingsAmount(goal.currentAmount, goal.currencyCode)} saved will be archived.`}
          />
          {isDeleting ? (
            <View style={styles.stateRow}>
              <Spinner />
              <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Archiving savings goal…</Text>
            </View>
          ) : null}
          <View style={styles.actions}>
            <Button title="Cancel" variant="outline" onPress={() => router.back()} />
            <Button title="Delete Goal" variant="destructive" onPress={() => setShowDialog(true)} loading={isDeleting} />
          </View>
        </Card>
      ) : null}
      <Dialog
        visible={showDialog}
        title="Confirm archive"
        description="Archiving removes this goal from active planning while preserving historical data."
        confirmLabel="Yes, archive"
        cancelLabel="Keep goal"
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

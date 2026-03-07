import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";

import { Alert, Banner, Button, Card, Dialog, EmptyState, SectionHeader, Spinner, Text, View } from "@/components";
import { archiveDebtPlan, formatDebtAmount, formatDebtType, getDebtPlanById, type DebtPlan } from "@/lib/debt";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function DeleteDebtScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [debtPlan, setDebtPlan] = useState<DebtPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
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

  const onDelete = async () => {
    if (!id) {
      setError("Debt plan ID is missing.");
      return;
    }

    setShowDialog(false);
    setIsDeleting(true);
    setError(null);

    try {
      const success = await archiveDebtPlan(id);
      if (!success) {
        throw new Error("Archiving failed. Try again.");
      }

      toast.success("Debt plan archived", {
        description: `${debtPlan?.name ?? "Debt plan"} was archived.`,
      });
      router.replace("/(tabs)/finance/debt" as Href);
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Archiving failed. Try again.";
      setError(message);
      toast.error("Archive failed", {
        description: message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const notFound = !isLoading && !debtPlan;

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <SectionHeader title="Delete Debt" subtitle={`Debt ID: ${id ?? "unknown"}`} />

      {error ? (
        <Banner
          variant="error"
          title="Archive failed"
          message={error}
          actionLabel="Dismiss"
          onActionPress={() => setError(null)}
        />
      ) : null}

      {isLoading ? (
        <View style={styles.deletingState}>
          <Spinner />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading debt plan…</Text>
        </View>
      ) : null}

      {notFound ? (
        <EmptyState
          title="Debt plan not found"
          message="This debt plan no longer exists, so there is nothing to archive."
          actionLabel="Back to debt"
          onActionPress={() => router.replace("/(tabs)/finance/debt" as Href)}
        />
      ) : null}

      {!isLoading && debtPlan ? (
        <Card variant="outline" style={[styles.confirmCard, { borderColor: theme.border }]}>
          <Text style={[Typography.titleSM, { color: theme.text }]}>Archive {debtPlan.name}?</Text>
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>
            This removes the debt plan from active workflows but keeps the history.
          </Text>

          <Alert
            variant="error"
            title="This action cannot be undone"
            message={`${formatDebtType(debtPlan.debtType)} debt with ${formatDebtAmount(debtPlan.currentBalance, debtPlan.currencyCode)} will be archived.`}
          />

          {isDeleting ? (
            <View style={styles.deletingState}>
              <Spinner />
              <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Archiving debt plan…</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Button title="Cancel" variant="outline" onPress={() => router.back()} />
            <Button title="Delete Debt" variant="destructive" onPress={() => setShowDialog(true)} loading={isDeleting} />
          </View>
        </Card>
      ) : null}

      <Dialog
        visible={showDialog}
        title="Confirm archive"
        description="Archiving removes this debt plan from active planning while preserving historical data."
        confirmLabel="Yes, archive"
        cancelLabel="Keep debt plan"
        tone="destructive"
        onCancel={() => setShowDialog(false)}
        onConfirm={onDelete}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.lg,
  },
  confirmCard: {
    gap: UI_PRESETS.spacing.md,
  },
  deletingState: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
  actions: {
    gap: UI_PRESETS.spacing.sm,
    marginTop: UI_PRESETS.spacing.sm,
  },
});

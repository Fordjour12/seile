import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";

import { Banner, BudgetPeriodForm, Button, ListItem, SectionHeader, Spinner, Text, View, type BudgetPeriodFormValues } from "@/components";
import {
  formatBudgetAmount,
  mapBudgetEnvelopeListItem,
  type UpdateBudgetPeriodPayload,
  useActivateBudgetPeriod,
  useArchiveBudgetPeriod,
  useBudgetEnvelopes,
  useBudgetPeriod,
  useCloseBudgetPeriod,
  useCopyPreviousBudgetPeriod,
  useUpdateBudgetPeriod,
} from "@/lib/budget";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function UpdateBudgetPeriodScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const period = useBudgetPeriod(id);
  const envelopes = useBudgetEnvelopes(id);
  const updateBudgetPeriod = useUpdateBudgetPeriod();
  const activateBudgetPeriod = useActivateBudgetPeriod();
  const copyPreviousBudgetPeriod = useCopyPreviousBudgetPeriod();
  const closeBudgetPeriod = useCloseBudgetPeriod();
  const archiveBudgetPeriod = useArchiveBudgetPeriod();
  const isLoading = Boolean(id) && (period === undefined || envelopes === undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const derivedError =
    error ??
    (!id
      ? "Budget period ID is missing."
      : !isLoading && !period
        ? "Budget period not found."
        : null);

  const handleUpdate = async (values: BudgetPeriodFormValues) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const payload: UpdateBudgetPeriodPayload = {
        incomeTarget: Number(values.incomeTarget),
        notes: values.notes || undefined,
      };
      await updateBudgetPeriod(id, payload);
      toast.success("Budget period updated", { description: "Budget period changes have been saved." });
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : "That budget period could not be updated.";
      setError(message);
      toast.error("Update failed", { description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!id) return;
    try {
      await activateBudgetPeriod(id);
      toast.success("Budget period activated", { description: "This period is now active." });
    } catch (error) {
      toast.error("Activation failed", { description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const handleCopyPrevious = async () => {
    if (!id) return;
    try {
      const result = await copyPreviousBudgetPeriod(id);
      toast.success("Copied previous period", {
        description: result.noPreviousPeriod ? "No previous period was available." : `${result.copiedCount} envelopes copied.`,
      });
    } catch (error) {
      toast.error("Copy failed", { description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const handleClose = async () => {
    if (!id) return;
    try {
      await closeBudgetPeriod(id);
      toast.success("Budget period closed", { description: "The active period has been closed." });
    } catch (error) {
      toast.error("Close failed", { description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const handleArchive = async () => {
    if (!id) return;
    try {
      await archiveBudgetPeriod(id);
      toast.success("Budget period archived", { description: "The period has been archived." });
      router.replace("/(tabs)/finance/budget" as Href);
    } catch (error) {
      toast.error("Archive failed", { description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.background }]} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <SectionHeader title="Manage Budget Period" subtitle={period ? `${period.year}-${String(period.month).padStart(2, "0")}` : "Budget period"} />
      {derivedError ? <Banner variant="error" title="Budget issue" message={derivedError} actionLabel="Back" onActionPress={() => router.replace("/(tabs)/finance/budget" as Href)} /> : null}
      {isLoading ? (
        <View style={styles.loadingState}>
          <Spinner />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading budget period…</Text>
        </View>
      ) : null}
      {!isLoading && period ? (
        <>
          <BudgetPeriodForm
            mode="update"
            submitLabel="Save changes"
            loading={loading}
            initialValues={{
              year: `${period.year}`,
              month: `${period.month}`,
              incomeTarget: `${period.incomeTarget}`,
              notes: period.notes ?? "",
            }}
            onSubmit={handleUpdate}
          />
          <View style={styles.actionGrid}>
            {period.status !== "active" ? <Button title="Activate Period" variant="outline" onPress={handleActivate} /> : null}
            <Button title="Copy Previous" variant="outline" onPress={handleCopyPrevious} />
            {period.status === "active" ? <Button title="Close Period" variant="outline" onPress={handleClose} /> : null}
            {period.status === "closed" ? <Button title="Archive Period" variant="destructive" onPress={handleArchive} /> : null}
            <Button title="Add Envelope" onPress={() => router.push(`/(tabs)/finance/budget/${period.id}/envelopes/create` as Href)} />
          </View>

          <View style={[styles.summaryCard, { borderColor: theme.border, backgroundColor: theme.card }]}> 
            <Text style={[Typography.titleSM, { color: theme.text }]}>Period Totals</Text>
            <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Allocated: {formatBudgetAmount(period.totalAllocated, period.currencyCode)}</Text>
            <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Actual spend: {formatBudgetAmount(period.totalActualSpend, period.currencyCode)}</Text>
            <Text style={[Typography.bodySM, { color: period.unallocated < 0 ? theme.destructive : theme.mutedForeground }]}>Unallocated: {formatBudgetAmount(period.unallocated, period.currencyCode)}</Text>
          </View>

          <View style={styles.list}>
            {(envelopes ?? []).map((envelope) => {
              const item = mapBudgetEnvelopeListItem(envelope, period.currencyCode);
              return (
                <ListItem
                  key={envelope.id}
                  title={item.title}
                  subtitle={`${item.subtitle} · Allocated ${formatBudgetAmount(envelope.effectiveAllocation, period.currencyCode)}`}
                  meta={item.balanceLabel}
                  onPress={() => router.push(`/(tabs)/finance/budget/envelopes/${envelope.id}/update` as Href)}
                  right={<Text style={[Typography.labelSM, { color: envelope.overspent ? theme.destructive : theme.primary }]}>{Math.round(envelope.spendPercent)}%</Text>}
                />
              );
            })}
          </View>
        </>
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
  actionGrid: {
    gap: UI_PRESETS.spacing.sm,
    paddingHorizontal: UI_PRESETS.spacing.section,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.lg,
    padding: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.xs,
    marginHorizontal: UI_PRESETS.spacing.section,
  },
  list: {
    gap: UI_PRESETS.spacing.sm,
    paddingHorizontal: UI_PRESETS.spacing.section,
  },
  backButton: {
    marginHorizontal: UI_PRESETS.spacing.section,
  },
});

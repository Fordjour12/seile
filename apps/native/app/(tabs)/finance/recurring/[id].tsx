import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";

import { Banner, Button, Card, SectionHeader, Spinner, Text, View } from "@/components";
import {
  deleteRecurringTransaction,
  getRecurringTransaction,
  pauseRecurringTransaction,
  resumeRecurringTransaction,
  type RecurringTransaction,
} from "@/lib/recurring";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function RecurringDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [item, setItem] = useState<RecurringTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) {
        setLoading(false);
        return;
      }
      const found = await getRecurringTransaction(id);
      setItem(found);
      setLoading(false);
    }

    void load();
  }, [id]);

  async function handlePauseResume() {
    if (!id || !item) return;

    setIsSubmitting(true);
    try {
      if (item.isActive) {
        await pauseRecurringTransaction(id);
        toast.success("Schedule paused");
      } else {
        await resumeRecurringTransaction(id);
        toast.success("Schedule resumed");
      }
      const refreshed = await getRecurringTransaction(id);
      setItem(refreshed);
    } catch (error) {
      toast.error("Could not update schedule", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await deleteRecurringTransaction(id, false);
      toast.success("Schedule deleted");
      router.replace("/(tabs)/finance/recurring" as Href);
    } catch (error) {
      toast.error("Could not delete schedule", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader title="Schedule Detail" subtitle={`ID: ${id ?? "unknown"}`} />

      {loading ? (
        <View style={styles.loadingState}>
          <Spinner />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading schedule…</Text>
        </View>
      ) : null}

      {!loading && !item ? (
        <Banner
          variant="error"
          title="Schedule not found"
          message="This schedule may have been removed."
        />
      ) : null}

      {!loading && item ? (
        <Card variant="outline" style={[styles.card, { borderColor: theme.border }]}> 
          <Text style={[Typography.titleSM, { color: theme.foreground }]}>{item.note || item.kind}</Text>
          <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Amount: {item.currencyCode} {item.amount.toFixed(2)}</Text>
          <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Schedule: {item.scheduleType} every {item.interval}</Text>
          <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Next run: {new Date(item.nextRunAt).toLocaleString()}</Text>
          <Text style={[Typography.captionSM, { color: item.isActive ? theme.chart2 : theme.destructive }]}> 
            {item.isActive ? "Active" : "Paused"}
          </Text>
        </Card>
      ) : null}

      {!loading && item ? (
        <Button
          title={isSubmitting ? "Updating..." : item.isActive ? "Pause schedule" : "Resume schedule"}
          onPress={handlePauseResume}
          disabled={isSubmitting}
        />
      ) : null}

      {!loading && item ? (
        <Button
          title={isSubmitting ? "Deleting..." : "Delete schedule"}
          variant="destructive"
          onPress={handleDelete}
          disabled={isSubmitting}
        />
      ) : null}

      <Button title="Back to schedules" variant="outline" onPress={() => router.replace("/(tabs)/finance/recurring" as Href)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingTop: UI_PRESETS.spacing.screen,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.md,
  },
  loadingState: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
  card: { gap: UI_PRESETS.spacing.xs },
});

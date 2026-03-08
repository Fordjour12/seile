import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";

import { Banner, Button, Card, SectionHeader, Spinner, Text, View } from "@/components";
import { cancelSubscription, getSubscription, type Subscription } from "@/lib/subscriptions";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [item, setItem] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) {
        setLoading(false);
        return;
      }
      const found = await getSubscription(id);
      setItem(found);
      setLoading(false);
    }

    void load();
  }, [id]);

  async function onCancel() {
    if (!id) {
      return;
    }

    setIsSubmitting(true);
    try {
      await cancelSubscription(id);
      toast.success("Subscription cancelled");
      router.replace("/(tabs)/finance/recurring" as Href);
    } catch (error) {
      toast.error("Could not cancel subscription", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader title="Subscription Detail" subtitle={`ID: ${id ?? "unknown"}`} />

      {loading ? (
        <View style={styles.loadingState}>
          <Spinner />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading subscription…</Text>
        </View>
      ) : null}

      {!loading && !item ? (
        <Banner
          variant="error"
          title="Subscription not found"
          message="This subscription may have been removed."
        />
      ) : null}

      {!loading && item ? (
        <Card variant="outline" style={[styles.card, { borderColor: theme.border }]}>
          <Text style={[Typography.titleSM, { color: theme.foreground }]}>{item.subscriptionMeta.serviceName}</Text>
          <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Status: {item.subscriptionMeta.status}</Text>
          <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Amount: {item.currencyCode} {item.amount.toFixed(2)}</Text>
          <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Next renewal: {new Date(item.nextRunAt).toLocaleDateString()}</Text>
        </Card>
      ) : null}

      {!loading && item ? (
        <Button
          title={isSubmitting ? "Cancelling..." : "Cancel subscription"}
          variant="destructive"
          onPress={onCancel}
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

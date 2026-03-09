import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { toast } from "sonner-native";

import { Badge, Button, Card, EmptyState, ListItem, SectionHeader, Text, View } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { formatPrayerStatus, useCreatePrayer, usePrayers, useUpdatePrayerStatus } from "@/lib/spiritual";

import { FaithField } from "./faith-shared";

export function FaithPrayersScreen() {
  const prayers = usePrayers();
  const createPrayer = useCreatePrayer();
  const updateStatus = useUpdatePrayerStatus();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Prayer title is required");
      return;
    }

    setLoading(true);
    try {
      await createPrayer({
        title,
        category: category || undefined,
        description: description || undefined,
      });
      toast.success("Prayer entry added");
      setTitle("");
      setCategory("");
      setDescription("");
    } catch (error) {
      toast.error("Could not save prayer", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id: string, status: "answered" | "archived") => {
    setUpdatingId(id);
    try {
      await updateStatus(id, status);
      toast.success(status === "answered" ? "Prayer marked as answered" : "Prayer archived");
    } catch (error) {
      toast.error("Could not update prayer", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <SectionHeader title="Prayer Journal" subtitle="REQUESTS, INTERCESSION, ANSWERS" />

      <Card style={styles.formCard}>
        <Text variant="h3">New prayer entry</Text>
        <FaithField label="Title" value={title} onChangeText={setTitle} placeholder="Pray for wisdom in this decision" />
        <FaithField label="Category" value={category} onChangeText={setCategory} placeholder="Family, health, work, church" />
        <FaithField label="Description" value={description} onChangeText={setDescription} placeholder="Optional notes or names" multiline />
        <Button title="Add prayer entry" loading={loading} onPress={handleCreate} />
      </Card>

      {prayers === undefined ? (
        <Card variant="outline" style={[styles.prayerCard, { borderColor: theme.border }]}>
          <Text variant="small" style={{ color: theme.mutedForeground }}>
            Loading prayer journal...
          </Text>
        </Card>
      ) : prayers.length ? (
        <View style={styles.list}>
          {prayers.map((entry) => (
            <Card key={entry.id} variant="outline" style={[styles.prayerCard, { borderColor: theme.border }]}>
              <ListItem
                title={entry.title}
                subtitle={entry.description ?? entry.category ?? "Prayer entry"}
                meta={new Date(entry.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                right={<Badge color={entry.status === "answered" ? "success" : "secondary"}>{formatPrayerStatus(entry.status)}</Badge>}
              />
              {entry.status === "active" ? (
                <View style={styles.rowActions}>
                  <Button
                    title="Mark answered"
                    variant="secondary"
                    loading={updatingId === entry.id}
                    onPress={() => handleStatus(entry.id, "answered")}
                  />
                  <Button
                    title="Archive"
                    variant="outline"
                    loading={updatingId === entry.id}
                    onPress={() => handleStatus(entry.id, "archived")}
                  />
                </View>
              ) : null}
            </Card>
          ))}
        </View>
      ) : (
        <EmptyState
          title="No prayer entries yet"
          message="Capture requests, keep them visible, and mark answers when they come."
        />
      )}
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
  formCard: {
    gap: UI_PRESETS.spacing.sm,
  },
  list: {
    gap: UI_PRESETS.spacing.sm,
  },
  prayerCard: {
    gap: UI_PRESETS.spacing.sm,
  },
  rowActions: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
});

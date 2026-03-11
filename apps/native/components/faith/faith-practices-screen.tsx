import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { toast } from "sonner-native";

import { Badge, Button, Card, Chip, EmptyState, ListItem, SectionHeader, Text, View } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { formatPracticeCadence, useCreateSpiritualPractice, useSpiritualPractices, useToggleSpiritualPracticeActive } from "@/lib/spiritual";
import type { SpiritualCadence } from "@/lib/spiritual";

import { FaithField } from "./faith-shared";

const PRACTICE_TYPES = ["prayer", "meditation", "scripture", "gratitude", "service"] as const;
const CADENCE_OPTIONS: SpiritualCadence[] = ["daily", "weekdays", "weekly", "custom"];
const DAY_OPTIONS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

export function FaithPracticesScreen() {
  const practices = useSpiritualPractices();
  const createPractice = useCreateSpiritualPractice();
  const toggleActive = useToggleSpiritualPracticeActive();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [practiceType, setPracticeType] = useState<(typeof PRACTICE_TYPES)[number]>("prayer");
  const [cadence, setCadence] = useState<SpiritualCadence>("daily");
  const [targetValue, setTargetValue] = useState("1");
  const [unit, setUnit] = useState("session");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [syncToPlanner, setSyncToPlanner] = useState(true);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleDay = (day: string) => {
    setScheduleDays((current) => (current.includes(day) ? current.filter((entry) => entry !== day) : [...current, day]));
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Practice title is required");
      return;
    }

    const parsedTargetValue = Number(targetValue);
    if (!Number.isFinite(parsedTargetValue) || parsedTargetValue <= 0) {
      toast.error("Target value must be a positive number");
      return;
    }

    if (cadence === "custom" && scheduleDays.length === 0) {
      toast.error("Choose at least one day for a custom practice");
      return;
    }

    setLoading(true);
    try {
      await createPractice({
        title,
        description: description || undefined,
        practiceType,
        cadence,
        targetValue: parsedTargetValue,
        unit,
        timeOfDay: timeOfDay || undefined,
        scheduleDays: cadence === "custom" ? scheduleDays : undefined,
        syncToPlanner,
      });
      toast.success("Practice added");
      setTitle("");
      setDescription("");
      setTargetValue("1");
      setUnit("session");
      setTimeOfDay("");
      setScheduleDays([]);
      setSyncToPlanner(true);
    } catch (error) {
      toast.error("Could not add practice", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    setUpdatingId(id);
    try {
      await toggleActive(id, active);
      toast.success(active ? "Practice resumed" : "Practice paused");
    } catch (error) {
      toast.error("Could not update practice", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <SectionHeader title="Practices" subtitle="LIGHTWEIGHT RHYTHMS" />

      <Card style={styles.formCard}>
        <Text variant="h3">New practice</Text>
        <FaithField label="Title" value={title} onChangeText={setTitle} placeholder="Morning prayer" />
        <FaithField label="Description" value={description} onChangeText={setDescription} placeholder="Optional context" multiline />
        <View style={styles.chipRow}>
          {PRACTICE_TYPES.map((value) => (
            <Chip key={value} label={value} selected={practiceType === value} onSelect={(selected) => selected && setPracticeType(value)} />
          ))}
        </View>
        <View style={styles.chipRow}>
          {CADENCE_OPTIONS.map((value) => (
            <Chip key={value} label={value} selected={cadence === value} onSelect={(selected) => selected && setCadence(value)} />
          ))}
        </View>
        {cadence === "custom" ? (
          <View style={styles.chipRow}>
            {DAY_OPTIONS.map((day) => (
              <Chip key={day} label={day.slice(0, 3)} selected={scheduleDays.includes(day)} onSelect={() => toggleDay(day)} />
            ))}
          </View>
        ) : null}
        <View style={styles.twoUp}>
          <FaithField label="Target value" value={targetValue} onChangeText={setTargetValue} placeholder="1" style={{ flex: 1 }} />
          <FaithField label="Unit" value={unit} onChangeText={setUnit} placeholder="session, minutes, acts" style={{ flex: 1 }} />
        </View>
        <FaithField label="Time of day" value={timeOfDay} onChangeText={setTimeOfDay} placeholder="Morning, lunch, evening" />
        <View style={styles.syncRow}>
          <Text variant="small">Sync to planner</Text>
          <Chip label={syncToPlanner ? "On" : "Off"} selected={syncToPlanner} onSelect={setSyncToPlanner} />
        </View>
        <Button title="Add practice" loading={loading} onPress={handleCreate} />
      </Card>

      {practices === undefined ? (
        <Card variant="outline" style={[styles.practiceCard, { borderColor: theme.border }]}>
          <Text variant="small" style={{ color: theme.mutedForeground }}>
            Loading spiritual practices...
          </Text>
        </Card>
      ) : practices.length ? (
        <View style={styles.list}>
          {practices.map((practice) => (
            <Card key={practice.id} variant="outline" style={[styles.practiceCard, { borderColor: theme.border }]}>
              <ListItem
                title={practice.title}
                subtitle={practice.description ?? `${practice.practiceType} practice`}
                meta={`${practice.targetValue} ${practice.unit}`}
                right={<Badge color={practice.active ? "success" : "secondary"}>{practice.active ? "active" : "paused"}</Badge>}
              />
              <Text variant="small" style={{ color: theme.mutedForeground }}>
                {formatPracticeCadence(practice)}{practice.timeOfDay ? ` · ${practice.timeOfDay}` : ""}
              </Text>
              <View style={styles.rowActions}>
                {practice.plannerHabitId ? <Badge variant="outline" color="secondary">Planner linked</Badge> : <Badge variant="outline" color="warning">Local only</Badge>}
                <Button
                  title={practice.active ? "Pause" : "Resume"}
                  variant="outline"
                  loading={updatingId === practice.id}
                  onPress={() => handleToggle(practice.id, !practice.active)}
                />
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <EmptyState
          title="No spiritual practices yet"
          message="Start with one tiny rhythm you can keep even on a hard week."
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
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.xs,
  },
  twoUp: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
  },
  syncRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  list: {
    gap: UI_PRESETS.spacing.sm,
  },
  practiceCard: {
    gap: UI_PRESETS.spacing.sm,
  },
  rowActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
});

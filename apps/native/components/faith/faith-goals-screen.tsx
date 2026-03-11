import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { toast } from "sonner-native";

import { Badge, Button, Card, Chip, EmptyState, ListItem, SectionHeader, Text, View } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { formatGoalTarget, formatSpiritualDate, useCreateSpiritualGoal, useSpiritualGoals, useUpdateSpiritualGoalProgress } from "@/lib/spiritual";

import { FaithField } from "./faith-shared";

const GOAL_TYPES = ["prayer", "study", "gratitude", "meditation", "service"] as const;

export function FaithGoalsScreen() {
  const goals = useSpiritualGoals();
  const createGoal = useCreateSpiritualGoal();
  const updateProgress = useUpdateSpiritualGoalProgress();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<(typeof GOAL_TYPES)[number]>("prayer");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Goal title is required");
      return;
    }

    const parsedTarget = targetValue.trim() ? Number(targetValue) : undefined;
    if (parsedTarget !== undefined && !Number.isFinite(parsedTarget)) {
      toast.error("Target value must be a valid number");
      return;
    }

    setLoading(true);
    try {
      await createGoal({
        title,
        description: description || undefined,
        goalType,
        targetValue: parsedTarget,
        unit: unit || undefined,
        deadline: deadline || undefined,
      });
      toast.success("Spiritual goal added");
      setTitle("");
      setDescription("");
      setTargetValue("");
      setUnit("");
      setDeadline("");
    } catch (error) {
      toast.error("Could not create goal", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProgress = async (id: string, progress: number, markComplete?: boolean) => {
    setUpdatingId(id);
    try {
      await updateProgress(id, progress, markComplete ? "completed" : undefined);
      toast.success(markComplete ? "Goal completed" : "Goal progress updated");
    } catch (error) {
      toast.error("Could not update goal", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <SectionHeader title="Spiritual Goals" subtitle="TRACK DELIBERATE GROWTH" />

      <Card style={styles.formCard}>
        <Text variant="h3">New goal</Text>
        <FaithField label="Title" value={title} onChangeText={setTitle} placeholder="Pray daily before checking messages" />
        <FaithField label="Description" value={description} onChangeText={setDescription} placeholder="Optional why or season" multiline />
        <View style={styles.chipRow}>
          {GOAL_TYPES.map((value) => (
            <Chip key={value} label={value} selected={goalType === value} onSelect={(selected) => selected && setGoalType(value)} />
          ))}
        </View>
        <View style={styles.twoUp}>
          <FaithField label="Target value" value={targetValue} onChangeText={setTargetValue} placeholder="365" style={{ flex: 1 }} />
          <FaithField label="Unit" value={unit} onChangeText={setUnit} placeholder="days, sessions, minutes" style={{ flex: 1 }} />
        </View>
        <FaithField label="Deadline" value={deadline} onChangeText={setDeadline} placeholder="YYYY-MM-DD" />
        <Button title="Add spiritual goal" loading={loading} onPress={handleCreate} />
      </Card>

      {goals === undefined ? (
        <Card variant="outline" style={[styles.goalCard, { borderColor: theme.border }]}>
          <Text variant="small" style={{ color: theme.mutedForeground }}>
            Loading spiritual goals...
          </Text>
        </Card>
      ) : goals.length ? (
        <View style={styles.list}>
          {goals.map((goal) => {
            const nextProgress = Math.min(100, goal.progress + 10);
            return (
              <Card key={goal.id} variant="outline" style={[styles.goalCard, { borderColor: theme.border }]}>
                <ListItem
                  title={goal.title}
                  subtitle={goal.description ?? `${goal.goalType} goal`}
                  meta={goal.deadline ? formatSpiritualDate(goal.deadline) : undefined}
                  right={<Badge color={goal.status === "completed" ? "success" : "secondary"}>{goal.status}</Badge>}
                />
                <Text variant="small" style={{ color: theme.mutedForeground }}>
                  {formatGoalTarget(goal)}
                </Text>
                <View style={styles.rowActions}>
                  <Button
                    title={goal.status === "completed" ? "Completed" : "Advance 10%"}
                    variant="outline"
                    loading={updatingId === goal.id}
                    disabled={goal.status === "completed"}
                    onPress={() => handleProgress(goal.id, nextProgress)}
                  />
                  <Button
                    title="Mark complete"
                    variant="secondary"
                    loading={updatingId === goal.id}
                    disabled={goal.status === "completed"}
                    onPress={() => handleProgress(goal.id, 100, true)}
                  />
                </View>
              </Card>
            );
          })}
        </View>
      ) : (
        <EmptyState
          title="No spiritual goals yet"
          message="Choose one practice or growth aim you can sustain gently."
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
  list: {
    gap: UI_PRESETS.spacing.sm,
  },
  goalCard: {
    gap: UI_PRESETS.spacing.sm,
  },
  rowActions: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
});

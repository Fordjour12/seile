import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { BottomSheet } from "@/components/bottom-sheet";
import { Button } from "@/components/button";
import { Chip } from "@/components/chip";
import { Input } from "@/components/input";
import { Text } from "@/components/text";
import { View } from "@/components/view";
import { Typography, UI_PRESETS } from "@/lib/constants";
import { shiftDateKey, toDateKey } from "@/lib/scheduler/date";
import type {
  CreateSchedulerTaskPayload,
  SchedulerTaskPriority,
  SchedulerTaskRecurrence,
} from "@/lib/scheduler/types";

const PRIORITIES: SchedulerTaskPriority[] = ["low", "medium", "high"];
const RECURRENCES: SchedulerTaskRecurrence[] = ["none", "daily", "weekly", "monthly"];

type SchedulerAddTaskSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSchedulerTaskPayload) => Promise<void>;
};

export function SchedulerAddTaskSheet({
  visible,
  onClose,
  onSubmit,
}: SchedulerAddTaskSheetProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState(toDateKey(new Date()));
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState<SchedulerTaskPriority>("medium");
  const [recurrence, setRecurrence] = useState<SchedulerTaskRecurrence>("none");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setTitle("");
    setNotes("");
    setDueDate(toDateKey(new Date()));
    setTime("");
    setPriority("medium");
    setRecurrence("none");
    setIsSubmitting(false);
  }, [visible]);

  async function handleSubmit() {
    if (!title.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        notes: notes.trim() || null,
        priority,
        dueDate,
        time: time.trim() || null,
        recurrence,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Add Task"
      subtitle="Create a one-off task or a recurring follow-up."
      snapPoints={["78%"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.fieldGroup}>
          <Text style={Typography.labelSM} selectable>
            Title
          </Text>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="Task title..."
            autoFocus
          />
        </View>

        <View style={styles.quickDates}>
          {[
            { label: "Today", value: toDateKey(new Date()) },
            { label: "Tomorrow", value: shiftDateKey(toDateKey(new Date()), 1) },
            { label: "Next Week", value: shiftDateKey(toDateKey(new Date()), 7) },
          ].map((item) => (
            <Chip
              key={item.label}
              label={item.label}
              selected={dueDate === item.value}
              onSelect={() => setDueDate(item.value)}
            />
          ))}
        </View>

        <View style={styles.fieldGrid}>
          <View style={styles.fieldGroup}>
            <Text style={Typography.labelSM} selectable>
              Due Date
            </Text>
            <Input value={dueDate} onChangeText={setDueDate} placeholder="2026-03-07" />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={Typography.labelSM} selectable>
              Time
            </Text>
            <Input value={time} onChangeText={setTime} placeholder="09:30" />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={Typography.labelSM} selectable>
            Priority
          </Text>
          <View style={styles.pillRow}>
            {PRIORITIES.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={priority === item}
                onSelect={() => setPriority(item)}
              />
            ))}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={Typography.labelSM} selectable>
            Recurrence
          </Text>
          <View style={styles.pillRow}>
            {RECURRENCES.map((item) => (
              <Chip
                key={item}
                label={item === "none" ? "once" : item}
                selected={recurrence === item}
                onSelect={() => setRecurrence(item)}
              />
            ))}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={Typography.labelSM} selectable>
            Notes
          </Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Context, links, or reminders..."
            multiline
            style={styles.notesInput}
          />
        </View>

        <View style={styles.actions}>
          <Button title="Cancel" variant="outline" onPress={onClose} />
          <Button
            title={isSubmitting ? "Adding..." : "Add Task"}
            onPress={() => void handleSubmit()}
            disabled={!title.trim() || isSubmitting}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: UI_PRESETS.spacing.md,
    paddingBottom: UI_PRESETS.spacing.section,
  },
  fieldGroup: {
    gap: UI_PRESETS.spacing.xs,
  },
  fieldGrid: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
  quickDates: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.xs,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.xs,
  },
  notesInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: UI_PRESETS.spacing.sm,
  },
});

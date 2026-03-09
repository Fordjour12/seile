import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { Button } from "@/components/button";
import { Chip } from "@/components/chip";
import { Input } from "@/components/input";
import { Text } from "@/components/text";
import { View } from "@/components/view";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import {
  buildLocalDueDateTime,
  formatShortDate,
  formatTimeLabel,
  shiftDateKey,
  toDateKey,
} from "@/lib/scheduler";
import { useColorScheme } from "@/lib/use-color-scheme";
import type {
  CreateSchedulerTaskPayload,
  SchedulerTaskPriority,
  SchedulerTaskRecurrence,
} from "@/lib/scheduler";

const PRIORITIES: SchedulerTaskPriority[] = ["low", "medium", "high"];
const RECURRENCES: SchedulerTaskRecurrence[] = ["none", "daily", "weekly", "monthly"];

export type SchedulerTaskFormValues = Pick<
  CreateSchedulerTaskPayload,
  "title" | "notes" | "priority" | "dueDate" | "time" | "recurrence"
>;

type SchedulerTaskFormProps = {
  initialValues?: SchedulerTaskFormValues;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: SchedulerTaskFormValues) => Promise<void>;
  onCancel?: () => void;
};

type ActivePicker = "date" | "time" | null;

const DEFAULT_VALUES: SchedulerTaskFormValues = {
  title: "",
  notes: null,
  priority: "medium",
  dueDate: toDateKey(new Date()),
  time: null,
  recurrence: "none",
};

export function SchedulerTaskForm({
  initialValues,
  submitLabel,
  loading = false,
  onSubmit,
  onCancel,
}: SchedulerTaskFormProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [title, setTitle] = useState(DEFAULT_VALUES.title);
  const [notes, setNotes] = useState(DEFAULT_VALUES.notes ?? "");
  const [dueDate, setDueDate] = useState(DEFAULT_VALUES.dueDate);
  const [time, setTime] = useState(DEFAULT_VALUES.time ?? "");
  const [priority, setPriority] = useState<SchedulerTaskPriority>(DEFAULT_VALUES.priority);
  const [recurrence, setRecurrence] = useState<SchedulerTaskRecurrence>(
    DEFAULT_VALUES.recurrence ?? "none",
  );
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const nextValues = initialValues ?? DEFAULT_VALUES;
    setTitle(nextValues.title);
    setNotes(nextValues.notes ?? "");
    setDueDate(nextValues.dueDate);
    setTime(nextValues.time ?? "");
    setPriority(nextValues.priority);
    setRecurrence(nextValues.recurrence ?? "none");
    setSubmitError(null);
  }, [initialValues]);

  const pickerValue = buildLocalDueDateTime(dueDate, time || null);
  const isBusy = loading || isSubmitting;

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (process.env.EXPO_OS === "android") {
      setActivePicker(null);
    }

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    setDueDate(toDateKey(selectedDate));
  }

  function handleTimeChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (process.env.EXPO_OS === "android") {
      setActivePicker(null);
    }

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    const hours = String(selectedDate.getHours()).padStart(2, "0");
    const minutes = String(selectedDate.getMinutes()).padStart(2, "0");
    setTime(`${hours}:${minutes}`);
  }

  async function handleSubmit() {
    if (!title.trim() || !dueDate.trim()) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        notes: notes.trim() || null,
        dueDate: dueDate.trim(),
        time: time.trim() || null,
        priority,
        recurrence,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Could not save task. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.content}>
      <View style={styles.fieldGroup}>
        <Text style={Typography.labelSM} selectable>
          Title
        </Text>
        <Input value={title} onChangeText={setTitle} placeholder="Task title..." autoFocus />
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
          <Pressable
            onPress={() => setActivePicker(activePicker === "date" ? null : "date")}
            style={[
              styles.pickerField,
              {
                backgroundColor: theme.input,
                borderColor: activePicker === "date" ? theme.primary : theme.border,
              },
            ]}
          >
            <Text style={[Typography.bodyMD, { color: theme.foreground }]} selectable>
              {formatShortDate(dueDate)}
            </Text>
            <Text style={[Typography.captionSM, { color: theme.mutedForeground }]} selectable>
              {dueDate}
            </Text>
          </Pressable>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={Typography.labelSM} selectable>
            Time
          </Text>
          <Pressable
            onPress={() => setActivePicker(activePicker === "time" ? null : "time")}
            style={[
              styles.pickerField,
              {
                backgroundColor: theme.input,
                borderColor: activePicker === "time" ? theme.primary : theme.border,
              },
            ]}
          >
            <Text style={[Typography.bodyMD, { color: theme.foreground }]} selectable>
              {formatTimeLabel(time || null) ?? "No time set"}
            </Text>
            <Text style={[Typography.captionSM, { color: theme.mutedForeground }]} selectable>
              {time || "Optional reminder time"}
            </Text>
          </Pressable>
        </View>
      </View>

      {activePicker === "date" ? (
        <View
          style={[
            styles.pickerPanel,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <DateTimePicker
            value={pickerValue}
            mode="date"
            display={process.env.EXPO_OS === "ios" ? "inline" : "default"}
            minimumDate={new Date(2024, 0, 1)}
            onChange={handleDateChange}
          />
        </View>
      ) : null}

      {activePicker === "time" ? (
        <View
          style={[
            styles.pickerPanel,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <DateTimePicker
            value={pickerValue}
            mode="time"
            display={process.env.EXPO_OS === "ios" ? "spinner" : "default"}
            minuteInterval={5}
            onChange={handleTimeChange}
          />
          {time ? (
            <Button
              title="Clear Time"
              variant="ghost"
              size="sm"
              onPress={() => {
                setTime("");
                setActivePicker(null);
              }}
            />
          ) : null}
        </View>
      ) : null}

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
        {onCancel ? (
          <Button title="Cancel" variant="outline" onPress={onCancel} disabled={isBusy} />
        ) : null}
        <Button
          title={isBusy ? "Saving..." : submitLabel}
          onPress={() => void handleSubmit()}
          disabled={!title.trim() || !dueDate.trim() || isBusy}
        />
      </View>
      {submitError ? (
        <Text style={[Typography.captionSM, { color: theme.destructive }]} selectable>
          {submitError}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: UI_PRESETS.spacing.md,
  },
  fieldGroup: {
    flex: 1,
    gap: UI_PRESETS.spacing.xs,
  },
  quickDates: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.xs,
  },
  fieldGrid: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
  pickerField: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.md,
    paddingHorizontal: UI_PRESETS.spacing.lg,
    paddingVertical: UI_PRESETS.spacing.md,
    justifyContent: "center",
    gap: UI_PRESETS.spacing.xs,
  },
  pickerPanel: {
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.lg,
    paddingHorizontal: UI_PRESETS.spacing.md,
    paddingVertical: UI_PRESETS.spacing.sm,
    gap: UI_PRESETS.spacing.sm,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.xs,
  },
  notesInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: UI_PRESETS.spacing.sm,
  },
});

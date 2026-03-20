import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

import { BottomSheet } from "./bottom-sheet";
import { Input } from "./input";
import { Text } from "./text";
import { View } from "./view";

type Mode = "date" | "datetime";

type FinanceDateTimePickerFieldProps = {
  label: string;
  value?: string;
  mode?: Mode;
  placeholder?: string;
  onChangeValue: (value: string | undefined) => void;
};

function formatPreview(value: string | undefined, mode: Mode): string {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  if (mode === "date") {
    return date.toLocaleDateString();
  }

  return date.toLocaleString();
}

export function FinanceDateTimePickerField({
  label,
  value,
  mode = "datetime",
  placeholder = "YYYY-MM-DD",
  onChangeValue,
}: FinanceDateTimePickerFieldProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  const preview = useMemo(() => formatPreview(value, mode), [value, mode]);

  function applyNow() {
    const now = new Date();
    const next = mode === "date" ? now.toISOString().slice(0, 10) : now.toISOString();
    onChangeValue(next);
    setDraft(next);
    setVisible(false);
  }

  function applyPlus(days: number) {
    const base = value ? new Date(value) : new Date();
    base.setDate(base.getDate() + days);
    const next = mode === "date" ? base.toISOString().slice(0, 10) : base.toISOString();
    onChangeValue(next);
    setDraft(next);
    setVisible(false);
  }

  return (
    <View style={styles.container}>
      <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>{label}</Text>

      <Pressable
        onPress={() => {
          setDraft(value ?? "");
          setVisible(true);
        }}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text style={[Typography.bodySM, { color: value ? theme.foreground : theme.mutedForeground }]}>
          {value ? preview : placeholder}
        </Text>
      </Pressable>

      <BottomSheet
        visible={visible}
        onClose={() => setVisible(false)}
        title={label}
        subtitle="Choose quick date/time or enter manually"
        snapPoints={["55%"]}
      >
        <View style={styles.quickRow}>
          <Pressable style={[styles.quickBtn, { borderColor: theme.border }]} onPress={applyNow}>
            <Text style={[Typography.captionSM, { color: theme.foreground }]}>Now</Text>
          </Pressable>
          <Pressable style={[styles.quickBtn, { borderColor: theme.border }]} onPress={() => applyPlus(1)}>
            <Text style={[Typography.captionSM, { color: theme.foreground }]}>+1 day</Text>
          </Pressable>
          <Pressable style={[styles.quickBtn, { borderColor: theme.border }]} onPress={() => applyPlus(7)}>
            <Text style={[Typography.captionSM, { color: theme.foreground }]}>+1 week</Text>
          </Pressable>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Manual ({mode === "date" ? "YYYY-MM-DD" : "ISO datetime"})</Text>
          <Input value={draft} onChangeText={setDraft} placeholder={mode === "date" ? "2026-04-01" : "2026-04-01T10:00:00.000Z"} />
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionBtn, { borderColor: theme.border }]}
            onPress={() => {
              onChangeValue(undefined);
              setDraft("");
              setVisible(false);
            }}
          >
            <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Clear</Text>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, { borderColor: theme.primary, backgroundColor: theme.primary }]}
            onPress={() => {
              onChangeValue(draft || undefined);
              setVisible(false);
            }}
          >
            <Text style={[Typography.captionSM, { color: theme.primaryForeground }]}>Apply</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: UI_PRESETS.spacing.xs,
  },
  trigger: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.md,
    paddingHorizontal: UI_PRESETS.spacing.sm,
    justifyContent: "center",
  },
  quickRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.xs,
  },
  quickBtn: {
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.md,
    paddingHorizontal: UI_PRESETS.spacing.sm,
    paddingVertical: UI_PRESETS.spacing.xs,
  },
  fieldGroup: {
    gap: UI_PRESETS.spacing.xs,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: UI_PRESETS.spacing.xs,
  },
  actionBtn: {
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.md,
    paddingHorizontal: UI_PRESETS.spacing.sm,
    paddingVertical: UI_PRESETS.spacing.xs,
  },
});

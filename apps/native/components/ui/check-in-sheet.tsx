import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Badge } from "./badge";
import { Button } from "./button";
import { Card } from "./card";
import { Text } from "./text";
import { BottomSheet } from "./bottom-sheet";

import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export type CheckInSheetCardProps = {
  eyebrow?: string;
  badge?: string;
  title: string;
  subtitle: string;
  mood: number;
  energy: number;
  readiness: number;
  busy?: boolean;
  completed?: boolean;
  contextNote?: string;
  onSetMood: (value: number) => void;
  onSetEnergy: (value: number) => void;
  onSetReadiness: (value: number) => void;
  onSubmit: () => Promise<void> | void;
  submitLabel: string;
};

export type CheckInSheetProps = CheckInSheetCardProps & {
  visible: boolean;
  onClose: () => void;
  snapPoints?: ReadonlyArray<string>;
};

type CheckInScaleFieldProps = {
  label: string;
  value: number;
  descriptors?: string[];
  accentColor: string;
  onChange: (value: number) => void;
};

type CheckInMoodSelectorProps = {
  value: number;
  onChange: (value: number) => void;
};

const MOOD_OPTIONS = [
  { value: 1, label: "Low" },
  { value: 2, label: "Meh" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Great" },
] as const;

const ENERGY_DESCRIPTORS = ["Low", "Low", "Steady", "Good", "High"];
const READINESS_DESCRIPTORS = ["Not yet", "Warming up", "Ready", "Strong", "Locked in"];

export function CheckInSheetCard({
  eyebrow,
  badge,
  title,
  subtitle,
  mood,
  energy,
  readiness,
  busy = false,
  completed = false,
  contextNote,
  onSetMood,
  onSetEnergy,
  onSetReadiness,
  onSubmit,
  submitLabel,
}: CheckInSheetCardProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Card style={styles.sheetCard}>
      <View style={styles.header}>
        {eyebrow ? (
          <Text selectable variant="muted" style={styles.eyebrow}>
            {eyebrow}
          </Text>
        ) : null}
        <View style={styles.titleRow}>
          <Text selectable variant="small" style={styles.title}>
            {title}
          </Text>
          {badge ? <Badge color="secondary">{badge}</Badge> : null}
        </View>
        <Text selectable variant="small" style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>

      <CheckInSectionLabel label="Mood" />
      <CheckInMoodSelector value={mood} onChange={onSetMood} />

      <CheckInScaleField
        label="Energy"
        value={energy}
        accentColor="#ba7517"
        descriptors={ENERGY_DESCRIPTORS}
        onChange={onSetEnergy}
      />
      <CheckInScaleField
        label="Readiness"
        value={readiness}
        accentColor="#1d9e75"
        descriptors={READINESS_DESCRIPTORS}
        onChange={onSetReadiness}
      />

      {contextNote ? <CheckInContextNote text={contextNote} /> : null}

      <View style={styles.actionRow}>
        <Button
          title={completed ? "Check-in already logged" : submitLabel}
          disabled={busy || completed}
          onPress={onSubmit}
          style={styles.submitButton}
        />
      </View>

      <Text selectable variant="muted" style={[styles.footer, { color: theme.mutedForeground }]}>
        This signal helps the AI adjust pacing before it makes stronger suggestions.
      </Text>
    </Card>
  );
}

export function CheckInSheet({
  visible,
  onClose,
  snapPoints = ["72%"],
  ...props
}: CheckInSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={snapPoints}>
      <CheckInSheetBody {...props} />
    </BottomSheet>
  );
}

export function CheckInSheetBody(props: CheckInSheetCardProps) {
  return <CheckInSheetCard {...props} />;
}

export function CheckInSectionLabel({ label }: { label: string }) {
  return (
    <Text selectable variant="muted" style={styles.sectionLabel}>
      {label}
    </Text>
  );
}

export function CheckInMoodSelector({
  value,
  onChange,
}: CheckInMoodSelectorProps) {
  return (
    <View style={styles.moodRow}>
      {MOOD_OPTIONS.map((option) => {
        const active = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.moodButton,
              active ? styles.moodButtonActive : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <View style={[styles.moodDot, active ? styles.moodDotActive : null]} />
            <Text selectable variant="muted" style={active ? styles.moodLabelActive : styles.moodLabel}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function CheckInScaleField({
  label,
  value,
  descriptors,
  accentColor,
  onChange,
}: CheckInScaleFieldProps) {
  const descriptor = descriptors?.[value - 1];

  return (
    <View style={styles.scaleBlock}>
      <View style={styles.scaleHeader}>
        <Text selectable variant="small" style={styles.scaleTitle}>
          {label}
        </Text>
        <View style={styles.scaleMeta}>
          <Text selectable variant="h3" style={[styles.scaleValue, { color: accentColor }]}>
            {value}
          </Text>
          {descriptor ? (
            <Text selectable variant="muted" style={[styles.scaleDescriptor, { color: accentColor }]}>
              {descriptor}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.scaleTrack}>
        {Array.from({ length: 5 }, (_, index) => {
          const itemValue = index + 1;
          const active = itemValue <= value;

          return (
            <Pressable
              key={`${label}-${itemValue}`}
              onPress={() => onChange(itemValue)}
              style={({ pressed }) => [
                styles.scaleStep,
                {
                  backgroundColor: active ? accentColor : "rgba(255,255,255,0.08)",
                  borderColor: active ? `${accentColor}88` : "rgba(255,255,255,0.08)",
                },
                pressed ? styles.pressed : null,
              ]}
            >
              <Text selectable variant="muted" style={active ? styles.scaleStepLabelActive : styles.scaleStepLabel}>
                {itemValue}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function CheckInContextNote({ text }: { text: string }) {
  return (
    <View style={styles.contextNote}>
      <View style={styles.contextDot} />
      <Text selectable variant="small" style={styles.contextText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetCard: {
    backgroundColor: "#141418",
    borderColor: "#2a2a36",
    borderCurve: "continuous",
    borderRadius: 22,
    borderWidth: 1,
    gap: 16,
    paddingBottom: 12,
  },
  header: {
    gap: 4,
  },
  eyebrow: {
    color: "#6d6d82",
    fontFamily: "Geist",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  title: {
    color: "#f4f1ff",
    flex: 1,
    fontFamily: "Geist",
    fontWeight: "700",
  },
  subtitle: {
    color: "#a6a0bc",
    lineHeight: 20,
  },
  sectionLabel: {
    color: "#6d6d82",
    fontFamily: "Geist",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  moodRow: {
    flexDirection: "row",
    gap: 8,
  },
  moodButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  moodButtonActive: {
    backgroundColor: "#1e1e28",
    borderColor: "#3a3a52",
  },
  moodDot: {
    backgroundColor: "#4d4d61",
    borderRadius: 999,
    height: 12,
    width: 12,
  },
  moodDotActive: {
    backgroundColor: "#d4537e",
  },
  moodLabel: {
    color: "#7d7d94",
    fontFamily: "Geist",
    fontWeight: "700",
  },
  moodLabelActive: {
    color: "#f0c3d2",
    fontFamily: "Geist",
    fontWeight: "700",
  },
  scaleBlock: {
    gap: 10,
  },
  scaleHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scaleTitle: {
    color: "#ece8fb",
    fontFamily: "Geist",
    fontWeight: "700",
  },
  scaleMeta: {
    alignItems: "flex-end",
    gap: 2,
  },
  scaleValue: {
    fontWeight: "700",
    lineHeight: 28,
  },
  scaleDescriptor: {
    fontFamily: "Geist",
    fontWeight: "700",
  },
  scaleTrack: {
    flexDirection: "row",
    gap: 8,
  },
  scaleStep: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 34,
  },
  scaleStepLabel: {
    color: "#9d9db2",
    fontFamily: "Geist",
    fontWeight: "700",
  },
  scaleStepLabelActive: {
    color: "#0e0e10",
    fontFamily: "Geist",
    fontWeight: "700",
  },
  contextNote: {
    backgroundColor: "#1a1a24",
    borderColor: "#2a2a36",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  contextDot: {
    backgroundColor: "#9b8fff",
    borderRadius: 999,
    height: 5,
    marginTop: 7,
    width: 5,
  },
  contextText: {
    color: "#a8a1db",
    flex: 1,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  submitButton: {
    borderRadius: 14,
    borderCurve: "continuous",
    flex: 1,
  },
  footer: {
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.84,
  },
});

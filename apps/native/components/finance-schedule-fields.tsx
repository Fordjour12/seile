import React from "react";
import { Pressable, StyleSheet } from "react-native";

import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import type { ScheduleType } from "@/lib/recurring";
import { Input } from "./input";
import { Text } from "./text";
import { View } from "./view";

const SCHEDULE_TYPES: ScheduleType[] = ["daily", "weekly", "monthly", "yearly"];

type FinanceScheduleFieldsProps = {
  scheduleType: ScheduleType;
  interval: string;
  dayOfMonth?: string;
  dayOfWeek?: string;
  onScheduleTypeChange: (scheduleType: ScheduleType) => void;
  onIntervalChange: (interval: string) => void;
  onDayOfMonthChange: (dayOfMonth: string) => void;
  onDayOfWeekChange: (dayOfWeek: string) => void;
};

export function FinanceScheduleFields({
  scheduleType,
  interval,
  dayOfMonth,
  dayOfWeek,
  onScheduleTypeChange,
  onIntervalChange,
  onDayOfMonthChange,
  onDayOfWeekChange,
}: FinanceScheduleFieldsProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View style={styles.container}>
      <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Schedule</Text>

      <View style={styles.typeGrid}>
        {SCHEDULE_TYPES.map((item) => {
          const active = item === scheduleType;
          return (
            <Pressable
              key={item}
              onPress={() => onScheduleTypeChange(item)}
              style={({ pressed }) => [
                styles.typePill,
                {
                  borderColor: active ? theme.primary : theme.border,
                  backgroundColor: active ? theme.primary : theme.card,
                  opacity: pressed ? 0.86 : 1,
                },
              ]}
            >
              <Text
                style={[
                  Typography.labelSM,
                  {
                    color: active ? theme.primaryForeground : theme.foreground,
                    textTransform: "capitalize",
                  },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Every</Text>
          <Input
            value={interval}
            onChangeText={onIntervalChange}
            keyboardType="number-pad"
            placeholder="1"
          />
        </View>

        {scheduleType === "monthly" ? (
          <View style={styles.field}>
            <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Day of month (1-28)</Text>
            <Input
              value={dayOfMonth}
              onChangeText={onDayOfMonthChange}
              keyboardType="number-pad"
              placeholder="1"
            />
          </View>
        ) : null}

        {scheduleType === "weekly" ? (
          <View style={styles.field}>
            <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Day of week (0-6)</Text>
            <Input
              value={dayOfWeek}
              onChangeText={onDayOfWeekChange}
              keyboardType="number-pad"
              placeholder="1"
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: UI_PRESETS.spacing.sm,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.xs,
  },
  typePill: {
    minWidth: 88,
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.md,
    paddingHorizontal: UI_PRESETS.spacing.sm,
    paddingVertical: UI_PRESETS.spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
    flexWrap: "wrap",
  },
  field: {
    minWidth: 140,
    flex: 1,
    gap: UI_PRESETS.spacing.xs,
  },
});

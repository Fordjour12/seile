import React from "react";
import { Pressable, StyleSheet } from "react-native";

import { EmptyState } from "@/components/empty-state";
import { Spinner } from "@/components/spinner";
import { Text } from "@/components/text";
import { View } from "@/components/view";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import {
  formatAgendaLabel,
  formatCalendarDay,
  formatShortWeekday,
  getAgendaSections,
  getHourLabel,
  getMonthDots,
  getMonthGrid,
  getTasksForHour,
  SCHEDULER_TIMELINE_HOURS,
  type SchedulerTask,
} from "@/lib/scheduler";
import {
  getOutstandingDependencyCount,
} from "@/lib/scheduler/helpers";
import { getSchedulerPriorityColor, withAlpha } from "@/lib/scheduler/palette";

import { SchedulerTaskRow } from "@/components/scheduler-task-row";

export type SchedulerTheme = typeof NAV_THEME.light;

export function SchedulerStatsCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: withAlpha(color, 0.14),
          borderColor: withAlpha(color, 0.26),
        },
      ]}
    >
      <Text style={[Typography.captionSM, { color }]} selectable>
        {label}
      </Text>
      <Text style={[Typography.titleSM, { color, fontVariant: ["tabular-nums"] }]} selectable>
        {value}
      </Text>
    </View>
  );
}

export function SchedulerMonthView({
  theme,
  tasks,
  selectedDate,
  todayDate,
  onSelectDate,
}: {
  theme: SchedulerTheme;
  tasks: SchedulerTask[];
  selectedDate: string;
  todayDate: string;
  onSelectDate: (dateKey: string) => void;
}) {
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const grid = getMonthGrid(selectedDate);
  const rows = Array.from({ length: 6 }, (_, index) => grid.slice(index * 7, index * 7 + 7));

  return (
    <View style={styles.monthGrid}>
      <View style={styles.weekdayRow}>
        {weekdayLabels.map((label) => (
          <Text
            key={label}
            style={[Typography.labelXS, { color: theme.mutedForeground, textAlign: "center" }]}
            selectable
          >
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.gridRows}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.gridRow}>
            {row.map((cell) => {
              const isToday = cell.dateKey === todayDate;
              const isSelected = cell.dateKey === selectedDate;
              const dots = getMonthDots(tasks, cell.dateKey);

              return (
                <Pressable
                  key={cell.dateKey}
                  onPress={() => onSelectDate(cell.dateKey)}
                  style={[
                    styles.monthCell,
                    {
                      opacity: cell.inMonth ? 1 : 0.35,
                      backgroundColor: isSelected
                        ? withAlpha(theme.primary, 0.18)
                        : isToday
                          ? withAlpha(theme.primary, 0.1)
                          : theme.card,
                      borderColor: isSelected || isToday ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      Typography.captionSM,
                      {
                        color: isSelected ? theme.primary : theme.foreground,
                        fontVariant: ["tabular-nums"],
                      },
                    ]}
                    selectable
                  >
                    {formatCalendarDay(cell.dateKey)}
                  </Text>
                  <View style={styles.dotRow}>
                    {dots.map((task) => (
                      <View
                        key={task.id}
                        style={[
                          styles.dot,
                          {
                            backgroundColor:
                              task.status === "overdue"
                                ? theme.destructive
                                : getSchedulerPriorityColor(theme, task.priority),
                          },
                        ]}
                      />
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

export function SchedulerTimelineView({
  theme,
  tasks,
  dateKeys,
  todayDate,
  selectedDate,
  onSelectDate,
  onSwitchToDay,
}: {
  theme: SchedulerTheme;
  tasks: SchedulerTask[];
  dateKeys: string[];
  todayDate: string;
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  onSwitchToDay?: (dateKey: string) => void;
}) {
  return (
    <View style={styles.timeline}>
      <View style={styles.timelineHeader}>
        <View style={styles.hourSpacer} />
        {dateKeys.map((dateKey) => {
          const isToday = dateKey === todayDate;
          const isSelected = dateKey === selectedDate;
          return (
            <Pressable
              key={dateKey}
              onPress={() => {
                onSelectDate(dateKey);
                onSwitchToDay?.(dateKey);
              }}
              style={[
                styles.timelineHeaderCell,
                {
                  backgroundColor: isSelected
                    ? withAlpha(theme.primary, 0.18)
                    : "transparent",
                  borderColor: isSelected ? theme.primary : "transparent",
                },
              ]}
            >
              <Text
                style={[
                  Typography.captionSM,
                  { color: isToday ? theme.primary : theme.mutedForeground },
                ]}
                selectable
              >
                {formatShortWeekday(dateKey)}
              </Text>
              <Text
                style={[
                  Typography.labelMD,
                  {
                    color: isToday ? theme.primary : theme.foreground,
                    fontVariant: ["tabular-nums"],
                  },
                ]}
                selectable
              >
                {formatCalendarDay(dateKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {SCHEDULER_TIMELINE_HOURS.map((hour) => (
        <View key={hour} style={styles.timelineRow}>
          <View style={styles.hourLabelCell}>
            <Text style={[Typography.captionSM, { color: theme.mutedForeground }]} selectable>
              {getHourLabel(hour)}
            </Text>
          </View>
          {dateKeys.map((dateKey) => {
            const hourTasks = getTasksForHour(tasks, dateKey, hour);
            return (
              <View
                key={`${dateKey}-${hour}`}
                style={[
                  styles.timelineCell,
                  {
                    backgroundColor: withAlpha(theme.border, 0.12),
                    borderColor: theme.border,
                  },
                ]}
              >
                {hourTasks.map((task) => (
                  <View
                    key={task.id}
                    style={[
                      styles.timelineChip,
                      {
                        backgroundColor: withAlpha(
                          getSchedulerPriorityColor(theme, task.priority),
                          0.2,
                        ),
                        borderLeftColor: getSchedulerPriorityColor(theme, task.priority),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        Typography.captionSM,
                        {
                          color: getSchedulerPriorityColor(theme, task.priority),
                          fontWeight: "600",
                        },
                      ]}
                      numberOfLines={1}
                      selectable
                    >
                      {task.title}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function SchedulerAgendaView({
  theme,
  tasks,
  todayDate,
  tasksById,
  onOpenTask,
}: {
  theme: SchedulerTheme;
  tasks: SchedulerTask[];
  todayDate: string;
  tasksById: Map<string, SchedulerTask>;
  onOpenTask: (taskId: string) => void;
}) {
  const sections = getAgendaSections(tasks, todayDate);

  if (!sections.length) {
    return (
      <EmptyState
        title="Nothing on the horizon"
        message="Your next 14 days are clear."
        icon={<Text style={Typography.displaySM}>🗓️</Text>}
      />
    );
  }

  return (
    <View style={styles.agendaSections}>
      {sections.map((section) => (
        <View key={section.dateKey} style={styles.agendaSection}>
          <Text style={[Typography.labelXS, { color: theme.mutedForeground }]} selectable>
            {formatAgendaLabel(section.dateKey, todayDate)}
          </Text>
          <View style={styles.listGroup}>
            {section.tasks.map((task) => (
              <SchedulerTaskRow
                key={task.id}
                task={task}
                theme={theme}
                dependencyCount={getOutstandingDependencyCount(task, tasksById)}
                onPress={() => onOpenTask(task.id)}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

export function SchedulerLoadingState({
  theme,
  label = "Loading scheduler...",
}: {
  theme: SchedulerTheme;
  label?: string;
}) {
  return (
    <View style={styles.loadingState}>
      <Spinner />
      <Text style={[Typography.bodySM, { color: theme.mutedForeground }]} selectable>
        {label}
      </Text>
    </View>
  );
}

export function SchedulerTaskNotFoundState({
  theme,
  title = "Task not found",
  message = "This task may have been deleted or is unavailable.",
}: {
  theme: SchedulerTheme;
  title?: string;
  message?: string;
}) {
  return (
    <EmptyState
      title={title}
      message={message}
      icon={<Text style={Typography.displaySM}>🧭</Text>}
      style={{
        minHeight: 240,
      }}
    />
  );
}

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.lg,
    paddingHorizontal: UI_PRESETS.spacing.lg,
    paddingVertical: UI_PRESETS.spacing.md,
    gap: UI_PRESETS.spacing.xs,
  },
  monthGrid: {
    gap: UI_PRESETS.spacing.md,
  },
  weekdayRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.xs,
  },
  gridRows: {
    gap: UI_PRESETS.spacing.xs,
  },
  gridRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.xs,
  },
  monthCell: {
    flex: 1,
    minHeight: 56,
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.md,
    paddingHorizontal: UI_PRESETS.spacing.sm,
    paddingVertical: UI_PRESETS.spacing.sm,
    justifyContent: "space-between",
  },
  dotRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: UI_PRESETS.radius.full,
  },
  timeline: {
    gap: UI_PRESETS.spacing.xs,
  },
  timelineHeader: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.xs,
    alignItems: "stretch",
  },
  hourSpacer: {
    width: 42,
  },
  timelineHeaderCell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.md,
    paddingVertical: UI_PRESETS.spacing.sm,
    alignItems: "center",
    gap: 2,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: UI_PRESETS.spacing.xs,
    minHeight: 56,
  },
  hourLabelCell: {
    width: 42,
    justifyContent: "flex-start",
    paddingTop: 6,
  },
  timelineCell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.md,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 4,
  },
  timelineChip: {
    borderLeftWidth: 2,
    borderRadius: UI_PRESETS.radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  agendaSections: {
    gap: UI_PRESETS.spacing.md,
  },
  agendaSection: {
    gap: UI_PRESETS.spacing.sm,
  },
  listGroup: {
    gap: UI_PRESETS.spacing.sm,
  },
  loadingState: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
});

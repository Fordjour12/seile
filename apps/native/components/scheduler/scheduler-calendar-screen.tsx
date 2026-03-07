import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { Text } from "@/components/text";
import { View } from "@/components/view";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import {
  formatAgendaLabel,
  formatMonthLabel,
  getTasksForDate,
  getWeekDateKeys,
  shiftDateKey,
  shiftMonth,
  toDateKey,
  type SchedulerView,
} from "@/lib/scheduler";
import { getOutstandingDependencyCount } from "@/lib/scheduler/helpers";
import { useSchedulerData } from "@/lib/scheduler/use-scheduler-data";

import {
  SchedulerAgendaView,
  SchedulerLoadingState,
  SchedulerMonthView,
  SchedulerTimelineView,
} from "./scheduler-shared";
import { SchedulerTaskRow } from "@/components/scheduler-task-row";

const CALENDAR_TABS: Array<{ label: string; value: SchedulerView }> = [
  { label: "Month", value: "month" },
  { label: "Week", value: "week" },
  { label: "Day", value: "day" },
  { label: "Agenda", value: "agenda" },
];

export function SchedulerCalendarScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const scheduler = useSchedulerData();
  const todayDate = toDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [activeView, setActiveView] = useState<SchedulerView>("month");

  const timelineDates = activeView === "day" ? [selectedDate] : getWeekDateKeys(selectedDate);
  const selectedDateTasks = useMemo(
    () => getTasksForDate(scheduler.tasks, selectedDate),
    [scheduler.tasks, selectedDate],
  );

  function shiftCalendar(direction: -1 | 1) {
    if (activeView === "month") {
      setSelectedDate(shiftMonth(selectedDate, direction));
      return;
    }

    if (activeView === "week" || activeView === "agenda") {
      setSelectedDate(shiftDateKey(selectedDate, direction * 7));
      return;
    }

    setSelectedDate(shiftDateKey(selectedDate, direction));
  }

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <View style={styles.topRow}>
        <Text style={[Typography.bodyMD, { color: theme.mutedForeground }]} selectable>
          Move through the schedule with dedicated calendar views.
        </Text>
        <Button
          title="New Task"
          size="sm"
          onPress={() => router.push("/(tabs)/scheduler/tasks/create")}
        />
      </View>

      {scheduler.error ? (
        <Banner
          variant="error"
          title="Calendar is showing stale data"
          message={scheduler.error}
          actionLabel="Retry"
          onActionPress={() => void scheduler.refresh()}
        />
      ) : null}

      {scheduler.loading && scheduler.tasks.length === 0 ? (
        <SchedulerLoadingState theme={theme} label="Loading calendar..." />
      ) : null}

      {!scheduler.loading && scheduler.tasks.length === 0 ? (
        <EmptyState
          title="No tasks on the calendar"
          message="Create a task to start filling the calendar."
          actionLabel="Create task"
          onActionPress={() => router.push("/(tabs)/scheduler/tasks/create")}
          icon={<Text style={Typography.displaySM}>📅</Text>}
        />
      ) : null}

      {scheduler.tasks.length > 0 ? (
        <>
          <View style={[styles.viewSwitcher, { backgroundColor: theme.muted, borderColor: theme.border }]}>
            {CALENDAR_TABS.map((tab) => (
              <Pressable
                key={tab.value}
                onPress={() => setActiveView(tab.value)}
                style={[
                  styles.viewSwitcherPill,
                  {
                    backgroundColor: activeView === tab.value ? theme.primary : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    Typography.captionSM,
                    {
                      color:
                        activeView === tab.value
                          ? theme.primaryForeground
                          : theme.mutedForeground,
                    },
                  ]}
                  selectable
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Card variant="outline" style={[styles.calendarCard, { borderColor: theme.border }]}>
            <View style={styles.navRow}>
              <Pressable
                onPress={() => shiftCalendar(-1)}
                style={[styles.navButton, { borderColor: theme.border }]}
              >
                <Text style={Typography.labelMD} selectable>
                  ←
                </Text>
              </Pressable>
              <Text style={Typography.titleSM} selectable>
                {formatMonthLabel(selectedDate)}
              </Text>
              <Pressable
                onPress={() => shiftCalendar(1)}
                style={[styles.navButton, { borderColor: theme.border }]}
              >
                <Text style={Typography.labelMD} selectable>
                  →
                </Text>
              </Pressable>
            </View>

            {activeView === "month" ? (
              <SchedulerMonthView
                theme={theme}
                tasks={scheduler.tasks}
                selectedDate={selectedDate}
                todayDate={todayDate}
                onSelectDate={setSelectedDate}
              />
            ) : null}

            {activeView === "week" ? (
              <SchedulerTimelineView
                theme={theme}
                tasks={scheduler.tasks}
                dateKeys={timelineDates}
                todayDate={todayDate}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onSwitchToDay={(dateKey) => {
                  setSelectedDate(dateKey);
                  setActiveView("day");
                }}
              />
            ) : null}

            {activeView === "day" ? (
              <SchedulerTimelineView
                theme={theme}
                tasks={scheduler.tasks}
                dateKeys={[selectedDate]}
                todayDate={todayDate}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            ) : null}

            {activeView === "agenda" ? (
              <SchedulerAgendaView
                theme={theme}
                tasks={scheduler.tasks}
                todayDate={todayDate}
                tasksById={scheduler.tasksById}
                onOpenTask={(taskId) => router.push(`/(tabs)/scheduler/${taskId}`)}
              />
            ) : null}
          </Card>

          {(activeView === "month" || activeView === "week") ? (
            <Card variant="outline" style={[styles.selectedDayCard, { borderColor: theme.border }]}>
              <Text style={[Typography.labelXS, { color: theme.mutedForeground }]} selectable>
                {formatAgendaLabel(selectedDate, todayDate)}
              </Text>
              {selectedDateTasks.length > 0 ? (
                <View style={styles.listGroup}>
                  {selectedDateTasks.map((task) => (
                    <SchedulerTaskRow
                      key={task.id}
                      task={task}
                      theme={theme}
                      dependencyCount={getOutstandingDependencyCount(task, scheduler.tasksById)}
                      onPress={() => router.push(`/(tabs)/scheduler/${task.id}`)}
                    />
                  ))}
                </View>
              ) : (
                <EmptyState
                  title="No tasks for this day"
                  message="Pick another day or add something new."
                  icon={<Text style={Typography.displaySM}>🌙</Text>}
                />
              )}
            </Card>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingTop: UI_PRESETS.spacing.screen,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: UI_PRESETS.spacing.md,
  },
  viewSwitcher: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.full,
    padding: 4,
    gap: 4,
  },
  viewSwitcherPill: {
    flex: 1,
    alignItems: "center",
    borderRadius: UI_PRESETS.radius.full,
    paddingVertical: UI_PRESETS.spacing.sm,
  },
  calendarCard: {
    gap: UI_PRESETS.spacing.md,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDayCard: {
    gap: UI_PRESETS.spacing.md,
  },
  listGroup: {
    gap: UI_PRESETS.spacing.sm,
  },
});

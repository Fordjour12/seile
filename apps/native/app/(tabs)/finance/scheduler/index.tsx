import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { toast } from "sonner-native";
import { LinearGradient } from "expo-linear-gradient";

import {
  Banner,
  Card,
  Chip,
  EmptyState,
  Spinner,
  Text,
  View,
} from "@/components";
import { SchedulerAddTaskSheet } from "@/components/scheduler-add-task-sheet";
import { SchedulerAlertCard } from "@/components/scheduler-alert-card";
import { SchedulerTag } from "@/components/scheduler-tag";
import { SchedulerTaskDetailSheet } from "@/components/scheduler-task-detail-sheet";
import { SchedulerTaskRow } from "@/components/scheduler-task-row";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import {
  createSchedulerTask,
  filterSchedulerTasks,
  formatAgendaLabel,
  formatCalendarDay,
  formatCurrentDate,
  formatMonthLabel,
  formatShortDate,
  formatShortWeekday,
  formatTimeLabel,
  getAgendaSections,
  getAlertBuckets,
  getHourLabel,
  getMonthDots,
  getMonthGrid,
  getOutstandingDependencyCount,
  getSchedulerStats,
  getTasksForDate,
  getTasksForHour,
  getWeekDateKeys,
  shiftDateKey,
  shiftMonth,
  synchronizeSchedulerState,
  SCHEDULER_TIMELINE_HOURS,
  toDateKey,
  toggleSchedulerSubtask,
  updateSchedulerTask,
  deleteSchedulerTask,
  type CreateSchedulerTaskPayload,
  type SchedulerFilter,
  type SchedulerTask,
  type SchedulerTab,
  type SchedulerView,
} from "@/lib/scheduler";
import {
  getSchedulerPriorityColor,
  withAlpha,
} from "@/lib/scheduler/palette";

const CALENDAR_TABS: Array<{ label: string; value: SchedulerView }> = [
  { label: "Month", value: "month" },
  { label: "Week", value: "week" },
  { label: "Day", value: "day" },
  { label: "Agenda", value: "agenda" },
];

const TOP_TABS: Array<{ label: string; value: SchedulerTab }> = [
  { label: "Calendar", value: "calendar" },
  { label: "Tasks", value: "tasks" },
  { label: "Alerts", value: "alerts" },
];

const TASK_FILTERS: SchedulerFilter[] = ["all", "overdue", "today", "upcoming"];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
type Theme = typeof NAV_THEME.light;

function SchedulerStatsCard({
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

function SchedulerMonthView({
  theme,
  tasks,
  selectedDate,
  todayDate,
  onSelectDate,
}: {
  theme: Theme;
  tasks: SchedulerTask[];
  selectedDate: string;
  todayDate: string;
  onSelectDate: (dateKey: string) => void;
}) {
  const grid = getMonthGrid(selectedDate);
  const rows = Array.from({ length: 6 }, (_, index) => grid.slice(index * 7, index * 7 + 7));

  return (
    <View style={styles.monthGrid}>
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
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

function SchedulerTimelineView({
  theme,
  tasks,
  dateKeys,
  todayDate,
  selectedDate,
  onSelectDate,
  onSwitchToDay,
}: {
  theme: Theme;
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

function SchedulerAgendaView({
  theme,
  tasks,
  todayDate,
  tasksById,
  onOpenTask,
}: {
  theme: Theme;
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

export default function SchedulerScreen() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const todayDate = toDateKey(new Date());

  const [tasks, setTasks] = useState<SchedulerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [activeTab, setActiveTab] = useState<SchedulerTab>("calendar");
  const [activeView, setActiveView] = useState<SchedulerView>("month");
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [taskFilter, setTaskFilter] = useState<SchedulerFilter>("all");
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [isAddSheetVisible, setIsAddSheetVisible] = useState(false);

  const stats = useMemo(() => getSchedulerStats(tasks, todayDate), [tasks, todayDate]);
  const tasksById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const activeTask = detailTaskId ? tasksById.get(detailTaskId) ?? null : null;

  const fabPulse = useSharedValue(1);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabPulse.value }],
  }));

  useEffect(() => {
    if (stats.overdue > 0) {
      fabPulse.value = withRepeat(withTiming(1.05, { duration: 900 }), -1, true);
      return;
    }

    fabPulse.value = withTiming(1, { duration: 180 });
  }, [fabPulse, stats.overdue]);

  async function refreshTasks(options?: { silent?: boolean }) {
    if (!options?.silent) {
      setLoading(true);
    }

    setHasError(false);
    try {
      const nextTasks = await synchronizeSchedulerState();
      setTasks(nextTasks);
      if (detailTaskId && !nextTasks.some((task) => task.id === detailTaskId)) {
        setDetailTaskId(null);
      }
    } catch (error) {
      setHasError(true);
      if (!options?.silent) {
        toast.error("Could not load scheduler", {
          description: error instanceof Error ? error.message : "Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshTasks();
  }, []);

  async function handleCreateTask(payload: CreateSchedulerTaskPayload) {
    try {
      await createSchedulerTask(payload);
      await refreshTasks({ silent: true });
      setIsAddSheetVisible(false);
      setSelectedDate(payload.dueDate);
      toast.success("Task added");
    } catch (error) {
      toast.error("Could not add task", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  async function handleUpdateTask(taskId: string, patch: Partial<SchedulerTask>) {
    try {
      await updateSchedulerTask(taskId, {
        title: patch.title,
        notes: patch.notes,
        priority: patch.priority,
        dueDate: patch.dueDate,
        time: patch.time,
        recurrence: patch.recurrence,
        dependencyIds: patch.dependencyIds,
        subtasks: patch.subtasks,
        status: patch.status,
      });
      await refreshTasks({ silent: true });
    } catch (error) {
      toast.error("Could not update task", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  async function handleToggleSubtask(taskId: string, subtaskId: string, done: boolean) {
    try {
      await toggleSchedulerSubtask(taskId, subtaskId, done);
      await refreshTasks({ silent: true });
    } catch (error) {
      toast.error("Could not update subtask", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      await deleteSchedulerTask(taskId);
      setDetailTaskId(null);
      await refreshTasks({ silent: true });
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Could not delete task", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

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

  const selectedDateTasks = getTasksForDate(tasks, selectedDate);
  const filteredTasks = filterSchedulerTasks(tasks, taskFilter, todayDate);
  const alerts = getAlertBuckets(tasks, todayDate);
  const timelineDates = activeView === "day" ? [selectedDate] : getWeekDateKeys(selectedDate);

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[Typography.displaySM, { color: theme.foreground }]} selectable>
              Scheduler
            </Text>
            <Text style={[Typography.bodySM, { color: theme.mutedForeground }]} selectable>
              {formatCurrentDate()}
            </Text>
          </View>

          {stats.overdue > 0 ? (
            <SchedulerTag label={`${stats.overdue} overdue`} color={theme.destructive} />
          ) : null}
        </View>

        <View style={styles.statsRow}>
          <SchedulerStatsCard label="Overdue" value={stats.overdue} color={theme.destructive} />
          <SchedulerStatsCard label="Today" value={stats.today} color={theme.chart4} />
          <SchedulerStatsCard label="Upcoming" value={stats.upcoming} color={theme.chart2} />
        </View>

        <View style={[styles.topTabs, { borderColor: theme.border, backgroundColor: theme.card }]}>
          {TOP_TABS.map((tab) => {
            const active = activeTab === tab.value;
            return (
              <Pressable
                key={tab.value}
                onPress={() => setActiveTab(tab.value)}
                style={[
                  styles.topTabButton,
                  active && {
                    borderBottomColor: theme.primary,
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    Typography.labelMD,
                    { color: active ? theme.foreground : theme.mutedForeground },
                  ]}
                  selectable
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {hasError ? (
          <Banner
            variant="error"
            title="Scheduler is unavailable"
            message="The latest data could not be loaded."
            actionLabel="Retry"
            onActionPress={() => void refreshTasks()}
          />
        ) : null}

        {loading ? (
          <View style={styles.loadingState}>
            <Spinner />
            <Text style={[Typography.bodySM, { color: theme.mutedForeground }]} selectable>
              Loading tasks...
            </Text>
          </View>
        ) : null}

        {!loading && activeTab === "calendar" ? (
          <View style={styles.calendarSection}>
            <View style={[styles.viewSwitcher, { backgroundColor: theme.muted, borderColor: theme.border }]}>
              {CALENDAR_TABS.map((tab) => (
                <Pressable
                  key={tab.value}
                  onPress={() => setActiveView(tab.value)}
                  style={[
                    styles.viewSwitcherPill,
                    {
                      backgroundColor:
                        activeView === tab.value ? theme.primary : "transparent",
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
                  tasks={tasks}
                  selectedDate={selectedDate}
                  todayDate={todayDate}
                  onSelectDate={setSelectedDate}
                />
              ) : null}

              {activeView === "week" ? (
                <SchedulerTimelineView
                  theme={theme}
                  tasks={tasks}
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
                  tasks={tasks}
                  dateKeys={[selectedDate]}
                  todayDate={todayDate}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              ) : null}

              {activeView === "agenda" ? (
                <SchedulerAgendaView
                  theme={theme}
                  tasks={tasks}
                  todayDate={todayDate}
                  tasksById={tasksById}
                  onOpenTask={setDetailTaskId}
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
                        dependencyCount={getOutstandingDependencyCount(task, tasksById)}
                        onPress={() => setDetailTaskId(task.id)}
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
          </View>
        ) : null}

        {!loading && activeTab === "tasks" ? (
          <View style={styles.tasksSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {TASK_FILTERS.map((filter) => {
                const label =
                  filter === "overdue"
                    ? `Overdue${stats.overdue ? ` (${stats.overdue})` : ""}`
                    : filter.charAt(0).toUpperCase() + filter.slice(1);
                return (
                  <Chip
                    key={filter}
                    label={label}
                    selected={taskFilter === filter}
                    onSelect={() => setTaskFilter(filter)}
                  />
                );
              })}
            </ScrollView>

            {filteredTasks.length > 0 ? (
              <View style={styles.listGroup}>
                {filteredTasks.map((task) => (
                  <SchedulerTaskRow
                    key={task.id}
                    task={task}
                    theme={theme}
                    dependencyCount={getOutstandingDependencyCount(task, tasksById)}
                    onPress={() => setDetailTaskId(task.id)}
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                title="No tasks here"
                message="Try another filter or add a fresh task."
                icon={<Text style={Typography.displaySM}>🎉</Text>}
              />
            )}
          </View>
        ) : null}

        {!loading && activeTab === "alerts" ? (
          <View style={styles.alertsSection}>
            {alerts.overdue.length > 0 ? (
              <View style={styles.alertSection}>
                <Text style={[Typography.labelXS, { color: theme.destructive }]} selectable>
                  🔴 Overdue
                </Text>
                <View style={styles.listGroup}>
                  {alerts.overdue.map((task) => (
                    <SchedulerAlertCard
                      key={task.id}
                      task={task}
                      color={theme.destructive}
                      icon="⚠️"
                      subtitle={`Was due ${task.dueDate}`}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {alerts.today.length > 0 ? (
              <View style={styles.alertSection}>
                <Text style={[Typography.labelXS, { color: theme.chart4 }]} selectable>
                  🟡 Due Today
                </Text>
                <View style={styles.listGroup}>
                  {alerts.today.map((task) => (
                    <SchedulerAlertCard
                      key={task.id}
                      task={task}
                      color={theme.chart4}
                      icon="📋"
                      subtitle={
                        task.time
                          ? `${formatTimeLabel(task.time)}${task.dependencyIds.length ? ` · ${task.dependencyIds.length} deps` : ""}`
                          : task.dependencyIds.length
                            ? `${task.dependencyIds.length} dependencies`
                            : "Due before today ends"
                      }
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {alerts.upcoming.length > 0 ? (
              <View style={styles.alertSection}>
                <Text style={[Typography.labelXS, { color: theme.chart2 }]} selectable>
                  🟢 Coming Up
                </Text>
                <View style={styles.listGroup}>
                  {alerts.upcoming.map((task) => (
                    <SchedulerAlertCard
                      key={task.id}
                      task={task}
                      color={theme.chart2}
                      icon="⏳"
                      subtitle={`Due ${formatShortDate(task.dueDate)}`}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {!alerts.overdue.length && !alerts.today.length && !alerts.upcoming.length ? (
              <EmptyState
                title="All clear!"
                message="No alerts at the moment."
                icon={<Text style={Typography.displaySM}>✅</Text>}
              />
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <Animated.View style={[styles.fabWrap, fabStyle]}>
        <Pressable onPress={() => setIsAddSheetVisible(true)} style={styles.fabButton}>
          <LinearGradient
            colors={["#7C6EFA", "#A78BFA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Text style={[Typography.titleSM, { color: "#ffffff" }]} selectable>
              +
            </Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <SchedulerAddTaskSheet
        visible={isAddSheetVisible}
        onClose={() => setIsAddSheetVisible(false)}
        onSubmit={handleCreateTask}
      />

      <SchedulerTaskDetailSheet
        visible={Boolean(activeTask)}
        task={activeTask}
        tasksById={tasksById}
        theme={theme}
        onClose={() => setDetailTaskId(null)}
        onUpdateTask={handleUpdateTask}
        onToggleSubtask={handleToggleSubtask}
        onDeleteTask={handleDeleteTask}
        onOpenTask={setDetailTaskId}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingTop: UI_PRESETS.spacing.screen,
    paddingBottom: 120,
    gap: UI_PRESETS.spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: UI_PRESETS.spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: UI_PRESETS.spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.lg,
    paddingHorizontal: UI_PRESETS.spacing.lg,
    paddingVertical: UI_PRESETS.spacing.md,
    gap: UI_PRESETS.spacing.xs,
  },
  topTabs: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.xl,
    overflow: "hidden",
  },
  topTabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: UI_PRESETS.spacing.md,
  },
  loadingState: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
  calendarSection: {
    gap: UI_PRESETS.spacing.md,
  },
  tasksSection: {
    gap: UI_PRESETS.spacing.md,
  },
  alertsSection: {
    gap: UI_PRESETS.spacing.md,
  },
  alertSection: {
    gap: UI_PRESETS.spacing.sm,
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
  selectedDayCard: {
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
  filterRow: {
    gap: UI_PRESETS.spacing.xs,
  },
  fabWrap: {
    position: "absolute",
    right: UI_PRESETS.spacing.screen,
    bottom: UI_PRESETS.spacing.section,
  },
  fabButton: {
    borderRadius: 16,
  },
  fabGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(124, 110, 250, 0.35)",
  },
});

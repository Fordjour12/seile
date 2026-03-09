import { buildLocalDueDateTime, compareDateKeys, formatShortDate, getDateRange, shiftDateKey } from "./date";
import type { SchedulerFilter, SchedulerStats, SchedulerTask } from "./types";

export const SCHEDULER_PRIORITY_LEVEL: Record<SchedulerTask["priority"], number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const PRIORITY_ORDER: Record<SchedulerTask["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function sortTasks(left: SchedulerTask, right: SchedulerTask): number {
  const dueDateCompare = compareDateKeys(left.dueDate, right.dueDate);
  if (dueDateCompare !== 0) {
    return dueDateCompare;
  }

  const leftTime = left.time ?? "99:99";
  const rightTime = right.time ?? "99:99";
  const timeCompare = leftTime.localeCompare(rightTime);
  if (timeCompare !== 0) {
    return timeCompare;
  }

  return left.title.localeCompare(right.title);
}

export function getTaskProgress(task: SchedulerTask): number {
  if (!task.subtasks.length) {
    return 0;
  }

  const complete = task.subtasks.filter((item) => item.done).length;
  return Math.round((complete / task.subtasks.length) * 100);
}

export function getTasksForDate(tasks: SchedulerTask[], dateKey: string): SchedulerTask[] {
  return tasks.filter((item) => item.dueDate === dateKey).sort(sortTasks);
}

export function getOpenTasks(tasks: SchedulerTask[]): SchedulerTask[] {
  return tasks.filter((item) => item.status !== "done");
}

export function getSchedulerStats(tasks: SchedulerTask[], todayDate: string): SchedulerStats {
  const openTasks = getOpenTasks(tasks);
  return {
    overdue: openTasks.filter((item) => item.status === "overdue").length,
    today: openTasks.filter((item) => item.dueDate === todayDate).length,
    upcoming: openTasks.filter((item) => item.dueDate > todayDate).length,
  };
}

export function filterSchedulerTasks(
  tasks: SchedulerTask[],
  filter: SchedulerFilter,
  todayDate: string,
): SchedulerTask[] {
  const openTasks = getOpenTasks(tasks);
  const filtered =
    filter === "all"
      ? tasks
      : filter === "overdue"
        ? openTasks.filter((item) => item.status === "overdue")
        : filter === "today"
          ? openTasks.filter((item) => item.dueDate === todayDate)
          : openTasks.filter((item) => item.dueDate > todayDate);

  return [...filtered].sort(sortTasks);
}

export function getAlertBuckets(tasks: SchedulerTask[], todayDate: string) {
  const openTasks = getOpenTasks(tasks);
  return {
    overdue: openTasks.filter((item) => item.status === "overdue").sort(sortTasks),
    today: openTasks.filter((item) => item.dueDate === todayDate && item.status !== "overdue").sort(sortTasks),
    upcoming: openTasks
      .filter((item) => item.dueDate > todayDate && item.dueDate <= shiftDateKey(todayDate, 3))
      .sort(sortTasks),
  };
}

export function getMonthDots(tasks: SchedulerTask[], dateKey: string): SchedulerTask[] {
  return getTasksForDate(tasks, dateKey)
    .sort((left, right) => {
      if (left.status === "overdue" && right.status !== "overdue") {
        return -1;
      }
      if (left.status !== "overdue" && right.status === "overdue") {
        return 1;
      }
      return PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority];
    })
    .slice(0, 3);
}

export function getTimelineTasks(tasks: SchedulerTask[], dateKey: string): SchedulerTask[] {
  return getTasksForDate(tasks, dateKey)
    .filter((item) => item.time)
    .sort(sortTasks);
}

export function getTasksForHour(tasks: SchedulerTask[], dateKey: string, hour: number): SchedulerTask[] {
  return getTimelineTasks(tasks, dateKey).filter((item) => Number(item.time?.split(":")[0] ?? -1) === hour);
}

export function getAgendaSections(tasks: SchedulerTask[], todayDate: string) {
  const range = getDateRange(shiftDateKey(todayDate, -2), 14);
  return range
    .map((dateKey) => ({
      dateKey,
      tasks: getTasksForDate(tasks, dateKey),
    }))
    .filter((section) => section.tasks.length > 0);
}

export function getTaskDateSummary(task: SchedulerTask): string {
  if (task.status === "overdue") {
    return "Overdue";
  }

  return formatShortDate(task.dueDate);
}

export function getUpcomingNotificationBody(task: SchedulerTask, todayDate: string): string {
  if (task.dueDate === todayDate) {
    return task.time ? `Due at ${task.time}` : "Due today";
  }

  return `Due on ${formatShortDate(task.dueDate)}`;
}

export function getOutstandingDependencyCount(task: SchedulerTask, tasksById: Map<string, SchedulerTask>): number {
  return task.dependencyIds.filter((dependencyId) => {
    const dependency = tasksById.get(dependencyId);
    return dependency && dependency.status !== "done";
  }).length;
}

export function getDependencyTasks(task: SchedulerTask, tasksById: Map<string, SchedulerTask>): SchedulerTask[] {
  return task.dependencyIds
    .map((dependencyId) => tasksById.get(dependencyId))
    .filter((item): item is SchedulerTask => Boolean(item));
}

export function buildOverdueDigest(tasks: SchedulerTask[]): string {
  return tasks
    .filter((item) => item.status === "overdue")
    .map((item) => `${item.id}:${item.title}`)
    .join("|");
}

export function shouldScheduleTaskNotification(task: SchedulerTask): boolean {
  if (task.status === "done" || task.status === "overdue") {
    return false;
  }

  if (!task.time || task.time.trim().length === 0) {
    return false;
  }

  return buildLocalDueDateTime(task.dueDate, task.time).getTime() > Date.now();
}

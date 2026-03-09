import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createSchedulerTask,
  deleteSchedulerTask,
  toggleSchedulerSubtask,
  updateSchedulerTask,
} from "./repository";
import { getAlertBuckets, getSchedulerStats } from "./helpers";
import { synchronizeSchedulerState } from "./service";
import type {
  CreateSchedulerTaskPayload,
  SchedulerStats,
  SchedulerTask,
  UpdateSchedulerTaskPayload,
} from "./types";

export type UseSchedulerDataResult = {
  tasks: SchedulerTask[];
  tasksById: Map<string, SchedulerTask>;
  loading: boolean;
  error: string | null;
  refresh: (options?: { silent?: boolean; throwOnError?: boolean }) => Promise<void>;
  stats: SchedulerStats;
  alerts: {
    overdue: SchedulerTask[];
    today: SchedulerTask[];
    upcoming: SchedulerTask[];
  };
  createTask: (payload: CreateSchedulerTaskPayload) => Promise<SchedulerTask>;
  updateTask: (id: string, payload: UpdateSchedulerTaskPayload) => Promise<SchedulerTask>;
  toggleSubtask: (id: string, subtaskId: string, done: boolean) => Promise<SchedulerTask>;
  deleteTask: (id: string) => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return "Please try again.";
}

export function useSchedulerData(): UseSchedulerDataResult {
  const [tasks, setTasks] = useState<SchedulerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayDate, setTodayDate] = useState(() => getTodayDateKey());

  const refresh = useCallback(async (options?: { silent?: boolean; throwOnError?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }

    setError(null);

    try {
      const nextTasks = await synchronizeSchedulerState();
      setTasks(nextTasks);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
      if (options?.throwOnError) {
        throw caughtError;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh().catch(() => null);
  }, [refresh]);

  useEffect(() => {
    function scheduleMidnightRefresh() {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);

      return setTimeout(() => {
        setTodayDate(getTodayDateKey());
      }, nextMidnight.getTime() - now.getTime());
    }

    const timer = scheduleMidnightRefresh();
    return () => {
      clearTimeout(timer);
    };
  }, [todayDate]);

  const createTask = useCallback(
    async (payload: CreateSchedulerTaskPayload): Promise<SchedulerTask> => {
      const created = await createSchedulerTask(payload);
      const nextTasks = await synchronizeSchedulerState();
      setTasks(nextTasks);
      setError(null);
      setLoading(false);

      return nextTasks.find((task) => task.id === created.id) ?? created;
    },
    [],
  );

  const patchTask = useCallback(
    async (id: string, payload: UpdateSchedulerTaskPayload): Promise<SchedulerTask> => {
      const updated = await updateSchedulerTask(id, payload);
      const nextTasks = await synchronizeSchedulerState();
      setTasks(nextTasks);
      setError(null);
      setLoading(false);

      return nextTasks.find((task) => task.id === updated.id) ?? updated;
    },
    [],
  );

  const toggleSubtask = useCallback(
    async (id: string, subtaskId: string, done: boolean): Promise<SchedulerTask> => {
      const updated = await toggleSchedulerSubtask(id, subtaskId, done);
      const nextTasks = await synchronizeSchedulerState();
      setTasks(nextTasks);
      setError(null);
      setLoading(false);

      return nextTasks.find((task) => task.id === updated.id) ?? updated;
    },
    [],
  );

  const removeTask = useCallback(async (id: string): Promise<void> => {
    try {
      const deleted = await deleteSchedulerTask(id);
      if (!deleted) {
        setError("Could not delete task. Please try again.");
        return;
      }

      const nextTasks = await synchronizeSchedulerState();
      setTasks(nextTasks);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const tasksById = useMemo(
    () => new Map(tasks.map((task) => [task.id, task])),
    [tasks],
  );
  const stats = useMemo(() => getSchedulerStats(tasks, todayDate), [tasks, todayDate]);
  const alerts = useMemo(() => getAlertBuckets(tasks, todayDate), [tasks, todayDate]);

  return {
    tasks,
    tasksById,
    loading,
    error,
    refresh,
    stats,
    alerts,
    createTask,
    updateTask: patchTask,
    toggleSubtask,
    deleteTask: removeTask,
  };
}

function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

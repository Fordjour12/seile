import { postJson } from "@/lib/accounts/http-client";

import type {
  CreateSchedulerTaskPayload,
  SchedulerTask,
  SchedulerTaskDraftSubtask,
  UpdateSchedulerTaskPayload,
} from "./types";

type BackendSchedulerTask = {
  _id: string;
  title: string;
  notes?: string | null;
  status: SchedulerTask["status"];
  priority: SchedulerTask["priority"];
  dueDate: string;
  time?: string | null;
  recurrence: SchedulerTask["recurrence"];
  dependencyIds: string[];
  subtasks: Array<{
    id: string;
    title: string;
    done: boolean;
  }>;
  previousTaskId?: string | null;
  nextTaskId?: string | null;
  completedAt?: number | null;
  createdAt: number;
  updatedAt: number;
};

function mapSchedulerTask(task: BackendSchedulerTask): SchedulerTask {
  return {
    id: task._id,
    title: task.title,
    notes: task.notes ?? null,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    time: task.time ?? null,
    recurrence: task.recurrence,
    dependencyIds: task.dependencyIds,
    subtasks: task.subtasks,
    previousTaskId: task.previousTaskId ?? null,
    nextTaskId: task.nextTaskId ?? null,
    completedAt: task.completedAt ? new Date(task.completedAt).toISOString() : null,
    createdAt: new Date(task.createdAt).toISOString(),
    updatedAt: new Date(task.updatedAt).toISOString(),
  };
}

function mapSubtasks(subtasks: SchedulerTaskDraftSubtask[] | undefined) {
  return subtasks?.map((item) => ({
    id: item.id ?? "",
    title: item.title,
    done: item.done ?? false,
  }));
}

export async function listSchedulerTasks(includeCompleted: boolean = true): Promise<SchedulerTask[]> {
  const rows = await postJson<BackendSchedulerTask[]>("/scheduler/tasks/list", {
    includeCompleted,
  });

  return rows.map(mapSchedulerTask);
}

export async function getSchedulerTask(id: string): Promise<SchedulerTask | null> {
  const row = await postJson<BackendSchedulerTask | null>("/scheduler/tasks/getById", { id });
  return row ? mapSchedulerTask(row) : null;
}

export async function createSchedulerTask(payload: CreateSchedulerTaskPayload): Promise<SchedulerTask> {
  const row = await postJson<BackendSchedulerTask>("/scheduler/tasks/create", {
    title: payload.title,
    notes: payload.notes,
    priority: payload.priority,
    dueDate: payload.dueDate,
    time: payload.time,
    recurrence: payload.recurrence ?? "none",
    dependencyIds: payload.dependencyIds,
    subtasks: mapSubtasks(payload.subtasks),
  });

  return mapSchedulerTask(row);
}

export async function updateSchedulerTask(
  id: string,
  payload: UpdateSchedulerTaskPayload,
): Promise<SchedulerTask> {
  const row = await postJson<BackendSchedulerTask>("/scheduler/tasks/update", {
    id,
    title: payload.title,
    notes: payload.notes,
    priority: payload.priority,
    dueDate: payload.dueDate,
    time: payload.time,
    recurrence: payload.recurrence,
    dependencyIds: payload.dependencyIds,
    subtasks: mapSubtasks(payload.subtasks),
    status: payload.status,
  });

  return mapSchedulerTask(row);
}

export async function toggleSchedulerSubtask(
  id: string,
  subtaskId: string,
  done: boolean,
): Promise<SchedulerTask> {
  const row = await postJson<BackendSchedulerTask>("/scheduler/tasks/toggle-subtask", {
    id,
    subtaskId,
    done,
  });

  return mapSchedulerTask(row);
}

export async function deleteSchedulerTask(id: string): Promise<boolean> {
  return postJson<boolean>("/scheduler/tasks/delete", { id });
}

export async function reconcileSchedulerTasks(todayDate: string): Promise<SchedulerTask[]> {
  const rows = await postJson<BackendSchedulerTask[]>("/scheduler/tasks/reconcile", {
    todayDate,
  });

  return rows.map(mapSchedulerTask);
}

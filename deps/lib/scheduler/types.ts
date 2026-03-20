export type SchedulerTaskStatus = "todo" | "in_progress" | "done" | "overdue";
export type SchedulerTaskPriority = "low" | "medium" | "high";
export type SchedulerTaskRecurrence = "none" | "daily" | "weekly" | "monthly";
export type SchedulerView = "month" | "week" | "day" | "agenda";
export type SchedulerTab = "calendar" | "tasks" | "alerts";
export type SchedulerFilter = "all" | "overdue" | "today" | "upcoming";

export type SchedulerTaskSubtask = {
  id: string;
  title: string;
  done: boolean;
};

export type SchedulerTask = {
  id: string;
  title: string;
  notes?: string | null;
  status: SchedulerTaskStatus;
  priority: SchedulerTaskPriority;
  dueDate: string;
  time?: string | null;
  recurrence: SchedulerTaskRecurrence;
  dependencyIds: string[];
  subtasks: SchedulerTaskSubtask[];
  previousTaskId?: string | null;
  nextTaskId?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SchedulerTaskDraftSubtask = {
  id?: string;
  title: string;
  done?: boolean;
};

export type CreateSchedulerTaskPayload = {
  title: string;
  notes?: string | null;
  priority: SchedulerTaskPriority;
  dueDate: string;
  time?: string | null;
  recurrence?: SchedulerTaskRecurrence;
  dependencyIds?: string[];
  subtasks?: SchedulerTaskDraftSubtask[];
};

export type UpdateSchedulerTaskPayload = {
  title?: string;
  notes?: string | null;
  priority?: SchedulerTaskPriority;
  dueDate?: string;
  time?: string | null;
  recurrence?: SchedulerTaskRecurrence;
  dependencyIds?: string[];
  subtasks?: SchedulerTaskDraftSubtask[];
  status?: SchedulerTaskStatus;
};

export type SchedulerStats = {
  overdue: number;
  today: number;
  upcoming: number;
};

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const schedulerTaskStatusValidator = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("done"),
  v.literal("overdue"),
);

export const schedulerTaskPriorityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);

export const schedulerTaskRecurrenceValidator = v.union(
  v.literal("none"),
  v.literal("daily"),
  v.literal("weekly"),
  v.literal("monthly"),
);

export const schedulerTaskSubtaskValidator = v.object({
  id: v.string(),
  title: v.string(),
  done: v.boolean(),
});

export const schedulerTasksTable = defineTable({
  userId: v.string(),
  title: v.string(),
  notes: v.optional(v.union(v.string(), v.null())),
  status: schedulerTaskStatusValidator,
  priority: schedulerTaskPriorityValidator,
  dueDate: v.string(),
  time: v.optional(v.union(v.string(), v.null())),
  recurrence: schedulerTaskRecurrenceValidator,
  dependencyIds: v.array(v.id("schedulerTasks")),
  subtasks: v.array(schedulerTaskSubtaskValidator),
  previousTaskId: v.optional(v.union(v.id("schedulerTasks"), v.null())),
  nextTaskId: v.optional(v.union(v.id("schedulerTasks"), v.null())),
  completedAt: v.optional(v.union(v.number(), v.null())),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_dueDate", ["userId", "dueDate"])
  .index("by_userId_status", ["userId", "status"])
  .index("by_userId_dueDate_and_status", ["userId", "dueDate", "status"]);

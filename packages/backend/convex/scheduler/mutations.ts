import { ConvexError, v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import { mutation, type MutationCtx } from "../_generated/server";
import { requireUserId } from "../lib/identity";
import {
  schedulerTaskPriorityValidator,
  schedulerTaskRecurrenceValidator,
  schedulerTaskStatusValidator,
  schedulerTaskSubtaskValidator,
} from "../schema/scheduler_tasks";

function normalizeTitle(title: string): string {
  const value = title.trim();
  if (!value) {
    throw new ConvexError("Validation: title is required");
  }

  if (value.length > 120) {
    throw new ConvexError("Validation: title must be 120 characters or fewer");
  }

  return value;
}

function normalizeNotes(notes: string | null | undefined): string | null {
  if (notes === undefined || notes === null) {
    return null;
  }

  const value = notes.trim();
  return value.length > 0 ? value : null;
}

function normalizeDueDate(dueDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    throw new ConvexError("Validation: dueDate must use YYYY-MM-DD");
  }

  return dueDate;
}

function normalizeTime(time: string | null | undefined): string | null {
  if (time === undefined || time === null || time.trim().length === 0) {
    return null;
  }

  const value = time.trim();
  if (!/^\d{2}:\d{2}$/.test(value)) {
    throw new ConvexError("Validation: time must use HH:MM");
  }

  const [hours, minutes] = value.split(":").map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new ConvexError("Validation: time must use a valid 24-hour clock");
  }

  return value;
}

function dateKeyToDate(dueDate: string): Date {
  const [year, month, day] = dueDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

function dateToDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;
}

function getNextDueDate(dueDate: string, recurrence: "none" | "daily" | "weekly" | "monthly"): string | null {
  if (recurrence === "none") {
    return null;
  }

  const next = dateKeyToDate(dueDate);
  if (recurrence === "daily") {
    next.setUTCDate(next.getUTCDate() + 1);
  } else if (recurrence === "weekly") {
    next.setUTCDate(next.getUTCDate() + 7);
  } else {
    next.setUTCMonth(next.getUTCMonth() + 1);
  }

  return dateToDateKey(next);
}

function duplicateSubtasks(subtasks: Array<{ title: string }>): Array<Doc<"schedulerTasks">["subtasks"][number]> {
  return subtasks.map((item) => ({
    id: crypto.randomUUID(),
    title: normalizeTitle(item.title),
    done: false,
  }));
}

async function assertDependenciesOwnedByUser(
  ctx: MutationCtx,
  dependencyIds: Id<"schedulerTasks">[],
  currentTaskId?: Id<"schedulerTasks">,
): Promise<void> {
  const userId = await requireUserId(ctx);

  for (const dependencyId of dependencyIds) {
    if (currentTaskId && dependencyId === currentTaskId) {
      throw new ConvexError("Validation: a task cannot depend on itself");
    }

    const dependency = await ctx.db.get(dependencyId);
    if (!dependency || dependency.userId !== userId) {
      throw new ConvexError("Validation: dependency task not found");
    }
  }
}

async function getOwnedTask(
  ctx: MutationCtx,
  id: Id<"schedulerTasks">,
): Promise<Doc<"schedulerTasks">> {
  const userId = await requireUserId(ctx);
  const task = await ctx.db.get(id);
  if (!task || task.userId !== userId) {
    throw new ConvexError("Scheduler task not found");
  }

  return task;
}

export const createSchedulerTask = mutation({
  args: {
    title: v.string(),
    notes: v.optional(v.union(v.string(), v.null())),
    priority: schedulerTaskPriorityValidator,
    dueDate: v.string(),
    time: v.optional(v.union(v.string(), v.null())),
    recurrence: v.optional(schedulerTaskRecurrenceValidator),
    dependencyIds: v.optional(v.array(v.id("schedulerTasks"))),
    subtasks: v.optional(v.array(schedulerTaskSubtaskValidator)),
  },
  handler: async (ctx, args): Promise<Doc<"schedulerTasks">> => {
    const dependencyIds = args.dependencyIds ?? [];
    await assertDependenciesOwnedByUser(ctx, dependencyIds);
    const userId = await requireUserId(ctx);

    const now = Date.now();
    const id = await ctx.db.insert("schedulerTasks", {
      userId,
      title: normalizeTitle(args.title),
      notes: normalizeNotes(args.notes),
      status: "todo",
      priority: args.priority,
      dueDate: normalizeDueDate(args.dueDate),
      time: normalizeTime(args.time),
      recurrence: args.recurrence ?? "none",
      dependencyIds,
      subtasks: duplicateSubtasks(args.subtasks ?? []),
      previousTaskId: null,
      nextTaskId: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    const created = await ctx.db.get(id);
    if (!created) {
      throw new ConvexError("Failed to create scheduler task");
    }

    return created;
  },
});

export const updateSchedulerTask = mutation({
  args: {
    id: v.id("schedulerTasks"),
    title: v.optional(v.string()),
    notes: v.optional(v.union(v.string(), v.null())),
    priority: v.optional(schedulerTaskPriorityValidator),
    dueDate: v.optional(v.string()),
    time: v.optional(v.union(v.string(), v.null())),
    recurrence: v.optional(schedulerTaskRecurrenceValidator),
    dependencyIds: v.optional(v.array(v.id("schedulerTasks"))),
    subtasks: v.optional(v.array(schedulerTaskSubtaskValidator)),
    status: v.optional(schedulerTaskStatusValidator),
  },
  handler: async (ctx, args): Promise<Doc<"schedulerTasks">> => {
    const existing = await getOwnedTask(ctx, args.id);

    if (args.dependencyIds) {
      await assertDependenciesOwnedByUser(ctx, args.dependencyIds, args.id);
    }

    const nextStatus = args.status ?? existing.status;
    const patch: Partial<Doc<"schedulerTasks">> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) patch.title = normalizeTitle(args.title);
    if (args.notes !== undefined) patch.notes = normalizeNotes(args.notes);
    if (args.priority !== undefined) patch.priority = args.priority;
    if (args.dueDate !== undefined) patch.dueDate = normalizeDueDate(args.dueDate);
    if (args.time !== undefined) patch.time = normalizeTime(args.time);
    if (args.recurrence !== undefined) patch.recurrence = args.recurrence;
    if (args.dependencyIds !== undefined) patch.dependencyIds = args.dependencyIds;
    if (args.subtasks !== undefined) {
      patch.subtasks = args.subtasks.map((item) => ({
        id: item.id || crypto.randomUUID(),
        title: normalizeTitle(item.title),
        done: item.done,
      }));
    }
    if (args.status !== undefined) patch.status = nextStatus;

    if (nextStatus === "done") {
      patch.completedAt = existing.completedAt ?? Date.now();
    } else if (existing.status === "done") {
      patch.completedAt = null;
    }

    await ctx.db.patch(args.id, patch);

    let updated = await getOwnedTask(ctx, args.id);
    if (
      existing.status !== "done" &&
      nextStatus === "done" &&
      updated.recurrence !== "none" &&
      !updated.nextTaskId
    ) {
      const nextDueDate = getNextDueDate(updated.dueDate, updated.recurrence);
      if (nextDueDate) {
        const nextId = await ctx.db.insert("schedulerTasks", {
          userId: updated.userId,
          title: updated.title,
          notes: updated.notes ?? null,
          status: "todo",
          priority: updated.priority,
          dueDate: nextDueDate,
          time: updated.time ?? null,
          recurrence: updated.recurrence,
          dependencyIds: updated.dependencyIds,
          subtasks: duplicateSubtasks(updated.subtasks),
          previousTaskId: updated._id,
          nextTaskId: null,
          completedAt: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        await ctx.db.patch(updated._id, {
          nextTaskId: nextId,
          updatedAt: Date.now(),
        });
        updated = await getOwnedTask(ctx, args.id);
      }
    }

    return updated;
  },
});

export const toggleSchedulerSubtask = mutation({
  args: {
    id: v.id("schedulerTasks"),
    subtaskId: v.string(),
    done: v.boolean(),
  },
  handler: async (ctx, args): Promise<Doc<"schedulerTasks">> => {
    const existing = await getOwnedTask(ctx, args.id);
    const nextSubtasks = existing.subtasks.map((item) =>
      item.id === args.subtaskId ? { ...item, done: args.done } : item,
    );

    await ctx.db.patch(args.id, {
      subtasks: nextSubtasks,
      updatedAt: Date.now(),
    });

    return await getOwnedTask(ctx, args.id);
  },
});

export const deleteSchedulerTask = mutation({
  args: {
    id: v.id("schedulerTasks"),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const existing = await getOwnedTask(ctx, args.id);
    const relatedTasks = await ctx.db
      .query("schedulerTasks")
      .withIndex("by_userId", (q) => q.eq("userId", existing.userId))
      .collect();

    for (const task of relatedTasks) {
      if (task._id === args.id) {
        continue;
      }

      const dependencyIds = task.dependencyIds.filter((dependencyId) => dependencyId !== args.id);
      const nextPatch: Partial<Doc<"schedulerTasks">> = {};

      if (dependencyIds.length !== task.dependencyIds.length) {
        nextPatch.dependencyIds = dependencyIds;
      }
      if (task.previousTaskId === args.id) {
        nextPatch.previousTaskId = null;
      }
      if (task.nextTaskId === args.id) {
        nextPatch.nextTaskId = null;
      }

      if (Object.keys(nextPatch).length > 0) {
        nextPatch.updatedAt = Date.now();
        await ctx.db.patch(task._id, nextPatch);
      }
    }

    await ctx.db.delete(args.id);
    return true;
  },
});

export const reconcileSchedulerTasks = mutation({
  args: {
    todayDate: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"schedulerTasks">[]> => {
    const userId = await requireUserId(ctx);
    const todayDate = normalizeDueDate(args.todayDate);
    const rows = await ctx.db
      .query("schedulerTasks")
      .withIndex("by_userId_dueDate", (q) => q.eq("userId", userId))
      .collect();

    for (const task of rows) {
      if (task.status === "done") {
        continue;
      }

      if (task.dueDate < todayDate && task.status !== "overdue") {
        await ctx.db.patch(task._id, {
          status: "overdue",
          updatedAt: Date.now(),
        });
        continue;
      }

      if (task.dueDate >= todayDate && task.status === "overdue") {
        await ctx.db.patch(task._id, {
          status: "todo",
          updatedAt: Date.now(),
        });
      }
    }

    const updatedRows = await ctx.db
      .query("schedulerTasks")
      .withIndex("by_userId_dueDate", (q) => q.eq("userId", userId))
      .collect();

    return updatedRows.sort((left, right) => {
      const dueDateCompare = left.dueDate.localeCompare(right.dueDate);
      if (dueDateCompare !== 0) {
        return dueDateCompare;
      }

      const leftTime = left.time ?? "99:99";
      const rightTime = right.time ?? "99:99";
      return leftTime.localeCompare(rightTime);
    });
  },
});

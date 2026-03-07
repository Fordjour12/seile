import { v } from "convex/values";

import type { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { resolveSystemUserId } from "../lib/security";

function sortTasks(tasks: Doc<"schedulerTasks">[]): Doc<"schedulerTasks">[] {
  return [...tasks].sort((left, right) => {
    const dueDateCompare = left.dueDate.localeCompare(right.dueDate);
    if (dueDateCompare !== 0) {
      return dueDateCompare;
    }

    const leftTime = left.time ?? "99:99";
    const rightTime = right.time ?? "99:99";
    const timeCompare = leftTime.localeCompare(rightTime);
    if (timeCompare !== 0) {
      return timeCompare;
    }

    return left.createdAt - right.createdAt;
  });
}

export const listSchedulerTasks = query({
  args: {
    includeCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<Doc<"schedulerTasks">[]> => {
    const userId = resolveSystemUserId();
    const rows = await ctx.db
      .query("schedulerTasks")
      .withIndex("by_userId_dueDate", (q) => q.eq("userId", userId))
      .collect();

    if (args.includeCompleted) {
      return sortTasks(rows);
    }

    return sortTasks(rows.filter((item) => item.status !== "done"));
  },
});

export const getSchedulerTaskById = query({
  args: {
    id: v.id("schedulerTasks"),
  },
  handler: async (ctx, args): Promise<Doc<"schedulerTasks"> | null> => {
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== resolveSystemUserId()) {
      return null;
    }

    return task;
  },
});

export const getSchedulerSummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = resolveSystemUserId();
    const rows = await ctx.db
      .query("schedulerTasks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const total = rows.length;
    const overdue = rows.filter((item) => item.status === "overdue").length;
    const done = rows.filter((item) => item.status === "done").length;

    return {
      total,
      overdue,
      done,
      open: total - done,
    };
  },
});

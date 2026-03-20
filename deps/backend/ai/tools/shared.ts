"use node";

import { api, internal } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";
import type { AIDomain, DomainSnapshot } from "../types";

export async function createTaskDraft(
  ctx: ActionCtx,
  input: {
    title: string;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
  },
) {
  return await ctx.runMutation(api.productivity.planner.mutations.createTask, {
    title: input.title,
    priority: input.priority ?? "medium",
    dueDate: input.dueDate,
  });
}

export async function createHabitDraft(
  ctx: ActionCtx,
  input: {
    name: string;
    cadence?: "daily" | "weekdays" | "weekly" | "custom";
    targetValue?: number;
    scheduleDays?: string[];
  },
) {
  return await ctx.runMutation(api.productivity.planner.mutations.createHabit, {
    name: input.name,
    cadence: input.cadence ?? "daily",
    targetValue: input.targetValue ?? 1,
    scheduleDays: input.scheduleDays,
  });
}

export async function getAllDomainSnapshots(ctx: ActionCtx, userId: string) {
  return (await ctx.runQuery(internal.ai.aggregates.getAllSnapshotsForUser, {
    userId,
  })) as Record<AIDomain, DomainSnapshot>;
}

export async function getWeekSnapshot(
  ctx: ActionCtx,
  userId: string,
): Promise<DomainSnapshot | undefined> {
  const snapshots = await getAllDomainSnapshots(ctx, userId);
  return snapshots?.productivity;
}

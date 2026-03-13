"use node";

import { api, internal } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";
import type { AIDomain, DomainSnapshot } from "../types";

const apiAny = api as any;
const internalApi = internal as unknown as Record<string, Record<string, any>>;

export async function createTaskDraft(
  ctx: ActionCtx,
  input: {
    title: string;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
  },
) {
  return await ctx.runMutation(apiAny["planner/mutations"].createTask, {
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
  return await ctx.runMutation(apiAny["planner/mutations"].createHabit, {
    name: input.name,
    cadence: input.cadence ?? "daily",
    targetValue: input.targetValue ?? 1,
    scheduleDays: input.scheduleDays,
  });
}

export async function getAllDomainSnapshots(ctx: ActionCtx, userId: string) {
  return (await ctx.runQuery(internalApi["ai/aggregates"].getAllSnapshotsForUser, {
    userId,
  })) as Record<AIDomain, DomainSnapshot>;
}

export async function getWeekSnapshot(ctx: ActionCtx, userId: string) {
  const snapshots = await getAllDomainSnapshots(ctx, userId);
  return snapshots.productivity;
}

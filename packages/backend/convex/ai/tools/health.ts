"use node";

import { z } from "zod";

import { api } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";
import { healthCoachAgent } from "../agents/health";
import type { PendingAction } from "../types";
import { isoDateFromTimestamp } from "../../lib/planner";

const apiAny = api as any;

const healthActionSchema = z.object({
  toolName: z.literal("health.logWorkout"),
  title: z.string().min(1),
  preview: z.string().min(1),
  args: z.object({
    type: z.enum([
      "strength",
      "running",
      "walking",
      "cycling",
      "yoga",
      "stretching",
      "sports",
      "recovery",
      "other",
    ]),
    durationMinutes: z.number().int().min(1).max(360),
    intensity: z.enum(["low", "medium", "high"]).default("medium"),
    date: z.string().optional(),
    notes: z.string().optional(),
  }),
});

const healthResponseSchema = z.object({
  reply: z.string().min(1),
  actions: z.array(healthActionSchema).max(2).default([]),
});

export async function analyzeHealthRequest(
  ctx: ActionCtx,
  input: {
    threadId?: string;
    userId: string;
    userMessage: string;
    snapshot: unknown;
    memory: unknown;
  },
) {
  const thread = input.threadId
    ? { threadId: input.threadId }
    : await healthCoachAgent.createThread(ctx, {
        userId: input.userId,
        title: "Health AI",
        summary: "Health specialist conversation",
      });

  const result = await healthCoachAgent.generateObject(ctx, thread, {
    prompt: [
      "Analyze whether the user is trying to log a workout.",
      "Only produce actions for explicit workout logging requests or clear recent workout reports.",
      "If no workout should be logged, return an empty actions array.",
      `Health snapshot: ${JSON.stringify(input.snapshot)}`,
      `Memory: ${JSON.stringify(input.memory)}`,
      `User message: ${input.userMessage}`,
    ].join("\n\n"),
    schema: healthResponseSchema,
  });

  const actions: PendingAction[] = result.object.actions.map((action) => ({
    toolName: action.toolName,
    approvalMode: "confirm",
    args: {
      ...action.args,
      date: action.args.date ?? isoDateFromTimestamp(Date.now()),
    },
    domain: "health",
    previewText: action.preview,
  }));

  return {
    reply: result.object.reply,
    actions,
  };
}

export async function executeHealthPendingAction(
  ctx: ActionCtx,
  action: PendingAction,
) {
  if (action.toolName !== "health.logWorkout") {
    throw new Error(`Unsupported health tool: ${action.toolName}`);
  }

  const args = healthActionSchema.parse({
    toolName: action.toolName,
    title: "Log workout",
    preview: action.previewText,
    args: action.args,
  }).args;

  return await ctx.runMutation(apiAny["health/mutations"].createWorkout, args);
}

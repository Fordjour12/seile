"use node";

import { z } from "zod";

import { api } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";
import { faithCoachAgent } from "../agents/faith";
import type { PendingAction } from "../types";
import { isoDateFromTimestamp } from "../../lib/planner";

const apiAny = api as any;
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const faithActionSchema = z.discriminatedUnion("toolName", [
  z.object({
    toolName: z.literal("faith.createPrayer"),
    title: z.string().min(1),
    preview: z.string().min(1),
    args: z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      category: z.string().optional(),
    }),
  }),
  z.object({
    toolName: z.literal("faith.createDevotionalEntry"),
    title: z.string().min(1),
    preview: z.string().min(1),
    args: z.object({
      title: z.string().min(1),
      source: z.string().optional(),
      passage: z.string().optional(),
      date: isoDateSchema.optional(),
      notes: z.string().optional(),
    }),
  }),
]);

const faithResponseSchema = z.object({
  reply: z.string().min(1),
  actions: z.array(faithActionSchema).max(2).default([]),
});

export async function analyzeFaithRequest(
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
    : await faithCoachAgent.createThread(ctx, {
        userId: input.userId,
        title: "Faith AI",
        summary: "Faith specialist conversation",
      });
  const threadId = input.threadId ?? thread.threadId;

  const result = await faithCoachAgent.generateObject(ctx, thread, {
    prompt: [
      "Analyze whether the user is asking to create a prayer item or devotional entry.",
      "Only produce actions for explicit write requests.",
      "If the request is reflective or informational only, return no actions.",
      `Faith snapshot: ${JSON.stringify(input.snapshot)}`,
      `Memory: ${JSON.stringify(input.memory)}`,
      `User message: ${input.userMessage}`,
    ].join("\n\n"),
    schema: faithResponseSchema,
  });

  const actions: PendingAction[] = result.object.actions.map((action) => ({
    toolName: action.toolName,
    approvalMode: "confirm",
    args:
      action.toolName === "faith.createDevotionalEntry"
        ? {
            ...action.args,
            date: action.args.date ?? isoDateFromTimestamp(Date.now()),
          }
        : action.args,
    domain: "faith",
    previewText: action.preview,
  }));

  return {
    threadId,
    reply: result.object.reply,
    actions,
  };
}

export async function executeFaithPendingAction(
  ctx: ActionCtx,
  action: PendingAction,
) {
  const parsed = faithActionSchema.parse({
    toolName: action.toolName,
    title: action.toolName,
    preview: action.previewText,
    args: action.args,
  });

  if (parsed.toolName === "faith.createPrayer") {
    return await ctx.runMutation(apiAny["spiritual/mutations"].createPrayer, parsed.args);
  }

  return await ctx.runMutation(
    apiAny["spiritual/mutations"].createSpiritualReading,
    parsed.args,
  );
}

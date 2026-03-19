"use node";

import { createThread } from "@convex-dev/agent";

import type { ActionCtx } from "../_generated/server";
import { components } from "../_generated/api";
import { env } from "@seile/env/backend";

export const componentsAny = components as any;

export function ensureAiConfigured() {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error(
      "AI layer is not configured. Set OPENROUTER_API_KEY in the backend environment.",
    );
  }
}

export async function createAiThread(
  ctx: ActionCtx,
  input: {
    userId: string;
    title: string;
    summary: string;
  },
) {
  ensureAiConfigured();
  return await createThread(ctx, componentsAny.agent, input);
}

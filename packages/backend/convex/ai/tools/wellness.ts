"use node";

import type { ActionCtx } from "../../_generated/server";

export async function createJournalPrompt(
  _ctx: ActionCtx,
  input: {
    focus?: string;
    domain?: string;
  },
) {
  const focusText = input.focus ? ` focused on ${input.focus}` : "";
  return {
    prompt: `Take 5 minutes to write about how you're feeling today${focusText}. What's one thing creating pressure, and one thing giving you energy?`,
    suggestedDomain: input.domain ?? "wellness",
  };
}

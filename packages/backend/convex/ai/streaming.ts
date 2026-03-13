"use node";

import { streamText } from "ai";
import type { HttpRouter } from "convex/server";
import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { requireUserId } from "../lib/identity";
import { getDomainPrompt, GLOBAL_SYSTEM_PROMPT } from "./prompts";
import { pickDomainsFromIntent } from "./policies";
import { getModel } from "./model";

const internalApi = internal as unknown as Record<string, Record<string, any>>;

export function registerAiStreamingRoutes(http: HttpRouter) {
  http.route({
    path: "/ai/stream",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const userId = await requireUserId(ctx as any);
      const body = await request.json();
      const prompt =
        body && typeof body === "object" && "prompt" in body && typeof body.prompt === "string"
          ? body.prompt
          : "";

      if (!prompt.trim()) {
        return new Response("Prompt is required.", { status: 400 });
      }

      const domains = pickDomainsFromIntent(prompt);
      const snapshots = await ctx.runQuery(internalApi["ai/aggregates"].getAllSnapshotsForUser, {
        userId,
      });
      const system = [
        GLOBAL_SYSTEM_PROMPT,
        `Active domains: ${domains.join(", ")}`,
        ...domains.map(getDomainPrompt),
        `Snapshots: ${JSON.stringify(snapshots)}`,
      ].join("\n\n");

      const result = streamText({
        model: getModel("fast"),
        system,
        prompt,
      });

      return result.toTextStreamResponse();
    }),
  });
}

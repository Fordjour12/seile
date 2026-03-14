"use node";

import { streamText } from "ai";
import type { HttpRouter } from "convex/server";
import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { requireUserId } from "../lib/identity";
import { getDomainPrompt, GLOBAL_SYSTEM_PROMPT } from "./prompts";
import { pickDomainsFromIntent } from "./policies";
import { getModel } from "./model";
import type { AIDomain, DomainSnapshot } from "./types";

const MAX_STREAMING_SNAPSHOT_CHARS = 2400;
const MAX_STREAMING_DOMAIN_CHARS = 700;

export function registerAiStreamingRoutes(http: HttpRouter) {
  http.route({
    path: "/ai/stream",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const userId = await requireUserId(ctx as any);
      let body: unknown;
      try {
        body = await request.json();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Malformed JSON in /ai/stream request", { message });
        return new Response(`Malformed JSON: ${message}`, { status: 400 });
      }
      const prompt =
        body && typeof body === "object" && "prompt" in body && typeof body.prompt === "string"
          ? body.prompt
          : "";

      if (!prompt.trim()) {
        return new Response("Prompt is required.", { status: 400 });
      }

      const domains = pickDomainsFromIntent(prompt);
      const snapshots = await ctx.runQuery(internal.ai.aggregates.getAllSnapshotsForUser, {
        userId,
      });
      const system = [
        GLOBAL_SYSTEM_PROMPT,
        `Active domains: ${domains.join(", ")}`,
        ...domains.map(getDomainPrompt),
        `Snapshots: ${summarizeSnapshots(snapshots, domains)}`,
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

function summarizeSnapshots(
  snapshots: Record<string, DomainSnapshot>,
  domains: AIDomain[],
) {
  const summaryByDomain = domains.map((domain) => {
    const snapshot = snapshots[domain];
    const compact = JSON.stringify({
      generatedAt: snapshot?.generatedAt ?? null,
      summary: snapshot?.summary ?? {},
    });
    return `${domain}: ${truncateSnapshotText(compact, MAX_STREAMING_DOMAIN_CHARS)}`;
  });

  return truncateSnapshotText(
    summaryByDomain.join("\n"),
    MAX_STREAMING_SNAPSHOT_CHARS,
  );
}

function truncateSnapshotText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
}

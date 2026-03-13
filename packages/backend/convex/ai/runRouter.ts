"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

import { requireUserId } from "../lib/identity";
import { detectCrossDomainSignals } from "./crossDomain";
import { getDomainAvailability, naiveRouteIntent } from "./policies";
import type { AIResponse, AIDomain } from "./types";
import { analyzeFaithRequest } from "./tools/faith";
import { analyzeFinanceRequest } from "./tools/finance";
import { analyzeHealthRequest } from "./tools/health";
import { plannerRouterAgent } from "./agents/router";
import { masterPlannerAgent } from "./agents/planner";
import { wellnessCoachAgent } from "./agents/wellness";
import { healthCoachAgent } from "./agents/health";
import { faithCoachAgent } from "./agents/faith";
import { financeCoachAgent } from "./agents/finance";
import { serializePendingActions } from "./approval";

const internalApi = internal as unknown as Record<string, Record<string, any>>;

export const runAI = action({
  args: {
    userMessage: v.string(),
    threadId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<AIResponse> => {
    const userId = await requireUserId(ctx);
    const route = naiveRouteIntent(args.userMessage);
    const [snapshots, memoryRows] = await Promise.all([
      ctx.runQuery(internalApi["ai/aggregates"].getAllSnapshotsForUser, { userId }),
      ctx.runQuery(internalApi["ai/memory"].getAllMemoryForUser, { userId }),
    ]);
    const crossDomainSignals = detectCrossDomainSignals(snapshots);
    const domainMemory = groupMemoryByDomain(memoryRows);

    if (route.domains.every((domain) => !getDomainAvailability(domain).available)) {
      return {
        type: "message",
        content:
          "That domain is not wired into the Life OS AI layer yet. Try finance, health, faith, or planning for now.",
        domains: route.domains,
      };
    }

    if (route.intent === "cross_domain" || route.intent === "plan" || route.domains.length > 1) {
      const content = await runPlannerStyleResponse(ctx, {
        userId,
        threadId: args.threadId,
        userMessage: args.userMessage,
        snapshots,
        memoryRows,
        crossDomainSignals,
      });
      return {
        type: "message",
        content,
        domains: route.domains,
        crossDomainSignals,
      };
    }

    const domain = route.domains[0];
    if (!getDomainAvailability(domain).available) {
      return {
        type: "message",
        content: `${domain} is recognized but not yet available in this build.`,
        domains: [domain],
      };
    }

    if (domain === "finance") {
      const analysis = await analyzeFinanceRequest(ctx, {
        threadId: args.threadId,
        userId,
        userMessage: args.userMessage,
        snapshot: snapshots.finance,
        memory: domainMemory.finance ?? [],
      });
      if (analysis.actions.length > 0) {
        const approval = await ctx.runMutation(internalApi["ai/approval"].createApprovalRequestInternal, {
          userId,
          actions: serializePendingActions(analysis.actions),
        });
        return {
          type: "approval_request",
          title: analysis.reply,
          actions: analysis.actions,
          requestId: approval.requestId,
        };
      }

      return {
        type: "message",
        content: analysis.reply,
        domains: ["finance"],
      };
    }

    if (domain === "health") {
      const analysis = await analyzeHealthRequest(ctx, {
        threadId: args.threadId,
        userId,
        userMessage: args.userMessage,
        snapshot: snapshots.health,
        memory: domainMemory.health ?? [],
      });
      if (analysis.actions.length > 0) {
        const approval = await ctx.runMutation(internalApi["ai/approval"].createApprovalRequestInternal, {
          userId,
          actions: serializePendingActions(analysis.actions),
        });
        return {
          type: "approval_request",
          title: analysis.reply,
          actions: analysis.actions,
          requestId: approval.requestId,
        };
      }

      return {
        type: "message",
        content: analysis.reply,
        domains: ["health"],
      };
    }

    if (domain === "faith") {
      const analysis = await analyzeFaithRequest(ctx, {
        threadId: args.threadId,
        userId,
        userMessage: args.userMessage,
        snapshot: snapshots.faith,
        memory: domainMemory.faith ?? [],
      });
      if (analysis.actions.length > 0) {
        const approval = await ctx.runMutation(internalApi["ai/approval"].createApprovalRequestInternal, {
          userId,
          actions: serializePendingActions(analysis.actions),
        });
        return {
          type: "approval_request",
          title: analysis.reply,
          actions: analysis.actions,
          requestId: approval.requestId,
        };
      }

      return {
        type: "message",
        content: analysis.reply,
        domains: ["faith"],
      };
    }

    const content = await runSingleDomainResponse(ctx, {
      domain,
      userId,
      threadId: args.threadId,
      userMessage: args.userMessage,
      snapshot: snapshots[domain],
      memory: domainMemory[domain] ?? [],
      crossDomainSignals,
    });

    return {
      type: "message",
      content,
      domains: [domain],
      crossDomainSignals,
    };
  },
});

async function runPlannerStyleResponse(
  ctx: any,
  input: {
    userId: string;
    threadId?: string;
    userMessage: string;
    snapshots: Record<string, unknown>;
    memoryRows: unknown[];
    crossDomainSignals: unknown[];
  },
) {
  const thread = input.threadId
    ? { threadId: input.threadId }
    : await masterPlannerAgent.createThread(ctx, {
        userId: input.userId,
        title: "Life OS Planner",
        summary: "Integrated planning conversation",
      });

  const result = await masterPlannerAgent.generateText(ctx, thread, {
    prompt: [
      `User request: ${input.userMessage}`,
      `Snapshots: ${JSON.stringify(input.snapshots)}`,
      `Memory: ${JSON.stringify(input.memoryRows)}`,
      `Cross-domain signals: ${JSON.stringify(input.crossDomainSignals)}`,
      "Respond with a calm, integrated plan or answer grounded in the data above.",
    ].join("\n\n"),
  });

  return result.text;
}

async function runSingleDomainResponse(
  ctx: any,
  input: {
    domain: AIDomain;
    userId: string;
    threadId?: string;
    userMessage: string;
    snapshot: unknown;
    memory: unknown[];
    crossDomainSignals: unknown[];
  },
) {
  const agent =
    input.domain === "wellness"
      ? wellnessCoachAgent
      : input.domain === "health"
        ? healthCoachAgent
        : input.domain === "faith"
          ? faithCoachAgent
          : input.domain === "finance"
            ? financeCoachAgent
            : plannerRouterAgent;
  const thread = input.threadId
    ? { threadId: input.threadId }
    : await agent.createThread(ctx, {
        userId: input.userId,
        title: `${input.domain} AI`,
        summary: `${input.domain} specialist conversation`,
      });

  const result = await agent.generateText(ctx, thread, {
    prompt: [
      `Domain: ${input.domain}`,
      `User request: ${input.userMessage}`,
      `Domain snapshot: ${JSON.stringify(input.snapshot)}`,
      `Relevant memory: ${JSON.stringify(input.memory)}`,
      `Cross-domain signals: ${JSON.stringify(input.crossDomainSignals)}`,
      "Respond directly and practically. Do not invent data.",
    ].join("\n\n"),
  });

  return result.text;
}

function groupMemoryByDomain(
  rows: Array<{ domain: AIDomain } & Record<string, unknown>>,
) {
  return rows.reduce(
    (acc, row) => {
      const current = acc[row.domain] ?? [];
      current.push(row);
      acc[row.domain] = current;
      return acc;
    },
    {} as Partial<Record<AIDomain, Array<Record<string, unknown>>>>,
  );
}

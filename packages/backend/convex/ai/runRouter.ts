"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

import { requireUserId } from "../lib/identity";
import { detectCrossDomainSignals } from "./crossDomain";
import { getDomainAvailability, naiveRouteIntent } from "./policies";
import { ALL_DOMAINS } from "./types";
import type { AIDomain, RunAIResponse } from "./types";
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
const MAX_MEMORY_ROWS_PER_DOMAIN = 4;
const MAX_MEMORY_VALUE_LENGTH = 220;

type PromptMemoryRow = {
  domain: AIDomain;
  key: string;
  value: string;
  confidence: string;
  updatedAt: number;
};

export const runAI = action({
  args: {
    userMessage: v.string(),
    threadId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<RunAIResponse> => {
    const userId = await requireUserId(ctx);
    const route = naiveRouteIntent(args.userMessage);
    const [snapshots, memoryRows] = await Promise.all([
      ctx.runQuery(internalApi["ai/aggregates"].getAllSnapshotsForUser, { userId }),
      ctx.runQuery(internalApi["ai/memory"].getAllMemoryForUser, { userId }),
    ]);
    const promptMemoryRows = selectPromptMemoryRows(memoryRows);
    const domainMemory = groupMemoryByDomain(promptMemoryRows);
    const crossDomainSignals = detectCrossDomainSignals(snapshots);

    if (route.domains.every((domain) => !getDomainAvailability(domain).available)) {
      return {
        type: "message",
        content:
          "That domain is not wired into the Life OS AI layer yet. Try finance, health, faith, or planning for now.",
        domains: route.domains,
        threadId: null,
      };
    }

    if (route.intent === "cross_domain" || route.intent === "plan" || route.domains.length > 1) {
      const result = await runPlannerStyleResponse(ctx, {
        userId,
        threadId: args.threadId,
        userMessage: args.userMessage,
        snapshots,
        memoryRows: promptMemoryRows,
        crossDomainSignals,
      });
      return {
        type: "message",
        content: result.content,
        domains: route.domains,
        crossDomainSignals,
        threadId: result.threadId,
      };
    }

    const domain = route.domains[0];
    if (!getDomainAvailability(domain).available) {
      return {
        type: "message",
        content: `${domain} is recognized but not yet available in this build.`,
        domains: [domain],
        threadId: null,
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
          threadId: analysis.threadId,
        };
      }

      return {
        type: "message",
        content: analysis.reply,
        domains: ["finance"],
        threadId: analysis.threadId,
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
          threadId: analysis.threadId,
        };
      }

      return {
        type: "message",
        content: analysis.reply,
        domains: ["health"],
        threadId: analysis.threadId,
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
          threadId: analysis.threadId,
        };
      }

      return {
        type: "message",
        content: analysis.reply,
        domains: ["faith"],
        threadId: analysis.threadId,
      };
    }

    const result = await runSingleDomainResponse(ctx, {
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
      content: result.content,
      domains: [domain],
      crossDomainSignals,
      threadId: result.threadId,
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
    memoryRows: PromptMemoryRow[];
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
  const threadId = input.threadId ?? thread.threadId;

  const result = await masterPlannerAgent.generateText(ctx, thread, {
    prompt: [
      `User request: ${input.userMessage}`,
      `Snapshots: ${JSON.stringify(input.snapshots)}`,
      `Memory: ${JSON.stringify(input.memoryRows)}`,
      `Cross-domain signals: ${JSON.stringify(input.crossDomainSignals)}`,
      "Respond with a calm, integrated plan or answer grounded in the data above.",
    ].join("\n\n"),
  });

  return {
    threadId,
    content: result.text,
  };
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
  const threadId = input.threadId ?? thread.threadId;

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

  return {
    threadId,
    content: result.text,
  };
}

function groupMemoryByDomain(
  rows: PromptMemoryRow[],
) {
  return rows.reduce(
    (acc, row) => {
      const current = acc[row.domain] ?? [];
      current.push(row);
      acc[row.domain] = current;
      return acc;
    },
    {} as Partial<Record<AIDomain, PromptMemoryRow[]>>,
  );
}

function selectPromptMemoryRows(
  rows: Array<{ domain: AIDomain } & Record<string, unknown>>,
): PromptMemoryRow[] {
  const grouped = rows.reduce(
    (acc, row) => {
      const domainRows = acc[row.domain] ?? [];
      domainRows.push(row);
      acc[row.domain] = domainRows;
      return acc;
    },
    {} as Partial<Record<AIDomain, Array<{ domain: AIDomain } & Record<string, unknown>>>>,
  );

  const result: PromptMemoryRow[] = [];
  for (const domain of ALL_DOMAINS) {
    const domainRows = grouped[domain] ?? [];
    const selected = [...domainRows]
      .sort((left, right) => {
        const leftUpdatedAt =
          typeof left.updatedAt === "number" ? left.updatedAt : 0;
        const rightUpdatedAt =
          typeof right.updatedAt === "number" ? right.updatedAt : 0;
        return rightUpdatedAt - leftUpdatedAt;
      })
      .slice(0, MAX_MEMORY_ROWS_PER_DOMAIN)
      .map((row) => ({
        domain: row.domain,
        key: typeof row.key === "string" ? row.key : "memory",
        value: truncateText(
          typeof row.value === "string" ? row.value : JSON.stringify(row.value ?? ""),
          MAX_MEMORY_VALUE_LENGTH,
        ),
        confidence:
          typeof row.confidence === "string" ? row.confidence : "medium",
        updatedAt: typeof row.updatedAt === "number" ? row.updatedAt : 0,
      }));
    result.push(...selected);
  }

  return result.sort((left, right) => right.updatedAt - left.updatedAt);
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
}

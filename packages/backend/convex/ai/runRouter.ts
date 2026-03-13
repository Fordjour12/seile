"use node";

import { ConvexError, v } from "convex/values";
import { z } from "zod";

import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import { action } from "../_generated/server";
import { requireUserId } from "../lib/identity";
import { buildPendingAction } from "./approval";
import { createPendingApprovals } from "./executeWithApproval";
import { financeAgent } from "./agents/finance";
import { faithAgent } from "./agents/faith";
import { healthAgent } from "./agents/health";
import { plannerAgent } from "./agents/planner";
import { wellnessAgent } from "./agents/wellness";
import { hydrateMemoryForDomains } from "./memory/hydration";
import { classifyRoute } from "./policies/handoffRules";
import { buildDomainPrompt } from "./prompts/domains";
import { buildGlobalSystemPrompt } from "./prompts/global";
import { buildPlannerPromptBlock } from "./prompts/planner";
import { buildResponseFormattingPrompt } from "./prompts/responseFormatting";
import { buildSafetyPrompt } from "./policies/safetyPolicies";
import { getFaithSnapshot } from "./tools/faith";
import { getFinanceSnapshot } from "./tools/finance";
import { getHealthSnapshot } from "./tools/health";
import { getProductivitySnapshot } from "./tools/productivity";
import {
  addThreadMessages,
  createConversationThread,
  getPlannerContext,
} from "./tools/shared";
import { getWellnessSnapshot } from "./tools/wellness";
import {
  aiDomainValidator,
  aiIntentValidator,
  pendingActionSchema,
  runSourceValidator,
  type AIIntent,
  type AIResponse,
  type AIDomain,
} from "./types";
import {
  draftWeeklyPlanForUser,
  replanWeeklyPlanForUser,
  reviewLatestPastWeeklyPlanForUser,
} from "./workflows/weeklyPlanner";
import {
  financeAssistantResponseSchema,
  financeProposalSchema,
} from "./types";
import { executeConfirmedFinanceProposal } from "./executeWithApproval";

const internalApi = internal as unknown as Record<string, Record<string, any>>;

const specialistReplySchema = z.object({
  reply: z.string().min(1),
  suggestions: z.array(z.string()).max(6).default([]),
});

export const runAI = action({
  args: {
    text: v.string(),
    threadId: v.optional(v.string()),
    surface: v.optional(v.string()),
    source: v.optional(runSourceValidator),
    preferredDomains: v.optional(v.array(aiDomainValidator)),
    preferredIntent: v.optional(aiIntentValidator),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await runAIForUser(ctx, {
      userId,
      text: args.text,
      threadId: args.threadId,
      surface: args.surface,
      source: args.source ?? "ai_router",
      preferredDomains: args.preferredDomains,
      preferredIntent: args.preferredIntent,
      persistToThread: true,
    });
  },
});

export const confirmPendingAIAction = action({
  args: {
    approvalId: v.id("aiApprovals"),
    confirmationText: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await confirmPendingAIActionForUser(ctx, {
      userId,
      approvalId: args.approvalId,
      confirmationText: args.confirmationText,
    });
  },
});

export async function runAIForUser(
  ctx: ActionCtx,
  input: {
    userId: string;
    text: string;
    threadId?: string;
    surface?: string;
    source: "planner_chat" | "finance_chat" | "ai_router" | "workflow" | "system";
    preferredDomains?: AIDomain[];
    preferredIntent?: AIIntent;
    persistToThread?: boolean;
  },
) {
  const text = input.text.trim();
  if (!text) {
    throw new ConvexError("AI message cannot be empty.");
  }

  const route = classifyRoute({
    text,
    preferredDomains: input.preferredDomains,
    preferredIntent: input.preferredIntent,
  });
  const visibleThreadId =
    input.threadId ??
    (await createConversationThread(ctx, {
      userId: input.userId,
      title: "AI conversation",
      summary: "Shared AI conversation",
    }));

  const runId = await ctx.runMutation(internalApi["ai/state"].createRunInternal, {
    userId: input.userId,
    threadId: visibleThreadId,
    source: input.source,
    surface: input.surface,
    text,
    intent: route.intent,
    domains: route.domains,
    agentName: route.specialist,
  });

  try {
    const memory = await hydrateMemoryForDomains(ctx, {
      userId: input.userId,
      domains: route.domains,
    });

    const response = await dispatchRoute(ctx, {
      userId: input.userId,
      text,
      threadId: visibleThreadId,
      runId,
      source: input.source,
      route,
      memorySummary: memory.summary,
    });

    let messageIds:
      | {
          userMessageId?: string;
          assistantMessageId?: string;
        }
      | undefined;

    if (input.persistToThread !== false) {
      messageIds = await addThreadMessages(ctx, {
        threadId: visibleThreadId,
        userId: input.userId,
        userText: text,
        assistantText: response.text,
        agentName: route.specialist,
      });
    }

    await ctx.runMutation(internalApi["ai/state"].completeRunInternal, {
      runId,
      responseKind: response.kind,
      latencyMs: Date.now() - (response.startedAt ?? Date.now()),
    });

    return {
      ...response,
      threadId: visibleThreadId,
      runId,
      ...messageIds,
    };
  } catch (error) {
    await ctx.runMutation(internalApi["ai/state"].failRunInternal, {
      runId,
      error: error instanceof Error ? error.message : String(error),
      latencyMs: 0,
    });
    throw error;
  }
}

export async function confirmPendingAIActionForUser(
  ctx: ActionCtx,
  input: {
    userId: string;
    approvalId: string;
    confirmationText: string;
  },
) {
  const approval = await ctx.runQuery(internalApi["ai/state"].getApprovalInternal, {
    approvalId: input.approvalId,
    userId: input.userId,
  });

  if (!approval) {
    throw new ConvexError("Approval request not found.");
  }
  if (approval.status !== "pending") {
    throw new ConvexError("Approval request is no longer pending.");
  }

  try {
    let result: unknown;
    if (approval.domain === "finance") {
      result = await executeConfirmedFinanceProposal(ctx, {
        proposalJson: JSON.stringify({
          proposalId: approval._id,
          actionType: approval.actionType,
          title: approval.title,
          preview: approval.preview,
          payloadJson: approval.payloadJson,
          destructive: approval.destructive,
          requiresConfirmation: true,
        }),
        confirmationText: input.confirmationText,
      });
    } else {
      throw new ConvexError("This approval domain is not executable yet.");
    }

    await ctx.runMutation(internalApi["ai/state"].updateApprovalStatusInternal, {
      approvalId: approval._id,
      status: "confirmed",
    });

    await ctx.runMutation(internalApi["ai/state"].logToolCallInternal, {
      userId: input.userId,
      runId: approval.runId,
      domain: approval.domain,
      toolName: approval.actionType,
      actionType: approval.actionType,
      approvalMode: approval.approvalMode,
      outcome: "succeeded",
    });

    return {
      ok: true,
      approvalId: approval._id,
      result,
    };
  } catch (error) {
    await ctx.runMutation(internalApi["ai/state"].updateApprovalStatusInternal, {
      approvalId: approval._id,
      status: "failed",
    });

    await ctx.runMutation(internalApi["ai/state"].logToolCallInternal, {
      userId: input.userId,
      runId: approval.runId,
      domain: approval.domain,
      toolName: approval.actionType,
      actionType: approval.actionType,
      approvalMode: approval.approvalMode,
      outcome: "failed",
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function dispatchRoute(
  ctx: ActionCtx,
  input: {
    userId: string;
    text: string;
    threadId: string;
    runId: string;
    source: "planner_chat" | "finance_chat" | "ai_router" | "workflow" | "system";
    route: ReturnType<typeof classifyRoute>;
    memorySummary: string;
  },
) {
  const startedAt = Date.now();

  if (input.route.specialist === "finance") {
    const response = await handleFinanceRoute(ctx, input);
    return { ...response, startedAt };
  }

  if (input.route.specialist === "health") {
    const response = await handleHealthRoute(ctx, input);
    return { ...response, startedAt };
  }

  if (input.route.specialist === "wellness") {
    const response = await handleWellnessRoute(ctx, input);
    return { ...response, startedAt };
  }

  if (input.route.specialist === "faith") {
    const response = await handleFaithRoute(ctx, input);
    return { ...response, startedAt };
  }

  const response = await handlePlannerRoute(ctx, input);
  return { ...response, startedAt };
}

async function handleFinanceRoute(
  ctx: ActionCtx,
  input: Parameters<typeof dispatchRoute>[1],
): Promise<AIResponse> {
  const snapshot = await getFinanceSnapshot(ctx, input.userId);
  await ctx.runMutation(internalApi["ai/state"].logToolCallInternal, {
    userId: input.userId,
    runId: input.runId,
    domain: "finance",
    toolName: "finance.getSnapshot",
    approvalMode: "auto",
    outcome: "succeeded",
  });

  const scratchThreadId = await createConversationThread(ctx, {
    title: "Finance scratch",
    summary: "Temporary AI finance scratchpad",
  });

  const structured = await financeAgent.generateObject(
    ctx,
    { threadId: scratchThreadId },
    {
      prompt: [
        buildGlobalSystemPrompt(),
        buildDomainPrompt("finance"),
        buildSafetyPrompt("finance"),
        `Structured memory:\n${input.memorySummary}`,
        "Prepare a finance-agent response.",
        "If the user asks to change finance data, include proposedActions.",
        "Use exact entity ids from the provided context when an existing record is referenced.",
        `Finance context: ${JSON.stringify(snapshot.summary)}`,
        `User message: ${input.text}`,
      ].join("\n\n"),
      schema: financeAssistantResponseSchema,
    },
  );

  if (structured.object.proposedActions.length > 0) {
    const pendingActions = await createPendingApprovals(ctx, {
      userId: input.userId,
      threadId: input.threadId,
      runId: input.runId,
      source: input.source,
      domain: "finance",
      proposals: structured.object.proposedActions.map((proposal) => ({
        actionType: proposal.actionType,
        title: proposal.title,
        preview: proposal.preview,
        payloadJson: proposal.payloadJson,
        destructive: proposal.destructive,
      })),
    });

    return {
      kind: "approval_request",
      text: structured.object.reply,
      domains: ["finance"],
      pendingActions,
    };
  }

  return {
    kind: "message",
    text: structured.object.reply,
    domains: ["finance"],
  };
}

async function handleHealthRoute(
  ctx: ActionCtx,
  input: Parameters<typeof dispatchRoute>[1],
): Promise<AIResponse> {
  const snapshot = await getHealthSnapshot(ctx);
  await ctx.runMutation(internalApi["ai/state"].logToolCallInternal, {
    userId: input.userId,
    runId: input.runId,
    domain: "health",
    toolName: "health.getSnapshot",
    approvalMode: "auto",
    outcome: "succeeded",
  });

  const scratchThreadId = await createConversationThread(ctx, {
    title: "Health scratch",
    summary: "Temporary AI health scratchpad",
  });

  const structured = await healthAgent.generateObject(
    ctx,
    { threadId: scratchThreadId },
    {
      prompt: [
        buildGlobalSystemPrompt(),
        buildDomainPrompt("health"),
        buildSafetyPrompt("health"),
        buildResponseFormattingPrompt({ mode: "suggestions" }),
        `Structured memory:\n${input.memorySummary}`,
        `Health context: ${JSON.stringify(snapshot)}`,
        `User message: ${input.text}`,
      ].join("\n\n"),
      schema: specialistReplySchema,
    },
  );

  if (structured.object.suggestions.length > 0) {
    return {
      kind: "suggestions",
      text: structured.object.reply,
      domains: ["health"],
      suggestions: structured.object.suggestions,
    };
  }

  return {
    kind: "message",
    text: structured.object.reply,
    domains: ["health"],
  };
}

async function handleWellnessRoute(
  ctx: ActionCtx,
  input: Parameters<typeof dispatchRoute>[1],
): Promise<AIResponse> {
  const snapshot = await getWellnessSnapshot(ctx, input.userId);
  await ctx.runMutation(internalApi["ai/state"].logToolCallInternal, {
    userId: input.userId,
    runId: input.runId,
    domain: "wellness",
    toolName: "wellness.getSnapshot",
    approvalMode: "auto",
    outcome: "succeeded",
  });

  const scratchThreadId = await createConversationThread(ctx, {
    title: "Wellness scratch",
    summary: "Temporary AI wellness scratchpad",
  });

  const structured = await wellnessAgent.generateObject(
    ctx,
    { threadId: scratchThreadId },
    {
      prompt: [
        buildGlobalSystemPrompt(),
        buildDomainPrompt("wellness"),
        buildSafetyPrompt("wellness"),
        buildResponseFormattingPrompt({ mode: "suggestions" }),
        `Structured memory:\n${input.memorySummary}`,
        `Wellness context: ${JSON.stringify(snapshot)}`,
        `User message: ${input.text}`,
      ].join("\n\n"),
      schema: specialistReplySchema,
    },
  );

  if (structured.object.suggestions.length > 0) {
    return {
      kind: "suggestions",
      text: structured.object.reply,
      domains: ["wellness"],
      suggestions: structured.object.suggestions,
    };
  }

  return {
    kind: "message",
    text: structured.object.reply,
    domains: ["wellness"],
  };
}

async function handleFaithRoute(
  ctx: ActionCtx,
  input: Parameters<typeof dispatchRoute>[1],
): Promise<AIResponse> {
  const snapshot = await getFaithSnapshot(ctx);
  await ctx.runMutation(internalApi["ai/state"].logToolCallInternal, {
    userId: input.userId,
    runId: input.runId,
    domain: "faith",
    toolName: "faith.getSnapshot",
    approvalMode: "auto",
    outcome: "succeeded",
  });

  const scratchThreadId = await createConversationThread(ctx, {
    title: "Faith scratch",
    summary: "Temporary AI faith scratchpad",
  });

  const structured = await faithAgent.generateObject(
    ctx,
    { threadId: scratchThreadId },
    {
      prompt: [
        buildGlobalSystemPrompt(),
        buildDomainPrompt("faith"),
        buildSafetyPrompt("faith"),
        buildResponseFormattingPrompt({ mode: "suggestions" }),
        `Structured memory:\n${input.memorySummary}`,
        `Faith context: ${JSON.stringify(snapshot)}`,
        `User message: ${input.text}`,
      ].join("\n\n"),
      schema: specialistReplySchema,
    },
  );

  if (structured.object.suggestions.length > 0) {
    return {
      kind: "suggestions",
      text: structured.object.reply,
      domains: ["faith"],
      suggestions: structured.object.suggestions,
    };
  }

  return {
    kind: "message",
    text: structured.object.reply,
    domains: ["faith"],
  };
}

async function handlePlannerRoute(
  ctx: ActionCtx,
  input: Parameters<typeof dispatchRoute>[1],
): Promise<AIResponse> {
  const normalized = input.text.toLowerCase();
  const mode =
    normalized.includes("recovery") || normalized.includes("gentle") || normalized.includes("lighter")
      ? "recovery"
      : "zero_input";
  const wantsReplan =
    normalized.includes("replan") ||
    normalized.includes("adjust this week") ||
    normalized.includes("lighter week") ||
    normalized.includes("reset this week");

  const initialContext = await getPlannerContext(ctx, { userId: input.userId });
  await ctx.runMutation(internalApi["ai/state"].logToolCallInternal, {
    userId: input.userId,
    runId: input.runId,
    domain: "planner",
    toolName: "planner.getContext",
    approvalMode: "auto",
    outcome: "succeeded",
  });

  let actionSummary =
    "No planner mutation was run. Answer conversationally from the current planner context.";
  let responseKind: AIResponse["kind"] = "message";

  if (input.route.intent === "review") {
    const review = await reviewLatestPastWeeklyPlanForUser(ctx, input.userId);
    actionSummary = review
      ? "A weekly review was generated from the latest unreviewed past plan."
      : "No unreviewed past weekly plan was available.";
    responseKind = "review";
  } else if (wantsReplan) {
    if (initialContext.currentPlan?._id) {
      const result = await replanWeeklyPlanForUser(ctx, {
        userId: input.userId,
        planId: initialContext.currentPlan._id,
      });
      actionSummary =
        result.movedCount > 0 || result.droppedCount > 0
          ? `The current week was replanned. Moved ${result.movedCount} items and dropped ${result.droppedCount} items.`
          : (result.warning ?? "The current weekly structure was kept.");
      responseKind = "plan";
    } else {
      actionSummary = "No current weekly plan exists yet, so replanning could not run.";
    }
  } else if (input.route.intent === "plan") {
    const result = await draftWeeklyPlanForUser(ctx, {
      userId: input.userId,
      mode,
      createdBy: "user",
    });
    actionSummary = result.reused
      ? "A weekly plan already existed for the current week, so the existing plan was kept."
      : `A ${mode === "recovery" ? "recovery" : "balanced"} weekly plan was drafted.`;
    responseKind = "plan";
  }

  const refreshedContext = await getPlannerContext(ctx, { userId: input.userId });
  const productivity = await getProductivitySnapshot(ctx, input.userId);

  const scratchThreadId = await createConversationThread(ctx, {
    title: "Planner scratch",
    summary: "Temporary AI planner scratchpad",
  });

  const structured = await plannerAgent.generateObject(
    ctx,
    { threadId: scratchThreadId },
    {
      prompt: [
        buildGlobalSystemPrompt(),
        buildDomainPrompt("planner"),
        buildPlannerPromptBlock(),
        buildResponseFormattingPrompt({ mode: responseKind }),
        `Structured memory:\n${input.memorySummary}`,
        `User message: ${input.text}`,
        `Action summary: ${actionSummary}`,
        `Planner context: ${JSON.stringify({
          week: refreshedContext.week,
          profile: refreshedContext.profile,
          agentState: refreshedContext.agentState,
          goals: refreshedContext.goals.slice(0, 10),
          openTasks: refreshedContext.openTasks.slice(0, 10),
          habits: refreshedContext.habits.slice(0, 8),
          currentPlan: refreshedContext.currentPlan,
          currentPlanItems: refreshedContext.currentPlanItems.slice(0, 16),
          latestReview: refreshedContext.latestReview,
          productivity,
        })}`,
      ].join("\n\n"),
      schema: specialistReplySchema,
    },
  );

  if (responseKind === "review" && refreshedContext.latestReview) {
    return {
      kind: "review",
      text: structured.object.reply,
      domains: input.route.domains,
      review: refreshedContext.latestReview,
    };
  }

  if (responseKind === "plan" && refreshedContext.currentPlan) {
    return {
      kind: "plan",
      text: structured.object.reply,
      domains: input.route.domains,
      plan: serializeCurrentPlan(refreshedContext),
    };
  }

  if (structured.object.suggestions.length > 0) {
    return {
      kind: "suggestions",
      text: structured.object.reply,
      domains: input.route.domains,
      suggestions: structured.object.suggestions,
    };
  }

  return {
    kind: "message",
    text: structured.object.reply,
    domains: input.route.domains,
  };
}

function serializeCurrentPlan(context: Awaited<ReturnType<typeof getPlannerContext>>) {
  return {
    title: context.currentPlan?.title ?? "Weekly plan",
    summary: context.currentPlan?.summary ?? "",
    priorityTitles: context.currentPlan?.priorityTitles ?? [],
    warnings: context.currentPlan?.warnings ?? [],
    burnoutRiskScore: context.currentPlan?.burnoutRiskScore ?? 0,
    recoverySuggested: context.currentPlan?.recoverySuggested ?? false,
    items: context.currentPlanItems.map((item: any) => ({
      itemType: item.itemType,
      title: item.title,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      priority: item.priority,
      effort: item.effort,
      notes: item.notes,
      draftTask: undefined,
      draftHabit: undefined,
    })),
  };
}

export function mapPendingActionsToFinanceProposals(
  pendingActions: Array<z.infer<typeof pendingActionSchema>>,
) {
  return pendingActions.map((pendingAction) =>
    financeProposalSchema.parse({
      proposalId: pendingAction.approvalId,
      actionType: pendingAction.actionType,
      title: pendingAction.title,
      preview: pendingAction.preview,
      payloadJson: pendingAction.payloadJson,
      destructive: pendingAction.destructive,
      requiresConfirmation: pendingAction.requiresConfirmation,
    }),
  );
}

export function mapApprovalToPendingAction(approval: {
  _id: string;
  domain: AIDomain;
  actionType: string;
  title: string;
  preview: string;
  payloadJson: string;
  approvalMode: "auto" | "confirm" | "restricted";
  destructive: boolean;
  status: "pending" | "confirmed" | "rejected" | "failed";
}) {
  return pendingActionSchema.parse(
    buildPendingAction({
      approvalId: approval._id,
      domain: approval.domain,
      actionType: approval.actionType,
      title: approval.title,
      preview: approval.preview,
      payloadJson: approval.payloadJson,
      approvalMode: approval.approvalMode,
      destructive: approval.destructive,
    }),
  );
}

import { components, internal } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";

const componentsAny = components as any;
const internalApi = internal as unknown as Record<string, Record<string, any>>;

export async function createConversationThread(
  ctx: ActionCtx,
  input: {
    userId?: string;
    title: string;
    summary: string;
  },
) {
  const thread = await ctx.runMutation(componentsAny.agent.threads.createThread, {
    userId: input.userId,
    title: input.title,
    summary: input.summary,
  });
  return thread._id;
}

export async function getPlannerContext(
  ctx: ActionCtx,
  input: { userId: string; weekStart?: string },
) {
  return await ctx.runQuery(internalApi["planner/queries"].getPlannerAgentContext, input);
}

export async function addThreadMessages(
  ctx: ActionCtx,
  input: {
    threadId: string;
    userId: string;
    userText: string;
    assistantText: string;
    agentName: string;
  },
) {
  const result = await ctx.runMutation(componentsAny.agent.messages.addMessages, {
    threadId: input.threadId,
    userId: input.userId,
    messages: [
      {
        message: {
          role: "user",
          content: input.userText,
        },
        text: input.userText,
        status: "success",
      },
      {
        agentName: input.agentName,
        message: {
          role: "assistant",
          content: input.assistantText,
        },
        text: input.assistantText,
        status: "success",
      },
    ],
  });

  return {
    userMessageId: result.messages[0]?._id,
    assistantMessageId: result.messages[1]?._id,
  };
}

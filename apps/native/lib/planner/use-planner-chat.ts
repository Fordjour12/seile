import { useAction, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/backend-api";

const plannerApi = api as unknown as Record<string, Record<string, any>>;

export type PlannerChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  status: "pending" | "success" | "failed";
  createdAt: number;
  clientRequestId?: string;
  error?: string;
};

type LocalPlannerChatMessage = PlannerChatMessage & {
  localOnly?: boolean;
  retryText?: string;
};

export type PlannerQuickPrompt = {
  id: string;
  label: string;
  prompt: string;
};

export type PlannerChatThread = {
  id: string;
  title: string;
  summary: string;
  status: string;
  createdAt: number;
};

export const PLANNER_QUICK_PROMPTS: PlannerQuickPrompt[] = [
  {
    id: "balanced",
    label: "Balanced week",
    prompt: "Plan my week and give me a realistic, balanced focus for the days ahead.",
  },
  {
    id: "recovery",
    label: "Recovery week",
    prompt: "Give me a recovery plan for this week with lower pressure and more room to recover.",
  },
  {
    id: "replan",
    label: "Replan week",
    prompt: "Replan this week and make the remainder lighter and more realistic.",
  },
  {
    id: "review",
    label: "Review last week",
    prompt: "Review last week and tell me what worked, what slipped, and what to protect next.",
  },
];

export function usePlannerChat(options?: { threadId?: string; readOnly?: boolean }) {
  const home = useQuery(plannerApi["planner/queries"].getPlannerChatHome, {});
  const resolvedThreadId = options?.threadId ?? home?.activeThreadId ?? undefined;
  const thread = useQuery(
    plannerApi["planner/queries"].getPlannerChatThread,
    options?.threadId ? { threadId: options.threadId } : "skip",
  ) as PlannerChatThread | null | undefined;
  const serverMessagesResult = useQuery(
    plannerApi["planner/queries"].listPlannerChatMessages,
    resolvedThreadId
      ? {
          threadId: resolvedThreadId,
          paginationOpts: {
            cursor: null,
            numItems: 80,
          },
        }
      : "skip",
  );
  const sendPlannerChatMessage = useAction(plannerApi["planner/actions"].sendPlannerChatMessage);

  const [composerText, setComposerText] = useState("");
  const [status, setStatus] = useState("Planner ready.");
  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<LocalPlannerChatMessage[]>([]);

  const serverMessages = (serverMessagesResult?.page ?? []) as PlannerChatMessage[];

  useEffect(() => {
    if (!serverMessages.length) {
      return;
    }

    const serverMessageIds = new Set(serverMessages.map((message) => message.id));
    const serverClientRequestIds = new Set(
      serverMessages
        .map((message) => message.clientRequestId)
        .filter((value): value is string => typeof value === "string" && value.length > 0),
    );
    setLocalMessages((current) =>
      current.filter(
        (message) =>
          !serverMessageIds.has(message.id) &&
          !(message.clientRequestId && serverClientRequestIds.has(message.clientRequestId)),
      ),
    );
  }, [serverMessages]);

  const messages = useMemo(() => {
    const merged = new Map<string, LocalPlannerChatMessage>();
    for (const message of serverMessages) {
      merged.set(message.id, message);
    }

    for (const message of localMessages) {
      if (!merged.has(message.id)) {
        merged.set(message.id, message);
      }
    }

    return Array.from(merged.values()).sort((left, right) => left.createdAt - right.createdAt);
  }, [localMessages, serverMessages]);

  const sendMessage = async (
    value?: string,
    existingClientRequestId?: string,
    existingMessageId?: string,
  ) => {
    if (options?.readOnly) {
      return;
    }

    const text = (value ?? composerText).trim();
    if (!text || isSending) {
      return;
    }

    const now = Date.now();
    const clientRequestId = existingClientRequestId ?? createPlannerClientRequestId();
    const pendingMessageId = existingMessageId ?? `pending-${clientRequestId}`;
    setLocalMessages((current) => {
      const next = current.filter(
        (message) => message.id !== pendingMessageId && message.clientRequestId !== clientRequestId,
      );
      next.push({
        id: pendingMessageId,
        role: "user",
        text,
        status: "pending",
        createdAt: now,
        clientRequestId,
        localOnly: true,
        retryText: text,
      });
      return next;
    });
    setComposerText("");
    setIsSending(true);
    setStatus("Planner is thinking...");

    try {
      const result = await sendPlannerChatMessage({ text, clientRequestId });
      setStatus("Planner replied.");
      setLocalMessages((current) => {
        const next = current.filter(
          (message) => message.id !== pendingMessageId && message.clientRequestId !== clientRequestId,
        );

        if (result.userMessageId && !next.some((message) => message.id === result.userMessageId)) {
          next.push({
            id: result.userMessageId,
            role: "user",
            text,
            status: "success",
            createdAt: now,
            clientRequestId,
          });
        }

        if (
          result.assistantMessageId &&
          !next.some((message) => message.id === result.assistantMessageId)
        ) {
          next.push({
            id: result.assistantMessageId,
            role: "assistant",
            text: result.text,
            status: "success",
            createdAt: now + 1,
            clientRequestId,
          });
        }

        return next;
      });
    } catch (error) {
      const message = formatPlannerError(error);
      setStatus(message);
      setLocalMessages((current) =>
        current.map((entry) =>
          entry.id === pendingMessageId || entry.clientRequestId === clientRequestId
            ? {
                ...entry,
                status: "failed",
                error: message,
              }
            : entry,
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  const retryMessage = async (messageId: string) => {
    const entry = localMessages.find((message) => message.id === messageId);
    if (!entry?.retryText || !entry.clientRequestId) {
      return;
    }

    await sendMessage(entry.retryText, entry.clientRequestId, entry.id);
  };

  const hasConversation = messages.length > 0 || Boolean(resolvedThreadId);

  return {
    home,
    thread,
    messages,
    composerText,
    setComposerText,
    sendMessage,
    retryMessage,
    status,
    isSending,
    quickPrompts: PLANNER_QUICK_PROMPTS,
    hasConversation,
    isLoading:
      home === undefined ||
      (Boolean(resolvedThreadId) && serverMessagesResult === undefined) ||
      (Boolean(options?.threadId) && thread === undefined),
  };
}

function formatPlannerError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Planner request failed.";
}

function createPlannerClientRequestId() {
  return `planner-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

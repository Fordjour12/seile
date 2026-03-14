import { useAction } from "convex/react";
import { useState } from "react";

import type { AiChatMessage } from "./types";
import { aiApi } from "./api";
import type { RunAIResponse } from "./api";

type ApprovalAction = Extract<
  RunAIResponse,
  { type: "approval_request" }
>["actions"][number];

export function useDomainAi() {
  const runAI = useAction(aiApi["ai/runRouter"].runAI);
  const [composerText, setComposerText] = useState("");
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState("AI ready.");
  const [threadId, setThreadId] = useState<string | null>(null);

  const sendMessage = async (value?: string) => {
    const text = (value ?? composerText).trim();
    if (!text || isSending) {
      return;
    }

    const now = Date.now();
    const optimisticId = `local-${now}`;
    setComposerText("");
    setIsSending(true);
    setStatus("Thinking...");
    setMessages((current) => [
      ...current,
      {
        id: optimisticId,
        role: "user",
        text,
        createdAt: now,
        status: "success",
      },
    ]);

    try {
      const result = await runAI({
        userMessage: text,
        threadId: threadId ?? undefined,
      });
      setThreadId(result.threadId);
      setMessages((current) => [...current, normalizeAiResponse(result)]);
      setStatus("AI replied.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "AI request failed.");
      setMessages((current) => [
        ...current,
        {
          id: `error-${now}`,
          role: "assistant",
          text:
            error instanceof Error ? error.message : "AI request failed.",
          createdAt: now + 1,
          status: "failed",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return {
    composerText,
    setComposerText,
    messages,
    sendMessage,
    isSending,
    status,
    threadId,
  };
}

function normalizeAiResponse(response: RunAIResponse): AiChatMessage {
  if (response.type === "approval_request") {
    return {
      id: `approval-${response.requestId}`,
      role: "assistant",
      text: `${response.title}\n\n${response.actions
        .map((action: ApprovalAction) => `• ${action.previewText}`)
        .join("\n")}`,
      createdAt: Date.now(),
      status: "success",
      approvalRequestId: response.requestId,
    };
  }

  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    text: response.content,
    createdAt: Date.now(),
    status: "success",
  };
}

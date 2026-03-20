import type { RunAIResponse } from "./api";

export type AIDomain =
  | "finance"
  | "health"
  | "wellness"
  | "productivity"
  | "career"
  | "relationships"
  | "faith"
  | "space";

export type ApprovalMode = "auto" | "confirm" | "confirmText" | "restricted";

export type PendingAction = {
  toolName: string;
  approvalMode: ApprovalMode;
  args: Record<string, unknown>;
  domain: AIDomain;
  previewText: string;
  expectedConfirmation?: string;
};

export type AIResponse = RunAIResponse;

export type AiChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  createdAt: number;
  status: "pending" | "success" | "failed";
  approvalRequestId?: string;
};

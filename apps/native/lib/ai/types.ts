export type AIDomain =
  | "finance"
  | "health"
  | "wellness"
  | "productivity"
  | "career"
  | "relationships"
  | "faith"
  | "space";

export type ApprovalMode = "auto" | "confirm" | "restricted";

export type PendingAction = {
  toolName: string;
  approvalMode: ApprovalMode;
  args: Record<string, unknown>;
  domain: AIDomain;
  previewText: string;
};

export type AIResponse =
  | {
      type: "message";
      content: string;
      domains: AIDomain[];
      crossDomainSignals?: Array<{
        sourceDomain: AIDomain;
        targetDomain: AIDomain;
        signal: string;
        severity: "low" | "medium" | "high";
        suggestedAction?: string;
      }>;
    }
  | {
      type: "approval_request";
      title: string;
      actions: PendingAction[];
      requestId: string;
    };

export type AiChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  createdAt: number;
  status: "pending" | "success" | "failed";
  approvalRequestId?: string;
};

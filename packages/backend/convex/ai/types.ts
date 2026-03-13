export type AIDomain =
  | "finance"
  | "health"
  | "wellness"
  | "productivity"
  | "career"
  | "relationships"
  | "faith"
  | "space";

export const ALL_DOMAINS: AIDomain[] = [
  "finance",
  "health",
  "wellness",
  "productivity",
  "career",
  "relationships",
  "faith",
  "space",
];

export type GoalHorizon = "day" | "week" | "month" | "year";
export type ApprovalMode = "auto" | "confirm" | "restricted";
export type Priority = "low" | "medium" | "high";

export type PlanItem = {
  id: string;
  title: string;
  domain: AIDomain;
  reason?: string;
  horizon: GoalHorizon;
  priority: Priority;
  suggestedAt: number;
  crossDomainLinks?: AIDomain[];
};

export type CrossDomainSignal = {
  sourceDomain: AIDomain;
  targetDomain: AIDomain;
  signal: string;
  severity: "low" | "medium" | "high";
  suggestedAction?: string;
};

export type PendingAction = {
  toolName: string;
  approvalMode: ApprovalMode;
  args: Record<string, unknown>;
  domain: AIDomain;
  previewText: string;
};

export type ApprovalRequest = {
  requestId: string;
  createdAt: number;
  actions: PendingAction[];
  expiresAt: number;
};

export type MemoryEntry = {
  domain: AIDomain;
  key: string;
  value: string;
  confidence: "low" | "medium" | "high";
  updatedAt: number;
};

export type AIResponse =
  | {
      type: "message";
      content: string;
      domains: AIDomain[];
      crossDomainSignals?: CrossDomainSignal[];
    }
  | {
      type: "plan";
      title: string;
      domains: AIDomain[];
      items: PlanItem[];
      crossDomainSignals?: CrossDomainSignal[];
    }
  | {
      type: "approval_request";
      title: string;
      actions: PendingAction[];
      requestId: string;
    }
  | {
      type: "suggestion_batch";
      suggestions: PlanItem[];
      generatedFor: AIDomain[];
      rationale: string;
    };

export type DomainSnapshot = {
  domain: AIDomain;
  generatedAt: number;
  summary: Record<string, unknown>;
  raw: Record<string, unknown>;
};

export type RouteIntent = {
  domains: AIDomain[];
  intent: "answer" | "plan" | "review" | "handoff" | "cross_domain";
  urgency: "low" | "medium" | "high";
};

export type DomainAvailability = {
  domain: AIDomain;
  available: boolean;
  liveAgent: boolean;
};

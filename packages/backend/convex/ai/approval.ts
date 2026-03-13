import type { AIDomain, ApprovalMode, PendingAction, RunSource } from "./types";
import { getToolApprovalMode } from "./policies/toolPolicies";

export function getApprovalMode(input: { domain: AIDomain; actionType?: string }) {
  return getToolApprovalMode(input);
}

export function buildPendingAction(input: {
  approvalId: string;
  domain: AIDomain;
  actionType: string;
  title: string;
  preview: string;
  payloadJson: string;
  destructive?: boolean;
  approvalMode?: ApprovalMode;
  source?: RunSource;
}): PendingAction {
  return {
    approvalId: input.approvalId,
    domain: input.domain,
    actionType: input.actionType,
    title: input.title,
    preview: input.preview,
    payloadJson: input.payloadJson,
    destructive: input.destructive ?? false,
    requiresConfirmation: true,
    approvalMode: input.approvalMode ?? getApprovalMode(input),
    status: "pending",
  };
}


import { useAction, useQuery } from "convex/react";

import { aiApi } from "./api";

export function useAiApprovals() {
  const approvals = useQuery(aiApi["ai/approval"].getPendingApprovals, {}) as
    | Array<{
        requestId: string;
        createdAt: number;
        expiresAt: number;
        actions: Array<{
          toolName: string;
          approvalMode: "auto" | "confirm" | "restricted";
          args: Record<string, unknown>;
          domain: string;
          previewText: string;
        }>;
      }>
    | undefined;
  const resolveApprovalRequest = useAction(
    aiApi["ai/approval_actions"].resolveApprovalRequest,
  );

  const approve = async (requestId: string) => {
    return await resolveApprovalRequest({ requestId, approved: true });
  };

  const reject = async (requestId: string) => {
    return await resolveApprovalRequest({ requestId, approved: false });
  };

  return {
    approvals: approvals ?? [],
    isLoading: approvals === undefined,
    approve,
    reject,
  };
}

import { api } from "@/lib/backend-api";
import type { FunctionArgs, FunctionReturnType } from "convex/server";

type NativeAiApi = {
  "ai/runRouter": typeof api.ai.runRouter;
  "ai/approval": typeof api.ai.approval;
  "ai/approval_actions": typeof api.ai.approval_actions;
  "ai/memory": typeof api.ai.memory;
};

export const aiApi = {
  "ai/runRouter": api.ai.runRouter,
  "ai/approval": api.ai.approval,
  "ai/approval_actions": api.ai.approval_actions,
  "ai/memory": api.ai.memory,
} satisfies NativeAiApi;

export type RunAIAction = NativeAiApi["ai/runRouter"]["runAI"];
export type RunAIArgs = FunctionArgs<RunAIAction>;
export type RunAIResponse = FunctionReturnType<RunAIAction>;

export type GetPendingApprovalsQuery =
  NativeAiApi["ai/approval"]["getPendingApprovals"];
export type GetPendingApprovalsArgs = FunctionArgs<GetPendingApprovalsQuery>;
export type GetPendingApprovalsResult =
  FunctionReturnType<GetPendingApprovalsQuery>;

export type ResolveApprovalRequestAction =
  NativeAiApi["ai/approval_actions"]["resolveApprovalRequest"];
export type ResolveApprovalRequestArgs =
  FunctionArgs<ResolveApprovalRequestAction>;
export type ResolveApprovalRequestResult =
  FunctionReturnType<ResolveApprovalRequestAction>;

export type GetMemoryForDomainQuery =
  NativeAiApi["ai/memory"]["getMemoryForDomain"];
export type GetMemoryForDomainArgs = FunctionArgs<GetMemoryForDomainQuery>;
export type GetMemoryForDomainResult =
  FunctionReturnType<GetMemoryForDomainQuery>;

export type GetAllMemoryQuery = NativeAiApi["ai/memory"]["getAllMemory"];
export type GetAllMemoryArgs = FunctionArgs<GetAllMemoryQuery>;
export type GetAllMemoryResult = FunctionReturnType<GetAllMemoryQuery>;

export type UpsertMemoryMutation = NativeAiApi["ai/memory"]["upsertMemory"];
export type UpsertMemoryArgs = FunctionArgs<UpsertMemoryMutation>;
export type UpsertMemoryResult = FunctionReturnType<UpsertMemoryMutation>;

export type DeleteMemoryKeyMutation =
  NativeAiApi["ai/memory"]["deleteMemoryKey"];
export type DeleteMemoryKeyArgs = FunctionArgs<DeleteMemoryKeyMutation>;
export type DeleteMemoryKeyResult =
  FunctionReturnType<DeleteMemoryKeyMutation>;

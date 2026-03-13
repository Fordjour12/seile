import { api } from "@/lib/backend-api";

type AiApiShape = {
  "ai/runRouter": {
    runAI: any;
  };
  "ai/approval": {
    getPendingApprovals: any;
  };
  "ai/approval_actions": {
    resolveApprovalRequest: any;
  };
  "ai/memory": {
    getMemoryForDomain: any;
    getAllMemory: any;
    upsertMemory: any;
    deleteMemoryKey: any;
  };
};

export const aiApi = api as unknown as AiApiShape;

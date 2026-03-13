import type { ApprovalMode, AIDomain } from "../types";

export function getToolApprovalMode(input: { domain: AIDomain; actionType?: string }) {
  if (!input.actionType) {
    return "auto" satisfies ApprovalMode;
  }

  if (input.domain === "finance") {
    return "confirm" satisfies ApprovalMode;
  }

  if (input.actionType.includes("archive") || input.actionType.includes("delete")) {
    return "restricted" satisfies ApprovalMode;
  }

  return "confirm" satisfies ApprovalMode;
}


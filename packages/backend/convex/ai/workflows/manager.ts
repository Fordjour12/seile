import { WorkflowManager } from "@convex-dev/workflow";
import type { WorkflowId } from "@convex-dev/workflow";
import type { RunResult } from "@convex-dev/workpool";
import type { FunctionReference, RegisteredMutation } from "convex/server";

import { components } from "../../_generated/api";

export const workflow = new WorkflowManager(components.workflow);

type WorkflowMutationReference<T> =
  T extends RegisteredMutation<"internal", infer Args, infer ReturnValue>
    ? FunctionReference<"mutation", "internal", Args, ReturnValue>
    : never;

export function workflowRef<T>(mutation: T): WorkflowMutationReference<T> {
  return mutation as unknown as WorkflowMutationReference<T>;
}

type WorkflowOnCompleteArgs = {
  workflowId: WorkflowId;
  context: unknown;
  result: RunResult;
};

type WorkflowOnCompleteReference<T> =
  T extends FunctionReference<
    "mutation",
    "internal",
    infer _Args,
    infer ReturnValue,
    infer ComponentPath
  >
    ? FunctionReference<
        "mutation",
        "internal",
        WorkflowOnCompleteArgs,
        ReturnValue,
        ComponentPath
      >
    : never;

export function workflowOnCompleteRef<T>(
  mutation: T,
): WorkflowOnCompleteReference<T> {
  return mutation as unknown as WorkflowOnCompleteReference<T>;
}

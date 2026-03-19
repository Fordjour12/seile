"use node";

import { Agent } from "@convex-dev/agent";

import { getModel } from "../model";
import { GLOBAL_SYSTEM_PROMPT } from "../prompts";
import { componentsAny } from "../runtime";
export { naiveRouteIntent } from "../policies";

export const plannerRouterAgent = new Agent(componentsAny.agent, {
  name: "Life OS Router",
  languageModel: getModel("fast"),
  instructions: GLOBAL_SYSTEM_PROMPT,
});

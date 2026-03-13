"use node";

import { Agent } from "@convex-dev/agent";

import { getModel } from "../model";
import { GLOBAL_SYSTEM_PROMPT, getDomainPrompt } from "../prompts";
import { componentsAny } from "../runtime";

export const spaceCoachAgent = new Agent(componentsAny.agent, {
  name: "Space Coach",
  languageModel: getModel("fast"),
  instructions: `${GLOBAL_SYSTEM_PROMPT}\n\n${getDomainPrompt("space")}`,
});

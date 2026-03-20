"use node";

import { Agent } from "@convex-dev/agent";

import { getModel } from "../model";
import { GLOBAL_SYSTEM_PROMPT, getDomainPrompt } from "../prompts";
import { componentsAny } from "../runtime";

export const faithCoachAgent = new Agent(componentsAny.agent, {
  name: "Faith Coach",
  languageModel: getModel("reasoning"),
  instructions: `${GLOBAL_SYSTEM_PROMPT}\n\n${getDomainPrompt("faith")}`,
});

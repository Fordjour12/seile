"use node";

import { Agent } from "@convex-dev/agent";

import { getModel } from "../model";
import { GLOBAL_SYSTEM_PROMPT, getDomainPrompt } from "../prompts";
import { componentsAny } from "../runtime";

export const careerCoachAgent = new Agent(componentsAny.agent, {
  name: "Career Coach",
  languageModel: getModel("fast"),
  instructions: `${GLOBAL_SYSTEM_PROMPT}\n\n${getDomainPrompt("career")}`,
});

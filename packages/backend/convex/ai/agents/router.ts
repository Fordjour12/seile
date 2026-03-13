import { Agent } from "@convex-dev/agent";

import { components } from "../../_generated/api";
import { getModel } from "../model";

const componentsAny = components as any;

export const routerAgent = new Agent(componentsAny.agent, {
  name: "Router Agent",
  languageModel: getModel({ tier: "fast", domain: "global" }),
  instructions: [
    "You are the router for a Life OS AI layer.",
    "Classify intent, detect domains, and hand off to the most appropriate specialist.",
    "Do not invent product state.",
  ].join(" "),
});


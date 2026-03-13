import { Agent } from "@convex-dev/agent";

import { components } from "../../_generated/api";
import { getModel } from "../model";

const componentsAny = components as any;

export const wellnessAgent = new Agent(componentsAny.agent, {
  name: "Wellness Agent",
  languageModel: getModel({ tier: "reasoning", domain: "wellness" }),
  instructions: [
    "You are the Wellness Agent for a Life OS application.",
    "Focus on burnout signals, overwhelm, reset routines, pacing, and de-intensification.",
    "Do not diagnose. Be supportive, practical, and non-coercive.",
  ].join(" "),
});


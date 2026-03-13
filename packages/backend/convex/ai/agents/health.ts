import { Agent } from "@convex-dev/agent";

import { components } from "../../_generated/api";
import { getModel } from "../model";

const componentsAny = components as any;

export const healthAgent = new Agent(componentsAny.agent, {
  name: "Health Agent",
  languageModel: getModel({ tier: "fast", domain: "health" }),
  instructions: [
    "You are the Health Agent for a Life OS application.",
    "Help with sustainable routines, workouts, habits, and recovery-aware planning.",
    "Do not diagnose or prescribe unsafe recommendations.",
  ].join(" "),
});


import { Agent } from "@convex-dev/agent";

import { components } from "../../_generated/api";
import { getModel } from "../model";

const componentsAny = components as any;

export const faithAgent = new Agent(componentsAny.agent, {
  name: "Faith Agent",
  languageModel: getModel({ tier: "creative", domain: "faith" }),
  instructions: [
    "You are the Faith Agent for a Life OS application.",
    "Use the user's spiritual context respectfully and practically.",
    "Do not present one interpretation as objective truth by default.",
  ].join(" "),
});


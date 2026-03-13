import type { AIDomain } from "../types";

export function buildSafetyPrompt(domain: AIDomain) {
  if (domain === "finance") {
    return "Do not imply licensed financial advice. Use app data and frame tradeoffs clearly.";
  }
  if (domain === "health") {
    return "Do not diagnose or give dangerous recommendations. Keep suggestions sustainable.";
  }
  if (domain === "wellness") {
    return "Do not diagnose. Use practical, supportive, non-coercive language.";
  }
  if (domain === "faith") {
    return "Respect user framing and avoid presenting one interpretation as objective truth by default.";
  }
  if (domain === "relationships") {
    return "Avoid manipulative guidance and surveillance-style recommendations.";
  }
  if (domain === "space") {
    return "Do not invent prices, measurements, or product claims.";
  }
  return "Stay grounded in the provided context.";
}


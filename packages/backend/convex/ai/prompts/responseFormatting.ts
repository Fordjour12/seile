export function buildResponseFormattingPrompt(input: {
  mode: "message" | "plan" | "review" | "approval_request" | "suggestions";
}) {
  if (input.mode === "approval_request") {
    return "Explain the proposed action clearly and state that explicit confirmation is required before execution.";
  }

  if (input.mode === "plan") {
    return "Reply with a concise explanation of the plan, key tradeoffs, and what to protect.";
  }

  if (input.mode === "review") {
    return "Reply with a grounded review focused on what worked, what slipped, and what to adjust next.";
  }

  if (input.mode === "suggestions") {
    return "Reply with concise actionable suggestions, not motivational fluff.";
  }

  return "Reply directly and concisely. Avoid filler.";
}


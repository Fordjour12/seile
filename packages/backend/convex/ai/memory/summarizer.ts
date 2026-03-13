import type { AIDomain, MemoryKind } from "../types";

export function summarizeMemoryForPrompt(
  rows: Array<{
    domain: AIDomain;
    kind: MemoryKind;
    summary: string;
  }>,
) {
  if (!rows.length) {
    return "No relevant structured memory.";
  }

  return rows
    .map((row) => `- [${row.domain}/${row.kind}] ${row.summary}`)
    .join("\n");
}


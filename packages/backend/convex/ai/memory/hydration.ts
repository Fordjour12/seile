import type { ActionCtx } from "../../_generated/server";
import { internal } from "../../_generated/api";
import type { AIDomain } from "../types";

const internalApi = internal as unknown as Record<string, Record<string, any>>;

export async function hydrateMemoryForDomains(
  ctx: ActionCtx,
  input: {
    userId: string;
    domains: AIDomain[];
  },
) {
  const memory = await ctx.runQuery(internalApi["ai/memory/queries"].getRelevantMemory, {
    userId: input.userId,
    domains: input.domains,
  });

  const ids = memory.records.map((row: { _id: string }) => row._id);
  if (ids.length > 0) {
    await ctx.runMutation(internalApi["ai/memory/mutations"].touchMemoryInternal, { ids });
  }

  return memory;
}

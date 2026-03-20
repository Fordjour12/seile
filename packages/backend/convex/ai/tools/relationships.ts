"use node";

import type { FunctionReference } from "convex/server";

import type { ActionCtx } from "../../_generated/server";
import { api } from "../../_generated/api";

const relationshipsApi = api as typeof api & {
  relationships: {
    ai: {
      getRelationshipsSnapshotForAI: FunctionReference<"query", "public", {}, unknown>;
    };
    rituals: {
      create: FunctionReference<
        "mutation",
        "public",
        {
          title: string;
          contactName?: string;
          frequency: "daily" | "weekly" | "monthly";
        },
        unknown
      >;
    };
  };
};

export async function getRelationshipsSnapshot(ctx: ActionCtx) {
  return await ctx.runQuery(relationshipsApi.relationships.ai.getRelationshipsSnapshotForAI, {});
}

export async function createRelationshipRitual(
  ctx: ActionCtx,
  input: {
    title: string;
    contactName?: string;
    frequency: "daily" | "weekly" | "monthly";
    confirmed?: boolean;
  },
) {
  if (!input.confirmed) {
    return {
      ok: false,
      requiresConfirmation: true,
      preview: {
        title: input.title,
        contactName: input.contactName,
        frequency: input.frequency,
      },
    };
  }

  const ritualId = await ctx.runMutation(relationshipsApi.relationships.rituals.create, {
    title: input.title,
    contactName: input.contactName,
    frequency: input.frequency,
  });

  return {
    ok: true,
    ritualId,
  };
}

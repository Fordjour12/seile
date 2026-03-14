"use node";

import type { FunctionReference } from "convex/server";

import type { ActionCtx } from "../../_generated/server";
import { api } from "../../_generated/api";

const spaceApi = api as typeof api & {
  space: {
    ai: {
      getSpaceSnapshotForAI: FunctionReference<"query", "public", {}, unknown>;
    };
    upgrades: {
      create: FunctionReference<
        "mutation",
        "public",
        {
          title: string;
          zone: string;
          estimatedCost?: number;
          priority: "low" | "medium" | "high";
        },
        unknown
      >;
    };
  };
};

export async function getSpaceSnapshot(ctx: ActionCtx) {
  return await ctx.runQuery(spaceApi.space.ai.getSpaceSnapshotForAI, {});
}

export async function createSpaceUpgradePlan(
  ctx: ActionCtx,
  input: {
    title: string;
    zone: string;
    estimatedCost?: number;
    priority?: "low" | "medium" | "high";
    confirmed?: boolean;
  },
) {
  if (!input.confirmed) {
    return {
      ok: false,
      requiresConfirmation: true,
      preview: {
        title: input.title,
        zone: input.zone,
        estimatedCost: input.estimatedCost,
      },
    };
  }

  const upgradeId = await ctx.runMutation(spaceApi.space.upgrades.create, {
    title: input.title,
    zone: input.zone,
    estimatedCost: input.estimatedCost,
    priority: input.priority ?? "medium",
  });

  return {
    ok: true,
    upgradeId,
  };
}

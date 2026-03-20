"use node";

import type { FunctionReference } from "convex/server";

import type { ActionCtx } from "../../_generated/server";
import { api } from "../../_generated/api";

const careerApi = api as typeof api & {
  career: {
    ai: {
      getCareerSnapshotForAI: FunctionReference<"query", "public", {}, unknown>;
    };
    milestones: {
      create: FunctionReference<
        "mutation",
        "public",
        {
          title: string;
          category: "skill" | "project" | "networking" | "financial" | "other";
          targetDate?: string;
        },
        unknown
      >;
    };
  };
};

export async function getCareerSnapshot(ctx: ActionCtx) {
  return await ctx.runQuery(careerApi.career.ai.getCareerSnapshotForAI, {});
}

export async function createCareerMilestone(
  ctx: ActionCtx,
  input: {
    title: string;
    category: "skill" | "project" | "networking" | "financial" | "other";
    targetDate?: string;
    confirmed?: boolean;
  },
) {
  if (!input.confirmed) {
    return {
      ok: false,
      requiresConfirmation: true,
      preview: {
        title: input.title,
        category: input.category,
        targetDate: input.targetDate,
      },
    };
  }

  const milestoneId = await ctx.runMutation(careerApi.career.milestones.create, {
    title: input.title,
    category: input.category,
    targetDate: input.targetDate,
  });

  return {
    ok: true,
    milestoneId,
  };
}

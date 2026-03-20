"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";

const apiAny = api as unknown as Record<string, Record<string, any>>;
const DEFAULT_WORK_HOURS = {
  start: "09:00",
  end: "17:00",
} as const;

const DEFAULT_REST_DAYS = ["sunday"] as const;

export const initializeFirstRunForUser = action({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    initialized: boolean;
    reason?: "missing_user_profile";
    bootstrap: { created: boolean; seededCount: number } | null;
  }> => {
    const profile = await ctx.runQuery(api.onboarding.getUserProfile, {});
    if (!profile) {
      return {
        initialized: false,
        reason: "missing_user_profile",
        bootstrap: null,
      };
    }

    await ctx.runMutation(apiAny["productivity/planner/mutations"].upsertPlannerProfile, {
      timezone: "UTC",
      workHours: DEFAULT_WORK_HOURS,
      restDays: [...DEFAULT_REST_DAYS],
      energyPattern: "morning",
      planningStyle: mapPlanningStyle(profile.planningStyle),
      maxTasksPerDay: mapMaxTasksPerDay(profile.planningStyle),
      deepWorkPreference: mapDeepWorkPreference(profile.planningStyle),
    });

    let bootstrap = null;
    if (profile.selectedDomains.includes("finance")) {
      bootstrap = await ctx.runMutation(api.bootstrap.bootstrapUserData, {});
    }

    return {
      initialized: true,
      bootstrap,
    };
  },
});

function mapPlanningStyle(style: "light" | "balanced" | "intensive") {
  switch (style) {
    case "light":
      return "minimal" as const;
    case "intensive":
      return "flexible" as const;
    default:
      return "structured" as const;
  }
}

function mapMaxTasksPerDay(style: "light" | "balanced" | "intensive") {
  switch (style) {
    case "light":
      return 2;
    case "intensive":
      return 5;
    default:
      return 3;
  }
}

function mapDeepWorkPreference(style: "light" | "balanced" | "intensive") {
  return style !== "light";
}

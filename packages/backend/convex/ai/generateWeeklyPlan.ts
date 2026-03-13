"use node";

import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import { weeklyPlanSchema } from "./plannerSchema";
import { createPlannerThread, plannerAgent } from "./agents/planner";
import { buildPlannerPromptBlock } from "./prompts/planner";
import { buildWeeklyPlanDraft } from "../lib/planner";

const internalApi = internal as unknown as Record<string, Record<string, any>>;

const DEFAULT_PROFILE = {
  timezone: "UTC",
  workHours: {
    start: "09:00",
    end: "17:00",
  },
  restDays: ["sunday"],
  energyPattern: "morning" as const,
  planningStyle: "structured" as const,
  maxTasksPerDay: 3,
  deepWorkPreference: true,
};

export async function generateWeeklyPlanObject(
  ctx: ActionCtx,
  input: {
    userId: string;
    weekStart?: string;
    mode: "directed" | "discovery" | "zero_input" | "recovery";
  },
) {
  const context = await ctx.runQuery(internalApi["planner/queries"].getPlannerAgentContext, {
    userId: input.userId,
    weekStart: input.weekStart,
  });
  const profile = context.profile ?? DEFAULT_PROFILE;
  const baselineDraft = buildWeeklyPlanDraft({
    weekStart: context.week.startDate,
    mode: input.mode,
    goals: context.goals,
    tasks: context.openTasks,
    habits: context.habits,
    latestReview: context.latestReview,
    agentState: context.agentState,
    profile,
    health: context.health,
  });

  const threadId = await createPlannerThread(ctx, {
    userId: input.userId,
    title: `Weekly plan ${context.week.startDate}`,
    summary: "Generate a realistic weekly plan with buffers and recovery space.",
  });

  const result = await plannerAgent.generateObject(
    ctx,
    { threadId },
    {
      prompt: [
        "Generate a realistic weekly plan.",
        `Planning mode: ${input.mode}.`,
        buildPlannerPromptBlock(),
        `Context: ${JSON.stringify({
          week: context.week,
          profile,
          goals: context.goals.map((goal: any) => ({
            title: goal.title,
            domain: goal.domain,
            priority: goal.priority,
            horizon: goal.horizon,
            targetDate: goal.targetDate,
          })),
          openTasks: context.openTasks.map((task: any) => ({
            title: task.title,
            priority: task.priority,
            dueDate: task.dueDate,
          })),
          habits: context.habits.map((habit: any) => ({
            name: habit.name,
            cadence: habit.cadence,
            targetValue: habit.targetValue,
          })),
          health: context.health,
          latestReview: context.latestReview,
        })}`,
        `Baseline draft: ${JSON.stringify(baselineDraft)}`,
      ].join("\n\n"),
      schema: weeklyPlanSchema,
    },
  );

  return {
    context,
    threadId,
    plan: result.object,
  };
}

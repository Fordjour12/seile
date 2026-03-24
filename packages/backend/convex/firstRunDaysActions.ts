"use node";

import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { generateText, Output } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

import { env } from "@seile/env/backend";

const internalApi = internal as unknown as Record<string, Record<string, any>>;

const SUGGESTION_SCHEMA = z.object({
  category: z.enum(["focus", "sleep", "exercise", "tasks", "habits", "reflection"]),
  content: z.string().min(1).max(240),
  reasoning: z.string().min(1).max(240),
  confidence: z.number().int().min(35).max(95),
});

type SuggestionVariant = "purple" | "teal" | "amber";

function phaseForDay(dayNumber: number) {
  if (dayNumber <= 2) return "seed" as const;
  if (dayNumber <= 5) return "learn" as const;
  return "act" as const;
}

function clampDayNumber(dayNumber: number) {
  return Math.max(1, Math.min(7, Math.floor(dayNumber)));
}

function fallbackSuggestion(dayNumber: number) {
  const fallbackByDay: Record<
    number,
    {
      variant: SuggestionVariant;
      confidence: number;
      text: string;
      reasoning: string;
    }
  > = {
    3: {
      variant: "purple",
      confidence: 68,
      text: "You've been focused the last two days. Try 35-minute blocks instead of 25?",
      reasoning: "Day 3 is where the learn phase starts and the system begins with small adjustments.",
    },
    4: {
      variant: "teal",
      confidence: 71,
      text: "Try a 10-min walk after lunch. Movement helps your afternoon focus.",
      reasoning: "Day 4 leans into consistency signals and broadens suggestions slightly.",
    },
    5: {
      variant: "amber",
      confidence: 64,
      text: "Based on your mood tracking, try a 5-min breathing break before your next focus block.",
      reasoning: "Midweek suggestions check energy and recovery before pushing harder.",
    },
    6: {
      variant: "teal",
      confidence: 82,
      text: "You've completed 5 focus blocks in 5 days. Try 45 minutes today. You can do it.",
      reasoning: "Day 6 is the act phase, so the system can make a bolder recommendation.",
    },
    7: {
      variant: "purple",
      confidence: 80,
      text: "Your first week is complete. Keep one protected focus block as the anchor for week 2.",
      reasoning: "The final day transitions toward a repeatable next-week plan.",
    },
  };

  return fallbackByDay[dayNumber] ?? fallbackByDay[3];
}

function inferFallbackCategory(variant: SuggestionVariant) {
  if (variant === "teal") return "exercise" as const;
  if (variant === "amber") return "sleep" as const;
  return "focus" as const;
}

function buildModel() {
  if (!env.OPENROUTER_API_KEY) {
    return null;
  }

  const provider = createOpenRouter({
    apiKey: env.OPENROUTER_API_KEY,
    headers: {
      "HTTP-Referer": env.SITE_URL,
      "X-OpenRouter-Title": env.OPENROUTER_APP_NAME ?? "Seile First Run",
    },
  });

  return provider.chat(env.AI_MODEL_FAST ?? "openai/gpt-4o-mini");
}

export const generateDaySuggestion = internalAction({
  args: {
    userId: v.string(),
    dayNumber: v.number(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ ok: true; skipped: boolean; suggestionId: string }> => {
    const safeDayNumber = clampDayNumber(args.dayNumber);
    const phase = phaseForDay(safeDayNumber);
    const existingSuggestion: { _id: string } | null = await ctx.runQuery(
      internalApi.firstRunDays.getPendingSuggestionForPhase,
      {
        userId: args.userId,
        phase,
      },
    );
    if (existingSuggestion) {
      return { ok: true, skipped: true, suggestionId: existingSuggestion._id };
    }

    const context: {
      profile: unknown;
      recentSignals: unknown[];
      confidenceScores: unknown[];
    } = await ctx.runQuery(
      internalApi.firstRunDays.getSuggestionGenerationContext,
      {
        userId: args.userId,
        dayNumber: safeDayNumber,
      },
    );
    const fallback = fallbackSuggestion(safeDayNumber);

    let suggestion: z.infer<typeof SUGGESTION_SCHEMA> | null = null;
    const model = buildModel();
    if (model) {
      try {
        const result = await generateText({
          model,
          prompt: [
            "Generate one short onboarding suggestion for a first-run productivity app.",
            `Day: ${safeDayNumber}. Phase: ${phase}.`,
            "Return exactly one suggestion aligned to the user's context and recent behavior.",
            "Prefer concrete, low-friction suggestions. Keep content under 240 chars.",
            `User profile: ${JSON.stringify(context.profile)}`,
            `Recent signals: ${JSON.stringify(context.recentSignals)}`,
            `Confidence: ${JSON.stringify(context.confidenceScores)}`,
          ].join("\n\n"),
          experimental_output: Output.object({
            schema: SUGGESTION_SCHEMA,
          }),
        });
        if (result.experimental_output) {
          suggestion = result.experimental_output;
        }
      } catch (error) {
        console.error("generateDaySuggestion failed, using fallback", {
          userId: args.userId,
          dayNumber: safeDayNumber,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const record: z.infer<typeof SUGGESTION_SCHEMA> = suggestion ?? {
      category: inferFallbackCategory(fallback.variant),
      content: fallback.text,
      reasoning: fallback.reasoning,
      confidence: fallback.confidence,
    };

    const suggestionId: string = await ctx.runMutation(
      internalApi.firstRunDays.insertGeneratedSuggestion,
      {
        userId: args.userId,
        dayNumber: safeDayNumber,
        phase,
        category: record.category,
        content: record.content,
        reasoning: record.reasoning,
        confidenceAtTime: record.confidence,
      },
    );

    return { ok: true, skipped: false, suggestionId };
  },
});

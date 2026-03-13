import { v } from "convex/values";
import { z } from "zod";

export const AI_DOMAIN_VALUES = [
  "finance",
  "health",
  "wellness",
  "productivity",
  "career",
  "relationships",
  "faith",
  "space",
  "planner",
  "global",
] as const;

export const AI_INTENT_VALUES = [
  "chat",
  "plan",
  "review",
  "suggest",
  "act",
  "analyze",
  "check_in",
] as const;

export const APPROVAL_MODE_VALUES = ["auto", "confirm", "restricted"] as const;
export const MEMORY_KIND_VALUES = ["semantic", "episodic", "preference", "constraint"] as const;
export const MEMORY_SOURCE_VALUES = ["user", "agent", "workflow", "system"] as const;
export const RUN_SOURCE_VALUES = [
  "planner_chat",
  "finance_chat",
  "ai_router",
  "workflow",
  "system",
] as const;
export const AI_RESPONSE_KIND_VALUES = [
  "message",
  "plan",
  "approval_request",
  "suggestions",
  "review",
] as const;

export type AIDomain = (typeof AI_DOMAIN_VALUES)[number];
export type AIIntent = (typeof AI_INTENT_VALUES)[number];
export type ApprovalMode = (typeof APPROVAL_MODE_VALUES)[number];
export type MemoryKind = (typeof MEMORY_KIND_VALUES)[number];
export type MemorySource = (typeof MEMORY_SOURCE_VALUES)[number];
export type RunSource = (typeof RUN_SOURCE_VALUES)[number];
export type AIResponseKind = (typeof AI_RESPONSE_KIND_VALUES)[number];

export const aiDomainValidator = v.union(...AI_DOMAIN_VALUES.map((value) => v.literal(value)));
export const aiIntentValidator = v.union(...AI_INTENT_VALUES.map((value) => v.literal(value)));
export const approvalModeValidator = v.union(
  ...APPROVAL_MODE_VALUES.map((value) => v.literal(value)),
);
export const memoryKindValidator = v.union(
  ...MEMORY_KIND_VALUES.map((value) => v.literal(value)),
);
export const memorySourceValidator = v.union(
  ...MEMORY_SOURCE_VALUES.map((value) => v.literal(value)),
);
export const runSourceValidator = v.union(
  ...RUN_SOURCE_VALUES.map((value) => v.literal(value)),
);
export const aiResponseKindValidator = v.union(
  ...AI_RESPONSE_KIND_VALUES.map((value) => v.literal(value)),
);

export const weeklyPlanItemSchema = z.object({
  itemType: z.enum(["priority", "task", "habit", "workout", "buffer", "review", "milestone"]),
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  priority: z.enum(["low", "medium", "high"]),
  effort: z.enum(["low", "medium", "high"]),
  notes: z.string().optional(),
  draftTask: z
    .object({
      title: z.string().min(1),
      priority: z.enum(["low", "medium", "high"]),
      dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .optional(),
  draftHabit: z
    .object({
      name: z.string().min(1),
      cadence: z.enum(["daily", "weekdays", "weekly", "custom"]),
      targetValue: z.number(),
      scheduleDays: z.array(z.string()).optional(),
    })
    .optional(),
});

export const weeklyPlanSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  priorityTitles: z.array(z.string()).max(3),
  warnings: z.array(z.string()).max(6),
  burnoutRiskScore: z.number().min(0).max(100),
  recoverySuggested: z.boolean(),
  items: z.array(weeklyPlanItemSchema),
});

export type WeeklyPlan = z.infer<typeof weeklyPlanSchema>;

export const pendingActionSchema = z.object({
  approvalId: z.string().min(1),
  domain: z.enum(AI_DOMAIN_VALUES),
  actionType: z.string().min(1),
  title: z.string().min(1),
  preview: z.string().min(1),
  payloadJson: z.string().min(2),
  requiresConfirmation: z.boolean().default(true),
  destructive: z.boolean().default(false),
  approvalMode: z.enum(APPROVAL_MODE_VALUES),
  status: z.enum(["pending", "confirmed", "rejected", "failed"]).default("pending"),
});

export type PendingAction = z.infer<typeof pendingActionSchema>;

export const toolResultSchema = z.object({
  ok: z.boolean(),
  requiresConfirmation: z.boolean().optional(),
  preview: z.unknown().optional(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  pendingActions: z.array(pendingActionSchema).optional(),
});

export type ToolResult = z.infer<typeof toolResultSchema>;

export const aiResponseSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("message"),
    text: z.string().min(1),
    domains: z.array(z.enum(AI_DOMAIN_VALUES)).min(1),
    threadId: z.string().optional(),
    runId: z.string().optional(),
  }),
  z.object({
    kind: z.literal("plan"),
    text: z.string().min(1),
    domains: z.array(z.enum(AI_DOMAIN_VALUES)).min(1),
    plan: weeklyPlanSchema,
    threadId: z.string().optional(),
    runId: z.string().optional(),
  }),
  z.object({
    kind: z.literal("approval_request"),
    text: z.string().min(1),
    domains: z.array(z.enum(AI_DOMAIN_VALUES)).min(1),
    pendingActions: z.array(pendingActionSchema).min(1),
    threadId: z.string().optional(),
    runId: z.string().optional(),
  }),
  z.object({
    kind: z.literal("suggestions"),
    text: z.string().min(1),
    domains: z.array(z.enum(AI_DOMAIN_VALUES)).min(1),
    suggestions: z.array(z.string()).min(1),
    threadId: z.string().optional(),
    runId: z.string().optional(),
  }),
  z.object({
    kind: z.literal("review"),
    text: z.string().min(1),
    domains: z.array(z.enum(AI_DOMAIN_VALUES)).min(1),
    review: z.record(z.string(), z.unknown()),
    threadId: z.string().optional(),
    runId: z.string().optional(),
  }),
]);

export type AIResponse = z.infer<typeof aiResponseSchema>;

export const financeActionTypeSchema = z.enum([
  "account.create",
  "account.update",
  "account.archive",
  "transaction.create",
  "transaction.update",
  "transaction.reverse",
  "budgetPeriod.create",
  "budgetPeriod.update",
  "budgetPeriod.close",
  "budgetPeriod.archive",
  "budgetEnvelope.create",
  "budgetEnvelope.update",
  "budgetEnvelope.delete",
  "debt.create",
  "debt.update",
  "debt.archive",
  "savings.create",
  "savings.update",
  "savings.archive",
  "recurring.create",
  "recurring.update",
  "recurring.pause",
  "recurring.resume",
  "recurring.delete",
  "subscription.create",
  "subscription.cancel",
]);

export const financeProposalSchema = z.object({
  proposalId: z.string().min(1),
  actionType: financeActionTypeSchema,
  title: z.string().min(1),
  preview: z.string().min(1),
  payloadJson: z.string().min(2),
  destructive: z.boolean().default(false),
  requiresConfirmation: z.boolean().default(true),
});

export const financeAssistantResponseSchema = z.object({
  reply: z.string().min(1),
  proposedActions: z.array(financeProposalSchema).max(3).default([]),
});

export const toolResultValidator = v.object({
  ok: v.boolean(),
  requiresConfirmation: v.optional(v.boolean()),
  previewJson: v.optional(v.string()),
  dataJson: v.optional(v.string()),
  error: v.optional(v.string()),
});

export const pendingActionValidator = v.object({
  approvalId: v.string(),
  domain: aiDomainValidator,
  actionType: v.string(),
  title: v.string(),
  preview: v.string(),
  payloadJson: v.string(),
  requiresConfirmation: v.boolean(),
  destructive: v.boolean(),
  approvalMode: approvalModeValidator,
  status: v.union(
    v.literal("pending"),
    v.literal("confirmed"),
    v.literal("rejected"),
    v.literal("failed"),
  ),
});

export const weeklyPlanItemValidator = v.object({
  itemType: v.union(
    v.literal("priority"),
    v.literal("task"),
    v.literal("habit"),
    v.literal("workout"),
    v.literal("buffer"),
    v.literal("review"),
    v.literal("milestone"),
  ),
  title: v.string(),
  date: v.string(),
  startTime: v.optional(v.string()),
  endTime: v.optional(v.string()),
  priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  effort: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  notes: v.optional(v.string()),
  draftTask: v.optional(
    v.object({
      title: v.string(),
      priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      dueDate: v.string(),
    }),
  ),
  draftHabit: v.optional(
    v.object({
      name: v.string(),
      cadence: v.union(
        v.literal("daily"),
        v.literal("weekdays"),
        v.literal("weekly"),
        v.literal("custom"),
      ),
      targetValue: v.number(),
      scheduleDays: v.optional(v.array(v.string())),
    }),
  ),
});

export const weeklyPlanValidator = v.object({
  title: v.string(),
  summary: v.string(),
  priorityTitles: v.array(v.string()),
  warnings: v.array(v.string()),
  burnoutRiskScore: v.number(),
  recoverySuggested: v.boolean(),
  items: v.array(weeklyPlanItemValidator),
});

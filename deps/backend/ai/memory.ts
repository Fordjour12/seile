import { ConvexError, v } from "convex/values";

import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { requireUserId } from "../lib/identity";
import { aiDomainValidator, aiMemoryConfidenceValidator } from "../schema/ai";

const workflowReservationContextValidator = v.object({
  userId: v.string(),
  key: v.string(),
  reservationValue: v.string(),
});

type WorkflowReservationContext = {
  userId: string;
  key: string;
  reservationValue: string;
};

type WorkflowRunResult =
  | { kind: "success"; returnValue: unknown }
  | { kind: "failed"; error: string }
  | { kind: "canceled" };

export const getMemoryForDomain = query({
  args: {
    domain: aiDomainValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("aiMemory")
      .withIndex("by_user_domain", (q) =>
        q.eq("userId", userId).eq("domain", args.domain),
      )
      .collect();
  },
});

export const getAllMemory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("aiMemory")
      .withIndex("by_user_domain", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getAllMemoryForUser = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("aiMemory")
      .withIndex("by_user_domain", (q) => q.eq("userId", args.userId))
      .collect();

    return rows.sort((left, right) => right.updatedAt - left.updatedAt);
  },
});

export const getMemoryEntryForUserKey = internalQuery({
  args: {
    userId: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiMemory")
      .withIndex("by_user_key", (q) => q.eq("userId", args.userId).eq("key", args.key.trim()))
      .first();
  },
});

export const upsertMemory = mutation({
  args: {
    domain: aiDomainValidator,
    key: v.string(),
    value: v.string(),
    confidence: aiMemoryConfidenceValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const key = args.key.trim();
    const value = args.value.trim();

    if (!key || !value) {
      throw new ConvexError("Memory key and value are required.");
    }

    const existing = await ctx.db
      .query("aiMemory")
      .withIndex("by_user_key", (q) =>
        q.eq("userId", userId).eq("key", key),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        domain: args.domain,
        value,
        confidence: args.confidence,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("aiMemory", {
      userId,
      domain: args.domain,
      key,
      value,
      confidence: args.confidence,
      updatedAt: Date.now(),
    });
  },
});

export const upsertMemoryForUserInternal = internalMutation({
  args: {
    userId: v.string(),
    domain: aiDomainValidator,
    key: v.string(),
    value: v.string(),
    confidence: aiMemoryConfidenceValidator,
  },
  handler: async (ctx, args) => {
    const key = args.key.trim();
    const value = args.value.trim();

    if (!key || !value) {
      throw new ConvexError("Memory key and value are required.");
    }

    const existing = await ctx.db
      .query("aiMemory")
      .withIndex("by_user_key", (q) => q.eq("userId", args.userId).eq("key", key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        domain: args.domain,
        value,
        confidence: args.confidence,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("aiMemory", {
      userId: args.userId,
      domain: args.domain,
      key,
      value,
      confidence: args.confidence,
      updatedAt: Date.now(),
    });
  },
});

export const reserveWorkflowMemoryKey = internalMutation({
  args: {
    userId: v.string(),
    domain: aiDomainValidator,
    key: v.string(),
    reservationValue: v.string(),
    confidence: aiMemoryConfidenceValidator,
  },
  handler: async (ctx, args) => {
    const key = args.key.trim();
    const reservationValue = args.reservationValue.trim();

    if (!key || !reservationValue) {
      throw new ConvexError("Workflow reservation key and value are required.");
    }

    const existing = await ctx.db
      .query("aiMemory")
      .withIndex("by_user_key", (q) => q.eq("userId", args.userId).eq("key", key))
      .first();

    if (existing) {
      return { reserved: false };
    }

    await ctx.db.insert("aiMemory", {
      userId: args.userId,
      domain: args.domain,
      key,
      value: reservationValue,
      confidence: args.confidence,
      updatedAt: Date.now(),
    });

    return { reserved: true };
  },
});

export const releaseWorkflowMemoryReservation = internalMutation({
  args: workflowReservationContextValidator,
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("aiMemory")
      .withIndex("by_user_key", (q) =>
        q.eq("userId", args.userId).eq("key", args.key.trim()),
      )
      .first();

    if (!entry || entry.value !== args.reservationValue) {
      return { released: false };
    }

    await ctx.db.delete(entry._id);
    return { released: true };
  },
});

export const finalizeWorkflowMemoryReservation = internalMutation({
  args: {
    workflowId: v.string(),
    context: v.any(),
    result: v.any(),
  },
  handler: async (ctx, args) => {
    if (!isWorkflowReservationContext(args.context) || !isWorkflowRunResult(args.result)) {
      return { released: false };
    }

    if (args.result.kind === "success") {
      return { released: false };
    }

    const entry = await ctx.db
      .query("aiMemory")
      .withIndex("by_user_key", (q) =>
        q.eq("userId", args.context.userId).eq("key", args.context.key.trim()),
      )
      .first();

    if (!entry || entry.value !== args.context.reservationValue) {
      return { released: false };
    }

    await ctx.db.delete(entry._id);
    return { released: true };
  },
});

export const deleteMemoryKey = mutation({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const entry = await ctx.db
      .query("aiMemory")
      .withIndex("by_user_key", (q) =>
        q.eq("userId", userId).eq("key", args.key.trim()),
      )
      .first();

    if (entry) {
      await ctx.db.delete(entry._id);
    }

    return { ok: true };
  },
});

function isWorkflowReservationContext(
  value: unknown,
): value is WorkflowReservationContext {
  return Boolean(
    value &&
      typeof value === "object" &&
      "userId" in value &&
      typeof value.userId === "string" &&
      "key" in value &&
      typeof value.key === "string" &&
      "reservationValue" in value &&
      typeof value.reservationValue === "string",
  );
}

function isWorkflowRunResult(value: unknown): value is WorkflowRunResult {
  if (!value || typeof value !== "object" || !("kind" in value)) {
    return false;
  }

  if (value.kind === "success") {
    return true;
  }

  if (value.kind === "canceled") {
    return true;
  }

  return value.kind === "failed" && "error" in value && typeof value.error === "string";
}

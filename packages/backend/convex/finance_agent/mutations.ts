import { v } from "convex/values";

import { internalMutation, mutation } from "../_generated/server";
import { requireUserId } from "../lib/identity";

const DEFAULT_STATE = {
  agentEnabled: true,
  activeThreadId: undefined,
};

export const setFinanceAgentEnabled = mutation({
  args: {
    agentEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const state = await ensureFinanceAgentState(ctx, userId);
    await ctx.db.patch(state._id, {
      agentEnabled: args.agentEnabled,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(state._id);
  },
});

export const setActiveFinanceThread = internalMutation({
  args: {
    userId: v.string(),
    activeThreadId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const state = await ensureFinanceAgentState(ctx, args.userId);
    await ctx.db.patch(state._id, {
      activeThreadId: args.activeThreadId,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(state._id);
  },
});

export const logConfirmedFinanceAction = internalMutation({
  args: {
    userId: v.string(),
    threadId: v.optional(v.string()),
    proposalId: v.string(),
    actionType: v.string(),
    actionStatus: v.union(
      v.literal("confirmed"),
      v.literal("rejected"),
      v.literal("failed"),
    ),
    preview: v.string(),
    payloadJson: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("financeAgentAuditLog", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getOrCreateFinanceAgentState = internalMutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ensureFinanceAgentState(ctx, args.userId);
  },
});

async function ensureFinanceAgentState(ctx: any, userId: string) {
  const existing = await ctx.db
    .query("financeAgentState")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();
  if (existing) return existing;

  const now = Date.now();
  const id = await ctx.db.insert("financeAgentState", {
    userId,
    ...DEFAULT_STATE,
    createdAt: now,
    updatedAt: now,
  });
  return (await ctx.db.get(id))!;
}

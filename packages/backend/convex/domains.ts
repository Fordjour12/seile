import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/identity";
import { aiDomainValidator } from "./schema/ai";

const MAX_PINNED = 4;

// ─── Queries ────────────────────────────────────────────────────────────────

export const getUserDomains = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("userDomains")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getDomainStatus = query({
  args: { domain: aiDomainValidator },
  handler: async (ctx, { domain }) => {
    const userId = await requireUserId(ctx);
    const row = await ctx.db
      .query("userDomains")
      .withIndex("by_userId_domain", (q) =>
        q.eq("userId", userId).eq("domain", domain),
      )
      .first();
    return row ?? null;
  },
});

// ─── Mutations ──────────────────────────────────────────────────────────────

export const activateDomain = mutation({
  args: { domain: aiDomainValidator },
  handler: async (ctx, { domain }) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("userDomains")
      .withIndex("by_userId_domain", (q) =>
        q.eq("userId", userId).eq("domain", domain),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "active",
        activatedAt: now,
        deactivatedAt: undefined,
        updatedAt: now,
      });
      return { ok: true };
    }

    await ctx.db.insert("userDomains", {
      userId,
      domain,
      status: "active",
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return { ok: true };
  },
});

export const deactivateDomain = mutation({
  args: { domain: aiDomainValidator },
  handler: async (ctx, { domain }) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("userDomains")
      .withIndex("by_userId_domain", (q) =>
        q.eq("userId", userId).eq("domain", domain),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "inactive",
        pinnedAt: undefined,
        deactivatedAt: now,
        updatedAt: now,
      });
    }

    return { ok: true };
  },
});

export const togglePinDomain = mutation({
  args: { domain: aiDomainValidator },
  handler: async (ctx, { domain }) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("userDomains")
      .withIndex("by_userId_domain", (q) =>
        q.eq("userId", userId).eq("domain", domain),
      )
      .first();

    if (!existing || existing.status === "inactive") {
      return { ok: false, error: "Domain must be active before pinning" };
    }

    if (existing.status === "pinned") {
      // Unpin → active
      await ctx.db.patch(existing._id, {
        status: "active",
        pinnedAt: undefined,
        updatedAt: now,
      });
      return { ok: true, pinned: false };
    }

    // Check pin count
    const allRows = await ctx.db
      .query("userDomains")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    const pinnedCount = allRows.filter((r) => r.status === "pinned").length;

    if (pinnedCount >= MAX_PINNED) {
      return { ok: false, error: `You can pin at most ${MAX_PINNED} domains` };
    }

    await ctx.db.patch(existing._id, {
      status: "pinned",
      pinnedAt: now,
      updatedAt: now,
    });
    return { ok: true, pinned: true };
  },
});

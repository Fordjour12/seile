import { mutation } from "./_generated/server";

import { requireUserId } from "./lib/identity";

const DEFAULT_CATEGORIES = [
  "Salary",
  "Freelance",
  "Groceries",
  "Dining",
  "Transport",
  "Housing",
  "Utilities",
  "Health",
  "Entertainment",
  "Savings",
  "Debt Payments",
] as const;

export const bootstrapUserData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    if (existing.length >= DEFAULT_CATEGORIES.length) {
      return {
        created: false,
        seededCount: 0,
      };
    }

    const createdAt = Date.now();
    let seededCount = 0;

    for (const name of DEFAULT_CATEGORIES) {
      const category = await ctx.db
        .query("categories")
        .withIndex("by_userId_and_name", (q) => q.eq("userId", userId).eq("name", name))
        .first();

      if (category) {
        continue;
      }

      await ctx.db.insert("categories", {
        userId,
        name,
        icon: undefined,
        color: undefined,
        parentCategoryId: undefined,
        isSystem: true,
        createdAt,
      });
      seededCount += 1;
    }

    return {
      created: seededCount > 0,
      seededCount,
    };
  },
});

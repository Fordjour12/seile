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
      .first();

    if (existing) {
      return {
        created: false,
        seededCount: 0,
      };
    }

    const createdAt = Date.now();
    await Promise.all(
      DEFAULT_CATEGORIES.map((name) =>
        ctx.db.insert("categories", {
          userId,
          name,
          icon: undefined,
          color: undefined,
          parentCategoryId: undefined,
          isSystem: true,
          createdAt,
        }),
      ),
    );

    return {
      created: true,
      seededCount: DEFAULT_CATEGORIES.length,
    };
  },
});

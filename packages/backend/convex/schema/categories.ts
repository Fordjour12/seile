import { defineTable } from "convex/server";
import { v } from "convex/values";

export const categoriesTable = defineTable({
  userId: v.string(),
  name: v.string(),
  icon: v.optional(v.string()),
  color: v.optional(v.string()),
  parentCategoryId: v.optional(v.id("categories")),
  isSystem: v.boolean(),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_and_name", ["userId", "name"]);

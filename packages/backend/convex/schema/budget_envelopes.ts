import { defineTable } from "convex/server";
import { v } from "convex/values";

export const budgetEnvelopesTable = defineTable({
  userId: v.string(),
  periodId: v.id("budgetPeriods"),
  categoryId: v.id("categories"),
  name: v.string(),
  allocatedAmount: v.number(),
  rolloverAmount: v.number(),
  rolloverEnabled: v.boolean(),
  sortOrder: v.optional(v.string()),
  color: v.optional(v.string()),
  icon: v.optional(v.string()),
  categoryDeleted: v.optional(v.boolean()),
  notes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_periodId", ["periodId"])
  .index("by_periodId_categoryId", ["periodId", "categoryId"])
  .index("by_userId_categoryId", ["userId", "categoryId"]);

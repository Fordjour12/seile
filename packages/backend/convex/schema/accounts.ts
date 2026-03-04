import { defineTable } from "convex/server";
import { v } from "convex/values";

import { accountStatusValidator, accountTypeValidator } from "./validators";

export const accountsTable = defineTable({
  userId: v.string(),
  name: v.string(),
  type: accountTypeValidator,
  status: accountStatusValidator,
  currency: v.string(),
  balance: v.number(),
  note: v.optional(v.string()),
  // Legacy field retained during migration window.
  isArchived: v.optional(v.boolean()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_and_status", ["userId", "status"]);

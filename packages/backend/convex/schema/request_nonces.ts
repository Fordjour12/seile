import { defineTable } from "convex/server";
import { v } from "convex/values";

export const requestNoncesTable = defineTable({
  nonce: v.string(),
  createdAt: v.number(),
})
  .index("by_nonce", ["nonce"])
  .index("by_createdAt", ["createdAt"]);

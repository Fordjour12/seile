import { v } from "convex/values";

export const accountTypeValidator = v.union(
  v.literal("checking"),
  v.literal("savings"),
  v.literal("cash"),
  v.literal("credit"),
  v.literal("investment"),
  v.literal("bank"),
);

export const accountStatusValidator = v.union(
  v.literal("active"),
  v.literal("archived"),
  v.literal("closed"),
);

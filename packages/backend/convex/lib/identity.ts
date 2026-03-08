import { ConvexError } from "convex/values";

import type { MutationCtx, QueryCtx } from "../_generated/server";
import { authComponent } from "../auth";

type AuthCtx = QueryCtx | MutationCtx;

export async function requireUserId(ctx: AuthCtx): Promise<string> {
  const user = await authComponent.safeGetAuthUser(ctx);
  if (!user) {
    throw new ConvexError("Unauthenticated");
  }

  if (!user.userId) {
    throw new ConvexError("Authenticated user is missing a userId");
  }

  return user.userId;
}

export async function getOptionalUser(ctx: AuthCtx) {
  return await authComponent.safeGetAuthUser(ctx);
}

import { ConvexError } from "convex/values";

import type { MutationCtx, QueryCtx } from "../_generated/server";
import { authComponent } from "../auth";

type AuthCtx = QueryCtx | MutationCtx;

export async function requireUserId(ctx: AuthCtx): Promise<string> {
  const user = await authComponent.safeGetAuthUser(ctx);
  if (!user) {
    throw new ConvexError("Unauthenticated");
  }

  const userId =
    typeof user.userId === "string" && user.userId.length > 0
      ? user.userId
      : typeof user._id === "string" && user._id.length > 0
        ? user._id
        : null;

  if (!userId) {
    throw new ConvexError("Authenticated user is missing a userId");
  }

  return userId;
}

export async function getOptionalUser(ctx: AuthCtx) {
  return await authComponent.safeGetAuthUser(ctx);
}

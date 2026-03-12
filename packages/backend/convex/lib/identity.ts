import { ConvexError } from "convex/values";

import { authComponent } from "../auth";

export async function requireUserId(ctx: any): Promise<string> {
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

export async function getOptionalUser(ctx: any) {
  return await authComponent.safeGetAuthUser(ctx);
}

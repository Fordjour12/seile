import { expo } from "@better-auth/expo";
import { passkey } from "@better-auth/passkey";
import { convexAdapter, createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { env } from "@seile/env/backend";

import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";

const componentsAny = components as any;
const authOrigin = env.CONVEX_SITE_URL.replace(/\/$/, "");
const rpID = new URL(authOrigin).hostname;

export const authComponent = createClient<DataModel>(componentsAny.betterAuth);

function isRuntimeCtx(
  ctx: unknown,
): ctx is Parameters<typeof authComponent.adapter>[0] {
  return Boolean(
    ctx && typeof ctx === "object" && "auth" in ctx && "runQuery" in ctx,
  );
}

export function createAuth(ctx: unknown) {
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: authOrigin,
    database: isRuntimeCtx(ctx)
      ? authComponent.adapter(ctx)
      : convexAdapter({} as any, componentsAny.betterAuth),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    trustedOrigins: [authOrigin, "seile://"],
    plugins: [
      expo(),
      passkey({
        rpID,
        rpName: "Seile",
        origin: authOrigin,
      }),
      convex({
        authConfig,
      }),
    ],
  });
}

export const { getAuthUser } = authComponent.clientApi();

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.getAuthUser(ctx);
  },
});

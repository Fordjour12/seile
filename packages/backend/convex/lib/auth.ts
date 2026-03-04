import { ConvexError } from "convex/values";

import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
  assertTimestampFresh,
  assertValidSignature,
  buildSigningMessage,
  getHmacSecret,
  isRequestNonceExpired,
  signMessage,
  type AuthPayload,
} from "./security";

type SignedArgs = {
  auth: AuthPayload;
} & Record<string, unknown>;

type SignedRequestCtx = QueryCtx | MutationCtx;

export async function requireSignedRequest(
  ctx: SignedRequestCtx,
  args: SignedArgs,
  functionName: string
): Promise<void> {
  assertTimestampFresh(args.auth.ts);

  const { auth, ...payloadWithoutAuth } = args;
  const signingMessage = buildSigningMessage(functionName, payloadWithoutAuth, auth);
  const expectedSig = await signMessage(getHmacSecret(), signingMessage);
  assertValidSignature(auth.sig, expectedSig);

  await assertNonceFreshAndPersist(ctx, auth);
}

async function assertNonceFreshAndPersist(ctx: SignedRequestCtx, auth: AuthPayload): Promise<void> {
  const now = Date.now();
  const existing = await ctx.db
    .query("requestNonces")
    .withIndex("by_nonce", (query) => query.eq("nonce", auth.nonce))
    .first();

  if (existing && !isRequestNonceExpired(existing.createdAt, now)) {
    throw new ConvexError("Unauthorized: replay detected");
  }

  if (!hasInsert(ctx)) {
    // Convex queries are read-only, so replay persistence must be enforced by write-capable callers.
    return;
  }

  await ctx.db.insert("requestNonces", {
    nonce: auth.nonce,
    createdAt: now,
  });
}

function hasInsert(ctx: SignedRequestCtx): ctx is MutationCtx {
  return "insert" in ctx.db;
}

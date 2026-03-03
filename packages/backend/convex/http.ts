import { anyApi, httpRouter } from "convex/server";

import { httpAction } from "./_generated/server";
import { buildSigningMessage, getHmacSecret, signMessage } from "./lib/security";

const http = httpRouter();

function json(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Request failed";
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json();

  if (!body || typeof body !== "object") {
    return {};
  }

  return body as Record<string, unknown>;
}

function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function withSignedAuth(functionName: string, payload: Record<string, unknown>) {
  const auth = {
    ts: Date.now(),
    nonce: createNonce(),
    sig: "",
  };

  const signingMessage = buildSigningMessage(functionName, payload, auth);
  auth.sig = await signMessage(getHmacSecret(), signingMessage);

  return {
    ...payload,
    auth,
  };
}

http.route({
  path: "/accounts/list",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await readBody(request);
      const args = await withSignedAuth("accounts:listAccounts", payload);
      const result = await ctx.runMutation((anyApi as any).accounts.listAccounts, args);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/accounts/getById",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await readBody(request);
      const args = await withSignedAuth("accounts:getAccountById", payload);
      const result = await ctx.runMutation((anyApi as any).accounts.getAccountById, args);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/accounts/create",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await readBody(request);
      const args = await withSignedAuth("accounts:createAccount", payload);
      const result = await ctx.runMutation((anyApi as any).accounts.createAccount, args);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/accounts/update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await readBody(request);
      const args = await withSignedAuth("accounts:updateAccount", payload);
      const result = await ctx.runMutation((anyApi as any).accounts.updateAccount, args);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/accounts/archive",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await readBody(request);
      const args = await withSignedAuth("accounts:deleteAccount", payload);
      const result = await ctx.runMutation((anyApi as any).accounts.deleteAccount, args);
      return json(200, { success: result });
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

export default http;

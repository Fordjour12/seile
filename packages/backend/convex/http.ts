import { httpRouter } from "convex/server";

import { httpAction } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { buildSigningMessage, getHmacSecret, signMessage, type AuthPayload } from "./lib/security";

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

async function withSignedAuth<TPayload extends Record<string, unknown>>(
  functionName: string,
  payload: TPayload,
): Promise<TPayload & { auth: AuthPayload }> {
  const auth: AuthPayload = {
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

type ListAccountsPayload = {
  includeArchived?: boolean;
  pagination?: {
    cursor?: string | null;
    limit?: number;
  };
};

type GetAccountPayload = {
  accountId: Id<"accounts">;
};

type CreateAccountPayload = {
  name: string;
  type: "checking" | "savings" | "cash" | "credit" | "investment" | "bank";
  currency: string;
  openingBalance?: number;
  note?: string;
};

type UpdateAccountPayload = {
  accountId: Id<"accounts">;
  name?: string;
  type?: "checking" | "savings" | "cash" | "credit" | "investment" | "bank";
  currency?: string;
  balance?: number;
  status?: "active" | "archived" | "closed";
  note?: string;
};

type ArchiveAccountPayload = {
  accountId: Id<"accounts">;
};

http.route({
  path: "/accounts/list",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as ListAccountsPayload;
      const args = await withSignedAuth("accounts:listAccounts", payload);
      const result = await ctx.runMutation(api.accounts.listAccounts, args);
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
      const payload = (await readBody(request)) as GetAccountPayload;
      const args = await withSignedAuth("accounts:getAccountById", payload);
      const result = await ctx.runMutation(api.accounts.getAccountById, args);
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
      const payload = (await readBody(request)) as CreateAccountPayload;
      const args = await withSignedAuth("accounts:createAccount", payload);
      const result = await ctx.runMutation(api.accounts.createAccount, args);
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
      const payload = (await readBody(request)) as UpdateAccountPayload;
      const args = await withSignedAuth("accounts:updateAccount", payload);
      const result = await ctx.runMutation(api.accounts.updateAccount, args);
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
      const payload = (await readBody(request)) as ArchiveAccountPayload;
      const args = await withSignedAuth("accounts:deleteAccount", payload);
      const result = await ctx.runMutation(api.accounts.deleteAccount, args);
      return json(200, { success: result });
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

export default http;

import { anyApi, httpRouter } from "convex/server";

import { httpAction } from "./_generated/server";

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

http.route({
  path: "/accounts/list",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const args = await readBody(request);
      const result = await ctx.runQuery(anyApi.accounts.listAccounts, args);
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
      const args = await readBody(request);
      const result = await ctx.runQuery(anyApi.accounts.getAccountById, args);
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
      const args = await readBody(request);
      const result = await ctx.runMutation(anyApi.accounts.createAccount, args);
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
      const args = await readBody(request);
      const result = await ctx.runMutation(anyApi.accounts.updateAccount, args);
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
      const args = await readBody(request);
      const result = await ctx.runMutation(anyApi.accounts.deleteAccount, args);
      return json(200, { success: result });
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

export default http;

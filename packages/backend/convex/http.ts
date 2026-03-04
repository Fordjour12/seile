import { httpRouter } from "convex/server";

import { httpAction } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import type { AuthPayload } from "./lib/security";

const http = httpRouter();
const apiAny = api as any;

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

function hasValidAuth(auth: unknown): auth is AuthPayload {
  if (!auth || typeof auth !== "object") {
    return false;
  }

  const authValue = auth as Record<string, unknown>;
  return (
    typeof authValue.ts === "number" &&
    typeof authValue.nonce === "string" &&
    typeof authValue.sig === "string"
  );
}

function assertSignedPayload(payload: Record<string, unknown>): void {
  if (!hasValidAuth(payload.auth)) {
    throw new Error("Unauthorized: missing or invalid auth payload");
  }
}

type ListAccountsPayload = {
  includeArchived?: boolean;
  pagination?: {
    cursor?: string | null;
    limit?: number;
  };
  auth: AuthPayload;
};

type GetAccountPayload = {
  accountId: Id<"accounts">;
  auth: AuthPayload;
};

type CreateAccountPayload = {
  name: string;
  type: "checking" | "savings" | "cash" | "credit" | "investment" | "bank";
  currency: string;
  openingBalance?: number;
  note?: string;
  auth: AuthPayload;
};

type UpdateAccountPayload = {
  accountId: Id<"accounts">;
  name?: string;
  type?: "checking" | "savings" | "cash" | "credit" | "investment" | "bank";
  currency?: string;
  balance?: number;
  status?: "active" | "archived" | "closed";
  note?: string;
  auth: AuthPayload;
};

type ArchiveAccountPayload = {
  accountId: Id<"accounts">;
  auth: AuthPayload;
};

type TransactionIdPayload = {
  id: Id<"transactions">;
};

type RecurringIdPayload = {
  id: Id<"recurringTransactions">;
};

http.route({
  path: "/accounts/list",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as ListAccountsPayload;
      assertSignedPayload(payload);
      const result = await ctx.runMutation(api.accounts.listAccounts, payload);
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
      assertSignedPayload(payload);
      const result = await ctx.runMutation(api.accounts.getAccountById, payload);
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
      assertSignedPayload(payload);
      const result = await ctx.runMutation(api.accounts.createAccount, payload);
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
      assertSignedPayload(payload);
      const result = await ctx.runMutation(api.accounts.updateAccount, payload);
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
      assertSignedPayload(payload);
      const result = await ctx.runMutation(api.accounts.deleteAccount, payload);
      return json(200, { success: result });
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/transactions/list",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as {
        limit?: number;
        before?: number;
      };
      const result = await ctx.runQuery(apiAny["transactions/queries"].listTransactions, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/transactions/getById",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as TransactionIdPayload;
      const result = await ctx.runQuery(apiAny["transactions/queries"].getTransactionById, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/transactions/summary",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as {
        from: number;
        to: number;
      };
      const result = await ctx.runQuery(apiAny["transactions/queries"].getTransactionSummary, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/transactions/create",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await readBody(request);
      const result = await ctx.runMutation(apiAny["transactions/mutations"].createTransaction, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/transactions/update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await readBody(request);
      const result = await ctx.runMutation(apiAny["transactions/mutations"].updateTransaction, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/transactions/delete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await readBody(request);
      const result = await ctx.runMutation(apiAny["transactions/mutations"].deleteTransaction, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/transactions/reverse",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as TransactionIdPayload;
      const result = await ctx.runMutation(apiAny["transactions/mutations"].reverseTransaction, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/recurring/list",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as { includeInactive?: boolean };
      const result = await ctx.runQuery(apiAny["recurring/queries"].listRecurringTransactions, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/recurring/upcoming",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as { withinDays: number };
      const result = await ctx.runQuery(apiAny["recurring/queries"].getUpcomingRecurring, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/recurring/create",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await readBody(request);
      const result = await ctx.runMutation(apiAny["recurring/mutations"].createRecurringTransaction, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/recurring/update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await readBody(request);
      const result = await ctx.runMutation(apiAny["recurring/mutations"].updateRecurringTransaction, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/recurring/pause",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as RecurringIdPayload;
      const result = await ctx.runMutation(apiAny["recurring/mutations"].pauseRecurringTransaction, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/recurring/resume",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as RecurringIdPayload;
      const result = await ctx.runMutation(apiAny["recurring/mutations"].resumeRecurringTransaction, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/recurring/delete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await readBody(request);
      const result = await ctx.runMutation(apiAny["recurring/mutations"].deleteRecurringTransaction, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/subscriptions/list",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as { includeInactive?: boolean };
      const result = await ctx.runQuery(apiAny["subscriptions/queries"].listSubscriptions, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/subscriptions/by-status",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as {
        status: "active" | "trial" | "paused" | "cancelled";
      };
      const result = await ctx.runQuery(apiAny["subscriptions/queries"].getByStatus, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/subscriptions/upcoming",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as { withinDays: number };
      const result = await ctx.runQuery(apiAny["subscriptions/queries"].getUpcomingRenewals, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/subscriptions/monthly-spend",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      await readBody(request);
      const result = await ctx.runQuery(apiAny["subscriptions/queries"].getMonthlySubscriptionSpend, {});
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/subscriptions/create",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await readBody(request);
      const result = await ctx.runMutation(apiAny["subscriptions/mutations"].createSubscription, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/subscriptions/cancel",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as RecurringIdPayload;
      const result = await ctx.runMutation(apiAny["subscriptions/mutations"].cancelSubscription, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/categories/list",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      await readBody(request);
      const result = await ctx.runQuery(apiAny["categories/queries"].listCategories, {});
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

export default http;

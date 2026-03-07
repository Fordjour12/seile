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
  providerName?: string;
  type: "checking" | "savings" | "cash" | "credit" | "investment" | "bank";
  currency: string;
  openingBalance?: number;
  note?: string;
  auth: AuthPayload;
};

type UpdateAccountPayload = {
  accountId: Id<"accounts">;
  name?: string;
  providerName?: string;
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

type DebtIdPayload = {
  id: Id<"debtPlans">;
};

type SavingsIdPayload = {
  id: Id<"savingsGoals">;
};

type SchedulerTaskIdPayload = {
  id: Id<"schedulerTasks">;
};

type BudgetPeriodIdPayload = {
  id: Id<"budgetPeriods">;
};

type BudgetEnvelopeIdPayload = {
  id: Id<"budgetEnvelopes">;
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
  path: "/scheduler/tasks/list",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as {
        includeCompleted?: boolean;
      };
      const result = await ctx.runQuery(apiAny["scheduler/queries"].listSchedulerTasks, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/scheduler/tasks/getById",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as SchedulerTaskIdPayload;
      const result = await ctx.runQuery(apiAny["scheduler/queries"].getSchedulerTaskById, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/scheduler/tasks/create",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await readBody(request);
      const result = await ctx.runMutation(apiAny["scheduler/mutations"].createSchedulerTask, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/scheduler/tasks/update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await readBody(request);
      const result = await ctx.runMutation(apiAny["scheduler/mutations"].updateSchedulerTask, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/scheduler/tasks/toggle-subtask",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await readBody(request);
      const result = await ctx.runMutation(apiAny["scheduler/mutations"].toggleSchedulerSubtask, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/scheduler/tasks/delete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as SchedulerTaskIdPayload;
      const result = await ctx.runMutation(apiAny["scheduler/mutations"].deleteSchedulerTask, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/scheduler/tasks/reconcile",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as {
        todayDate: string;
      };
      const result = await ctx.runMutation(apiAny["scheduler/mutations"].reconcileSchedulerTasks, payload);
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


http.route({
  path: "/debt/list",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as { status?: "draft" | "active" | "archived"; includeArchived?: boolean };
      const result = await ctx.runQuery(apiAny["debt/queries"].listDebtPlans, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/debt/snapshot",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      await readBody(request);
      const result = await ctx.runQuery(apiAny["debt/queries"].getDebtSnapshot, {});
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({
  path: "/debt/getById",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as DebtIdPayload;
      const result = await ctx.runQuery(apiAny["debt/queries"].getDebtPlanById, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({ path: "/debt/create", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = await readBody(request); const result = await ctx.runMutation(apiAny["debt/mutations"].createDebtPlan, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/debt/update", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = await readBody(request); const result = await ctx.runMutation(apiAny["debt/mutations"].updateDebtPlan, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/debt/reorder", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = await readBody(request); const result = await ctx.runMutation(apiAny["debt/mutations"].reorderDebtPlans, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/debt/archive", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = (await readBody(request)) as DebtIdPayload; const result = await ctx.runMutation(apiAny["debt/mutations"].archiveDebtPlan, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({
  path: "/savings/list",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = (await readBody(request)) as { status?: "draft" | "active" | "completed" | "archived"; includeArchived?: boolean };
      const result = await ctx.runQuery(apiAny["savings/queries"].listSavingsGoals, payload);
      return json(200, result);
    } catch (error) {
      return json(400, { error: errorMessage(error) });
    }
  }),
});

http.route({ path: "/savings/summary", method: "POST", handler: httpAction(async (ctx, request) => {
  try { await readBody(request); const result = await ctx.runQuery(apiAny["savings/queries"].getSavingsSummary, {}); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/savings/getById", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = (await readBody(request)) as SavingsIdPayload; const result = await ctx.runQuery(apiAny["savings/queries"].getSavingsGoalById, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/savings/create", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = await readBody(request); const result = await ctx.runMutation(apiAny["savings/mutations"].createSavingsGoal, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/savings/update", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = await readBody(request); const result = await ctx.runMutation(apiAny["savings/mutations"].updateSavingsGoal, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/savings/reorder", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = await readBody(request); const result = await ctx.runMutation(apiAny["savings/mutations"].reorderSavingsGoals, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/savings/archive", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = (await readBody(request)) as SavingsIdPayload; const result = await ctx.runMutation(apiAny["savings/mutations"].archiveSavingsGoal, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});



http.route({ path: "/budget/periods/list", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = await readBody(request); const result = await ctx.runQuery(apiAny["budget/queries"].listBudgetPeriods, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/budget/periods/active", method: "POST", handler: httpAction(async (ctx, request) => {
  try { await readBody(request); const result = await ctx.runQuery(apiAny["budget/queries"].getActivePeriod, {}); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/budget/periods/getById", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = (await readBody(request)) as BudgetPeriodIdPayload; const result = await ctx.runQuery(apiAny["budget/queries"].getBudgetPeriodById, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/budget/periods/summary", method: "POST", handler: httpAction(async (ctx, request) => {
  try { await readBody(request); const result = await ctx.runQuery(apiAny["budget/queries"].getBudgetSummary, {}); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/budget/periods/create", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = await readBody(request); const result = await ctx.runMutation(apiAny["budget/mutations"].createBudgetPeriod, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/budget/periods/update", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = await readBody(request); const result = await ctx.runMutation(apiAny["budget/mutations"].updateBudgetPeriod, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/budget/periods/activate", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = (await readBody(request)) as BudgetPeriodIdPayload; const result = await ctx.runMutation(apiAny["budget/mutations"].activateBudgetPeriod, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/budget/periods/close", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = (await readBody(request)) as BudgetPeriodIdPayload; const result = await ctx.runMutation(apiAny["budget/mutations"].closeBudgetPeriod, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/budget/periods/archive", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = (await readBody(request)) as BudgetPeriodIdPayload; const result = await ctx.runMutation(apiAny["budget/mutations"].archiveBudgetPeriod, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/budget/periods/copy", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = await readBody(request); const result = await ctx.runMutation(apiAny["budget/mutations"].copyPreviousPeriod, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/budget/envelopes/list", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = await readBody(request); const result = await ctx.runQuery(apiAny["budget/queries"].listEnvelopes, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/budget/envelopes/getById", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = (await readBody(request)) as BudgetEnvelopeIdPayload; const result = await ctx.runQuery(apiAny["budget/queries"].getEnvelopeById, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/budget/envelopes/history", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = await readBody(request); const result = await ctx.runQuery(apiAny["budget/queries"].getEnvelopeHistory, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/budget/envelopes/create", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = await readBody(request); const result = await ctx.runMutation(apiAny["budget/mutations"].createEnvelope, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/budget/envelopes/update", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = await readBody(request); const result = await ctx.runMutation(apiAny["budget/mutations"].updateEnvelope, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/budget/envelopes/reorder", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = await readBody(request); const result = await ctx.runMutation(apiAny["budget/mutations"].reorderEnvelopes, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

http.route({ path: "/budget/envelopes/delete", method: "POST", handler: httpAction(async (ctx, request) => {
  try { const payload = (await readBody(request)) as BudgetEnvelopeIdPayload; const result = await ctx.runMutation(apiAny["budget/mutations"].deleteEnvelope, payload); return json(200, result); }
  catch (error) { return json(400, { error: errorMessage(error) }); }
})});

export default http;

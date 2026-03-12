import { ConvexError, v } from "convex/values";

import type { Id } from "../_generated/dataModel";
import { components } from "../_generated/api";
import { internalQuery, query, type QueryCtx } from "../_generated/server";
import { requireUserId } from "../lib/identity";
import { env } from "@seile/env/backend";

const componentsAny = components as any;
const paginationValidator = v.object({
  cursor: v.union(v.string(), v.null()),
  numItems: v.number(),
});

export const getFinanceAgentHome = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const context = await buildFinanceAgentContext(ctx, userId);

    return {
      summary: context.summary,
      activeThreadId: context.agentState?.activeThreadId ?? null,
      agentState: context.agentState
        ? {
            _id: context.agentState._id,
            agentEnabled: context.agentState.agentEnabled,
            activeThreadId: context.agentState.activeThreadId ?? null,
          }
        : null,
      model: env.FINANCE_AGENT_MODEL ?? null,
    };
  },
});

export const getFinanceAgentContext = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await buildFinanceAgentContext(ctx, args.userId);
  },
});

export const listFinanceAgentMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: v.optional(paginationValidator),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const thread = await ctx.runQuery(componentsAny.agent.threads.getThread, {
      threadId: args.threadId,
    });

    if (!thread || thread.userId !== userId) {
      throw new ConvexError("Finance agent thread not found");
    }

    const page = await ctx.runQuery(
      componentsAny.agent.messages.listMessagesByThreadId,
      {
        threadId: args.threadId,
        order: "asc",
        excludeToolMessages: true,
        paginationOpts: args.paginationOpts ?? { cursor: null, numItems: 80 },
      },
    );

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      page: page.page.map((entry: any) => normalizeMessage(entry)).filter(Boolean),
    };
  },
});

export const getFinanceAgentThread = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const thread = await ctx.runQuery(componentsAny.agent.threads.getThread, {
      threadId: args.threadId,
    });

    if (!thread || thread.userId !== userId) {
      throw new ConvexError("Finance agent thread not found");
    }

    return {
      id: thread._id,
      title: thread.title ?? "Finance agent",
      summary: thread.summary ?? "",
      status: thread.status ?? "active",
      createdAt: thread._creationTime,
    };
  },
});

async function buildFinanceAgentContext(ctx: QueryCtx, userId: string) {
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [
    agentState,
    accounts,
    transactions,
    budgetPeriods,
    envelopes,
    debtPlans,
    savingsGoals,
    recurringTransactions,
    sharedGoals,
  ] = await Promise.all([
    ctx.db
      .query("financeAgentState")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first(),
    ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect(),
    ctx.db
      .query("transactions")
      .withIndex("by_userId_occurredAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20),
    ctx.db
      .query("budgetPeriods")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect(),
    ctx.db
      .query("budgetEnvelopes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect(),
    ctx.db
      .query("debtPlans")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect(),
    ctx.db
      .query("savingsGoals")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect(),
    ctx.db
      .query("recurringTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect(),
    ctx.db
      .query("sharedGoals")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect(),
  ]);

  const activeBudget =
    budgetPeriods.find((period) => period.status === "active") ?? null;
  const totalCash = accounts
    .filter((account) => account.status !== "archived")
    .reduce((sum, account) => sum + account.balance, 0);
  const activeDebt = debtPlans.filter((plan) => plan.status !== "archived");
  const activeSavings = savingsGoals.filter((goal) => goal.status !== "archived");
  const activeSubscriptions = recurringTransactions.filter(
    (entry) => entry.isSubscription && entry.isActive,
  );
  const monthTransactions = transactions.filter(
    (entry) => entry.occurredAt >= monthStart.getTime(),
  );

  let income = 0;
  let expense = 0;
  for (const transaction of monthTransactions) {
    if (transaction.kind === "income" || transaction.kind === "adjustment") {
      income += transaction.amount;
    } else if (transaction.kind === "expense") {
      expense += transaction.amount;
    }
  }

  return {
    agentState,
    summary: {
      totalCash,
      activeAccountsCount: accounts.filter((account) => account.status === "active")
        .length,
      monthIncome: income,
      monthExpense: expense,
      activeBudget: activeBudget
        ? {
            id: activeBudget._id,
            year: activeBudget.year,
            month: activeBudget.month,
            incomeTarget: activeBudget.incomeTarget,
          }
        : null,
      budgetEnvelopeCount: activeBudget
        ? envelopes.filter((entry) => entry.periodId === activeBudget._id).length
        : 0,
      debts: activeDebt.map((plan) => ({
        id: plan._id,
        name: plan.name,
        currentBalance: plan.currentBalance,
        monthlyDue: plan.monthlyDue,
        status: plan.status,
      })),
      savingsGoals: activeSavings.map((goal) => ({
        id: goal._id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        status: goal.status,
      })),
      recurringCount: recurringTransactions.filter((entry) => entry.isActive).length,
      activeSubscriptions: activeSubscriptions.map((entry) => ({
        id: entry._id,
        serviceName:
          entry.subscriptionMeta?.serviceName ?? entry.note ?? "Subscription",
        amount: entry.amount,
        status: entry.subscriptionMeta?.status ?? "active",
      })),
      recentTransactions: transactions.slice(0, 10).map((entry) => ({
        id: entry._id,
        kind: entry.kind,
        amount: entry.amount,
        note: entry.note,
        occurredAt: entry.occurredAt,
      })),
      sharedGoals: sharedGoals
        .filter((goal) => goal.active)
        .sort((left, right) => right.updatedAt - left.updatedAt)
        .slice(0, 10)
        .map((goal) => ({
          id: goal._id,
          title: goal.title,
          goalKind: goal.goalKind,
          priority: goal.priority,
          sourceDomain: goal.sourceDomain,
        })),
    },
  };
}

async function requireOwnedThread(ctx: QueryCtx, userId: string, threadId: Id<"_storage"> | string) {
  const thread = await ctx.runQuery(componentsAny.agent.threads.getThread, {
    threadId,
  });
  if (!thread || thread.userId !== userId) {
    throw new ConvexError("Finance agent thread not found");
  }
  return thread;
}

function normalizeMessage(entry: any) {
  const role = entry?.message?.role;
  if (role !== "user" && role !== "assistant") {
    return null;
  }

  const parts = entry?.message?.content ?? [];
  const text = parts
    .map((part: any) => (part?.type === "text" ? part.text : ""))
    .join("")
    .trim();
  if (!text) return null;

  return {
    id: entry._id,
    role,
    text,
    status: "success",
    createdAt: entry._creationTime ?? Date.now(),
  };
}

# Native Convex API Changes for apps/native

## Why this doc exists

The backend surface moved substantially between March 11, 2026 and March 14, 2026. `apps/native` now depends on the generated Convex API exported from `@seile/backend/convex/_generated/api`, with local adapters layered on top of that generated client.

This document is the source of truth for:

- current public Convex functions that native should call
- old namespace to new namespace mappings
- which endpoints are already consumed, available but unused, or intentionally not live

The main public-surface changes to keep in mind are:

- finance modules were reorganized from flat Convex files into `finance/*` namespaces
- planner endpoints moved into `productivity/planner/{queries,mutations,actions}`
- unified AI entrypoints now live under `ai/runRouter`, `ai/approval`, `ai/approval_actions`, and `ai/memory`
- `shared_goals` became the public cross-domain goal surface used by planner settings and finance-linked goal flows
- `finance/agent/*` exists publicly in backend but is not yet surfaced through native helper modules
- `career/*`, `relationships/*`, and `space/*` were added to backend, but native should not assume they are live

## High-signal change timeline

- `2026-03-11` `85e4ba4`
  Refined the spiritual module and tightened native faith integration. Native impact: the faith/spiritual screens now depend on indexed `spiritual/queries` plus stricter backend validation in `spiritual/mutations`, especially around goal target minimums and reading/reflection defaults.

- `2026-03-12` `13d7152`
  Introduced `shared_goals` and linked finance and planner goal flows through that public surface. Native impact: planner settings now create shared goals through `api.shared_goals.mutations.createSharedGoal`, while savings and debt mutations synchronize backend records to shared goals behind the scenes.

- `2026-03-13` `4017e21`
  Introduced the unified AI layer, including approvals, memory, and streaming. Native impact: older native wrapper files for planner/finance-agent were superseded by `ai/runRouter`, `ai/approval`, `ai/approval_actions`, `ai/memory`, and the `POST /ai/stream` HTTP route.

- `2026-03-14` `221e4ac`
  Reorganized finance and planner namespaces into `finance/*` and `productivity/planner/*`. Native impact: repositories and hooks were updated to call namespaced generated API paths, and this is the biggest migration point for anyone reading older code or older docs.

- `2026-03-14` `fa530f7`
  Added backend modules for `career/*`, `relationships/*`, and `space/*`. Native impact: these domains now exist in the generated backend surface and AI domain types, but they are not live for native usage and should not be treated as production-ready integrations.

## Namespace migration map

| Old namespace or wrapper | New namespace or adapter |
| --- | --- |
| `accounts.*` | `finance.accounts.*` |
| `budget.*` | `finance.budget.{queries,mutations}.*` |
| `categories.*` | `finance.categories.queries.*` |
| `debt.*` | `finance.debt.{queries,mutations}.*` |
| `savings.*` | `finance.savings.{queries,mutations}.*` |
| `subscriptions.*` | `finance.subscriptions.{queries,mutations}.*` |
| `transactions.*` | `finance.transactions.{queries,mutations}.*` |
| `recurring.*` | `finance.recurring.{queries,mutations}.*` |
| `planner.*` | `productivity/planner/{queries,mutations,actions}.*` |
| legacy native `finance-agent` wrappers | unified `ai/*` plus public `finance/agent/*` |
| legacy native `planner` wrapper file | `apps/native/lib/planner/api.ts` string-path adapter over `productivity/planner/*` |

No stale pre-reorg usages were found in the current `apps/native` tree. The migration map still matters because older commits, older docs, and any new native work based on pre-March 14 code can otherwise point at the wrong backend namespace.

## Native integration matrix

| Domain | Backend namespace | Public function | Type | Native consumer | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Finance accounts | `finance.accounts` | `finance.accounts.{listAccounts,getAccountById,createAccount,updateAccount,deleteAccount}` | query + mutation | `apps/native/lib/accounts/repository.ts` | In use | Direct generated API usage through `api.finance.accounts.*`. |
| Finance transactions queries | `finance.transactions.queries` | `finance.transactions.queries.{listTransactions,getTransactionById,getTransactionSummary}` | query | `apps/native/lib/transactions/repository.ts` | In use | Used for list, detail, and summary windows. |
| Finance transactions mutations | `finance.transactions.mutations` | `finance.transactions.mutations.{createTransaction,updateTransaction,deleteTransaction,reverseTransaction}` | mutation | `apps/native/lib/transactions/repository.ts` | In use | The native repo maps date strings and optional IDs before calling. |
| Finance subscriptions queries | `finance.subscriptions.queries` | `finance.subscriptions.queries.{listSubscriptions,getByStatus,getUpcomingRenewals,getMonthlySubscriptionSpend}` | query | `apps/native/lib/subscriptions/repository.ts` | In use | Subscription rows are recurring transactions with subscription metadata. |
| Finance subscriptions mutations | `finance.subscriptions.mutations` | `finance.subscriptions.mutations.{createSubscription,cancelSubscription}` | mutation | `apps/native/lib/subscriptions/repository.ts` | In use | Native creates subscriptions and performs cancellation only. |
| Finance budget queries | `finance.budget.queries` | `finance.budget.queries.{getBudgetSummary,getActivePeriod,listEnvelopes,listBudgetPeriods,getBudgetPeriodById,getEnvelopeById,getEnvelopeHistory}` | query | `apps/native/lib/budget/repository.ts` | In use | Queries return computed envelope or period summaries, not just raw rows. |
| Finance budget mutations | `finance.budget.mutations` | `finance.budget.mutations.{createBudgetPeriod,updateBudgetPeriod,activateBudgetPeriod,closeBudgetPeriod,archiveBudgetPeriod,copyPreviousPeriod,createEnvelope,updateEnvelope,deleteEnvelope,reorderEnvelopes}` | mutation | `apps/native/lib/budget/repository.ts` | `In use` except `reorderEnvelopes` is `Available, not used` | Reordering is public but not wired into native yet. |
| Finance savings queries | `finance.savings.queries` | `finance.savings.queries.{getSavingsSummary,listSavingsGoals,getSavingsGoalById}` | query | `apps/native/lib/savings/repository.ts` | In use | Savings summary includes computed completion metrics. |
| Finance savings mutations | `finance.savings.mutations` | `finance.savings.mutations.{createSavingsGoal,updateSavingsGoal,archiveSavingsGoal,reorderSavingsGoals,publishSavingsGoal}` | mutation | `apps/native/lib/savings/repository.ts` | `In use` for create/update/archive; `Available, not used` for reorder/publish | `publishSavingsGoal` currently throws `NotImplemented`. |
| Finance debt queries | `finance.debt.queries` | `finance.debt.queries.{listDebtPlans,getDebtPlanById,getDebtSnapshot}` | query | `apps/native/lib/debt/repository.ts` | In use | Snapshot is a compact aggregate for dashboard-style UI. |
| Finance debt mutations | `finance.debt.mutations` | `finance.debt.mutations.{createDebtPlan,updateDebtPlan,archiveDebtPlan,reorderDebtPlans,publishDebtPlan}` | mutation | `apps/native/lib/debt/repository.ts` | `In use` for create/update/archive; `Available, not used` for reorder/publish | `publishDebtPlan` currently throws `NotImplemented`. |
| Finance recurring queries | `finance.recurring.queries` | `finance.recurring.queries.{listRecurringTransactions,getUpcomingRecurring}` | query | `apps/native/lib/recurring/repository.ts` | In use | Native uses these for recurring transaction lists and upcoming items. |
| Finance recurring mutations | `finance.recurring.mutations` | `finance.recurring.mutations.{createRecurringTransaction,updateRecurringTransaction,pauseRecurringTransaction,resumeRecurringTransaction,deleteRecurringTransaction}` | mutation | `apps/native/lib/recurring/repository.ts` | In use | These are fully wired in native today. |
| Finance categories | `finance.categories.queries` | `finance.categories.queries.listCategories` | query | `apps/native/lib/categories/repository.ts` | In use | Simple category list for pickers and form state. |
| Scheduler queries | `scheduler.queries` | `scheduler.queries.{listSchedulerTasks,getSchedulerTaskById,getSchedulerSummary}` | query | `apps/native/lib/scheduler/repository.ts` | `In use` for list/detail; `Available, not used` for summary | Native uses imperative `convex.query` here instead of hooks. |
| Scheduler mutations | `scheduler.mutations` | `scheduler.mutations.{createSchedulerTask,updateSchedulerTask,toggleSchedulerSubtask,deleteSchedulerTask,reconcileSchedulerTasks}` | mutation | `apps/native/lib/scheduler/repository.ts` | In use | Includes recurrence and overdue reconciliation behavior. |
| Health queries | `health.queries` | `health.queries.{getHealthDashboard,listWorkouts}` | query | `apps/native/components/health/health-dashboard-screen.tsx` | `In use` for dashboard; `Available, not used` for listWorkouts | `listWorkouts` is public but not currently called from native. |
| Health mutations | `health.mutations` | `health.mutations.{createWorkout,createHealthHabit,createHealthGoal,logHealthMetrics,logEnergy}` | mutation | `apps/native/components/health/health-dashboard-screen.tsx` | In use | The dashboard screen calls the health mutations directly. |
| Spiritual queries | `spiritual/queries` | `spiritual/queries.{getSpiritualDashboard,listSpiritualGoals,listSpiritualPractices,listPrayers,listSpiritualReadings,listSpiritualReflections}` | query | `apps/native/lib/spiritual/repository.ts` | In use | Accessed through a string-path adapter instead of direct typed `api.*`. |
| Spiritual mutations | `spiritual/mutations` | `spiritual/mutations.{createSpiritualGoal,updateSpiritualGoalProgress,createSpiritualPractice,toggleSpiritualPracticeActive,createPrayer,updatePrayerStatus,createSpiritualReading,createSpiritualReflection}` | mutation | `apps/native/lib/spiritual/repository.ts` | In use | Fully used by the faith tab flows. |
| Shared goals queries | `shared_goals.queries` | `shared_goals.queries.{listSharedGoals}` | query | no current native consumer | Available, not used | Public and ready, but not called in current native. |
| Shared goals mutations | `shared_goals.mutations` | `shared_goals.mutations.{createSharedGoal,updateSharedGoal,archiveSharedGoal,createFinanceLinkedGoal}` | mutation | `apps/native/lib/api/shared-goals.ts`, `apps/native/lib/planner/use-planner-settings.ts` | `In use` for `createSharedGoal`; `Available, not used` for the others | `createFinanceLinkedGoal` is public but intentionally throws because finance domains own linked-goal creation. |
| Planner queries | `productivity/planner/queries` | `productivity/planner/queries.{getPlannerDashboard,getPlannerChatHome,listPlannerChatMessages,listPlannerChatThreads,getPlannerChatThread,listPlans,getPlanById,listGoals}` | query | `apps/native/lib/planner/use-planner-settings.ts`, `apps/native/lib/planner/use-planner-chat.ts`, `apps/native/lib/planner/use-planner-plan.ts`, `apps/native/components/planner/planner-overview-screen.tsx` | `In use` except `listGoals` is `Available, not used` | Accessed through `apps/native/lib/planner/api.ts`. |
| Planner mutations | `productivity/planner/mutations` | `productivity/planner/mutations.{upsertPlannerProfile,setAgentEnabled,setPlanItemStatus,createPlanningGoal}` | mutation | `apps/native/lib/planner/use-planner-settings.ts`, `apps/native/lib/planner/use-planner-plan.ts` | `In use` for first three; `Available, not used` for `createPlanningGoal` | Planner goal creation in native currently goes through `shared_goals`. |
| Planner actions | `productivity/planner/actions` | `productivity/planner/actions.{sendPlannerChatMessage,replanWeeklyPlan,reviewWeeklyPlan,draftWeeklyPlan,ensurePlannerChatThread}` | action | `apps/native/lib/planner/use-planner-chat.ts`, `apps/native/lib/planner/use-planner-plan.ts` | `In use` for `sendPlannerChatMessage`, `replanWeeklyPlan`, `reviewWeeklyPlan`; `Available, not used` for `draftWeeklyPlan`, `ensurePlannerChatThread` | Planner chat actions are public and thread-aware. |
| Unified AI router | `ai/runRouter` | `ai/runRouter.runAI` | action | `apps/native/lib/ai/use-domain-ai.ts` | In use | Main native AI entrypoint for request routing across supported domains. |
| AI approvals query | `ai/approval` | `ai/approval.getPendingApprovals` | query | `apps/native/lib/ai/use-ai-approvals.ts` | In use | Reads pending approval requests for the current user. |
| AI approval resolution | `ai/approval_actions` | `ai/approval_actions.resolveApprovalRequest` | action | `apps/native/lib/ai/use-ai-approvals.ts` | In use | Applies approve or reject resolution. |
| AI memory | `ai/memory` | `ai/memory.{getMemoryForDomain,getAllMemory,upsertMemory,deleteMemoryKey}` | query + mutation | `apps/native/lib/ai/api.ts` | Available, not used | Typed for native, but not actively called by current hooks. |
| AI streaming | HTTP route | `POST /ai/stream` | http | `apps/native/lib/ai/use-ai-stream.ts` | In use | Native posts `{ prompt }` to the Convex site URL and streams text chunks. |

### Recognized, not live

`career`, `relationships`, and `space` exist in backend modules and in `packages/backend/convex/ai/types.ts`, but `packages/backend/convex/ai/policies.ts` currently returns `available: false` for them. Native should treat those domains as recognized type-level surface area, not live product integrations.

## Domain-by-domain API reference

### Shared native adapters

These files are the native integration layer over the generated backend API:

- `apps/native/lib/backend-api.ts`
  Re-exports the generated `api` object from `@seile/backend/convex/_generated/api` and provides `asId` helpers.
- `apps/native/lib/api/finance.ts`
  Curates the main `api.finance.*` namespaces used by finance repositories.
- `apps/native/lib/api/shared-goals.ts`
  Re-exports `api.shared_goals.queries` and `api.shared_goals.mutations`.
- `apps/native/lib/planner/api.ts`
  Provides a string-path adapter over `productivity/planner/*`.
- `apps/native/lib/ai/api.ts`
  Provides a typed view of `ai/runRouter`, `ai/approval`, `ai/approval_actions`, and `ai/memory`.
- `apps/native/lib/convex-client.ts`
  Creates the `ConvexReactClient` instance used by hooks and imperative scheduler calls.

### Finance

Backend source files:

- `packages/backend/convex/finance/accounts.ts`
- `packages/backend/convex/finance/transactions/queries.ts`
- `packages/backend/convex/finance/transactions/mutations.ts`
- `packages/backend/convex/finance/subscriptions/queries.ts`
- `packages/backend/convex/finance/subscriptions/mutations.ts`
- `packages/backend/convex/finance/budget/queries.ts`
- `packages/backend/convex/finance/budget/mutations.ts`
- `packages/backend/convex/finance/savings/queries.ts`
- `packages/backend/convex/finance/savings/mutations.ts`
- `packages/backend/convex/finance/debt/queries.ts`
- `packages/backend/convex/finance/debt/mutations.ts`
- `packages/backend/convex/finance/recurring/queries.ts`
- `packages/backend/convex/finance/recurring/mutations.ts`
- `packages/backend/convex/finance/categories/queries.ts`
- public but not surfaced through native helper: `packages/backend/convex/finance/agent/queries.ts`, `packages/backend/convex/finance/agent/actions.ts`, `packages/backend/convex/finance/agent/mutations.ts`

Native consumer files:

- `apps/native/lib/api/finance.ts`
- `apps/native/lib/accounts/repository.ts`
- `apps/native/lib/transactions/repository.ts`
- `apps/native/lib/subscriptions/repository.ts`
- `apps/native/lib/budget/repository.ts`
- `apps/native/lib/savings/repository.ts`
- `apps/native/lib/debt/repository.ts`
- `apps/native/lib/recurring/repository.ts`
- `apps/native/lib/categories/repository.ts`

Functions:

- Accounts: `listAccounts`, `getAccountById`, `createAccount`, `updateAccount`, `deleteAccount`
- Transactions: `listTransactions`, `getTransactionById`, `getTransactionSummary`, `createTransaction`, `updateTransaction`, `deleteTransaction`, `reverseTransaction`
- Subscriptions: `listSubscriptions`, `getByStatus`, `getUpcomingRenewals`, `getMonthlySubscriptionSpend`, `createSubscription`, `cancelSubscription`
- Budget: `listBudgetPeriods`, `getActivePeriod`, `getBudgetPeriodById`, `getBudgetSummary`, `listEnvelopes`, `getEnvelopeById`, `getEnvelopeHistory`, `createBudgetPeriod`, `updateBudgetPeriod`, `activateBudgetPeriod`, `closeBudgetPeriod`, `archiveBudgetPeriod`, `copyPreviousPeriod`, `createEnvelope`, `updateEnvelope`, `deleteEnvelope`, `reorderEnvelopes`
- Savings: `listSavingsGoals`, `getSavingsGoalById`, `getSavingsSummary`, `createSavingsGoal`, `updateSavingsGoal`, `archiveSavingsGoal`, `reorderSavingsGoals`, `publishSavingsGoal`
- Debt: `listDebtPlans`, `getDebtPlanById`, `getDebtSnapshot`, `createDebtPlan`, `updateDebtPlan`, `archiveDebtPlan`, `reorderDebtPlans`, `publishDebtPlan`
- Recurring: `listRecurringTransactions`, `getUpcomingRecurring`, `createRecurringTransaction`, `updateRecurringTransaction`, `pauseRecurringTransaction`, `resumeRecurringTransaction`, `deleteRecurringTransaction`
- Categories: `listCategories`

Argument shape summary:

- Accounts use typed IDs for lookups and mutations, with create/update payloads around names, provider info, account type, currency, balance, status, and note fields.
- Transactions accept finance IDs plus timestamps in epoch milliseconds; `createTransaction` changes by `kind`, while `updateTransaction` only edits metadata such as category, note, and `occurredAt`.
- Subscription and recurring APIs take schedule metadata such as `scheduleType`, `interval`, `dayOfMonth`, `dayOfWeek`, `startAt`, and `endAt`; subscriptions also require service metadata and an account ID.
- Budget APIs use budget period IDs, envelope IDs, category IDs, year/month numbers, money fields, and optional presentation fields like notes, icon, color, and sort order.
- Savings and debt APIs accept domain-specific goal or debt attributes plus optional linked account/recurring/category IDs and priority ranks.

Return shape summary:

- Accounts return account docs or paginated account pages.
- Transaction, subscription, and recurring functions return raw domain docs or simple aggregate objects like transaction summary and monthly subscription spend.
- Budget queries return computed period or envelope views with derived spend, overspend, totals, and history.
- Savings and debt queries return computed rows plus summary/snapshot aggregates; several mutations return `{ id }`, domain docs, or booleans.
- `publishSavingsGoal` and `publishDebtPlan` are public but currently fail with `NotImplemented`.

Native usage note:

Use direct generated references through `api.finance.*` or `financeApi.*`; do not assume the older flat namespaces still exist.

### Scheduler

Backend source files:

- `packages/backend/convex/scheduler/queries.ts`
- `packages/backend/convex/scheduler/mutations.ts`

Native consumer files:

- `apps/native/lib/scheduler/repository.ts`

Functions:

- `listSchedulerTasks`
- `getSchedulerTaskById`
- `getSchedulerSummary`
- `createSchedulerTask`
- `updateSchedulerTask`
- `toggleSchedulerSubtask`
- `deleteSchedulerTask`
- `reconcileSchedulerTasks`

Argument shape summary:

- Queries use optional booleans or an `id`.
- Mutations use scheduler task IDs plus normalized task fields like `title`, `notes`, `priority`, `dueDate`, `time`, `recurrence`, dependency IDs, and subtasks.
- Reconciliation takes `todayDate` in `YYYY-MM-DD` format.

Return shape summary:

- Queries return task arrays, a single task or `null`, or a compact summary object with `total`, `overdue`, `done`, and `open`.
- Mutations return a task doc, a task array, or a boolean depending on the operation.

Native usage note:

This repo uses imperative `convex.query` and `convex.mutation` here instead of `useQuery` or `useMutation`, so scheduler screens already assume request-style access.

### Health

Backend source files:

- `packages/backend/convex/health/queries.ts`
- `packages/backend/convex/health/mutations.ts`

Native consumer files:

- `apps/native/components/health/health-dashboard-screen.tsx`

Functions:

- `getHealthDashboard`
- `listWorkouts`
- `createWorkout`
- `createHealthHabit`
- `createHealthGoal`
- `logHealthMetrics`
- `logEnergy`

Argument shape summary:

- The dashboard query has no args, while `listWorkouts` takes an optional `limit`.
- Mutations accept health-specific payloads such as workout type, date keys, intensity, duration, goal units, habit cadence, metrics, and signal levels.

Return shape summary:

- `getHealthDashboard` returns an aggregate view with goals, habits, recent workouts, latest metrics, latest energy log, health signals, and totals.
- `listWorkouts` returns recent workout docs.
- Mutations return created or updated domain docs.

Native usage note:

Current native health integration is dashboard-centric and does not use `listWorkouts`, even though it is public.

### Spiritual

Backend source files:

- `packages/backend/convex/spiritual/queries.ts`
- `packages/backend/convex/spiritual/mutations.ts`

Native consumer files:

- `apps/native/lib/spiritual/repository.ts`
- faith tab screens under `apps/native/components/faith/`

Functions:

- `getSpiritualDashboard`
- `listSpiritualGoals`
- `listSpiritualPractices`
- `listPrayers`
- `listSpiritualReadings`
- `listSpiritualReflections`
- `createSpiritualGoal`
- `updateSpiritualGoalProgress`
- `createSpiritualPractice`
- `toggleSpiritualPracticeActive`
- `createPrayer`
- `updatePrayerStatus`
- `createSpiritualReading`
- `createSpiritualReflection`

Argument shape summary:

- Queries use optional filters like status, active flags, and numeric limits.
- Mutations accept spiritual content fields such as title, goal type, cadence, unit, target value, schedule days, date keys, reflection text, mood, and prayer status.
- Several mutations optionally synchronize planner-facing IDs like `plannerGoalId` or `plannerHabitId`.

Return shape summary:

- The dashboard query returns a full spiritual dashboard object with `summary`, sorted content lists, and planner linkage metadata.
- List queries return spiritual docs ordered for display.
- Mutations return the created or updated spiritual domain doc.

Native usage note:

The faith tab is fully wired, but it currently reaches these public functions through a string-path `spiritualApi` cast rather than direct typed `api.*` access.

### Shared goals

Backend source files:

- `packages/backend/convex/shared_goals/queries.ts`
- `packages/backend/convex/shared_goals/mutations.ts`

Native consumer files:

- `apps/native/lib/api/shared-goals.ts`
- `apps/native/lib/planner/use-planner-settings.ts`

Functions:

- `listSharedGoals`
- `createSharedGoal`
- `updateSharedGoal`
- `archiveSharedGoal`
- `createFinanceLinkedGoal`

Argument shape summary:

- Shared-goal mutations use a shared goal ID plus planner-style goal fields such as `title`, `description`, `domain`, `horizon`, `targetDate`, `priority`, and `status`.
- `createFinanceLinkedGoal` takes no args because finance-linked creation is delegated back to the finance domain mutations.

Return shape summary:

- Queries return sorted shared goal rows.
- Create, update, and archive return shared goal records.
- `createFinanceLinkedGoal` currently throws `NotImplemented`.

Native usage note:

This is the public cross-domain goal surface native should prefer when creating planner-aligned goals instead of calling legacy planner goal endpoints directly.

### Planner

Backend source files:

- `packages/backend/convex/productivity/planner/queries.ts`
- `packages/backend/convex/productivity/planner/mutations.ts`
- `packages/backend/convex/productivity/planner/actions.ts`

Native consumer files:

- `apps/native/lib/planner/api.ts`
- `apps/native/lib/planner/use-planner-settings.ts`
- `apps/native/lib/planner/use-planner-chat.ts`
- `apps/native/lib/planner/use-planner-plan.ts`
- `apps/native/components/planner/planner-overview-screen.tsx`

Functions:

- Queries: `getPlannerDashboard`, `getPlannerChatHome`, `listPlannerChatMessages`, `listPlannerChatThreads`, `getPlannerChatThread`, `listPlans`, `getPlanById`, `listGoals`
- Mutations: `upsertPlannerProfile`, `setAgentEnabled`, `setPlanItemStatus`, `createPlanningGoal`
- Actions: `sendPlannerChatMessage`, `replanWeeklyPlan`, `reviewWeeklyPlan`, `draftWeeklyPlan`, `ensurePlannerChatThread`

Argument shape summary:

- Dashboard and chat-home queries accept an optional `weekStart`.
- Chat message and thread queries use `threadId` plus optional pagination objects.
- Plan detail and plan-item mutations use typed plan or plan-item IDs.
- Planner profile upserts use timezone, work hours, rest days, energy pattern, planning style, max tasks per day, and deep-work preferences.
- Planner actions use either a `planId`, a `text` message, or optional planning mode/week start arguments.

Return shape summary:

- Queries return planner context objects, current plan summaries, thread/message pages, plan lists, or a full `{ plan, items, review }` payload.
- `upsertPlannerProfile` and `setAgentEnabled` return planner state/profile docs.
- `setPlanItemStatus` updates a plan item and returns the updated row.
- `sendPlannerChatMessage` returns thread and message IDs plus assistant text.
- `replanWeeklyPlan`, `reviewWeeklyPlan`, and `draftWeeklyPlan` return structured planner action results.

Native usage note:

Native planner code should think in terms of `productivity/planner/*` as the stable public namespace, even when the local adapter still exposes it through string keys.

### AI and streaming

Backend source files:

- `packages/backend/convex/ai/runRouter.ts`
- `packages/backend/convex/ai/approval.ts`
- `packages/backend/convex/ai/approval_actions.ts`
- `packages/backend/convex/ai/memory.ts`
- `packages/backend/convex/ai/streaming.ts`
- policy and type context: `packages/backend/convex/ai/policies.ts`, `packages/backend/convex/ai/types.ts`

Native consumer files:

- `apps/native/lib/ai/api.ts`
- `apps/native/lib/ai/use-domain-ai.ts`
- `apps/native/lib/ai/use-ai-approvals.ts`
- `apps/native/lib/ai/use-ai-stream.ts`

Functions:

- `ai/runRouter.runAI`
- `ai/approval.getPendingApprovals`
- `ai/approval_actions.resolveApprovalRequest`
- `ai/memory.getMemoryForDomain`
- `ai/memory.getAllMemory`
- `ai/memory.upsertMemory`
- `ai/memory.deleteMemoryKey`
- `POST /ai/stream`

Argument shape summary:

- `runAI` takes `userMessage` and an optional `threadId`.
- Approval resolution takes a `requestId` and `approved` boolean.
- Memory functions use a domain, string keys, string values, and confidence levels, or a key-only delete payload.
- Streaming expects a JSON body with `{ prompt }`.

Return shape summary:

- `runAI` returns either a message response with domains and optional `threadId`, or an approval request with actions and `requestId`.
- `getPendingApprovals` returns approval requests with expiration data and deserialized action payloads.
- `resolveApprovalRequest` returns `{ approved: boolean }`.
- Memory queries return memory rows; mutations return inserted IDs or `{ ok: true }`.
- `POST /ai/stream` returns a text stream response.

Native usage note:

Native currently uses the unified AI entrypoints and should continue doing that unless the backend explicitly promotes a domain-specific AI action as stable for client use.

## Known gaps and high-risk areas

- `apps/native/lib/planner/api.ts` relies on string-keyed `any` casts over `productivity/planner/*`.
  Risk: future planner renames can bypass compile-time checking and fail only at runtime.

- `apps/native/lib/spiritual/repository.ts` relies on `api as unknown as Record<string, Record<string, any>>`.
  Risk: spiritual query or mutation path changes will not be caught by TypeScript in native.

- `apps/native/lib/api/finance.ts` does not expose `finance/agent/*` even though those public endpoints exist.
  Risk: a native engineer may incorrectly assume there is no public finance-agent surface or may reach for the wrong AI endpoint.

- `apps/native` currently uses unified AI entrypoints, not domain-specific AI tool or agent modules directly.
  Risk: backend-only AI internals may look callable in the repo even though they are not part of the intended native contract.

- dormant AI domains exist in type space (`career`, `relationships`, `space`) but are intentionally unavailable at runtime.
  Risk: native work can overbuild against generated types and ship UI flows for domains that the backend will reject or mark unavailable.

## What native should call next

- Use direct generated API references where possible.
- Prefer namespaced modules under `api.finance.*`, `api.scheduler.*`, `api.health.*`, and `api.shared_goals.*`.
- Treat `productivity/planner/*` and `spiritual/*` as the first candidates for removing `any` wrappers later.
- Use unified AI entrypoints for chat and approval flows unless backend explicitly exposes a stable domain-specific public action for native.
- Do not build against internal Convex functions.

## Validation checklist

- Every current native Convex call site is represented in this doc.
- Every referenced function is public in `packages/backend/convex/_generated/api.d.ts`.
- Every renamed namespace in the migration map matches git history.
- `POST /ai/stream` is included because native streaming depends on it.
- No internal-only functions are documented as native-callable.
- All dates are absolute dates, not relative wording.
- File paths in this doc point to the current repo layout.

### Review scenarios

1. A native engineer updating finance screens can find the right `api.finance.*` path without reading backend source.
2. A native engineer reading older code can translate a pre-reorg namespace to the new one from the migration table.
3. A native engineer adding planner features can see which `productivity/planner/*` functions are already in use and which are available but unused.
4. A native engineer working on AI can distinguish between stable public entrypoints and backend-only tool or agent internals.
5. A native engineer does not mistake dormant domains like `career` for live native integrations.
6. A reviewer can diff this doc against `apps/native` call sites and `packages/backend/convex/_generated/api.d.ts` with no missing currently used endpoints.

### Assumptions and defaults

- Scope is limited to native-facing public Convex APIs and the native-used HTTP streaming route.
- Output is one Markdown file, not multiple docs.
- `docs/feat` is the correct home for this documentation.
- Internal queries, internal mutations, internal actions, schema files, and backend-only AI internals are out of scope unless needed for one sentence of context.
- This doc optimizes for current native development rather than exhaustive backend documentation.

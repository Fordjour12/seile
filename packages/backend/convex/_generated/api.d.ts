/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accounts from "../accounts.js";
import type * as categories_queries from "../categories/queries.js";
import type * as crons from "../crons.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_ledger from "../lib/ledger.js";
import type * as lib_money from "../lib/money.js";
import type * as lib_recurring from "../lib/recurring.js";
import type * as lib_security from "../lib/security.js";
import type * as lib_validation from "../lib/validation.js";
import type * as migrations from "../migrations.js";
import type * as recurring_generate from "../recurring/generate.js";
import type * as recurring_mutations from "../recurring/mutations.js";
import type * as recurring_queries from "../recurring/queries.js";
import type * as schema_accounts from "../schema/accounts.js";
import type * as schema_categories from "../schema/categories.js";
import type * as schema_recurring_transactions from "../schema/recurring_transactions.js";
import type * as schema_request_nonces from "../schema/request_nonces.js";
import type * as schema_transactions from "../schema/transactions.js";
import type * as schema_validators from "../schema/validators.js";
import type * as subscriptions_mutations from "../subscriptions/mutations.js";
import type * as subscriptions_queries from "../subscriptions/queries.js";
import type * as transactions_mutations from "../transactions/mutations.js";
import type * as transactions_queries from "../transactions/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  "categories/queries": typeof categories_queries;
  crons: typeof crons;
  healthCheck: typeof healthCheck;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/ledger": typeof lib_ledger;
  "lib/money": typeof lib_money;
  "lib/recurring": typeof lib_recurring;
  "lib/security": typeof lib_security;
  "lib/validation": typeof lib_validation;
  migrations: typeof migrations;
  "recurring/generate": typeof recurring_generate;
  "recurring/mutations": typeof recurring_mutations;
  "recurring/queries": typeof recurring_queries;
  "schema/accounts": typeof schema_accounts;
  "schema/categories": typeof schema_categories;
  "schema/recurring_transactions": typeof schema_recurring_transactions;
  "schema/request_nonces": typeof schema_request_nonces;
  "schema/transactions": typeof schema_transactions;
  "schema/validators": typeof schema_validators;
  "subscriptions/mutations": typeof subscriptions_mutations;
  "subscriptions/queries": typeof subscriptions_queries;
  "transactions/mutations": typeof transactions_mutations;
  "transactions/queries": typeof transactions_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

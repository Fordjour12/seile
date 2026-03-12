import { api as generatedApi } from "@seile/backend/convex/_generated/api";

import type { Id, TableNames } from "@seile/backend/convex/_generated/dataModel";

export const financeApi = {
  accounts: generatedApi.accounts,
  transactions: generatedApi.transactions,
  budget: generatedApi.budget,
  debt: generatedApi.debt,
  savings: generatedApi.savings,
  recurring: generatedApi.recurring,
  subscriptions: generatedApi.subscriptions,
};

export function asId<TableName extends TableNames>(value: string): Id<TableName> {
  return value as Id<TableName>;
}

export function asOptionalId<TableName extends TableNames>(
  value: string | undefined,
): Id<TableName> | undefined {
  return value as Id<TableName> | undefined;
}

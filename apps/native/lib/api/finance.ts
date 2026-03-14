import { api as generatedApi } from "@seile/backend/convex/_generated/api";

import type { Id, TableNames } from "@seile/backend/convex/_generated/dataModel";

export const financeApi = {
  accounts: generatedApi.finance.accounts,
  transactions: generatedApi.finance.transactions,
  budget: generatedApi.finance.budget,
  debt: generatedApi.finance.debt,
  savings: generatedApi.finance.savings,
  recurring: generatedApi.finance.recurring,
  subscriptions: generatedApi.finance.subscriptions,
};

export function asId<TableName extends TableNames>(value: string): Id<TableName> {
  return value as Id<TableName>;
}

export function asOptionalId<TableName extends TableNames>(
  value: string | undefined,
): Id<TableName> | undefined {
  return value as Id<TableName> | undefined;
}

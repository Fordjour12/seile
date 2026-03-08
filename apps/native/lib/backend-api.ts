import { api as generatedApi } from "@seile/backend/convex/_generated/api";

import type { Id, TableNames } from "@seile/backend/convex/_generated/dataModel";

export const api = generatedApi;

export function asId<TableName extends TableNames>(value: string): Id<TableName> {
  return value as Id<TableName>;
}

export function asOptionalId<TableName extends TableNames>(
  value: string | undefined,
): Id<TableName> | undefined {
  return value as Id<TableName> | undefined;
}

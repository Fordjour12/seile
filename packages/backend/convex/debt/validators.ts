import { ConvexError } from "convex/values";

import { normalizeCurrency } from "../lib/validation";

export function validateDebtName(name: string): string {
  const value = name.trim();
  if (!value || value.length > 80) {
    throw new ConvexError("Validation: debt name must be between 1 and 80 characters");
  }
  return value;
}

export function validateDebtMoney(label: string, amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new ConvexError(`Validation: ${label} must be a non-negative number`);
  }
  return amount;
}

export function validateApr(apr: number | undefined): number | undefined {
  if (apr === undefined) return undefined;
  if (!Number.isFinite(apr) || apr < 0 || apr > 100) {
    throw new ConvexError("Validation: apr must be between 0 and 100");
  }
  return apr;
}

export function validatePriorityRank(priorityRank: string | undefined): string | undefined {
  if (priorityRank === undefined) return undefined;
  const trimmed = priorityRank.trim();
  if (!trimmed) {
    throw new ConvexError("Validation: priorityRank must be a non-empty string");
  }
  return trimmed;
}

export const validateDebtCurrency = normalizeCurrency;

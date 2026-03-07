import { ConvexError } from "convex/values";

import { normalizeCurrency } from "../lib/validation";

export function validateYear(year: number): number {
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(year) || year < currentYear - 2 || year > currentYear + 2) {
    throw new ConvexError("Validation: year must be within current year ± 2");
  }
  return year;
}

export function validateMonth(month: number): number {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new ConvexError("Validation: month must be between 1 and 12");
  }
  return month;
}

export function validateMoney(field: string, value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new ConvexError(`Validation: ${field} must be a non-negative number`);
  }
  return value;
}

export function validateOptionalNotes(notes: string | undefined): string | undefined {
  if (notes === undefined) return undefined;
  const trimmed = notes.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > 300) {
    throw new ConvexError("Validation: notes must be at most 300 characters");
  }
  return trimmed;
}

export function validateSortOrder(sortOrder: string | undefined): string | undefined {
  if (sortOrder === undefined) return undefined;
  const trimmed = sortOrder.trim();
  if (!trimmed) throw new ConvexError("Validation: sortOrder must be a non-empty string");
  return trimmed;
}

export const validateBudgetCurrency = normalizeCurrency;

import { ConvexError } from "convex/values";

import { normalizeCurrency } from "../lib/validation";

export function validateSavingsName(name: string): string {
  const value = name.trim();
  if (!value || value.length > 80) {
    throw new ConvexError("Validation: savings goal name must be between 1 and 80 characters");
  }
  return value;
}

export function validateTargetAmount(targetAmount: number): number {
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    throw new ConvexError("Validation: targetAmount must be greater than 0");
  }
  return targetAmount;
}

export function validateCurrentAmount(currentAmount: number, targetAmount: number): number {
  if (!Number.isFinite(currentAmount) || currentAmount < 0) {
    throw new ConvexError("Validation: currentAmount must be a non-negative number");
  }
  if (currentAmount > targetAmount) {
    throw new ConvexError("Validation: currentAmount cannot exceed targetAmount");
  }
  return currentAmount;
}

export function validateMonthlyContribution(monthlyContribution: number | undefined): number | undefined {
  if (monthlyContribution === undefined) return undefined;
  if (!Number.isFinite(monthlyContribution) || monthlyContribution < 0) {
    throw new ConvexError("Validation: monthlyContribution must be a non-negative number");
  }
  return monthlyContribution;
}

export const validateSavingsCurrency = normalizeCurrency;

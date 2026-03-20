import { ConvexError } from "convex/values";

export function assertValidCurrency(currency: string): string {
  const normalized = currency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new ConvexError("Validation: currency must be a 3-letter ISO code");
  }
  return normalized;
}

export function assertValidAmount(amount: number): number {
  if (!Number.isFinite(amount)) {
    throw new ConvexError("Validation: amount must be a finite number");
  }
  if (amount <= 0) {
    throw new ConvexError("Validation: amount must be greater than 0");
  }
  return amount;
}

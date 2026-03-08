import { ConvexError } from "convex/values";
import { v } from "convex/values";

export const ACCOUNT_TYPES = [
  "checking",
  "savings",
  "cash",
  "credit",
  "investment",
  "bank",
] as const;
export const ACCOUNT_STATUSES = ["active", "archived", "closed"] as const;
export const MAX_ACCOUNT_NAME_LENGTH = 80;
export const MAX_PROVIDER_NAME_LENGTH = 80;
export const MAX_NOTE_LENGTH = 300;

export const accountNameValidator = v.string();
export const accountTypeValidator = v.union(
  v.literal("checking"),
  v.literal("savings"),
  v.literal("cash"),
  v.literal("credit"),
  v.literal("investment"),
  v.literal("bank")
);
export const accountStatusValidator = v.union(
  v.literal("active"),
  v.literal("archived"),
  v.literal("closed")
);
export const currencyValidator = v.string();
export const balanceValidator = v.number();

export const authPayloadValidator = v.object({
  ts: v.number(),
  nonce: v.string(),
  sig: v.string(),
});

export const paginationValidator = v.optional(
  v.object({
    cursor: v.optional(v.union(v.string(), v.null())),
    limit: v.optional(v.number()),
  })
);

export const updateAccountValidator = v.object({
  accountId: v.id("accounts"),
  name: v.optional(accountNameValidator),
  providerName: v.optional(v.string()),
  type: v.optional(accountTypeValidator),
  currency: v.optional(currencyValidator),
  balance: v.optional(balanceValidator),
  status: v.optional(accountStatusValidator),
  note: v.optional(v.string()),
  auth: authPayloadValidator,
});

export function normalizeAccountName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new ConvexError("Validation: account name is required");
  }
  if (trimmed.length > MAX_ACCOUNT_NAME_LENGTH) {
    throw new ConvexError("Validation: account name is too long");
  }
  return trimmed;
}

export function normalizeOptionalProviderName(providerName: string | undefined): string | undefined {
  if (providerName === undefined) {
    return undefined;
  }

  const trimmed = providerName.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.length > MAX_PROVIDER_NAME_LENGTH) {
    throw new ConvexError("Validation: provider name is too long");
  }

  return trimmed;
}

export function normalizeCurrency(currency: string): string {
  const normalized = currency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new ConvexError("Validation: currency must be a 3-letter ISO code");
  }
  return normalized;
}

export function normalizeOptionalNote(note: string | undefined): string | undefined {
  if (note === undefined) {
    return undefined;
  }
  const trimmed = note.trim();
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.length > MAX_NOTE_LENGTH) {
    throw new ConvexError("Validation: note is too long");
  }
  return trimmed;
}

import { ConvexError } from "convex/values";
import { v } from "convex/values";

export const ACCOUNT_TYPES = ["cash", "bank", "investment", "credit"] as const;
export const MAX_ACCOUNT_NAME_LENGTH = 80;
export const MAX_NOTE_LENGTH = 300;

export const accountNameValidator = v.string();
export const accountTypeValidator = v.union(
  v.literal("cash"),
  v.literal("bank"),
  v.literal("investment"),
  v.literal("credit")
);
export const currencyValidator = v.string();

export const authPayloadValidator = v.object({
  ts: v.number(),
  nonce: v.string(),
  sig: v.string(),
});

export const paginationValidator = v.optional(
  v.object({
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  })
);

export const updateAccountValidator = v.object({
  accountId: v.id("accounts"),
  name: v.optional(accountNameValidator),
  type: v.optional(accountTypeValidator),
  currency: v.optional(currencyValidator),
  isArchived: v.optional(v.boolean()),
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

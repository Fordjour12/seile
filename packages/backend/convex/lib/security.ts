import { ConvexError } from "convex/values";

export const DEFAULT_SYSTEM_USER_ID = "local-user";
export const MAX_REQUEST_SKEW_MS = 5 * 60 * 1000;
export const REQUEST_NONCE_RETENTION_MS = MAX_REQUEST_SKEW_MS + 60 * 1000;
const APP_HMAC_SECRET_KEY = "APP_HMAC_SECRET";
const SYSTEM_USER_ID_KEY = "SYSTEM_USER_ID";

export type AuthPayload = {
  ts: number;
  nonce: string;
  sig: string;
};

export function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJson(item)).join(",")}]`;
  }

  const objectValue = value as Record<string, unknown>;
  const entries = Object.keys(objectValue)
    .sort()
    .filter((key) => objectValue[key] !== undefined)
    .map((key) => `"${key}":${stableJson(objectValue[key])}`);
  return `{${entries.join(",")}}`;
}

export function resolveSystemUserId(): string {
  return process.env[SYSTEM_USER_ID_KEY] ?? DEFAULT_SYSTEM_USER_ID;
}

export function getHmacSecret(): string {
  const secret = process.env[APP_HMAC_SECRET_KEY];
  if (!secret || secret.length < 32) {
    throw new ConvexError("APP_HMAC_SECRET is missing or invalid");
  }
  return secret;
}

export function assertTimestampFresh(ts: number, now: number = Date.now()): void {
  const delta = Math.abs(now - ts);
  if (delta > MAX_REQUEST_SKEW_MS) {
    throw new ConvexError("Unauthorized: request expired");
  }
}

export function isRequestNonceExpired(createdAt: number, now: number = Date.now()): boolean {
  return now - createdAt > REQUEST_NONCE_RETENTION_MS;
}

export function buildSigningMessage(
  functionName: string,
  payloadWithoutAuth: Record<string, unknown>,
  auth: Pick<AuthPayload, "ts" | "nonce">
): string {
  return `${functionName}:${stableJson(payloadWithoutAuth)}:${auth.ts}:${auth.nonce}`;
}

export async function signMessage(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return bufferToHex(signature);
}

export function assertValidSignature(actualSig: string, expectedSig: string): void {
  if (!timingSafeEqual(actualSig, expectedSig)) {
    throw new ConvexError("Unauthorized: invalid signature");
  }
}

function bufferToHex(input: ArrayBuffer): string {
  return Array.from(new Uint8Array(input), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

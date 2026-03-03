import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const APP_HMAC_SECRET_KEY = "APP_HMAC_SECRET";

export type SignedAuthPayload = {
  ts: number;
  nonce: string;
  sig: string;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function stripUndefined(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const cleaned: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    const entry = value[key];
    if (entry === undefined) {
      continue;
    }
    cleaned[key] = stripUndefined(entry);
  }
  return cleaned;
}

export function sanitizePayload<TPayload extends Record<string, unknown>>(payload: TPayload): TPayload {
  return stripUndefined(payload) as TPayload;
}

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

function bufferToHex(input: ArrayBuffer): string {
  return Array.from(new Uint8Array(input), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function signHmacSha256(secret: string, message: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Secure signing unavailable: WebCrypto is not supported on this device");
  }

  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await globalThis.crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return bufferToHex(signature);
}

export async function getAppHmacSecret(): Promise<string> {
  const secret = await SecureStore.getItemAsync(APP_HMAC_SECRET_KEY);
  if (!secret || secret.length < 32) {
    throw new Error("Missing or invalid APP_HMAC_SECRET in SecureStore");
  }
  return secret;
}

export async function signPayload(
  functionName: string,
  payloadWithoutAuth: Record<string, unknown>
): Promise<{ payload: Record<string, unknown>; auth: SignedAuthPayload }> {
  const payload = sanitizePayload(payloadWithoutAuth);
  const ts = Date.now();
  const nonce = Crypto.randomUUID();
  const secret = await getAppHmacSecret();
  const message = `${functionName}:${stableJson(payload)}:${ts}:${nonce}`;
  const sig = await signHmacSha256(secret, message);

  return {
    payload,
    auth: {
      ts,
      nonce,
      sig,
    },
  };
}

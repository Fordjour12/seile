import { env } from "@seile/env/native";

export type AuthPayload = {
  ts: number;
  nonce: string;
  sig: string;
};

function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJson(item)).join(",")}]`;
  }

  const objectValue = value as Record<string, unknown>;
  const keys = Object.keys(objectValue).sort();
  const entries = keys.map((key) => `"${key}":${stableJson(objectValue[key])}`);
  return `{${entries.join(",")}}`;
}

function bufferToHex(input: ArrayBuffer): string {
  return Array.from(new Uint8Array(input), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function createNonce(): string {
  const cryptoInstance = globalThis.crypto;
  if (!cryptoInstance?.getRandomValues) {
    return `nonce-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  const bytes = new Uint8Array(16);
  cryptoInstance.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function signMessage(secret: string, message: string): Promise<string> {
  const cryptoInstance = globalThis.crypto;
  if (!cryptoInstance?.subtle) {
    throw new Error("WebCrypto unavailable for signing");
  }

  const encoder = new TextEncoder();
  const key = await cryptoInstance.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await cryptoInstance.subtle.sign("HMAC", key, encoder.encode(message));
  return bufferToHex(signature);
}

export async function buildSignedPayload(
  functionName: string,
  payloadWithoutAuth: Record<string, unknown>,
): Promise<AuthPayload> {
  const secret = env.EXPO_PUBLIC_APP_HMAC_SECRET;
  if (!secret) {
    throw new Error("Missing EXPO_PUBLIC_APP_HMAC_SECRET");
  }

  const ts = Date.now();
  const nonce = createNonce();
  const signingMessage = `${functionName}:${stableJson(payloadWithoutAuth)}:${ts}:${nonce}`;
  const sig = await signMessage(secret, signingMessage);

  return {
    ts,
    nonce,
    sig,
  };
}

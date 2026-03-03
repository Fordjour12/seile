import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { env } from "@seile/env/native";

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

function bytesToHex(input: Uint8Array): string {
  return Array.from(input, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function utf8ToBytes(input: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(input);
  }

  const bytes: number[] = [];
  for (let index = 0; index < input.length; index += 1) {
    let codePoint = input.charCodeAt(index);

    if ((codePoint & 0xfc00) === 0xd800 && index + 1 < input.length) {
      const low = input.charCodeAt(index + 1);
      if ((low & 0xfc00) === 0xdc00) {
        codePoint = ((codePoint & 0x3ff) << 10) + (low & 0x3ff) + 0x10000;
        index += 1;
      }
    }

    if (codePoint <= 0x7f) {
      bytes.push(codePoint);
    } else if (codePoint <= 0x7ff) {
      bytes.push(0xc0 | (codePoint >>> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint <= 0xffff) {
      bytes.push(0xe0 | (codePoint >>> 12), 0x80 | ((codePoint >>> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
    } else {
      bytes.push(
        0xf0 | (codePoint >>> 18),
        0x80 | ((codePoint >>> 12) & 0x3f),
        0x80 | ((codePoint >>> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    }
  }

  return new Uint8Array(bytes);
}

function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function rotr(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

function sha256(bytes: Uint8Array): Uint8Array {
  const k = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);

  const h = new Uint32Array([
    0x6a09e667,
    0xbb67ae85,
    0x3c6ef372,
    0xa54ff53a,
    0x510e527f,
    0x9b05688c,
    0x1f83d9ab,
    0x5be0cd19,
  ]);

  const bitLength = bytes.length * 8;
  const padLength = ((56 - ((bytes.length + 1) % 64)) + 64) % 64;
  const padded = new Uint8Array(bytes.length + 1 + padLength + 8);
  padded.set(bytes, 0);
  padded[bytes.length] = 0x80;

  const high = Math.floor(bitLength / 0x100000000);
  const low = bitLength >>> 0;
  padded[padded.length - 8] = (high >>> 24) & 0xff;
  padded[padded.length - 7] = (high >>> 16) & 0xff;
  padded[padded.length - 6] = (high >>> 8) & 0xff;
  padded[padded.length - 5] = high & 0xff;
  padded[padded.length - 4] = (low >>> 24) & 0xff;
  padded[padded.length - 3] = (low >>> 16) & 0xff;
  padded[padded.length - 2] = (low >>> 8) & 0xff;
  padded[padded.length - 1] = low & 0xff;

  const w = new Uint32Array(64);
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      const j = offset + i * 4;
      w[i] = (padded[j] << 24) | (padded[j + 1] << 16) | (padded[j + 2] << 8) | padded[j + 3];
    }

    for (let i = 16; i < 64; i += 1) {
      const s0 = rotr(w[i - 15]!, 7) ^ rotr(w[i - 15]!, 18) ^ (w[i - 15]! >>> 3);
      const s1 = rotr(w[i - 2]!, 17) ^ rotr(w[i - 2]!, 19) ^ (w[i - 2]! >>> 10);
      w[i] = (((w[i - 16]! + s0) >>> 0) + ((w[i - 7]! + s1) >>> 0)) >>> 0;
    }

    let a = h[0]!;
    let b = h[1]!;
    let c = h[2]!;
    let d = h[3]!;
    let e = h[4]!;
    let f = h[5]!;
    let g = h[6]!;
    let x = h[7]!;

    for (let i = 0; i < 64; i += 1) {
      const sum1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (((((x + sum1) >>> 0) + ch) >>> 0) + ((k[i]! + w[i]!) >>> 0)) >>> 0;
      const sum0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (sum0 + maj) >>> 0;

      x = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h[0] = (h[0]! + a) >>> 0;
    h[1] = (h[1]! + b) >>> 0;
    h[2] = (h[2]! + c) >>> 0;
    h[3] = (h[3]! + d) >>> 0;
    h[4] = (h[4]! + e) >>> 0;
    h[5] = (h[5]! + f) >>> 0;
    h[6] = (h[6]! + g) >>> 0;
    h[7] = (h[7]! + x) >>> 0;
  }

  const out = new Uint8Array(32);
  for (let i = 0; i < 8; i += 1) {
    const value = h[i]!;
    out[i * 4] = (value >>> 24) & 0xff;
    out[i * 4 + 1] = (value >>> 16) & 0xff;
    out[i * 4 + 2] = (value >>> 8) & 0xff;
    out[i * 4 + 3] = value & 0xff;
  }

  return out;
}

function hmacSha256(secret: string, message: string): string {
  const blockSize = 64;
  let key = utf8ToBytes(secret);

  if (key.length > blockSize) {
    key = sha256(key);
  }

  if (key.length < blockSize) {
    const padded = new Uint8Array(blockSize);
    padded.set(key);
    key = padded;
  }

  const innerPad = new Uint8Array(blockSize);
  const outerPad = new Uint8Array(blockSize);
  for (let index = 0; index < blockSize; index += 1) {
    const keyByte = key[index] ?? 0;
    innerPad[index] = keyByte ^ 0x36;
    outerPad[index] = keyByte ^ 0x5c;
  }

  const inner = sha256(concatBytes(innerPad, utf8ToBytes(message)));
  const outer = sha256(concatBytes(outerPad, inner));
  return bytesToHex(outer);
}

async function signHmacSha256(secret: string, message: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    return hmacSha256(secret, message);
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
  const storedSecret = await SecureStore.getItemAsync(APP_HMAC_SECRET_KEY);
  if (storedSecret && storedSecret.length >= 32) {
    return storedSecret;
  }

  // Dev bootstrap path: seed SecureStore from Expo env once, then use SecureStore thereafter.
  const envSecret = env.EXPO_PUBLIC_APP_HMAC_SECRET;
  if (__DEV__ && envSecret && envSecret.length >= 32) {
    await SecureStore.setItemAsync(APP_HMAC_SECRET_KEY, envSecret);
    return envSecret;
  }

  throw new Error("Missing or invalid APP_HMAC_SECRET in SecureStore");
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

import * as SecureStore from "expo-secure-store";

import { postJson } from "@/lib/accounts/http-client";

import type { SavingsSummary } from "./types";

const CACHE_KEY = "savings:summary:system";

export async function getSavingsSummary(): Promise<SavingsSummary> {
  try {
    const result = await postJson<SavingsSummary>("/savings/summary", {});
    await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(result));
    return result;
  } catch {
    const cached = await SecureStore.getItemAsync(CACHE_KEY);
    if (!cached) throw new Error("Unable to load savings summary");
    return JSON.parse(cached) as SavingsSummary;
  }
}

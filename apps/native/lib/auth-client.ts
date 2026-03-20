import { expoClient } from "@better-auth/expo/client";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { env } from "@seile/env/native";

const rawScheme = Constants.expoConfig?.scheme;
const scheme =
  typeof rawScheme === "string"
    ? rawScheme
    : Array.isArray(rawScheme)
      ? rawScheme[0]
      : "seile";
const secureStoragePrefix = scheme.replace(/[^A-Za-z0-9._-]/g, "_");

export const authClient = createAuthClient({
  baseURL: env.EXPO_PUBLIC_CONVEX_SITE_URL,
  plugins: [
    expoClient({
      scheme,
      storagePrefix: secureStoragePrefix,
      storage: SecureStore,
    }),
    convexClient(),
  ],
});

export const useSession = authClient.useSession;

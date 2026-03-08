import { ConvexReactClient } from "convex/react";
import { env } from "@seile/env/native";

export const convex = new ConvexReactClient(env.EXPO_PUBLIC_CONVEX_URL, {
  unsavedChangesWarning: false,
  expectAuth: true,
});

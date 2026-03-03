import React from "react";
import { Stack } from "expo-router";

import { RouteAccountProvider } from "./route-context";

export default function AccountIdLayout() {
  return (
    <RouteAccountProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </RouteAccountProvider>
  );
}

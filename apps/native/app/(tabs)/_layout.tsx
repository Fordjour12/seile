import React from "react";

import { Tabs } from "expo-router";

import { useAuth } from "@/lib/v1-auth-context";

export default function TabLayout() {
  const { stage } = useAuth();
  const hideTabs = stage === "first-run";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: hideTabs ? { display: "none" } : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
        }}
      />
      <Tabs.Screen
        name="domains"
        options={{
          title: "Domains",
          href: hideTabs ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          href: hideTabs ? null : undefined,
        }}
      />
    </Tabs>
  );
}

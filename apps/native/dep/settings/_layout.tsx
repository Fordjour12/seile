import { Stack } from "expo-router";

import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function SettingLayout() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Profile",
          headerShown: true,
          headerLargeTitle: true,
          headerShadowVisible: false,
          headerTintColor: theme.foreground,
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerLargeStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
      <Stack.Screen
        name="planning-style"
        options={{
          title: "Planning Style",
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: theme.foreground,
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
      <Stack.Screen
        name="ai-tone"
        options={{
          title: "AI Tone",
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: theme.foreground,
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
      <Stack.Screen
        name="notification-timing"
        options={{
          title: "Notification Timing",
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: theme.foreground,
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
      <Stack.Screen
        name="timezone-sync"
        options={{
          title: "Timezone and Sync",
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: theme.foreground,
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
      <Stack.Screen
        name="data-export"
        options={{
          title: "Export My Data",
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: theme.foreground,
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
    </Stack>
  );
}

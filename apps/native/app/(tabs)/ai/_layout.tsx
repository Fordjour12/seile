import { Stack } from "expo-router";

import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function AiLayout() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "AI",
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
        name="classic"
        options={{
          title: "AI Workspace",
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: theme.foreground,
          headerBackTitle: "AI",
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
      <Stack.Screen
        name="weekly-plan"
        options={{
          title: "Weekly Plan",
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: theme.foreground,
          headerBackTitle: "AI",
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
      <Stack.Screen
        name="resume-plan"
        options={{
          title: "Resume Plan",
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: theme.foreground,
          headerBackTitle: "AI",
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
    </Stack>
  );
}

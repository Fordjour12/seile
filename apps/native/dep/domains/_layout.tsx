import { Stack } from "expo-router";

import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function DomainsLayout() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Domains",
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
        name="finance"
        options={{
          title: "Finance",
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: theme.foreground,
          headerBackTitle: "Domains",
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
      <Stack.Screen
        name="faith"
        options={{
          title: "Faith",
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: theme.foreground,
          headerBackTitle: "Domains",
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
      <Stack.Screen
        name="career"
        options={{
          title: "Career",
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: theme.foreground,
          headerBackTitle: "Domains",
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
      <Stack.Screen
        name="health"
        options={{
          title: "Health",
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: theme.foreground,
          headerBackTitle: "Domains",
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
      <Stack.Screen
        name="wellness"
        options={{
          title: "Wellness",
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: theme.foreground,
          headerBackTitle: "Domains",
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
      <Stack.Screen
        name="tasks"
        options={{
          title: "Tasks",
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: theme.foreground,
          headerBackTitle: "Domains",
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
      <Stack.Screen
        name="relationships"
        options={{
          title: "Relationships",
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: theme.foreground,
          headerBackTitle: "Domains",
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
      <Stack.Screen
        name="space"
        options={{
          title: "Space",
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: theme.foreground,
          headerBackTitle: "Domains",
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
    </Stack>
  );
}

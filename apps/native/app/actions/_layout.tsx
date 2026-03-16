import { Stack } from "expo-router";

import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function ActionsLayout() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Actions",
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.foreground,
        }}
      />
      <Stack.Screen
        name="quick-add"
        options={{
          title: "Quick Add",
          presentation: "formSheet",
          sheetGrabberVisible: true,
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.foreground,
        }}
      />
      <Stack.Screen
        name="approval"
        options={{
          title: "Approval",
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="preview"
        options={{
          title: "Action Preview",
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="check-in"
        options={{
          title: "Check-In",
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="goal"
        options={{
          title: "New Goal",
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

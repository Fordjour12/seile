import { Stack, useRouter } from "expo-router";
import { Settings } from "iconoir-react-native";

import { IconButton } from "@/components";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function PlannerLayout() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Planner",
          headerShown: true,
          headerRight: () => (
            <IconButton
              variant="ghost"
              size="sm"
              onPress={() => router.push("/(tabs)/planner/settings" as never)}
              icon={<Settings color={theme.foreground} width={18} height={18} />}
            />
          ),
        }}
      />
      <Stack.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Planner Settings",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Conversation",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="plans/[id]"
        options={{
          title: "Plan",
          headerShown: true,
        }}
      />
    </Stack>
  );
}

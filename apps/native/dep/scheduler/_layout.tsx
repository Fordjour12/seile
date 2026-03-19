import { Stack } from "expo-router";

export default function SchedulerLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Scheduler" }} />
      <Stack.Screen name="calendar" options={{ headerShown: false }} />
      <Stack.Screen name="tasks" options={{ headerShown: false }} />
      <Stack.Screen name="alerts" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

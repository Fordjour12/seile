import { Stack } from "expo-router";

export default function SchedulerAlertsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Alerts" }} />
    </Stack>
  );
}

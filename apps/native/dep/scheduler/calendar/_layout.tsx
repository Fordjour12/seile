import { Stack } from "expo-router";

export default function SchedulerCalendarLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Calendar" }} />
    </Stack>
  );
}

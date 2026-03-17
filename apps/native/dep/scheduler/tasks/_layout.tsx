import { Stack } from "expo-router";

export default function SchedulerTasksLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Tasks" }} />
      <Stack.Screen name="create" options={{ title: "New Task" }} />
    </Stack>
  );
}

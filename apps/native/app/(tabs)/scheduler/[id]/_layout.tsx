import { Stack } from "expo-router";

export default function SchedulerDetailLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Task Detail" }} />
      <Stack.Screen name="update" options={{ title: "Edit Task" }} />
      <Stack.Screen name="delete" options={{ title: "Delete Task" }} />
    </Stack>
  );
}

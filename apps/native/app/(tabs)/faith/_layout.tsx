import { Stack } from "expo-router";

export default function FaithLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Faith" }} />
      <Stack.Screen name="goals" options={{ title: "Goals" }} />
      <Stack.Screen name="practices" options={{ title: "Practices" }} />
      <Stack.Screen name="prayers" options={{ title: "Prayer Journal" }} />
      <Stack.Screen name="readings" options={{ title: "Readings" }} />
      <Stack.Screen name="reflections" options={{ title: "Reflections" }} />
    </Stack>
  );
}

import { Stack } from "expo-router";

export default function HealthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Health",
          headerShown: true,
        }}
      />
    </Stack>
  );
}

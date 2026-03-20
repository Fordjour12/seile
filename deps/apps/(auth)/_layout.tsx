import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="first-run-today" options={{ headerShown: true, title: "First Run Today" }} />
      <Stack.Screen name="week-1" options={{ headerShown: true, title: "Week 1" }} />
    </Stack>
  );
}

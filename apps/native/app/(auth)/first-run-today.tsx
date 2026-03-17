import { Redirect } from "expo-router";
import { useEffect } from "react";

import { FirstRunTodayScreen } from "@/components/today/first-run-today-screen";
import { useAuth } from "@/lib/auth-context";

export default function FirstRunTodayRoute() {
  const {
    advanceOnboardingStage,
    hasCompletedOnboarding,
    hasHydrated,
    isLoading,
    user,
  } = useAuth();

  useEffect(() => {
    if (!hasHydrated || isLoading || !user || hasCompletedOnboarding) {
      return;
    }

    void advanceOnboardingStage("first-run-today");
  }, [
    advanceOnboardingStage,
    hasCompletedOnboarding,
    hasHydrated,
    isLoading,
    user,
  ]);

  if (!hasHydrated || isLoading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (hasCompletedOnboarding) {
    return <Redirect href="/(tabs)/domains" />;
  }

  return <FirstRunTodayScreen />;
}

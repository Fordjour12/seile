import { Redirect } from "expo-router";
import { useEffect } from "react";

import { OnboardingWeek1Screen } from "@/components/auth/onboarding-week1-screen";
import { useAuth } from "@/lib/auth-context";

export default function OnboardingWeekOneRoute() {
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

    void advanceOnboardingStage("week-1");
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

  return <OnboardingWeek1Screen />;
}

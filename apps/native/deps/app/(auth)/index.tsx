import { Redirect } from "expo-router";

import { OnboardingScreen } from "@/components/auth/onboarding-screen";
import { useAuth } from "@/lib/auth-context";

export default function AuthIndexScreen() {
  const { hasCompletedOnboarding, hasHydrated, isLoading, user } = useAuth();

  if (!hasHydrated || isLoading) {
    return null;
  }

  if (user) {
    return (
      <Redirect
        href={hasCompletedOnboarding ? "/(tabs)" : "/(auth)/first-run-today"}
      />
    );
  }

  return <OnboardingScreen />;
}

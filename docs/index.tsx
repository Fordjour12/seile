import { Redirect, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";

import { StepAiTone } from "@/components/auth/onboarding/step-ai-tone";
import { StepDomains } from "@/components/auth/onboarding/step-domains";
import { StepName } from "@/components/auth/onboarding/step-name";
import { StepNotifications } from "@/components/auth/onboarding/step-notifications";
import { StepPlanningStyle } from "@/components/auth/onboarding/step-planning-style";
import { StepSummary } from "@/components/auth/onboarding/step-summary";
import { StepWelcome } from "@/components/auth/onboarding/step-welcome";
import {
  DOMAIN_OPTIONS,
  MAX_PINNED_DOMAINS,
  STEP_PROGRESS,
} from "@/components/auth/onboarding/data";
import type {
  AiTone,
  OnboardingNotifications,
  OnboardingNotificationKey,
  PlanningStyle,
  Step,
} from "@/components/auth/onboarding/types";
import { AnimatedProgressBar } from "@/components/auth/onboarding-flow-motion";
import { useAuth } from "@/lib/auth-context";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export function OnboardingScreen() {
  const {
    completeOnboardingSetup,
    hasHydrated,
    onboardingDraft,
    saveOnboardingDraft,
    startOnboarding,
    user,
  } = useAuth();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const { height } = useWindowDimensions();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [domains, setDomains] = useState<string[]>([
    "faith",
    "career",
    "finance",
    "health",
  ]);
  const [pinnedDomainIds, setPinnedDomainIds] = useState<string[]>(["faith"]);
  const [planningStyle, setPlanningStyle] = useState<PlanningStyle>("balanced");
  const [aiTone, setAiTone] = useState<AiTone>("direct");
  const [notifications, setNotifications] = useState<OnboardingNotifications>({
    morningBriefing: true,
    approvalAlerts: true,
    eveningCheckin: true,
    weeklyReview: true,
    habitReminders: false,
  });
  const hasHydratedDraft = useRef(false);
  const [isDraftReady, setIsDraftReady] = useState(false);

  const minHeight = Math.max(height - UI_PRESETS.spacing.screen * 2, 760);
  const displayName = name.trim() || "Bobie";

  const summaryDomains = useMemo(
    () =>
      DOMAIN_OPTIONS.filter((item) => domains.includes(item.id)).sort(
        (a, b) => {
          const aPinnedIndex = pinnedDomainIds.indexOf(a.id);
          const bPinnedIndex = pinnedDomainIds.indexOf(b.id);

          if (aPinnedIndex !== -1 && bPinnedIndex !== -1) {
            return aPinnedIndex - bPinnedIndex;
          }
          if (aPinnedIndex !== -1) {
            return -1;
          }
          if (bPinnedIndex !== -1) {
            return 1;
          }
          return domains.indexOf(a.id) - domains.indexOf(b.id);
        },
      ),
    [domains, pinnedDomainIds],
  );

  useEffect(() => {
    if (hasHydratedDraft.current) {
      return;
    }

    hasHydratedDraft.current = true;

    if (typeof onboardingDraft.name === "string") {
      setName(onboardingDraft.name);
    }
    if (
      Array.isArray(onboardingDraft.selectedDomains) &&
      onboardingDraft.selectedDomains.length > 0
    ) {
      setDomains(onboardingDraft.selectedDomains);
    }
    if (Array.isArray(onboardingDraft.pinnedDomainIds)) {
      setPinnedDomainIds(onboardingDraft.pinnedDomainIds);
    }
    if (onboardingDraft.planningStyle) {
      setPlanningStyle(onboardingDraft.planningStyle);
    }
    if (onboardingDraft.aiTone) {
      setAiTone(onboardingDraft.aiTone);
    }
    if (onboardingDraft.notifications) {
      setNotifications(
        onboardingDraft.notifications as OnboardingNotifications,
      );
    }
    if (typeof onboardingDraft.lastStep === "number") {
      const nextStep = Math.max(
        1,
        Math.min(7, onboardingDraft.lastStep),
      ) as Step;
      setStep(nextStep);
    }
    setIsDraftReady(true);
  }, [onboardingDraft]);

  useEffect(() => {
    if (!isDraftReady) {
      return;
    }

    void saveOnboardingDraft({
      name,
      selectedDomains: domains,
      pinnedDomainIds,
      planningStyle,
      aiTone,
      notifications,
      lastStep: step,
    });
  }, [
    aiTone,
    domains,
    name,
    notifications,
    pinnedDomainIds,
    planningStyle,
    isDraftReady,
    saveOnboardingDraft,
    step,
  ]);

  if (hasHydrated && user) {
    return <Redirect href="/(tabs)" />;
  }

  function nextStep() {
    setStep((current) => Math.min(7, current + 1) as Step);
  }

  function previousStep() {
    setStep((current) => Math.max(1, current - 1) as Step);
  }

  async function handleWelcomeScreen() {
    await completeOnboardingSetup();
    router.push("/(auth)/welcome");
  }

  async function handleExistingAccount() {
    await completeOnboardingSetup();
    router.push("/(auth)/sign-in");
  }

  function toggleDomain(id: string) {
    setDomains((current) => {
      const isSelected = current.includes(id);
      if (isSelected && current.length === 1) {
        return current;
      }

      const nextDomains = isSelected
        ? current.filter((item) => item !== id)
        : [...current, id];

      if (isSelected) {
        setPinnedDomainIds((currentPinned) =>
          currentPinned.filter((item) => item !== id),
        );
      }

      return nextDomains;
    });
  }

  function togglePinnedDomain(id: string) {
    if (!domains.includes(id)) {
      return;
    }

    setPinnedDomainIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= MAX_PINNED_DOMAINS) {
        return current;
      }
      return [...current, id];
    });
  }

  function toggleNotification(key: OnboardingNotificationKey) {
    setNotifications((current) => ({ ...current, [key]: !current[key] }));
  }

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <StepWelcome
            theme={theme}
            minHeight={minHeight}
            onStart={() => {
              void startOnboarding();
              nextStep();
            }}
          />
        );
      case 2:
        return (
          <StepName
            theme={theme}
            name={name}
            onChangeName={setName}
            onBack={previousStep}
            onNext={nextStep}
          />
        );
      case 3:
        return (
          <StepDomains
            theme={theme}
            domains={domains}
            pinnedDomainIds={pinnedDomainIds}
            onToggleDomain={toggleDomain}
            onTogglePinnedDomain={togglePinnedDomain}
            onBack={previousStep}
            onNext={nextStep}
          />
        );
      case 4:
        return (
          <StepPlanningStyle
            theme={theme}
            planningStyle={planningStyle}
            onSelectPlanningStyle={setPlanningStyle}
            onBack={previousStep}
            onNext={nextStep}
          />
        );
      case 5:
        return (
          <StepAiTone
            theme={theme}
            aiTone={aiTone}
            onSelectAiTone={setAiTone}
            onBack={previousStep}
            onNext={nextStep}
          />
        );
      case 6:
        return (
          <StepNotifications
            theme={theme}
            notifications={notifications}
            onToggleNotification={toggleNotification}
            onBack={previousStep}
            onNext={nextStep}
          />
        );
      case 7:
        return (
          <StepSummary
            theme={theme}
            minHeight={minHeight}
            displayName={displayName}
            summaryDomains={summaryDomains}
            aiTone={aiTone}
            pinnedDomainIds={pinnedDomainIds}
            onWelcomeScreen={() => {
              void handleWelcomeScreen();
            }}
            onUseExistingAccount={() => {
              void handleExistingAccount();
            }}
            onBack={previousStep}
          />
        );
      default:
        return null;
    }
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        minHeight,
        paddingHorizontal: UI_PRESETS.spacing.section,
        paddingTop: UI_PRESETS.spacing.lg,
        paddingBottom: UI_PRESETS.spacing.section,
        gap: 20,
      }}
    >
      <AnimatedProgressBar
        progress={STEP_PROGRESS[step]}
        trackColor={theme.border}
        fillColor="#9b8fff"
        height={2}
      />
      {renderStep()}
    </ScrollView>
  );
}

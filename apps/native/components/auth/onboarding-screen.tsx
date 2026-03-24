import { Redirect, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";

import {
  BIGGEST_BLOCKER_OPTIONS,
  COMMITMENT_LEVEL_OPTIONS,
  ENERGY_PATTERN_OPTIONS,
  PREFERRED_STYLE_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  STEP_PROGRESS,
} from "@/components/auth/onboarding/data";
import { StepChoice } from "@/components/auth/onboarding/step-choice";
import { StepName } from "@/components/auth/onboarding/step-name";
import { StepNotifications } from "@/components/auth/onboarding/step-notifications";
import { StepSummary } from "@/components/auth/onboarding/step-summary";
import { StepWelcome } from "@/components/auth/onboarding/step-welcome";
import type {
  BiggestBlocker,
  CommitmentLevel,
  EnergyPattern,
  OnboardingNotifications,
  OnboardingNotificationKey,
  PreferredStyle,
  PrimaryGoal,
  Step,
} from "@/components/auth/onboarding/types";
import { AnimatedProgressBar } from "@/components/auth/onboarding-flow-motion";
import { useAuth } from "@/lib/auth-context";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

function detectTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

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
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal>("productivity");
  const [energyPattern, setEnergyPattern] = useState<EnergyPattern>("morning");
  const [biggestBlocker, setBiggestBlocker] = useState<BiggestBlocker>("follow_through");
  const [preferredStyle, setPreferredStyle] = useState<PreferredStyle>("direct");
  const [commitmentLevel, setCommitmentLevel] = useState<CommitmentLevel>("moderate");
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
  const displayName = name.trim() || "there";

  useEffect(() => {
    if (hasHydratedDraft.current) {
      return;
    }

    hasHydratedDraft.current = true;

    if (typeof onboardingDraft.name === "string") {
      setName(onboardingDraft.name);
    }
    if (onboardingDraft.primaryGoal) {
      setPrimaryGoal(onboardingDraft.primaryGoal);
    }
    if (onboardingDraft.energyPattern) {
      setEnergyPattern(onboardingDraft.energyPattern);
    }
    if (onboardingDraft.biggestBlocker) {
      setBiggestBlocker(onboardingDraft.biggestBlocker);
    }
    if (onboardingDraft.preferredStyle) {
      setPreferredStyle(onboardingDraft.preferredStyle);
    }
    if (onboardingDraft.commitmentLevel) {
      setCommitmentLevel(onboardingDraft.commitmentLevel);
    }
    if (onboardingDraft.notifications) {
      setNotifications(onboardingDraft.notifications as OnboardingNotifications);
    }
    if (typeof onboardingDraft.lastStep === "number") {
      const nextStep = Math.max(1, Math.min(9, onboardingDraft.lastStep)) as Step;
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
      primaryGoal,
      energyPattern,
      biggestBlocker,
      preferredStyle,
      commitmentLevel,
      notifications,
      timezone: detectTimezone(),
      lastStep: step,
    });
  }, [
    biggestBlocker,
    commitmentLevel,
    energyPattern,
    isDraftReady,
    name,
    notifications,
    preferredStyle,
    primaryGoal,
    saveOnboardingDraft,
    step,
  ]);

  if (hasHydrated && user) {
    return <Redirect href="/(tabs)" />;
  }

  function nextStep() {
    setStep((current) => Math.min(9, current + 1) as Step);
  }

  function previousStep() {
    setStep((current) => Math.max(1, current - 1) as Step);
  }

  async function handleWelcomeScreen() {
    await completeOnboardingSetup();
    router.push("/(auth)/welcome");
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
          <StepChoice
            theme={theme}
            stepLabel="Step 2 of 8"
            title="What do you want the AI to improve first?"
            subtitle="This becomes the main lens for your first seven days."
            value={primaryGoal}
            options={PRIMARY_GOAL_OPTIONS}
            onSelect={setPrimaryGoal}
            onBack={previousStep}
            onNext={nextStep}
          />
        );
      case 4:
        return (
          <StepChoice
            theme={theme}
            stepLabel="Step 3 of 8"
            title="When do you usually have your best energy?"
            subtitle="Early suggestions will be timed around this until the AI learns better from your behavior."
            value={energyPattern}
            options={ENERGY_PATTERN_OPTIONS}
            onSelect={setEnergyPattern}
            onBack={previousStep}
            onNext={nextStep}
          />
        );
      case 5:
        return (
          <StepChoice
            theme={theme}
            stepLabel="Step 4 of 8"
            title="What gets in your way most often?"
            subtitle="This tells the AI where to be useful instead of just motivational."
            value={biggestBlocker}
            options={BIGGEST_BLOCKER_OPTIONS}
            onSelect={setBiggestBlocker}
            onBack={previousStep}
            onNext={nextStep}
          />
        );
      case 6:
        return (
          <StepChoice
            theme={theme}
            stepLabel="Step 5 of 8"
            title="How should the AI talk to you?"
            subtitle="This controls how it frames nudges, suggestions, and reflections."
            value={preferredStyle}
            options={PREFERRED_STYLE_OPTIONS}
            onSelect={setPreferredStyle}
            onBack={previousStep}
            onNext={nextStep}
          />
        );
      case 7:
        return (
          <StepChoice
            theme={theme}
            stepLabel="Step 6 of 8"
            title="How much structure do you want right now?"
            subtitle="This sets the initial intensity. The AI can adjust later once it sees your real capacity."
            value={commitmentLevel}
            options={COMMITMENT_LEVEL_OPTIONS}
            onSelect={setCommitmentLevel}
            onBack={previousStep}
            onNext={nextStep}
          />
        );
      case 8:
        return (
          <StepNotifications
            theme={theme}
            notifications={notifications}
            onToggleNotification={toggleNotification}
            onBack={previousStep}
            onNext={nextStep}
          />
        );
      case 9:
        return (
          <StepSummary
            theme={theme}
            minHeight={minHeight}
            displayName={displayName}
            primaryGoal={primaryGoal}
            energyPattern={energyPattern}
            biggestBlocker={biggestBlocker}
            preferredStyle={preferredStyle}
            commitmentLevel={commitmentLevel}
            notifications={notifications}
            onWelcomeScreen={() => {
              void handleWelcomeScreen();
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

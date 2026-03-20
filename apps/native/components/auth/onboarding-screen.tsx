import { Redirect, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";

import { AnimatedProgressBar } from "@/components/auth/onboarding-flow-motion";
import {
  COMMITMENT_SUMMARIES,
  DEFAULT_ONBOARDING_ANSWERS,
  ONBOARDING_QUESTIONS,
  STEP_PROGRESS,
  STYLE_SUMMARIES,
} from "@/components/auth/onboarding/data";
import type {
  OnboardingDraftAnswers,
  OnboardingQuestionKey,
  Step,
} from "@/components/auth/onboarding/types";
import { Card, Button, Text } from "@/components/ui";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { useAuth } from "@/lib/v1-auth-context";

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
  const [answers, setAnswers] = useState<OnboardingDraftAnswers>(DEFAULT_ONBOARDING_ANSWERS);
  const hasHydratedDraft = useRef(false);
  const [isDraftReady, setIsDraftReady] = useState(false);

  const minHeight = Math.max(height - UI_PRESETS.spacing.screen * 2, 760);

  useEffect(() => {
    if (hasHydratedDraft.current) {
      return;
    }

    hasHydratedDraft.current = true;
    setAnswers({
      primaryGoal: onboardingDraft.primaryGoal ?? DEFAULT_ONBOARDING_ANSWERS.primaryGoal,
      energyPattern: onboardingDraft.energyPattern ?? DEFAULT_ONBOARDING_ANSWERS.energyPattern,
      biggestBlocker:
        onboardingDraft.biggestBlocker ?? DEFAULT_ONBOARDING_ANSWERS.biggestBlocker,
      preferredStyle:
        onboardingDraft.preferredStyle ?? DEFAULT_ONBOARDING_ANSWERS.preferredStyle,
      commitmentLevel:
        onboardingDraft.commitmentLevel ?? DEFAULT_ONBOARDING_ANSWERS.commitmentLevel,
    });

    if (typeof onboardingDraft.lastStep === "number") {
      const nextStep = Math.max(1, Math.min(7, onboardingDraft.lastStep)) as Step;
      setStep(nextStep);
    }

    setIsDraftReady(true);
  }, [onboardingDraft]);

  useEffect(() => {
    if (!isDraftReady) {
      return;
    }

    void saveOnboardingDraft({
      ...answers,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      lastStep: step,
    });
  }, [answers, isDraftReady, saveOnboardingDraft, step]);

  if (hasHydrated && user) {
    return <Redirect href="/(tabs)" />;
  }

  function nextStep() {
    setStep((current) => Math.min(7, current + 1) as Step);
  }

  function previousStep() {
    setStep((current) => Math.max(1, current - 1) as Step);
  }

  async function handleCreateAccount() {
    await completeOnboardingSetup();
    router.push("/(auth)/welcome");
  }

  async function handleExistingAccount() {
    await completeOnboardingSetup();
    router.push("/(auth)/sign-in");
  }

  function updateAnswer(key: OnboardingQuestionKey, value: string) {
    setAnswers((current) => ({
      ...current,
      [key]: value,
    }));
  }

  const question = step >= 2 && step <= 6 ? ONBOARDING_QUESTIONS[step - 2] : null;

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
        fillColor="#ba7517"
        height={2}
      />

      {step === 1 ? (
        <View style={{ flex: 1, justifyContent: "space-between", gap: 24 }}>
          <View style={{ gap: 16 }}>
            <Text selectable variant="muted" style={eyebrow(theme)}>
              AI onboarding
            </Text>
            <Text selectable variant="h2" style={{ color: theme.foreground }}>
              Seven days to a useful model.
            </Text>
            <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 22 }}>
              The app starts with a few hardcoded activities, watches what you
              actually do, and earns the right to become more assertive. These
              next five questions only seed the first experiment.
            </Text>
          </View>

          <Card style={cardStyle(theme)}>
            <Text selectable variant="small" style={{ color: theme.foreground, fontWeight: "700" }}>
              What happens next
            </Text>
            <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
              Days 1-2 observe. Days 3-5 suggest carefully. Days 6-7 only go
              bold where confidence is earned.
            </Text>
          </Card>

          <Button
            title="Start onboarding"
            onPress={() => {
              void startOnboarding();
              nextStep();
            }}
          />
        </View>
      ) : null}

      {question ? (
        <View style={{ gap: 18 }}>
          <View style={{ gap: 8 }}>
            <Text selectable variant="muted" style={eyebrow(theme)}>
              Step {step - 1} of 5
            </Text>
            <Text selectable variant="h3" style={{ color: theme.foreground }}>
              {question.title}
            </Text>
            <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
              {question.hint}
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            {question.options.map((option) => {
              const selected = answers[question.key] === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => updateAnswer(question.key, option.value)}
                  style={({ pressed }) => [
                    cardStyle(theme),
                    {
                      borderColor: selected ? "#ba7517" : theme.border,
                      backgroundColor: selected ? theme.card : theme.background,
                      opacity: pressed ? 0.92 : 1,
                    },
                  ]}
                >
                  <Text selectable variant="small" style={{ color: theme.foreground, fontWeight: "700" }}>
                    {option.label}
                  </Text>
                  {option.sub ? (
                    <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 18 }}>
                      {option.sub}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Button title="Back" variant="outline" style={{ flex: 1 }} onPress={previousStep} />
            <Button title="Next" style={{ flex: 1 }} onPress={nextStep} />
          </View>
        </View>
      ) : null}

      {step === 7 ? (
        <View style={{ gap: 18 }}>
          <View style={{ gap: 8 }}>
            <Text selectable variant="muted" style={eyebrow(theme)}>
              Summary
            </Text>
            <Text selectable variant="h3" style={{ color: theme.foreground }}>
              Your first-week setup is ready.
            </Text>
            <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
              The AI will use these answers as a starting point, then update its
              model from your behavior instead of trusting the form forever.
            </Text>
          </View>

          <Card style={cardStyle(theme)}>
            <Text selectable variant="small" style={{ color: theme.foreground, fontWeight: "700" }}>
              Goal
            </Text>
            <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
              {labelForAnswer("primaryGoal", answers.primaryGoal)}
            </Text>
          </Card>

          <Card style={cardStyle(theme)}>
            <Text selectable variant="small" style={{ color: theme.foreground, fontWeight: "700" }}>
              Energy + blocker
            </Text>
            <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
              {labelForAnswer("energyPattern", answers.energyPattern)}.{" "}
              {labelForAnswer("biggestBlocker", answers.biggestBlocker)}.
            </Text>
          </Card>

          <Card style={cardStyle(theme)}>
            <Text selectable variant="small" style={{ color: theme.foreground, fontWeight: "700" }}>
              Coaching rules
            </Text>
            <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
              {STYLE_SUMMARIES[answers.preferredStyle]}
            </Text>
            <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 20 }}>
              {COMMITMENT_SUMMARIES[answers.commitmentLevel]}
            </Text>
          </Card>

          <View style={{ gap: 12 }}>
            <Button title="Create account" onPress={() => void handleCreateAccount()} />
            <Button
              title="I already have an account"
              variant="outline"
              onPress={() => void handleExistingAccount()}
            />
            <Button title="Back" variant="ghost" onPress={previousStep} />
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function labelForAnswer(key: OnboardingQuestionKey, value: string) {
  const question = ONBOARDING_QUESTIONS.find((item) => item.key === key);
  return question?.options.find((option) => option.value === value)?.label ?? value;
}

function eyebrow(theme: any) {
  return {
    color: theme.mutedForeground,
    fontWeight: "700" as const,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  };
}

function cardStyle(theme: any) {
  return {
    borderRadius: 20,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
    padding: 18,
  };
}

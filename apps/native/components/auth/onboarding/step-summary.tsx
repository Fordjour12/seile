import { View } from "react-native";

import Animated, { LinearTransition } from "react-native-reanimated";

import {
  BIGGEST_BLOCKER_OPTIONS,
  COMMITMENT_LEVEL_OPTIONS,
  ENERGY_PATTERN_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  STYLE_MESSAGES,
} from "@/components/auth/onboarding/data";
import { AnimatedStage } from "@/components/auth/onboarding-flow-motion";
import type {
  BiggestBlocker,
  CommitmentLevel,
  EnergyPattern,
  OnboardingNotifications,
  OnboardingTheme,
  PreferredStyle,
  PrimaryGoal,
} from "@/components/auth/onboarding/types";
import { Button, Card, Text } from "@/components/ui";

function findLabel<T extends string>(
  options: ReadonlyArray<{ id: T; label: string }>,
  value: T,
) {
  return options.find((item) => item.id === value)?.label ?? value;
}

export function StepSummary({
  theme,
  minHeight,
  displayName,
  primaryGoal,
  energyPattern,
  biggestBlocker,
  preferredStyle,
  commitmentLevel,
  notifications,
  onWelcomeScreen,
  onBack,
}: {
  theme: OnboardingTheme;
  minHeight: number;
  displayName: string;
  primaryGoal: PrimaryGoal;
  energyPattern: EnergyPattern;
  biggestBlocker: BiggestBlocker;
  preferredStyle: PreferredStyle;
  commitmentLevel: CommitmentLevel;
  notifications: OnboardingNotifications;
  onWelcomeScreen: () => void;
  onBack: () => void;
}) {
  const enabledNotifications = Object.entries(notifications).filter(([, enabled]) => enabled).length;

  const summaryItems = [
    ["Primary goal", findLabel(PRIMARY_GOAL_OPTIONS, primaryGoal)],
    ["Energy pattern", findLabel(ENERGY_PATTERN_OPTIONS, energyPattern)],
    ["Biggest blocker", findLabel(BIGGEST_BLOCKER_OPTIONS, biggestBlocker)],
    ["AI style", preferredStyle],
    ["Commitment", findLabel(COMMITMENT_LEVEL_OPTIONS, commitmentLevel)],
  ] as const;

  return (
    <AnimatedStage
      stageKey="onboarding-step-8"
      style={{
        flex: 1,
        justifyContent: "space-between",
        gap: 20,
        minHeight: minHeight - 120,
      }}
    >
      <View style={{ gap: 16 }}>
        <View style={{ gap: 8 }}>
          <Text
            selectable
            variant="muted"
            style={{
              textTransform: "uppercase",
              letterSpacing: 1,
              color: theme.mutedForeground,
              fontFamily: "Geist",
              fontWeight: "700",
            }}
          >
            Step 8 of 8
          </Text>
          <Text
            selectable
            style={{
              color: theme.foreground,
              fontFamily: "Geist",
              fontSize: 28,
              fontWeight: "700",
              lineHeight: 34,
            }}
          >
            You&apos;re set up, {displayName}.
          </Text>
          <Text
            selectable
            variant="small"
            style={{ color: theme.mutedForeground, lineHeight: 22 }}
          >
            This gives the AI enough signal to start your first seven days in seed mode.
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {summaryItems.map(([label, value]) => (
            <Animated.View
              key={label}
              layout={LinearTransition.springify().damping(18).stiffness(180)}
              style={{
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text
                selectable
                variant="muted"
                style={{
                  color: theme.foreground,
                  fontFamily: "Geist",
                  fontWeight: "700",
                }}
              >
                {label}: {value}
              </Text>
            </Animated.View>
          ))}
        </View>

        <Card
          style={{
            borderRadius: 16,
            borderCurve: "continuous",
            padding: 16,
            gap: 10,
            borderWidth: 1,
            borderColor: "rgba(42, 42, 64, 0.9)",
            backgroundColor: "rgba(19, 19, 31, 0.96)",
          }}
        >
          <Text
            selectable
            variant="muted"
            style={{
              color: theme.primary,
              textTransform: "uppercase",
              letterSpacing: 1,
              fontFamily: "Geist",
              fontWeight: "700",
            }}
          >
            First message
          </Text>
          <Text selectable variant="small" style={{ color: "#b0b0c0", lineHeight: 22 }}>
            {STYLE_MESSAGES[preferredStyle]}
          </Text>
        </Card>

        <Card
          style={{
            borderRadius: 14,
            borderCurve: "continuous",
            padding: 14,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.card,
          }}
        >
          <Text
            selectable
            variant="muted"
            style={{
              color: theme.mutedForeground,
              textTransform: "uppercase",
              letterSpacing: 1,
              fontFamily: "Geist",
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            What happens next
          </Text>
          <View style={{ gap: 8 }}>
            {[
              "You’ll land on Today and start a 7-day learning loop.",
              "The AI will use your goal, blocker, energy pattern, and style to seed early suggestions.",
              `${enabledNotifications} notification preference${enabledNotifications === 1 ? "" : "s"} will be active by default.`,
              "Nothing changes automatically. Suggestions still require your approval when they affect your plan.",
            ].map((label) => (
              <View
                key={label}
                style={{
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "flex-start",
                }}
              >
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    backgroundColor: "#9b8fff",
                    marginTop: 6,
                  }}
                />
                <Text
                  selectable
                  variant="small"
                  style={{
                    color: theme.foreground,
                    lineHeight: 18,
                    flex: 1,
                  }}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

      <View style={{ gap: 8 }}>
        <Button
          title="Welcome To Seile OS"
          onPress={onWelcomeScreen}
          style={{ borderRadius: 14, borderCurve: "continuous" }}
        />
        <Button
          title="Back"
          variant="ghost"
          onPress={onBack}
          style={{ borderRadius: 14, borderCurve: "continuous" }}
        />
      </View>
    </AnimatedStage>
  );
}

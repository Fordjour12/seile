import { View } from "react-native";

import Animated, {
  FadeInDown,
  LinearTransition,
} from "react-native-reanimated";

import { Button, Card, Text } from "@/components/ui";
import { AnimatedStage } from "@/components/auth/onboarding-flow-motion";
import type { OnboardingTheme } from "@/components/auth/onboarding/types";
import { BrainAnimation } from "@/components/animation/brain-animation";

export function StepWelcome({
  theme,
  minHeight,
  onStart,
}: {
  theme: OnboardingTheme;
  minHeight: number;
  onStart: () => void;
}) {
  return (
    <AnimatedStage
      stageKey="onboarding-step-1"
      style={{
        flex: 1,
        justifyContent: "space-between",
        gap: 24,
        minHeight: minHeight - 120,
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          gap: 28,
          paddingBottom: 20,
        }}
      >
        <View style={{ alignItems: "center", gap: 18 }}>
          <BrainAnimation mode="breathe" size={200} />
          <View style={{ gap: 10, alignItems: "center" }}>
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
              Welcome to
            </Text>
            <Text
              selectable
              style={{
                color: theme.foreground,
                fontFamily: "Geist",
                fontSize: 34,
                fontWeight: "700",
                paddingVertical: 16,
              }}
            >
              Seila OS
            </Text>
            <Text
              selectable
              variant="small"
              style={{
                color: theme.mutedForeground,
                textAlign: "center",
                lineHeight: 22,
                maxWidth: 300,
              }}
            >
              One intelligent system for every domain of your life. Calm,
              personal, yours.
            </Text>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          {[
            ["#9b8fff", "Plans your week using your real patterns"],
            ["#1d9e75", "Tracks 8 life domains in one place"],
            ["#ba7517", "Never changes anything without your approval"],
          ].map(([color, label], index) => (
            <Animated.View
              key={label}
              entering={FadeInDown.delay(120 + index * 80).duration(320)}
              layout={LinearTransition.springify().damping(18).stiffness(180)}
            >
              <Card
                style={{
                  borderRadius: 12,
                  borderCurve: "continuous",
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: color,
                  }}
                />
                <Text
                  selectable
                  variant="small"
                  style={{ color: theme.foreground }}
                >
                  {label}
                </Text>
              </Card>
            </Animated.View>
          ))}
        </View>
      </View>

      <Button
        title="Get started"
        onPress={onStart}
        style={{ borderRadius: 14, borderCurve: "continuous" }}
      />
    </AnimatedStage>
  );
}

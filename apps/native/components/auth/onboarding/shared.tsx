import { Children, useEffect, type ReactNode } from "react";
import { View } from "react-native";

import Animated, {
  Easing,
  FadeInDown,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Button, Text } from "@/components/ui";
import { AnimatedStage } from "@/components/auth/onboarding-flow-motion";

export function StepShell({
  stepLabel,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextDisabled = false,
}: {
  stepLabel: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  const stepChildren = Children.toArray(children);

  return (
    <AnimatedStage
      stageKey={stepLabel}
      style={{ flex: 1, justifyContent: "space-between", gap: 20 }}
    >
      <View style={{ gap: 16 }}>
        <View style={{ gap: 10 }}>
          <Text
            selectable
            variant="muted"
            style={{
              textTransform: "uppercase",
              letterSpacing: 1,
              fontFamily: "Geist",
              fontWeight: "700",
              color: "#666",
            }}
          >
            {stepLabel}
          </Text>
          <Text
            selectable
            style={{
              color: "#ffffff",
              fontFamily: "Geist",
              fontSize: 28,
              fontWeight: "700",
              lineHeight: 34,
            }}
          >
            {title}
          </Text>
          <Text
            selectable
            variant="small"
            style={{ color: "#666", lineHeight: 22 }}
          >
            {subtitle}
          </Text>
        </View>
        {stepChildren.map((child, index) => (
          <Animated.View
            key={`${stepLabel}-child-${index}`}
            entering={FadeInDown.delay(90 + index * 70).duration(280)}
            layout={LinearTransition.springify().damping(18).stiffness(180)}
          >
            {child}
          </Animated.View>
        ))}
      </View>

      <Animated.View
        entering={FadeInDown.delay(180 + stepChildren.length * 50).duration(280)}
        style={{ flexDirection: "row", gap: 8, paddingTop: 8 }}
      >
        <Button
          title="←"
          variant="outline"
          onPress={onBack}
          style={{
            paddingHorizontal: 18,
            borderRadius: 14,
            borderCurve: "continuous",
          }}
        />
        <Button
          title="Continue"
          onPress={onNext}
          disabled={nextDisabled}
          style={{ flex: 1, borderRadius: 14, borderCurve: "continuous" }}
        />
      </Animated.View>
    </AnimatedStage>
  );
}


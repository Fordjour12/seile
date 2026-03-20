import React, { useEffect, useMemo, useState } from "react";
import * as Haptics from "expo-haptics";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { Circle } from "react-native-svg";

/**
 * Extracted from:
 * - apps/native/ui/life_os_animations_2.html
 * - apps/native/ui/life_os_animations_rn_reanimated.html
 *
 * This file turns those HTML motion specs into reusable RN/Reanimated hooks.
 * It also fixes the common native pitfalls from the snippets:
 * - animate color via interpolation instead of timing string colors directly
 * - bridge animated numeric displays back to JS text safely
 * - use SVG animated props for ring progress
 * - avoid DOM-only concepts like CSS transitions and transform-origin
 */

export const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

function triggerSelectionHaptic() {
  void Haptics.selectionAsync().catch(() => {});
}

function useRoundedSharedValue(value: SharedValue<number>) {
  const [rounded, setRounded] = useState(() => Math.round(value.value));

  useAnimatedReaction(
    () => Math.round(value.value),
    (next, prev) => {
      if (next !== prev) {
        runOnJS(setRounded)(next);
      }
    },
    [],
  );

  return rounded;
}

export function useStaggeredEntrance(index: number, delayStep = 80) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.96);

  useEffect(() => {
    const delay = index * delayStep;
    opacity.value = withDelay(
      delay,
      withSpring(1, { damping: 20, stiffness: 200 }),
    );
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 18, stiffness: 180 }),
    );
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 22, stiffness: 300 }),
    );
  }, [delayStep, index, opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return {
    animatedStyle,
    opacity,
    scale,
    translateY,
  };
}

export function useSnapSlider({
  initialValue = 5,
  min = 1,
  max = 10,
  trackWidth = 240,
  enableHaptics = true,
  onValueChange,
}: {
  initialValue?: number;
  min?: number;
  max?: number;
  trackWidth?: number;
  enableHaptics?: boolean;
  onValueChange?: (value: number) => void;
}) {
  const snapped = useSharedValue(clamp(initialValue, min, max));
  const thumbScale = useSharedValue(1);
  const labelScale = useSharedValue(1);
  const value = useRoundedSharedValue(snapped);

  const progress = useDerivedValue(
    () => (snapped.value - min) / Math.max(max - min, 1),
  );

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((event) => {
          const pct = clamp(event.x / trackWidth, 0, 1);
          const next = clamp(
            Math.round(min + pct * (max - min)),
            min,
            max,
          );

          if (next === snapped.value) {
            return;
          }

          snapped.value = next;
          thumbScale.value = withSequence(
            withSpring(1.15, { damping: 8, stiffness: 400 }),
            withSpring(1, { damping: 12, stiffness: 300 }),
          );
          labelScale.value = withSequence(
            withSpring(1.3, { damping: 6, stiffness: 500 }),
            withSpring(1, { damping: 14, stiffness: 300 }),
          );

          if (enableHaptics) {
            runOnJS(triggerSelectionHaptic)();
          }

          if (onValueChange) {
            runOnJS(onValueChange)(next);
          }
        })
        .onFinalize(() => {
          thumbScale.value = withSpring(1, { damping: 16, stiffness: 300 });
          labelScale.value = withSpring(1, { damping: 16, stiffness: 300 });
        }),
    [enableHaptics, labelScale, max, min, onValueChange, snapped, thumbScale, trackWidth],
  );

  const fillStyle = useAnimatedStyle(() => ({
    width: trackWidth * progress.value,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: trackWidth * progress.value - 15 },
      { scale: thumbScale.value },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: labelScale.value }],
  }));

  return {
    gesture,
    labelStyle,
    fillStyle,
    thumbStyle,
    progress,
    value,
  };
}

export function useRadialFab() {
  const progress = useSharedValue(0);
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    progress.value = withSpring(next ? 1 : 0, {
      damping: 18,
      stiffness: 260,
    });
  };

  const mainStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["#9b8fff", "#7a6ef0"],
    ),
    transform: [{ rotate: `${interpolate(progress.value, [0, 1], [0, 45])}deg` }],
  }));

  const labelsStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return {
    isOpen,
    progress,
    toggle,
    labelsStyle,
    mainStyle,
  };
}

export function useRadialFabAction(
  progress: SharedValue<number>,
  angle: number,
  radius: number,
  index: number,
) {
  const radians = (angle * Math.PI) / 180;
  const tx = Math.cos(radians) * radius;
  const ty = Math.sin(radians) * radius;

  const animatedStyle = useAnimatedStyle(() => {
    const delayed = interpolate(
      progress.value,
      [index * 0.08, 1],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: delayed,
      transform: [
        { translateX: delayed * tx },
        { translateY: delayed * ty },
        { scale: delayed },
      ],
    };
  });

  return animatedStyle;
}

export function useApprovalFlashCard({
  onComplete,
}: {
  onComplete?: (result: "approved" | "rejected") => void;
} = {}) {
  const flash = useSharedValue(0);
  const exit = useSharedValue(0);
  const tint = useSharedValue(0);
  const result = useSharedValue<0 | 1 | -1>(0);

  const animateResult = (next: "approved" | "rejected") => {
    result.value = next === "approved" ? 1 : -1;

    flash.value = withSequence(
      withTiming(1, { duration: 80 }),
      withDelay(300, withTiming(0, { duration: 200 })),
    );
    tint.value = withSequence(
      withTiming(1, { duration: 100 }),
      withDelay(200, withTiming(0, { duration: 200 })),
    );
    exit.value = withDelay(350, withTiming(1, { duration: 250 }));

    if (onComplete) {
      setTimeout(() => onComplete(next), 650);
    }
  };

  const cardStyle = useAnimatedStyle(() => {
    const border = result.value === -1 ? "#e24b4a" : "#1d9e75";
    const tintColor = result.value === -1 ? "#1a0e0e" : "#0e1a14";

    return {
      borderColor: interpolateColor(flash.value, [0, 1], ["#2d2a40", border]),
      backgroundColor: interpolateColor(tint.value, [0, 1], ["#1a1a24", tintColor]),
      opacity: 1 - exit.value,
      transform: [
        { scale: interpolate(exit.value, [0, 1], [1, 0.94]) },
      ],
    };
  });

  return {
    approve: () => animateResult("approved"),
    reject: () => animateResult("rejected"),
    cardStyle,
  };
}

export function useElasticCounter(initialValue: number) {
  const animatedValue = useSharedValue(initialValue);
  const cardScale = useSharedValue(1);
  const value = useRoundedSharedValue(animatedValue);

  const animateTo = (next: number) => {
    animatedValue.value = withSpring(next, {
      damping: 10,
      stiffness: 100,
      mass: 0.6,
      overshootClamping: false,
    });
    cardScale.value = withSequence(
      withSpring(1.08, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 14, stiffness: 200 }),
    );
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return {
    animateTo,
    cardStyle,
    value,
  };
}

export function usePressScale(onPress: () => void) {
  const scale = useSharedValue(1);

  const gesture = useMemo(
    () =>
      Gesture.Tap()
        .maxDuration(10000)
        .onBegin(() => {
          scale.value = withSpring(0.97, {
            damping: 20,
            stiffness: 400,
          });
        })
        .onFinalize(() => {
          scale.value = withSpring(1, {
            damping: 16,
            stiffness: 300,
          });
        })
        .onEnd(() => {
          runOnJS(onPress)();
        }),
    [onPress, scale],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle, gesture };
}

export function useShimmerLoop(duration = 1200) {
  const progress = useSharedValue(-1);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false,
    );

    return () => cancelAnimation(progress);
  }, [duration, progress]);

  return progress;
}

export function useSkeletonShimmerStyle(
  shimmer: SharedValue<number>,
  travelWidth: number,
) {
  return useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value * travelWidth }],
  }));
}

export function usePhaseTransition<T>({
  phases,
  initialIndex = 0,
}: {
  phases: readonly T[];
  initialIndex?: number;
}) {
  const [index, setIndex] = useState(initialIndex);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const progress = useSharedValue((initialIndex + 1) / phases.length);

  const goToPhase = (nextIndex: number, direction: 1 | -1) => {
    if (nextIndex < 0 || nextIndex >= phases.length || nextIndex === index) {
      return;
    }

    opacity.value = withTiming(0, { duration: 160 });
    translateY.value = withTiming(direction * -12, { duration: 180 });

    setTimeout(() => {
      setIndex(nextIndex);
      translateY.value = direction * 16;
      opacity.value = withSpring(1, { damping: 22, stiffness: 200 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 180 });
      progress.value = withSpring((nextIndex + 1) / phases.length, {
        damping: 18,
        stiffness: 160,
      });
    }, 170);
  };

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return {
    current: phases[index],
    currentIndex: index,
    contentStyle,
    goToPhase,
    progressStyle,
  };
}

export function useAnimatedNumber(initialValue: number) {
  const animatedValue = useSharedValue(initialValue);
  const numericValue = useRoundedSharedValue(animatedValue);

  const update = (nextValue: number) => {
    animatedValue.value = withSpring(nextValue, {
      damping: 18,
      stiffness: 120,
      mass: 0.8,
    });
  };

  const colorStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      animatedValue.value,
      [0, 500, 2000],
      ["#e24b4a", "#ba7517", "#1d9e75"],
    ),
  }));

  return {
    animatedValue,
    colorStyle,
    formattedValue: useMemo(
      () => numericValue.toLocaleString("en-GH"),
      [numericValue],
    ),
    numericValue,
    update,
  };
}

export function useHabitRing(circumference: number) {
  const progress = useSharedValue(0);
  const [isComplete, setIsComplete] = useState(false);

  const toggle = () => {
    const next = !isComplete;
    setIsComplete(next);
    progress.value = withSpring(next ? 1 : 0, {
      damping: 16,
      stiffness: 220,
      overshootClamping: false,
    });
  };

  const ringAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0, 1]) }],
  }));

  return {
    checkStyle,
    isComplete,
    ringAnimatedProps,
    toggle,
  };
}

export function useSheetSpring({
  sheetHeight,
  onDismiss,
}: {
  sheetHeight: number;
  onDismiss: () => void;
}) {
  const translateY = useSharedValue(0);
  const contextY = useSharedValue(0);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          contextY.value = translateY.value;
        })
        .onUpdate((event) => {
          translateY.value = Math.max(0, contextY.value + event.translationY);
        })
        .onEnd((event) => {
          if (event.translationY > 80 || event.velocityY > 500) {
            translateY.value = withSpring(sheetHeight);
            runOnJS(onDismiss)();
            return;
          }

          translateY.value = withSpring(0, {
            damping: 20,
            stiffness: 200,
          });
        }),
    [contextY, onDismiss, sheetHeight, translateY],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return { animatedStyle, gesture, translateY };
}

export function useProgressRing({
  circumference,
  index,
  targetPct,
}: {
  circumference: number;
  index: number;
  targetPct: number;
}) {
  const progress = useSharedValue(0);
  const displayed = useRoundedSharedValue(progress);

  useEffect(() => {
    progress.value = withDelay(
      index * 100,
      withSpring(targetPct, {
        damping: 14,
        stiffness: 120,
        mass: 0.8,
      }),
    );
  }, [index, progress, targetPct]);

  const ringAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value / 100),
  }));

  return {
    displayedPct: displayed,
    progress,
    ringAnimatedProps,
  };
}

export function useSwipeApproval({
  onApprove,
  onReject,
  dismissDistance = 500,
}: {
  onApprove: () => void;
  onReject: () => void;
  dismissDistance?: number;
}) {
  const translateX = useSharedValue(0);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
          translateX.value = event.translationX;
        })
        .onEnd((event) => {
          if (event.translationX > 100 || event.velocityX > 800) {
            translateX.value = withSpring(dismissDistance);
            runOnJS(onApprove)();
          } else if (
            event.translationX < -100 ||
            event.velocityX < -800
          ) {
            translateX.value = withSpring(-dismissDistance);
            runOnJS(onReject)();
          } else {
            translateX.value = withSpring(0, {
              damping: 18,
              stiffness: 200,
            });
          }
        }),
    [dismissDistance, onApprove, onReject, translateX],
  );

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${translateX.value * 0.04}deg` },
    ],
  }));

  const approveStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 80], [0, 1], Extrapolation.CLAMP),
  }));

  const rejectStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-80, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return {
    approveStyle,
    cardStyle,
    gesture,
    rejectStyle,
    translateX,
  };
}

export function AiPulseOrb({
  state = "thinking",
  size = 56,
  style,
}: {
  state?: "thinking" | "approval" | "done";
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const outerScale = useSharedValue(1);
  const outerOpacity = useSharedValue(state === "done" ? 1 : 0.4);
  const coreScale = useSharedValue(1);
  const coreOpacity = useSharedValue(state === "done" ? 1 : 0.7);

  useEffect(() => {
    cancelAnimation(outerScale);
    cancelAnimation(outerOpacity);
    cancelAnimation(coreScale);
    cancelAnimation(coreOpacity);

    if (state === "done") {
      outerScale.value = 1;
      outerOpacity.value = 1;
      coreScale.value = 1;
      coreOpacity.value = 1;
      return;
    }

    const duration = state === "approval" ? 700 : 1000;

    outerScale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    outerOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration }),
        withTiming(0.4, { duration }),
      ),
      -1,
      false,
    );

    coreScale.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration }),
        withTiming(1, { duration }),
      ),
      -1,
      false,
    );

    coreOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration }),
        withTiming(0.7, { duration }),
      ),
      -1,
      false,
    );
  }, [coreOpacity, coreScale, outerOpacity, outerScale, state]);

  const palette = state === "approval"
    ? {
        outer: "rgba(186,117,23,0.15)",
        shell: "#1a1408",
        border: "#3d2a08",
        core: "#ba7517",
      }
    : state === "done"
      ? {
          outer: "rgba(29,158,117,0.12)",
          shell: "#0e1a14",
          border: "#1a3a24",
          core: "#1d9e75",
        }
      : {
          outer: "rgba(155,143,255,0.12)",
          shell: "#1e1a30",
          border: "#3d3570",
          core: "#9b8fff",
        };

  const outerStyle = useAnimatedStyle(() => ({
    opacity: outerOpacity.value,
    transform: [{ scale: outerScale.value }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    opacity: coreOpacity.value,
    transform: [{ scale: coreScale.value }],
  }));

  const innerSize = size - 16;
  const coreSize = Math.max(12, size * 0.25);

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            borderRadius: size / 2,
            backgroundColor: palette.outer,
          },
          outerStyle,
        ]}
      />
      <View
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: palette.shell,
          borderWidth: 1,
          borderColor: palette.border,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={[
            {
              width: coreSize,
              height: coreSize,
              borderRadius: coreSize / 2,
              backgroundColor: palette.core,
            },
            coreStyle,
          ]}
        />
      </View>
    </View>
  );
}

export function useDirectionalTabSpring(initialIndex = 0, width: number) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const navigateTo = (nextIndex: number) => {
    if (nextIndex === currentIndex) {
      return;
    }

    const direction = nextIndex > currentIndex ? 1 : -1;
    setCurrentIndex(nextIndex);
    translateX.value = direction * width;
    opacity.value = 0;
    translateX.value = withSpring(0, {
      damping: 24,
      stiffness: 220,
      mass: 0.9,
    });
    opacity.value = withTiming(1, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return {
    animatedStyle,
    currentIndex,
    navigateTo,
  };
}

export function useStaggeredBar(targetPct: number, index: number) {
  const width = useSharedValue(0);
  const displayed = useRoundedSharedValue(width);

  useEffect(() => {
    width.value = withDelay(
      index * 100,
      withSpring(targetPct, {
        damping: 16,
        stiffness: 140,
        overshootClamping: false,
      }),
    );
  }, [index, targetPct, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return {
    animatedStyle,
    displayedPct: displayed,
    progress: width,
  };
}

import { useEffect, useState, type ReactNode } from "react";
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";

import Animated, {
  Easing,
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type AnimatedStageProps = {
  children: ReactNode;
  stageKey: string;
  style?: StyleProp<ViewStyle>;
};

type AnimatedProgressBarProps = {
  progress: number;
  trackColor: string;
  fillColor: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

export function AnimatedStage({
  children,
  stageKey,
  style,
}: AnimatedStageProps) {
  return (
    <Animated.View
      key={stageKey}
      entering={FadeInDown.duration(360)}
      exiting={FadeOutUp.duration(220)}
      layout={LinearTransition.springify().damping(20).stiffness(180)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

export function AnimatedProgressBar({
  progress,
  trackColor,
  fillColor,
  height = 4,
  style,
}: AnimatedProgressBarProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    if (trackWidth <= 0) {
      return;
    }

    animatedWidth.value = withTiming((trackWidth * progress) / 100, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
  }, [animatedWidth, progress, trackWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: animatedWidth.value,
  }));

  function handleLayout(event: LayoutChangeEvent) {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth !== trackWidth) {
      setTrackWidth(nextWidth);
    }
  }

  return (
    <View
      onLayout={handleLayout}
      style={[
        {
          height,
          borderRadius: 999,
          backgroundColor: trackColor,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            height: "100%",
            borderRadius: 999,
            backgroundColor: fillColor,
          },
          fillStyle,
        ]}
      />
    </View>
  );
}

import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { Text } from "@/components/text";
import { View } from "@/components/view";
import { AnimationTokens, Typography, UI_PRESETS } from "@/lib/constants";

type SchedulerProgressBarProps = {
  progress: number;
  fillColor: string;
  trackColor: string;
  textColor: string;
};

export function SchedulerProgressBar({
  progress,
  fillColor,
  trackColor,
  textColor,
}: SchedulerProgressBarProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const widthValue = useSharedValue(0);

  useEffect(() => {
    widthValue.value = withTiming((trackWidth * progress) / 100, {
      duration: 300,
    });
  }, [progress, trackWidth, widthValue]);

  const fillStyle = useAnimatedStyle(() => ({
    width: widthValue.value,
  }));

  function onTrackLayout(event: LayoutChangeEvent) {
    setTrackWidth(event.nativeEvent.layout.width);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: trackColor }]} onLayout={onTrackLayout}>
        <Animated.View style={[styles.fill, fillStyle, { backgroundColor: fillColor }]} />
      </View>
      <Text style={[Typography.captionSM, { color: textColor, fontVariant: ["tabular-nums"] }]} selectable>
        {`${progress}%`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: UI_PRESETS.radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: UI_PRESETS.radius.full,
  },
});

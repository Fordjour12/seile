import React from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  type ViewProps,
} from "react-native";

import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type SwitchProps = Omit<ViewProps, "onPress"> & {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

const SWITCH_CONFIG = {
  height: 30,
  padding: 2,
  thumbSize: 24,
  width: 50,
};

export function Switch({
  value,
  onValueChange,
  disabled,
  style,
  ...props
}: SwitchProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Pressable
      onPress={() => {
        if (!disabled) {
          onValueChange(!value);
        }
      }}
      style={[
        styles.track,
        {
          backgroundColor: value ? theme.primary : theme.muted,
          borderColor: value ? theme.primary : theme.border,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      {...props}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            backgroundColor: value
              ? theme.primaryForeground
              : theme.mutedForeground,
            transform: [{ translateX: value ? SWITCH_CONFIG.thumbSize : 0 }],
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  thumb: {
    borderRadius: SWITCH_CONFIG.thumbSize / 2,
    height: SWITCH_CONFIG.thumbSize,
    width: SWITCH_CONFIG.thumbSize,
  },
  track: {
    borderRadius: SWITCH_CONFIG.height / 2,
    borderWidth: 1,
    height: SWITCH_CONFIG.height,
    padding: SWITCH_CONFIG.padding,
    width: SWITCH_CONFIG.width,
  },
});

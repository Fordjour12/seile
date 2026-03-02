import React from "react";
import { Pressable, View, ViewProps, StyleSheet, Animated } from "react-native";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface SwitchProps extends Omit<ViewProps, "onPress"> {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const SWITCH_CONFIG = {
  width: 50,
  height: 30,
  thumbSize: 24,
  padding: 2,
};

export function Switch({ value, onValueChange, disabled, style, ...props }: SwitchProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
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
            backgroundColor: value ? theme.primaryForeground : theme.mutedForeground,
            transform: [{ translateX: value ? SWITCH_CONFIG.thumbSize : 0 }],
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: SWITCH_CONFIG.width,
    height: SWITCH_CONFIG.height,
    borderRadius: SWITCH_CONFIG.height / 2,
    borderWidth: 1,
    padding: SWITCH_CONFIG.padding,
  },
  thumb: {
    width: SWITCH_CONFIG.thumbSize,
    height: SWITCH_CONFIG.thumbSize,
    borderRadius: SWITCH_CONFIG.thumbSize / 2,
  },
});

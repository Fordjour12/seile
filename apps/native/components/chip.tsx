import React from "react";
import { Pressable, Text, PressableProps, StyleSheet, ViewStyle } from "react-native";
import { NAV_THEME, ChipTokens } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface ChipProps extends Omit<PressableProps, "style"> {
  label: string;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  style?: ViewStyle;
}

const OPACITY = {
  pressed: 0.84,
  disabled: 0.45,
};

export function Chip({ label, selected = false, onSelect, disabled, style, ...props }: ChipProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const handlePress = () => {
    if (onSelect) {
      onSelect(!selected);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.primary : theme.muted,
          borderColor: selected ? theme.primary : theme.border,
          paddingHorizontal: ChipTokens.base.paddingHorizontal,
          paddingVertical: ChipTokens.base.paddingVertical,
          minHeight: ChipTokens.base.minHeight,
          borderRadius: ChipTokens.base.borderRadius,
        },
        pressed && { opacity: OPACITY.pressed },
        disabled && { opacity: OPACITY.disabled },
        style,
      ]}
      {...props}
    >
      <Text
        style={[
          styles.label,
          {
            color: selected ? theme.primaryForeground : theme.foreground,
            fontSize: ChipTokens.text.fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontWeight: "500",
  },
});

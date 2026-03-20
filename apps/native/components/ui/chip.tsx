import React from "react";
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  type StyleProp,
  Text,
  type ViewStyle,
} from "react-native";

import { ChipTokens, UI_PRESETS, UI_ELEMENT_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type ChipProps = Omit<PressableProps, "style"> & {
  label: string;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  style?: StyleProp<ViewStyle>;
};

export function Chip({
  label,
  selected = false,
  onSelect,
  disabled,
  style,
  ...props
}: ChipProps) {
  const { colorScheme } = useColorScheme();
  const palette =
    colorScheme === "dark" ? UI_ELEMENT_THEME.dark : UI_ELEMENT_THEME.light;

  return (
    <Pressable
      onPress={() => onSelect?.(!selected)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected
            ? palette.chip.selectedBg
            : palette.chip.bg,
          borderColor: selected
            ? palette.chip.selectedBg
            : palette.chip.border,
          borderWidth: selected
            ? ChipTokens.selected.borderWidth
            : ChipTokens.unselected.borderWidth,
          paddingHorizontal: ChipTokens.base.paddingHorizontal,
          paddingVertical: ChipTokens.base.paddingVertical,
          minHeight: ChipTokens.base.minHeight,
          borderRadius: ChipTokens.base.borderRadius,
        },
        pressed && { opacity: UI_PRESETS.opacity.pressed },
        disabled && { opacity: UI_PRESETS.opacity.disabled },
        style,
      ]}
      {...props}
    >
      <Text
        style={[
          styles.label,
          ChipTokens.text,
          {
            color: selected
              ? palette.chip.selectedText
              : palette.chip.text,
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
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
  },
  label: {
    textAlign: "center",
  },
});

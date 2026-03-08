import React from "react";
import { Pressable, Text, PressableProps, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { ChipTokens, UI_ELEMENT_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface ChipProps extends Omit<PressableProps, "style"> {
  label: string;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, selected = false, onSelect, disabled, style, ...props }: ChipProps) {
  const { colorScheme } = useColorScheme();
  const palette = colorScheme === "dark" ? UI_ELEMENT_THEME.dark : UI_ELEMENT_THEME.light;

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
          backgroundColor: selected ? palette.chip.selectedBg : palette.chip.bg,
          borderColor: selected ? palette.chip.selectedBg : palette.chip.border,
          borderWidth: selected ? ChipTokens.selected.borderWidth : ChipTokens.unselected.borderWidth,
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
          {
            color: selected ? palette.chip.selectedText : palette.chip.text,
          },
          ChipTokens.text,
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
    textAlign: "center",
  },
});

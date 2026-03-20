import React from "react";
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { NAV_THEME, InputTokens } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface InputProps extends TextInputProps {
  containerStyle?: ViewStyle;
}

export function Input({ containerStyle, style, ...props }: InputProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.input,
          borderColor: theme.border,
          borderRadius: InputTokens.field.borderRadius,
          minHeight: InputTokens.field.minHeight,
          paddingHorizontal: InputTokens.field.paddingHorizontal,
          paddingVertical: InputTokens.field.paddingVertical,
          borderWidth: InputTokens.field.borderWidth,
        },
        containerStyle,
      ]}
    >
      <TextInput
        style={[
          styles.input,
          {
            color: theme.foreground,
            fontSize: InputTokens.label.fontSize,
            lineHeight: InputTokens.label.lineHeight,
          },
          style,
        ]}
        placeholderTextColor={theme.mutedForeground}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  input: {},
});

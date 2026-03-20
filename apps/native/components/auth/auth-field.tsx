import React from "react";
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

import { Text } from "@/components/ui";
import { AUTH_PALETTE } from "@/components/auth/auth-palette";

type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  hint?: string;
  rightAction?: React.ReactNode;
};

export function AuthField({
  label,
  error,
  hint,
  rightAction,
  style,
  ...props
}: AuthFieldProps) {
  return (
    <View style={styles.group}>
      <Text selectable variant="small" style={styles.label}>
        {label}
      </Text>
      <View style={[styles.fieldWrap, error ? styles.fieldWrapError : null]}>
        <TextInput
          placeholderTextColor={AUTH_PALETTE.textFaint}
          style={[styles.input, rightAction ? styles.inputWithAction : null, style]}
          {...props}
        />
        {rightAction}
      </View>
      {error ? (
        <Text selectable variant="small" style={styles.error}>
          {error}
        </Text>
      ) : hint ? (
        <Text selectable variant="small" style={styles.hint}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 6,
  },
  label: {
    color: AUTH_PALETTE.textSubtle,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  fieldWrap: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AUTH_PALETTE.border,
    backgroundColor: AUTH_PALETTE.surface,
    justifyContent: "center",
  },
  fieldWrapError: {
    borderColor: "#3a1a1a",
  },
  input: {
    color: "#e0e0ec",
    fontFamily: "Figtree",
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  inputWithAction: {
    paddingRight: 64,
  },
  error: {
    color: AUTH_PALETTE.danger,
  },
  hint: {
    color: AUTH_PALETTE.textFaint,
  },
});

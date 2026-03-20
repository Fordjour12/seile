import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/ui";
import { AUTH_PALETTE } from "@/components/auth/auth-palette";
import { AuthField } from "@/components/auth/auth-field";

type AuthPasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string | null;
  showStrengthMeter?: boolean;
};

export function AuthPasswordField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  showStrengthMeter = false,
}: AuthPasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const strength = useMemo(() => getPasswordStrength(value), [value]);

  return (
    <View style={styles.group}>
      <AuthField
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!isVisible}
        autoComplete="password"
        autoCapitalize="none"
        autoCorrect={false}
        error={error}
        rightAction={
          <Pressable
            onPress={() => setIsVisible((current) => !current)}
            style={styles.action}
          >
            <Text selectable variant="small" style={styles.actionText}>
              {isVisible ? "Hide" : "Show"}
            </Text>
          </Pressable>
        }
      />
      {showStrengthMeter ? (
        <View style={styles.meterBlock}>
          <View style={styles.meterRow}>
            {strength.bars.map((color, index) => (
              <View
                key={`strength-${index}`}
                style={[styles.meterBar, { backgroundColor: color }]}
              />
            ))}
          </View>
          <Text selectable variant="small" style={[styles.meterLabel, { color: strength.labelColor }]}>
            {strength.label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const colors = [
    AUTH_PALETTE.danger,
    AUTH_PALETTE.warning,
    AUTH_PALETTE.primary,
    AUTH_PALETTE.positive,
  ];
  const labels = ["Too short", "Fair", "Good", "Strong"];
  const activeColor = score === 0 ? AUTH_PALETTE.textFaint : colors[Math.max(0, score - 1)];

  return {
    score,
    label: password.length === 0 ? "Enter a password" : labels[Math.max(0, score - 1)],
    labelColor: activeColor,
    bars: Array.from({ length: 4 }, (_, index) =>
      index < score ? activeColor : "#1e1e22",
    ),
  };
}

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  action: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  actionText: {
    color: AUTH_PALETTE.textSubtle,
    fontWeight: "500",
  },
  meterBlock: {
    gap: 4,
    marginTop: -2,
  },
  meterRow: {
    flexDirection: "row",
    gap: 4,
  },
  meterBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  meterLabel: {
    color: AUTH_PALETTE.textFaint,
  },
});

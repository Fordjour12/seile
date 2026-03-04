import React from "react";
import { StyleSheet } from "react-native";

import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { Input } from "./input";
import { Text } from "./text";
import { View } from "./view";

type FinanceAmountFieldProps = {
  value: string;
  currencyCode?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  onChangeValue: (nextValue: string) => void;
};

export function FinanceAmountField({
  value,
  currencyCode = "GHS",
  label = "Amount",
  placeholder = "0.00",
  error,
  onChangeValue,
}: FinanceAmountFieldProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View style={styles.container}>
      <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>{label}</Text>
      <View style={styles.row}>
        <View style={[styles.currencyPill, { borderColor: theme.border, backgroundColor: theme.card }]}>
          <Text style={[Typography.labelSM, { color: theme.foreground }]}>{currencyCode}</Text>
        </View>
        <Input
          value={value}
          onChangeText={onChangeValue}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          containerStyle={styles.amountInput}
        />
      </View>
      {error ? <Text style={[Typography.captionSM, { color: theme.destructive }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: UI_PRESETS.spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
  currencyPill: {
    minWidth: 72,
    height: 44,
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  amountInput: {
    flex: 1,
  },
});

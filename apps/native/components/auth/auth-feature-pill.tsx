import React from "react";
import { StyleSheet, View } from "react-native";

import { Surface, Text } from "@/components/ui";
import { AUTH_PALETTE } from "@/components/auth/auth-palette";

type AuthFeaturePillProps = {
  color: string;
  label: string;
};

export function AuthFeaturePill({ color, label }: AuthFeaturePillProps) {
  return (
    <Surface elevation="flat" tone="card" style={styles.pill}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text selectable variant="small" style={styles.label}>
        {label}
      </Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: AUTH_PALETTE.surface,
    borderColor: "#22242a",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
  label: {
    color: AUTH_PALETTE.textSubtle,
    fontWeight: "500",
  },
});

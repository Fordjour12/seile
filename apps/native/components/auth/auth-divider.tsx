import React from "react";
import { StyleSheet, View } from "react-native";

import { Separator, Text } from "@/components/ui";
import { AUTH_PALETTE } from "@/components/auth/auth-palette";

type AuthDividerProps = {
  label: string;
};

export function AuthDivider({ label }: AuthDividerProps) {
  return (
    <View style={styles.row}>
      <Separator style={styles.line} />
      <Text selectable variant="small" style={styles.label}>
        {label}
      </Text>
      <Separator style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  line: {
    flex: 1,
    backgroundColor: "#1e1e22",
  },
  label: {
    color: AUTH_PALETTE.textFaint,
    fontWeight: "500",
  },
});

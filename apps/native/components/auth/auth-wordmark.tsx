import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import { Text } from "@/components/ui";
import { AUTH_PALETTE } from "@/components/auth/auth-palette";
import { BrainAnimation } from "../animation/brain-animation";

export function AuthWordmark() {
  return (
    <View style={styles.row}>
      <BrainAnimation size={60} mode="idle" />
      <View style={styles.copy}>
        <Text selectable style={styles.title}>
          Seile OS
        </Text>
        <Text selectable variant="small" style={styles.subtitle}>
          Your personal operating system
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: AUTH_PALETTE.surfaceAccent,
    borderWidth: 1,
    borderColor: AUTH_PALETTE.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    gap: 2,
  },
  title: {
    color: AUTH_PALETTE.text,
    fontFamily: "Geist",
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: AUTH_PALETTE.textFaint,
  },
});

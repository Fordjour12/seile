import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { Button, Text } from "@/components/ui";
import { AUTH_PALETTE } from "@/components/auth/auth-palette";

type AuthSuccessStateProps = {
  title: string;
  subtitle: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
};

export function AuthSuccessState({
  title,
  subtitle,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
}: AuthSuccessStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.ring}>
        <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
          <Path
            d="M4 14l6 6L22 6"
            stroke={AUTH_PALETTE.primary}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      <Text selectable style={styles.title}>
        {title}
      </Text>
      <Text selectable variant="small" style={styles.subtitle}>
        {subtitle}
      </Text>
      <Button
        title={primaryLabel}
        onPress={onPrimaryPress}
        style={styles.primaryButton}
      />
      {secondaryLabel && onSecondaryPress ? (
        <Pressable onPress={onSecondaryPress}>
          <Text selectable variant="small" style={styles.secondaryLink}>
            {secondaryLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  ring: {
    width: 60,
    height: 60,
    borderRadius: 999,
    backgroundColor: AUTH_PALETTE.surfaceAccent,
    borderWidth: 1.5,
    borderColor: AUTH_PALETTE.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: AUTH_PALETTE.text,
    fontFamily: "Geist",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    color: AUTH_PALETTE.textSubtle,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 280,
  },
  primaryButton: {
    width: "100%",
    marginTop: 4,
    borderRadius: 14,
  },
  secondaryLink: {
    color: AUTH_PALETTE.textFaint,
    textAlign: "center",
  },
});

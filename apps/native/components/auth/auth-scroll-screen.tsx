import React from "react";
import { ScrollView, StyleSheet, type ViewStyle } from "react-native";

import { Container } from "@/components/container";
import { AUTH_PALETTE } from "@/components/auth/auth-palette";

type AuthScrollScreenProps = {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
};

export function AuthScrollScreen({
  children,
  contentStyle,
}: AuthScrollScreenProps) {
  return (
    <Container>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={[styles.content, contentStyle]}
      >
        {children}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: AUTH_PALETTE.screen,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
});

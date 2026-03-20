import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { NAV_THEME, CardTokens } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface CardProps extends ViewProps {
  variant?: "default" | "outline" | "ghost";
}

export function Card({ children, variant = "default", style, ...props }: CardProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const variantStyles = {
    default: {
      backgroundColor: theme.card,
      borderWidth: 0,
    },
    outline: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    ghost: {
      backgroundColor: "transparent",
      borderWidth: 0,
    },
  };

  return (
    <View
      style={[
        styles.card,
        { borderRadius: CardTokens.base.borderRadius },
        variantStyles[variant],
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: CardTokens.base.padding,
  },
});

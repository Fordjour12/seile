import React from "react";
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from "react-native";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type TextVariant = "h1" | "h2" | "h3" | "body" | "small" | "muted";

interface TextProps extends RNTextProps {
  variant?: TextVariant;
}

const variantStyles: Record<TextVariant, TextStyle> = {
  h1: { fontFamily: "Geist", fontSize: 36, fontWeight: "700", lineHeight: 42, letterSpacing: -0.4 },
  h2: { fontFamily: "Geist", fontSize: 30, fontWeight: "700", lineHeight: 36, letterSpacing: -0.3 },
  h3: { fontFamily: "Geist", fontSize: 26, fontWeight: "600", lineHeight: 32, letterSpacing: -0.2 },
  body: { fontFamily: "Figtree", fontSize: 15, fontWeight: "400", lineHeight: 22 },
  small: { fontFamily: "Figtree", fontSize: 13, fontWeight: "400", lineHeight: 19 },
  muted: { fontFamily: "Figtree", fontSize: 11, fontWeight: "400", lineHeight: 15 },
};

export function Text({ variant = "body", style, ...props }: TextProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const getTextColor = () => {
    if (variant === "muted") return theme.mutedForeground;
    return theme.foreground;
  };

  return (
    <RNText
      style={[
        variantStyles[variant],
        { color: getTextColor() },
        style,
      ]}
      {...props}
    />
  );
}

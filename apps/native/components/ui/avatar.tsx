import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  type ViewProps,
  View,
} from "react-native";

import { AvatarTokens, NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type AvatarProps = ViewProps & {
  source?: { uri: string };
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
};

export function Avatar({
  source,
  alt,
  fallback,
  size = "md",
  style,
  ...props
}: AvatarProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const avatarToken = AvatarTokens[size];

  const initials = (fallback ?? "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.muted,
          borderRadius: avatarToken.radius,
          height: avatarToken.size,
          width: avatarToken.size,
        },
        style,
      ]}
      {...props}
    >
      {source ? (
        <Image
          source={source}
          alt={alt}
          style={{
            borderRadius: avatarToken.radius,
            height: avatarToken.size,
            width: avatarToken.size,
          }}
        />
      ) : (
        <Text
          style={[
            styles.fallback,
            {
              color: theme.mutedForeground,
              fontSize: avatarToken.text.fontSize,
            },
          ]}
        >
          {initials}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fallback: {
    fontFamily: "Geist",
    fontWeight: "700",
  },
});

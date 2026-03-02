import React from "react";
import { View, Image, Text, ViewProps, StyleSheet } from "react-native";
import { NAV_THEME, AvatarTokens } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface AvatarProps extends ViewProps {
  source?: { uri: string };
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function Avatar({ source, alt, fallback, size = "md", style, ...props }: AvatarProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const avatarToken = AvatarTokens[size];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: avatarToken.size,
          height: avatarToken.size,
          borderRadius: avatarToken.radius,
          backgroundColor: theme.muted,
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
            width: avatarToken.size,
            height: avatarToken.size,
            borderRadius: avatarToken.radius,
          }}
        />
      ) : (
        <Text
          style={[
            styles.fallback,
            {
              fontSize: avatarToken.text.fontSize,
              color: theme.mutedForeground,
            },
          ]}
        >
          {fallback ? getInitials(fallback) : "?"}
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
    fontWeight: "600",
  },
});

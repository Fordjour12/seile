import React from "react";
import { Text } from "@/components/text";
import { View } from "@/components/view";
import { Pressable, StyleSheet, ViewProps } from "react-native";
import { HeaderTokens, UI_ELEMENT_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface SectionHeaderProps extends ViewProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  style,
  ...props
}: SectionHeaderProps) {
  const { colorScheme } = useColorScheme();
  const palette =
    colorScheme === "dark" ? UI_ELEMENT_THEME.dark : UI_ELEMENT_THEME.light;

  return (
    <View
      style={[
        styles.container,
        {
          minHeight: HeaderTokens.screen.minHeight,
          gap: HeaderTokens.screen.gap,
          paddingHorizontal: HeaderTokens.screen.paddingHorizontal,
          paddingVertical: HeaderTokens.screen.paddingVertical,
        },
        style,
      ]}
      {...props}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            HeaderTokens.title,
            { color: palette.text.primary },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              HeaderTokens.subtitle,
              { color: palette.text.secondary },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Text
            style={[HeaderTokens.actionLabel, { color: palette.text.link }]}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: "Geist",
  },
  subtitle: {
    fontFamily: "Geist",
    marginTop: 2,
  },
  pressed: {
    opacity: 0.8,
  },
});

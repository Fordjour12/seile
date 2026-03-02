import React from "react";
import { Pressable, PressableProps, StyleSheet, Text, View, ViewStyle } from "react-native";
import { ListItemTokens, UI_ELEMENT_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface ListItemProps extends Omit<PressableProps, "style"> {
  title: string;
  subtitle?: string;
  meta?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  compact?: boolean;
  style?: ViewStyle;
}

export function ListItem({
  title,
  subtitle,
  meta,
  left,
  right,
  compact = false,
  onPress,
  style,
  ...props
}: ListItemProps) {
  const { colorScheme } = useColorScheme();
  const palette = colorScheme === "dark" ? UI_ELEMENT_THEME.dark : UI_ELEMENT_THEME.light;
  const size = compact ? ListItemTokens.compact : ListItemTokens.base;
  const content = (
    <>
      {left ? <View style={styles.left}>{left}</View> : null}
      <View style={styles.content}>
        <Text style={[styles.title, ListItemTokens.title, { color: palette.listItem.text }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.subtitle, ListItemTokens.subtitle, { color: palette.listItem.subtitle }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {meta ? (
        <Text style={[styles.meta, ListItemTokens.meta, { color: palette.listItem.subtitle }]}>{meta}</Text>
      ) : null}
      {right ? <View style={styles.right}>{right}</View> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          {
            minHeight: size.minHeight,
            paddingHorizontal: size.paddingHorizontal,
            paddingVertical: size.paddingVertical,
            borderRadius: size.borderRadius,
            gap: size.gap,
            backgroundColor: pressed ? palette.listItem.pressedBg : palette.listItem.bg,
          },
          style,
        ]}
        {...props}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.row,
        {
          minHeight: size.minHeight,
          paddingHorizontal: size.paddingHorizontal,
          paddingVertical: size.paddingVertical,
          borderRadius: size.borderRadius,
          gap: size.gap,
          backgroundColor: palette.listItem.bg,
        },
        style,
      ]}
      {...props}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  left: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: "Geist",
  },
  subtitle: {
    marginTop: 2,
    fontFamily: "Geist",
  },
  meta: {
    fontFamily: "Geist",
    marginLeft: 8,
  },
  right: {
    marginLeft: 8,
  },
});

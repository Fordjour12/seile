import React from "react";
import { Modal, ModalProps, Pressable, StyleSheet, Text, View } from "react-native";
import { ActionSheetTokens, UI_ELEMENT_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

interface ActionSheetOption {
  key: string;
  label: string;
  destructive?: boolean;
  onPress?: () => void;
}

interface ActionSheetProps extends Omit<ModalProps, "transparent"> {
  visible: boolean;
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  cancelLabel?: string;
  onCancel?: () => void;
}

export function ActionSheet({
  visible,
  title,
  message,
  options,
  cancelLabel = "Cancel",
  onCancel,
  ...props
}: ActionSheetProps) {
  const { colorScheme } = useColorScheme();
  const palette = colorScheme === "dark" ? UI_ELEMENT_THEME.dark : UI_ELEMENT_THEME.light;

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onCancel} {...props}>
      <View style={styles.root}>
        <Pressable style={[styles.overlay, { backgroundColor: palette.modal.overlay }]} onPress={onCancel} />
        <View
          style={[
            styles.sheet,
            {
              borderTopLeftRadius: ActionSheetTokens.sheet.borderTopLeftRadius,
              borderTopRightRadius: ActionSheetTokens.sheet.borderTopRightRadius,
              paddingHorizontal: ActionSheetTokens.sheet.paddingHorizontal,
              paddingTop: ActionSheetTokens.sheet.paddingTop,
              paddingBottom: ActionSheetTokens.sheet.paddingBottom,
              gap: ActionSheetTokens.sheet.gap,
              borderWidth: ActionSheetTokens.sheet.borderWidth,
              borderColor: palette.modal.border,
              backgroundColor: palette.modal.sheetBg,
            },
          ]}
        >
          {title ? <Text style={[styles.title, ActionSheetTokens.title, { color: palette.text.primary }]}>{title}</Text> : null}
          {message ? (
            <Text style={[styles.message, ActionSheetTokens.message, { color: palette.text.secondary }]}>{message}</Text>
          ) : null}

          {options.map((option) => (
            <Pressable
              key={option.key}
              onPress={option.onPress}
              style={({ pressed }) => [
                styles.option,
                {
                  minHeight: ActionSheetTokens.option.minHeight,
                  borderRadius: ActionSheetTokens.option.borderRadius,
                  paddingHorizontal: ActionSheetTokens.option.paddingHorizontal,
                  paddingVertical: ActionSheetTokens.option.paddingVertical,
                  backgroundColor: pressed ? palette.surface.muted : palette.surface.card,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  ActionSheetTokens.optionText,
                  { color: option.destructive ? palette.text.danger : palette.text.primary },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}

          <Pressable onPress={onCancel} style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
            <Text style={[styles.cancelText, ActionSheetTokens.cancelText, { color: palette.text.link }]}>
              {cancelLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {},
  title: {
    fontFamily: "Geist",
  },
  message: {
    fontFamily: "Geist",
  },
  option: {
    justifyContent: "center",
  },
  optionText: {
    fontFamily: "Geist",
  },
  cancel: {
    alignItems: "center",
    marginTop: 6,
    paddingVertical: 8,
  },
  cancelText: {
    fontFamily: "Geist",
  },
  pressed: {
    opacity: 0.8,
  },
});

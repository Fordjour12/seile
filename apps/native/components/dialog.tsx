import React from "react";
import { Modal, ModalProps, Pressable, StyleSheet, Text, View } from "react-native";
import { DialogTokens, UI_ELEMENT_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { Button } from "./button";

interface DialogProps extends Omit<ModalProps, "transparent"> {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  dismissible?: boolean;
  tone?: "default" | "destructive";
}

export function Dialog({
  visible,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  dismissible = true,
  tone = "default",
  ...props
}: DialogProps) {
  const { colorScheme } = useColorScheme();
  const palette = colorScheme === "dark" ? UI_ELEMENT_THEME.dark : UI_ELEMENT_THEME.light;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel} {...props}>
      <View style={styles.root}>
        <Pressable
          style={[styles.overlay, { backgroundColor: palette.dialog.overlay }]}
          onPress={dismissible ? onCancel : undefined}
        />
        <View
          style={[
            styles.content,
            {
              maxWidth: DialogTokens.container.maxWidth,
              borderRadius: DialogTokens.container.borderRadius,
              padding: DialogTokens.container.padding,
              gap: DialogTokens.container.gap,
              borderWidth: DialogTokens.container.borderWidth,
              borderColor: palette.dialog.border,
              backgroundColor: palette.dialog.background,
            },
          ]}
        >
          <Text style={[styles.title, DialogTokens.title, { color: palette.dialog.foreground }]}>{title}</Text>
          {description ? (
            <Text style={[styles.description, DialogTokens.description, { color: palette.text.secondary }]}>
              {description}
            </Text>
          ) : null}
          <View style={[styles.actions, { gap: DialogTokens.actions.gap }]}>
            <Button title={cancelLabel} variant="ghost" onPress={onCancel} />
            <Button
              title={confirmLabel}
              variant={tone === "destructive" ? "destructive" : "primary"}
              onPress={onConfirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    width: "100%",
  },
  title: {
    fontFamily: "Geist",
  },
  description: {
    fontFamily: "Geist",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
});

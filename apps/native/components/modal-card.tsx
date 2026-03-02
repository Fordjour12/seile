import React from "react";
import { Modal, ModalProps, Pressable, StyleSheet, Text, View } from "react-native";
import { ModalTokens, UI_ELEMENT_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { Button } from "./button";

interface ModalCardProps extends Omit<ModalProps, "transparent"> {
  visible: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  children?: React.ReactNode;
}

export function ModalCard({
  visible,
  title,
  description,
  onClose,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  children,
  ...props
}: ModalCardProps) {
  const { colorScheme } = useColorScheme();
  const palette = colorScheme === "dark" ? UI_ELEMENT_THEME.dark : UI_ELEMENT_THEME.light;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} {...props}>
      <View style={styles.root}>
        <Pressable style={[styles.overlay, { backgroundColor: palette.modal.overlay }]} onPress={onClose} />
        <View
          style={[
            styles.card,
            {
              borderRadius: ModalTokens.card.borderRadius,
              padding: ModalTokens.card.padding,
              gap: ModalTokens.card.gap,
              backgroundColor: palette.modal.sheetBg,
              borderColor: palette.modal.border,
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.title, ModalTokens.title, { color: palette.modal.sheetText }]}>{title}</Text>
          {description ? (
            <Text style={[styles.description, ModalTokens.description, { color: palette.text.secondary }]}>
              {description}
            </Text>
          ) : null}
          {children}
          <View style={styles.actions}>
            {secondaryActionLabel && onSecondaryAction ? (
              <Button title={secondaryActionLabel} onPress={onSecondaryAction} variant="ghost" />
            ) : null}
            {primaryActionLabel && onPrimaryAction ? (
              <Button title={primaryActionLabel} onPress={onPrimaryAction} variant="primary" />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: "100%",
    maxWidth: 420,
  },
  title: {
    fontFamily: "Geist",
  },
  description: {
    fontFamily: "Geist",
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: 4,
  },
});

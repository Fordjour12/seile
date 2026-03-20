import React, { useCallback, useEffect, useMemo, useRef } from "react";

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetSpringConfigs,
  type BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import { StyleSheet, Text, View } from "react-native";

import {
  AnimationTokens,
  BottomSheetTokens,
  NAV_THEME,
  UI_ELEMENT_THEME,
} from "@/lib/constants";
import { resolveThemeShadow } from "@/lib/constants/theme";
import { useColorScheme } from "@/lib/use-color-scheme";

interface AppBottomSheetProps
  extends Omit<BottomSheetModalProps, "snapPoints" | "children" | "backgroundStyle"> {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  snapPoints?: ReadonlyArray<string>;
  children?: React.ReactNode;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  snapPoints = BottomSheetTokens.modal.snapPoints,
  children,
  ...props
}: AppBottomSheetProps) {
  const modalRef = useRef<BottomSheetModal>(null);
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const palette = colorScheme === "dark" ? UI_ELEMENT_THEME.dark : UI_ELEMENT_THEME.light;
  const modalToken = BottomSheetTokens.modal;
  const handleToken = BottomSheetTokens.handle;

  const springConfig = useBottomSheetSpringConfigs(AnimationTokens.spring.standard);
  const normalizedSnapPoints = useMemo(() => [...snapPoints], [snapPoints]);

  useEffect(() => {
    if (visible) {
      modalRef.current?.present();
      return;
    }

    modalRef.current?.dismiss();
  }, [visible]);

  const handleDismiss = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (backdropProps: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={Number(theme.backdropOpacity)}
        pressBehavior="close"
      />
    ),
    [theme.backdropOpacity],
  );

  return (
    <BottomSheetModal
      ref={modalRef}
      animationConfigs={springConfig}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: palette.bottomSheet.background,
        borderColor: palette.bottomSheet.border,
        borderWidth: 1,
      }}
      enablePanDownToClose
      handleIndicatorStyle={{
        backgroundColor: palette.bottomSheet.handle,
        borderRadius: handleToken.borderRadius,
        height: handleToken.height,
        marginBottom: handleToken.marginBottom,
        marginTop: handleToken.marginTop,
        width: handleToken.width,
      }}
      onDismiss={handleDismiss}
      snapPoints={normalizedSnapPoints}
      style={{
        boxShadow: resolveThemeShadow(theme, modalToken.shadowLevel),
      }}
      {...props}
    >
      <BottomSheetView
        style={[
          styles.content,
          {
            gap: modalToken.gap,
            paddingBottom: modalToken.paddingBottom,
            paddingHorizontal: modalToken.paddingHorizontal,
            paddingTop: modalToken.paddingTop,
          },
        ]}
      >
        {(title || subtitle) ? (
          <View style={styles.header}>
            {title ? (
              <Text
                style={[
                  styles.title,
                  BottomSheetTokens.header.title,
                  { color: palette.bottomSheet.foreground },
                ]}
              >
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text
                style={[
                  styles.subtitle,
                  BottomSheetTokens.header.subtitle,
                  { color: palette.text.secondary },
                ]}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : null}
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {},
  header: {
    gap: 4,
  },
  title: {
    fontFamily: "Geist",
  },
  subtitle: {
    fontFamily: "Geist",
  },
});

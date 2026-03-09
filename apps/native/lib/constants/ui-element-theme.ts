import { NAV_THEME } from "./theme";
import type { ElementTheme, ThemeMode, ThemeScale } from "./types";

export function buildElementTheme(theme: ThemeScale): ElementTheme {
  return {
    text: {
      primary: theme.foreground,
      secondary: theme.mutedForeground,
      inverse: theme.primaryForeground,
      link: theme.primary,
      danger: theme.destructive,
    },
    surface: {
      background: theme.background,
      card: theme.card,
      popover: theme.popover,
      muted: theme.muted,
      sidebar: theme.sidebar,
    },
    button: {
      primaryBg: theme.primary,
      primaryText: theme.primaryForeground,
      secondaryBg: theme.secondary,
      secondaryText: theme.secondaryForeground,
      ghostBg: "transparent",
      ghostText: theme.foreground,
      dangerBg: theme.destructive,
      dangerText: theme.destructiveForeground,
      border: theme.border,
      ring: theme.ring,
    },
    card: {
      background: theme.card,
      foreground: theme.cardForeground,
      border: theme.border,
      mutedBackground: theme.muted,
      shadowColor: theme.shadowColor,
    },
    input: {
      background: theme.background,
      text: theme.foreground,
      placeholder: theme.mutedForeground,
      border: theme.input,
      focusRing: theme.ring,
      invalid: theme.destructive,
    },
    badge: {
      solidBg: theme.primary,
      solidText: theme.primaryForeground,
      subtleBg: theme.muted,
      subtleText: theme.mutedForeground,
      outlineBorder: theme.border,
      outlineText: theme.foreground,
      successBg: theme.chart2,
      warningBg: theme.chart4,
      dangerBg: theme.destructive,
    },
    chip: {
      bg: theme.muted,
      text: theme.foreground,
      border: theme.border,
      selectedBg: theme.primary,
      selectedText: theme.primaryForeground,
    },
    listItem: {
      bg: "transparent",
      text: theme.foreground,
      subtitle: theme.mutedForeground,
      border: theme.border,
      pressedBg: theme.muted,
    },
    modal: {
      overlay: `hsla(0, 0%, 0%, ${theme.backdropOpacity})`,
      sheetBg: theme.background,
      sheetText: theme.foreground,
      border: theme.border,
    },
    bottomSheet: {
      background: theme.card,
      foreground: theme.cardForeground,
      border: theme.border,
      handle: theme.mutedForeground,
      backdrop: `hsla(0, 0%, 0%, ${theme.backdropOpacity})`,
    },
    dialog: {
      background: theme.card,
      foreground: theme.cardForeground,
      border: theme.border,
      overlay: `hsla(0, 0%, 0%, ${theme.backdropOpacity})`,
    },
    alert: {
      infoBg: theme.card,
      infoText: theme.cardForeground,
      infoBorder: theme.border,
      successBg: theme.chart2,
      warningBg: theme.chart4,
      errorBg: theme.destructive,
      accentText: theme.primaryForeground,
    },
    banner: {
      infoBg: theme.muted,
      infoText: theme.foreground,
      infoBorder: theme.border,
      successBg: theme.chart2,
      warningBg: theme.chart4,
      errorBg: theme.destructive,
      accentText: theme.primaryForeground,
    },
    toast: {
      infoBg: theme.card,
      infoText: theme.cardForeground,
      successBg: theme.chart2,
      warningBg: theme.chart4,
      errorBg: theme.destructive,
      onAccent: theme.primaryForeground,
      border: theme.border,
    },
  };
}

export const UI_ELEMENT_THEME = {
  light: buildElementTheme(NAV_THEME.light),
  dark: buildElementTheme(NAV_THEME.dark),
} as const satisfies Record<ThemeMode, ElementTheme>;

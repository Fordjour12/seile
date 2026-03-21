import { NAV_THEME } from "@/lib/constants";

const { dark } = NAV_THEME;

export const AUTH_PALETTE = {
  screen: dark.background,
  surface: dark.popover,
  surfaceElevated: dark.card,
  surfaceAccent: dark.secondary,
  border: dark.border,
  borderStrong: dark.ring,
  text: dark.foreground,
  textMuted: dark.foreground,
  textSubtle: dark.mutedForeground,
  textFaint: dark.mutedForeground,
  primary: dark.primary,
  positive: dark.chart2,
  warning: dark.chart3,
  danger: dark.destructive,
  faith: dark.chart4,
  info: dark.chart1,
} as const;

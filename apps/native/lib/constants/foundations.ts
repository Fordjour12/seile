export const SHARED_TOKENS = {
  fontSans: "Figtree, ui-sans-serif, sans-serif, system-ui",
  fontSerif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  fontMono:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontDisplay: "Geist, ui-sans-serif, sans-serif, system-ui",

  fontFamilyBody: "Figtree, ui-sans-serif, sans-serif, system-ui",
  fontFamilyHeading: "Geist, ui-sans-serif, sans-serif, system-ui",
  fontFamilyCode:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',

  fontSizeXs: "0.75rem",
  fontSizeSm: "0.875rem",
  fontSizeMd: "1rem",
  fontSizeLg: "1.125rem",
  fontSizeXl: "1.25rem",
  fontSize2Xl: "1.5rem",
  fontSize3Xl: "1.875rem",
  fontSize4Xl: "2.25rem",

  textXs: "0.75rem",
  textSm: "0.875rem",
  textDefault: "1rem",
  textLg: "1.125rem",
  textXl: "1.25rem",
  text2Xl: "1.5rem",
  text3Xl: "1.875rem",

  fontWeightThin: "100",
  fontWeightExtraLight: "200",
  fontWeightLight: "300",
  fontWeightRegular: "400",
  fontWeightMedium: "500",
  fontWeightSemibold: "600",
  fontWeightBold: "700",
  fontWeightExtraBold: "800",
  fontWeightBlack: "900",

  textWeightDefault: "400",
  textWeightStrong: "600",
  textWeightHeading: "700",

  radius: "0.5rem",
  radiusXs: "0.25rem",
  radiusSm: "0.375rem",
  radiusMd: "0.5rem",
  radiusLg: "0.75rem",
  radiusXl: "1rem",
  radius2Xl: "1.25rem",
  radiusFull: "9999px",

  spacing: "0.25rem",
  space2Xs: "0.125rem",
  spaceXs: "0.25rem",
  spaceSm: "0.5rem",
  spaceMd: "0.75rem",
  spaceLg: "1rem",
  spaceXl: "1.5rem",
  space2Xl: "2rem",
  space3Xl: "3rem",

  trackingTight: "-0.01em",
  trackingNormal: "0em",
  trackingWide: "0.02em",

  lineHeightTight: "1.2",
  lineHeightNormal: "1.45",
  lineHeightRelaxed: "1.7",

  textLineHeightCaption: "1.35",
  textLineHeightBody: "1.5",
  textLineHeightHeading: "1.2",

  durationFast: "150ms",
  durationNormal: "240ms",
  durationSlow: "360ms",
  easingStandard: "cubic-bezier(0.2, 0, 0, 1)",
  easingEmphasized: "cubic-bezier(0.2, 0, 0, 1.2)",
  easingDecelerate: "cubic-bezier(0, 0, 0, 1)",
  easingAccelerate: "cubic-bezier(0.3, 0, 1, 1)",

  opacityDisabled: "0.45",
  opacityMuted: "0.72",
  backdropOpacity: "0.6",

  borderWidth: "1px",
  borderWidthThick: "2px",
  focusRingWidth: "2px",
  focusRingOffset: "2px",

  zBase: "0",
  zDropdown: "1000",
  zSticky: "1100",
  zOverlay: "1200",
  zModal: "1300",
  zToast: "1400",
} as const;

export const LIGHT_ELEVATION_TOKENS = {
  shadowX: "0px",
  shadowY: "6px",
  shadowBlur: "16px",
  shadowSpread: "0px",
  shadowOpacity: "0.12",
  shadowColor: "#2d2d53",
  shadow2Xs: "0px 1px 2px 0px hsla(240, 29.6875%, 25.0980%, 0.05)",
  shadowXs: "0px 2px 4px 0px hsla(240, 29.6875%, 25.0980%, 0.08)",
  shadowSm:
    "0px 4px 8px 0px hsla(240, 29.6875%, 25.0980%, 0.1), 0px 1px 2px -1px hsla(240, 29.6875%, 25.0980%, 0.08)",
  shadow:
    "0px 6px 12px 0px hsla(240, 29.6875%, 25.0980%, 0.12), 0px 2px 4px -1px hsla(240, 29.6875%, 25.0980%, 0.1)",
  shadowMd:
    "0px 10px 20px 0px hsla(240, 29.6875%, 25.0980%, 0.14), 0px 4px 8px -2px hsla(240, 29.6875%, 25.0980%, 0.12)",
  shadowLg:
    "0px 14px 28px 0px hsla(240, 29.6875%, 25.0980%, 0.16), 0px 6px 12px -4px hsla(240, 29.6875%, 25.0980%, 0.12)",
  shadowXl:
    "0px 20px 36px 0px hsla(240, 29.6875%, 25.0980%, 0.2), 0px 10px 18px -6px hsla(240, 29.6875%, 25.0980%, 0.14)",
  shadow2Xl: "0px 28px 56px 0px hsla(240, 29.6875%, 25.0980%, 0.26)",
} as const;

export const DARK_ELEVATION_TOKENS = {
  shadowX: "0px",
  shadowY: "8px",
  shadowBlur: "20px",
  shadowSpread: "0px",
  shadowOpacity: "0.25",
  shadowColor: "#090911",
  shadow2Xs: "0px 2px 6px 0px hsla(240, 30.7692%, 5.0980%, 0.14)",
  shadowXs: "0px 4px 10px 0px hsla(240, 30.7692%, 5.0980%, 0.18)",
  shadowSm:
    "0px 6px 14px 0px hsla(240, 30.7692%, 5.0980%, 0.22), 0px 1px 2px -1px hsla(240, 30.7692%, 5.0980%, 0.18)",
  shadow:
    "0px 8px 18px 0px hsla(240, 30.7692%, 5.0980%, 0.26), 0px 2px 4px -1px hsla(240, 30.7692%, 5.0980%, 0.2)",
  shadowMd:
    "0px 12px 26px 0px hsla(240, 30.7692%, 5.0980%, 0.32), 0px 4px 8px -2px hsla(240, 30.7692%, 5.0980%, 0.24)",
  shadowLg:
    "0px 16px 34px 0px hsla(240, 30.7692%, 5.0980%, 0.38), 0px 6px 12px -4px hsla(240, 30.7692%, 5.0980%, 0.26)",
  shadowXl:
    "0px 22px 44px 0px hsla(240, 30.7692%, 5.0980%, 0.44), 0px 10px 16px -6px hsla(240, 30.7692%, 5.0980%, 0.3)",
  shadow2Xl: "0px 30px 62px 0px hsla(240, 30.7692%, 5.0980%, 0.52)",
} as const;

export const UI_PRESETS = {
  radius: {
    sm: 10,
    md: 12,
    lg: 14,
    xl: 16,
    xxl: 18,
    full: 999,
    modal: 24,
  },
  spacing: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 10,
    xl: 12,
    xxl: 14,
    xxxl: 16,
    section: 20,
    screen: 24,
    "4xl": 38,
  },
  size: {
    controlSm: 40,
    controlMd: 44,
    controlLg: 48,
    input: 46,
    listItem: 56,
    listItemCompact: 44,
    iconTouch: 40,
    avatarXs: 24,
    avatarSm: 32,
    avatarMd: 40,
    avatarLg: 56,
    avatarXl: 72,
  },
  opacity: {
    disabled: 0.45,
    muted: 0.72,
    pressed: 0.84,
    backdrop: 0.6,
  },
} as const;

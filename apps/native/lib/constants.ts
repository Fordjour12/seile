const SHARED_TOKENS = {
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

  // Semantic text tokens for faster UI authoring.
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
};

const LIGHT_ELEVATION_TOKENS = {
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
};

const DARK_ELEVATION_TOKENS = {
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
};

const textBase = {
  fontFamily: "Figtree",
  fontWeight: "400" as const,
  letterSpacing: 0,
};

const headingBase = {
  fontFamily: "Geist",
  fontWeight: "700" as const,
  letterSpacing: 0,
};

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

export const Typography = {
  eyebrow: {
    ...textBase,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: "uppercase" as const,
  },

  displayXL: {
    ...headingBase,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.4,
  },
  displayLG: {
    ...headingBase,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  displayMD: {
    ...headingBase,
    fontWeight: "600" as const,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  displaySM: {
    ...headingBase,
    fontWeight: "600" as const,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.15,
  },

  titleLG: {
    ...headingBase,
    fontWeight: "600" as const,
    fontSize: 20,
    lineHeight: 27,
  },
  titleMD: {
    ...headingBase,
    fontWeight: "600" as const,
    fontSize: 18,
    lineHeight: 24,
  },
  titleSM: {
    ...headingBase,
    fontWeight: "600" as const,
    fontSize: 16,
    lineHeight: 22,
  },

  labelLG: {
    ...textBase,
    fontWeight: "500" as const,
    fontSize: 16,
    lineHeight: 22,
  },
  labelMD: {
    ...textBase,
    fontWeight: "500" as const,
    fontSize: 14,
    lineHeight: 20,
  },
  labelSM: {
    ...textBase,
    fontWeight: "500" as const,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  labelXS: {
    ...textBase,
    fontWeight: "500" as const,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.24,
    textTransform: "uppercase" as const,
  },

  bodyLG: {
    ...textBase,
    fontSize: 17,
    lineHeight: 25,
  },
  bodyMD: {
    ...textBase,
    fontSize: 15,
    lineHeight: 22,
  },
  bodySM: {
    ...textBase,
    fontSize: 13,
    lineHeight: 19,
  },
  bodyXS: {
    ...textBase,
    fontSize: 11,
    lineHeight: 16,
  },

  captionLG: {
    ...textBase,
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.1,
  },
  captionSM: {
    ...textBase,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.12,
  },

  buttonLG: {
    ...textBase,
    fontWeight: "600" as const,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  buttonMD: {
    ...textBase,
    fontWeight: "600" as const,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  buttonSM: {
    ...textBase,
    fontWeight: "600" as const,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.12,
  },

  linkMD: {
    ...textBase,
    fontWeight: "500" as const,
    fontSize: 14,
    lineHeight: 20,
    textDecorationLine: "underline" as const,
  },
  linkSM: {
    ...textBase,
    fontWeight: "500" as const,
    fontSize: 12,
    lineHeight: 17,
    textDecorationLine: "underline" as const,
  },

  codeMD: {
    ...textBase,
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 19,
  },
  codeSM: {
    ...textBase,
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: 16,
  },

  numericLG: {
    ...textBase,
    fontWeight: "600" as const,
    fontSize: 20,
    lineHeight: 27,
    fontVariant: ["tabular-nums"] as const,
  },
  numericMD: {
    ...textBase,
    fontWeight: "600" as const,
    fontSize: 16,
    lineHeight: 22,
    fontVariant: ["tabular-nums"] as const,
  },
  numericSM: {
    ...textBase,
    fontWeight: "500" as const,
    fontSize: 13,
    lineHeight: 19,
    fontVariant: ["tabular-nums"] as const,
  },
} as const;

export const ButtonTokens = {
  base: {
    borderRadius: UI_PRESETS.radius.md,
    borderCurve: "continuous" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexDirection: "row" as const,
    gap: UI_PRESETS.spacing.md,
  },

  primary: {
    minHeight: UI_PRESETS.size.controlLg,
    paddingHorizontal: UI_PRESETS.spacing.xxxl,
    paddingVertical: UI_PRESETS.spacing.xl,
    text: Typography.buttonMD,
  },
  secondary: {
    minHeight: UI_PRESETS.size.controlMd,
    paddingHorizontal: UI_PRESETS.spacing.xxl,
    paddingVertical: UI_PRESETS.spacing.lg,
    text: Typography.buttonMD,
  },
  ghost: {
    minHeight: UI_PRESETS.size.controlSm,
    paddingHorizontal: UI_PRESETS.spacing.xl,
    paddingVertical: UI_PRESETS.spacing.md,
    text: Typography.buttonSM,
  },

  icon: {
    sm: {
      width: UI_PRESETS.size.avatarSm,
      height: UI_PRESETS.size.avatarSm,
      borderRadius: UI_PRESETS.radius.sm,
    },
    md: {
      width: UI_PRESETS.size.iconTouch,
      height: UI_PRESETS.size.iconTouch,
      borderRadius: UI_PRESETS.radius.md,
    },
    lg: {
      width: UI_PRESETS.size.controlLg,
      height: UI_PRESETS.size.controlLg,
      borderRadius: UI_PRESETS.radius.lg,
    },
  },

  state: {
    disabledOpacity: UI_PRESETS.opacity.disabled,
    pressedOpacity: UI_PRESETS.opacity.pressed,
    loadingOpacity: UI_PRESETS.opacity.muted,
  },
} as const;

export const CardTokens = {
  base: {
    borderRadius: UI_PRESETS.radius.xl,
    borderCurve: "continuous" as const,
    padding: UI_PRESETS.spacing.xxxl,
    gap: UI_PRESETS.spacing.xl,
  },

  elevated: {
    borderWidth: 0,
    shadowLevel: "shadowMd",
  },
  outlined: {
    borderWidth: 1,
    shadowLevel: "shadow2Xs",
  },
  filled: {
    borderWidth: 0,
    shadowLevel: "shadowSm",
  },

  compact: {
    padding: UI_PRESETS.spacing.xl,
    gap: UI_PRESETS.spacing.md,
    borderRadius: UI_PRESETS.radius.md,
  },
  cozy: {
    padding: UI_PRESETS.spacing.xxxl,
    gap: UI_PRESETS.spacing.xl,
    borderRadius: UI_PRESETS.radius.xl,
  },
  spacious: {
    padding: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.xxl,
    borderRadius: UI_PRESETS.radius.xxl,
  },

  media: {
    sm: { height: 120, borderRadius: UI_PRESETS.radius.sm },
    md: { height: 160, borderRadius: UI_PRESETS.radius.md },
    lg: { height: 220, borderRadius: UI_PRESETS.radius.lg },
  },
} as const;

export const InputTokens = {
  field: {
    minHeight: UI_PRESETS.size.input,
    paddingHorizontal: UI_PRESETS.spacing.xl,
    paddingVertical: UI_PRESETS.spacing.lg,
    borderRadius: UI_PRESETS.radius.md,
    borderCurve: "continuous" as const,
    borderWidth: 1,
  },
  label: Typography.labelMD,
  helper: Typography.captionLG,
  error: Typography.captionLG,
} as const;

export const ListItemTokens = {
  base: {
    minHeight: UI_PRESETS.size.listItem,
    paddingHorizontal: UI_PRESETS.spacing.xxxl,
    paddingVertical: UI_PRESETS.spacing.xl,
    gap: UI_PRESETS.spacing.xl,
    borderRadius: UI_PRESETS.radius.md,
    borderCurve: "continuous" as const,
  },
  compact: {
    minHeight: UI_PRESETS.size.listItemCompact,
    paddingHorizontal: UI_PRESETS.spacing.xl,
    paddingVertical: UI_PRESETS.spacing.md,
    gap: UI_PRESETS.spacing.lg,
    borderRadius: UI_PRESETS.radius.sm,
  },
  title: Typography.bodyMD,
  subtitle: Typography.bodySM,
  meta: Typography.captionLG,
} as const;

export const BadgeTokens = {
  base: {
    borderRadius: UI_PRESETS.radius.full,
    borderCurve: "continuous" as const,
    paddingHorizontal: UI_PRESETS.spacing.md,
    paddingVertical: UI_PRESETS.spacing.xs,
    minHeight: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  solid: {
    text: Typography.labelSM,
  },
  subtle: {
    text: Typography.labelSM,
  },
  outline: {
    borderWidth: 1,
    text: Typography.labelSM,
  },
  dot: {
    size: 8,
  },
} as const;

export const ChipTokens = {
  base: {
    minHeight: 32,
    paddingHorizontal: UI_PRESETS.spacing.lg,
    paddingVertical: UI_PRESETS.spacing.sm,
    borderRadius: UI_PRESETS.radius.full,
    borderCurve: "continuous" as const,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: UI_PRESETS.spacing.sm,
  },
  compact: {
    minHeight: 28,
    paddingHorizontal: UI_PRESETS.spacing.md,
    paddingVertical: 4,
  },
  text: Typography.labelSM,
  selected: {
    borderWidth: 1,
  },
  unselected: {
    borderWidth: 1,
  },
} as const;

export const ModalTokens = {
  overlay: {
    opacity: UI_PRESETS.opacity.backdrop,
  },
  sheet: {
    borderTopLeftRadius: UI_PRESETS.radius.modal,
    borderTopRightRadius: UI_PRESETS.radius.modal,
    borderCurve: "continuous" as const,
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: UI_PRESETS.spacing.xxxl,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.xxl,
    shadowLevel: "shadowXl",
  },
  card: {
    borderRadius: CardTokens.base.borderRadius,
    borderCurve: "continuous" as const,
    padding: CardTokens.base.padding,
    gap: CardTokens.base.gap,
    shadowLevel: "shadowLg",
  },
  title: Typography.titleLG,
  description: Typography.bodySM,
  actionPrimary: ButtonTokens.primary,
  actionSecondary: ButtonTokens.secondary,
} as const;

export const HeaderTokens = {
  screen: {
    minHeight: 56,
    paddingHorizontal: UI_PRESETS.spacing.xxxl,
    paddingVertical: UI_PRESETS.spacing.lg,
    gap: UI_PRESETS.spacing.md,
  },
  title: Typography.titleMD,
  subtitle: Typography.captionLG,
  actionLabel: Typography.labelMD,
  actionIcon: {
    size: 20,
    touchTarget: UI_PRESETS.size.iconTouch,
  },
} as const;

export const AvatarTokens = {
  xs: {
    size: UI_PRESETS.size.avatarXs,
    radius: UI_PRESETS.size.avatarXs / 2,
    text: Typography.labelXS,
  },
  sm: {
    size: UI_PRESETS.size.avatarSm,
    radius: UI_PRESETS.size.avatarSm / 2,
    text: Typography.labelSM,
  },
  md: {
    size: UI_PRESETS.size.avatarMd,
    radius: UI_PRESETS.size.avatarMd / 2,
    text: Typography.labelMD,
  },
  lg: {
    size: UI_PRESETS.size.avatarLg,
    radius: UI_PRESETS.size.avatarLg / 2,
    text: Typography.labelLG,
  },
  xl: {
    size: UI_PRESETS.size.avatarXl,
    radius: UI_PRESETS.size.avatarXl / 2,
    text: Typography.titleSM,
  },
  ring: {
    width: 2,
    offset: 2,
  },
} as const;

export const ToastTokens = {
  container: {
    minHeight: 52,
    borderRadius: UI_PRESETS.radius.lg,
    borderCurve: "continuous" as const,
    paddingHorizontal: UI_PRESETS.spacing.xl,
    paddingVertical: UI_PRESETS.spacing.lg,
    gap: UI_PRESETS.spacing.md,
    shadowLevel: "shadowLg",
  },
  title: Typography.labelMD,
  message: Typography.bodySM,
  action: Typography.labelSM,
  icon: {
    size: 18,
  },
} as const;

export const EmptyStateTokens = {
  container: {
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingVertical: UI_PRESETS.spacing.screen,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: UI_PRESETS.spacing.lg,
  },
  icon: {
    size: 40,
  },
  title: Typography.titleSM,
  message: Typography.bodySM,
  cta: ButtonTokens.secondary,
} as const;

export const DialogTokens = {
  overlay: {
    opacity: UI_PRESETS.opacity.backdrop,
  },
  container: {
    maxWidth: 420,
    borderRadius: CardTokens.base.borderRadius,
    borderCurve: "continuous" as const,
    padding: CardTokens.base.padding,
    gap: CardTokens.base.gap,
    borderWidth: 1,
    shadowLevel: "shadowXl",
  },
  title: Typography.titleLG,
  description: Typography.bodySM,
  actions: {
    gap: UI_PRESETS.spacing.md,
    justifyContent: "flex-end" as const,
  },
  actionPrimary: ButtonTokens.primary,
  actionSecondary: ButtonTokens.secondary,
} as const;

export const AlertTokens = {
  container: {
    borderRadius: UI_PRESETS.radius.md,
    borderCurve: "continuous" as const,
    paddingHorizontal: UI_PRESETS.spacing.xl,
    paddingVertical: UI_PRESETS.spacing.lg,
    gap: UI_PRESETS.spacing.md,
    borderWidth: 1,
  },
  title: Typography.labelMD,
  message: Typography.bodySM,
  action: Typography.labelSM,
  icon: {
    size: 16,
  },
} as const;

export const BannerTokens = {
  container: {
    minHeight: UI_PRESETS.size.listItem,
    borderRadius: UI_PRESETS.radius.lg,
    borderCurve: "continuous" as const,
    paddingHorizontal: UI_PRESETS.spacing.xl,
    paddingVertical: UI_PRESETS.spacing.lg,
    gap: UI_PRESETS.spacing.md,
    borderWidth: 1,
  },
  title: Typography.labelMD,
  message: Typography.bodySM,
  action: Typography.labelSM,
  icon: {
    size: 18,
  },
} as const;

export const ActionSheetTokens = {
  overlay: ModalTokens.overlay,
  sheet: {
    borderTopLeftRadius: ModalTokens.sheet.borderTopLeftRadius,
    borderTopRightRadius: ModalTokens.sheet.borderTopRightRadius,
    borderCurve: "continuous" as const,
    paddingHorizontal: ModalTokens.sheet.paddingHorizontal,
    paddingTop: ModalTokens.sheet.paddingTop,
    paddingBottom: ModalTokens.sheet.paddingBottom,
    gap: ModalTokens.sheet.gap,
    borderWidth: 1,
  },
  title: Typography.titleSM,
  message: Typography.bodySM,
  option: {
    minHeight: UI_PRESETS.size.controlMd,
    borderRadius: UI_PRESETS.radius.md,
    paddingHorizontal: UI_PRESETS.spacing.xl,
    paddingVertical: UI_PRESETS.spacing.lg,
  },
  optionText: Typography.bodyMD,
  cancelText: Typography.labelMD,
} as const;

export const AnimationTokens = {
  duration: {
    instant: 100,
    fast: 160,
    standard: 240,
    slow: 360,
    slower: 480,
  },
  spring: {
    snappy: {
      damping: 22,
      stiffness: 320,
      mass: 0.9,
      overshootClamping: false,
      restDisplacementThreshold: 0.1,
      restSpeedThreshold: 0.1,
    },
    standard: {
      damping: 26,
      stiffness: 280,
      mass: 1,
      overshootClamping: false,
      restDisplacementThreshold: 0.1,
      restSpeedThreshold: 0.1,
    },
    gentle: {
      damping: 32,
      stiffness: 220,
      mass: 1.05,
      overshootClamping: false,
      restDisplacementThreshold: 0.1,
      restSpeedThreshold: 0.1,
    },
  },
  timing: {
    easeOut: SHARED_TOKENS.easingDecelerate,
    easeInOut: SHARED_TOKENS.easingStandard,
    emphasize: SHARED_TOKENS.easingEmphasized,
  },
} as const;

export const BottomSheetTokens = {
  modal: {
    snapPoints: ["28%", "55%", "86%"] as const,
    borderRadius: UI_PRESETS.radius.modal,
    borderCurve: "continuous" as const,
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: UI_PRESETS.spacing.xl,
    paddingBottom: UI_PRESETS.spacing.screen,
    gap: UI_PRESETS.spacing.xl,
    shadowLevel: "shadowXl",
  },
  detached: {
    snapPoints: ["32%", "62%"] as const,
    bottomInset: UI_PRESETS.spacing.section,
    sideInset: UI_PRESETS.spacing.xxxl,
    borderRadius: UI_PRESETS.radius.modal,
    borderCurve: "continuous" as const,
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingTop: UI_PRESETS.spacing.xl,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.xl,
    shadowLevel: "shadow2Xl",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: UI_PRESETS.radius.full,
    marginTop: UI_PRESETS.spacing.sm,
    marginBottom: UI_PRESETS.spacing.sm,
  },
  header: {
    title: Typography.titleSM,
    subtitle: Typography.bodySM,
  },
} as const;

export const NAV_THEME = {
  light: {
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(235.5556, 14.7541%, 35.8824%)",
    text: "hsl(235.5556, 14.7541%, 35.8824%)",
    card: "hsl(0, 0%, 100%)",
    cardForeground: "hsl(235.5556, 14.7541%, 35.8824%)",
    popover: "hsl(222.0000, 11.3636%, 82.7451%)",
    popoverForeground: "hsl(235.5556, 14.7541%, 35.8824%)",
    primary: "hsl(266.0440, 85.0467%, 58.0392%)",
    primaryForeground: "hsl(0, 0%, 100%)",
    secondary: "hsl(222.0000, 11.3636%, 82.7451%)",
    secondaryForeground: "hsl(235.5556, 14.7541%, 35.8824%)",
    muted: "hsl(222.0000, 17.8571%, 89.0196%)",
    mutedForeground: "hsl(231.8182, 9.1667%, 47.0588%)",
    accent: "hsl(270, 59.2593%, 57.6471%)",
    accentForeground: "hsl(0, 0%, 100%)",
    destructive: "hsl(347.0769, 86.6667%, 44.1176%)",
    destructiveForeground: "hsl(0, 0%, 100%)",
    border: "hsl(223.3333, 15.5172%, 77.2549%)",
    input: "hsl(222.0000, 11.3636%, 82.7451%)",
    ring: "hsl(266.0440, 85.0467%, 58.0392%)",
    notification: "hsl(347.0769, 86.6667%, 44.1176%)",
    chart1: "hsl(17.8776, 100%, 48.0392%)",
    chart2: "hsl(174.8000, 100%, 29.4118%)",
    chart3: "hsl(195.7143, 72.4138%, 22.7451%)",
    chart4: "hsl(43.5294, 100%, 50%)",
    chart5: "hsl(36.3780, 100%, 49.8039%)",
    sidebar: "hsl(218.1818, 25.5814%, 91.5686%)",
    sidebarForeground: "hsl(235.5556, 14.7541%, 35.8824%)",
    sidebarPrimary: "hsl(266.0440, 85.0467%, 58.0392%)",
    sidebarPrimaryForeground: "hsl(0, 0%, 100%)",
    sidebarAccent: "hsl(270, 59.2593%, 57.6471%)",
    sidebarAccentForeground: "hsl(0, 0%, 100%)",
    sidebarBorder: "hsl(223.3333, 15.5172%, 77.2549%)",
    sidebarRing: "hsl(266.0440, 85.0467%, 58.0392%)",
    ...SHARED_TOKENS,
    ...LIGHT_ELEVATION_TOKENS,
  },

  dark: {
    background: "hsl(240, 22.7273%, 8.6275%)",
    foreground: "hsl(226.1538, 63.9344%, 88.0392%)",
    text: "hsl(226.1538, 63.9344%, 88.0392%)",
    card: "hsl(240, 22.7273%, 8.6275%)",
    cardForeground: "hsl(226.1538, 63.9344%, 88.0392%)",
    popover: "hsl(240, 21.3115%, 11.9608%)",
    popoverForeground: "hsl(226.1538, 63.9344%, 88.0392%)",
    primary: "hsl(267.4074, 83.5052%, 80.9804%)",
    primaryForeground: "hsl(240, 22.7273%, 8.6275%)",
    secondary: "hsl(236.8421, 16.2393%, 22.9412%)",
    secondaryForeground: "hsl(226.1538, 63.9344%, 88.0392%)",
    muted: "hsl(236.8421, 16.2393%, 22.9412%)",
    mutedForeground: "hsl(227.6471, 23.6111%, 71.7647%)",
    accent: "hsl(231.8919, 97.3684%, 85.0980%)",
    accentForeground: "hsl(240, 22.7273%, 8.6275%)",
    destructive: "hsl(343.2692, 81.2500%, 74.9020%)",
    destructiveForeground: "hsl(240, 22.7273%, 8.6275%)",
    border: "hsl(234.2857, 13.2075%, 31.1765%)",
    input: "hsl(236.8421, 16.2393%, 22.9412%)",
    ring: "hsl(267.4074, 83.5052%, 80.9804%)",
    notification: "hsl(343.2692, 81.2500%, 74.9020%)",
    chart1: "hsl(225.4286, 84.0000%, 49.0196%)",
    chart2: "hsl(159.8936, 100%, 36.8627%)",
    chart3: "hsl(36.3780, 100%, 49.8039%)",
    chart4: "hsl(273.4054, 100.0000%, 63.7255%)",
    chart5: "hsl(345.4709, 100%, 56.2745%)",
    sidebar: "hsl(240, 22.7273%, 8.6275%)",
    sidebarForeground: "hsl(226.1538, 63.9344%, 88.0392%)",
    sidebarPrimary: "hsl(267.4074, 83.5052%, 80.9804%)",
    sidebarPrimaryForeground: "hsl(240, 22.7273%, 8.6275%)",
    sidebarAccent: "hsl(231.8919, 97.3684%, 85.0980%)",
    sidebarAccentForeground: "hsl(240, 22.7273%, 8.6275%)",
    sidebarBorder: "hsl(234.2857, 13.2075%, 31.1765%)",
    sidebarRing: "hsl(267.4074, 83.5052%, 80.9804%)",
    ...SHARED_TOKENS,
    ...DARK_ELEVATION_TOKENS,
  },
};

const buildElementTheme = (theme: Record<string, string>) => ({
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
});

export const UI_ELEMENT_THEME = {
  light: buildElementTheme(NAV_THEME.light),
  dark: buildElementTheme(NAV_THEME.dark),
} as const;

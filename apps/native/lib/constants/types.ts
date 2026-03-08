export type ThemeMode = "light" | "dark";

export type TextTransformToken = "none" | "uppercase" | "lowercase" | "capitalize";
export type TextDecorationLineToken =
  | "none"
  | "underline"
  | "line-through"
  | "underline line-through";
export type FontVariantToken =
  | "small-caps"
  | "oldstyle-nums"
  | "lining-nums"
  | "tabular-nums"
  | "proportional-nums";

export type FontWeightToken =
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";

export interface SharedThemeTokens {
  fontSans: string;
  fontSerif: string;
  fontMono: string;
  fontDisplay: string;
  fontFamilyBody: string;
  fontFamilyHeading: string;
  fontFamilyCode: string;
  fontSizeXs: string;
  fontSizeSm: string;
  fontSizeMd: string;
  fontSizeLg: string;
  fontSizeXl: string;
  fontSize2Xl: string;
  fontSize3Xl: string;
  fontSize4Xl: string;
  textXs: string;
  textSm: string;
  textDefault: string;
  textLg: string;
  textXl: string;
  text2Xl: string;
  text3Xl: string;
  fontWeightThin: FontWeightToken;
  fontWeightExtraLight: FontWeightToken;
  fontWeightLight: FontWeightToken;
  fontWeightRegular: FontWeightToken;
  fontWeightMedium: FontWeightToken;
  fontWeightSemibold: FontWeightToken;
  fontWeightBold: FontWeightToken;
  fontWeightExtraBold: FontWeightToken;
  fontWeightBlack: FontWeightToken;
  textWeightDefault: FontWeightToken;
  textWeightStrong: FontWeightToken;
  textWeightHeading: FontWeightToken;
  radius: string;
  radiusXs: string;
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  radiusXl: string;
  radius2Xl: string;
  radiusFull: string;
  spacing: string;
  space2Xs: string;
  spaceXs: string;
  spaceSm: string;
  spaceMd: string;
  spaceLg: string;
  spaceXl: string;
  space2Xl: string;
  space3Xl: string;
  trackingTight: string;
  trackingNormal: string;
  trackingWide: string;
  lineHeightTight: string;
  lineHeightNormal: string;
  lineHeightRelaxed: string;
  textLineHeightCaption: string;
  textLineHeightBody: string;
  textLineHeightHeading: string;
  durationFast: string;
  durationNormal: string;
  durationSlow: string;
  easingStandard: string;
  easingEmphasized: string;
  easingDecelerate: string;
  easingAccelerate: string;
  opacityDisabled: string;
  opacityMuted: string;
  backdropOpacity: string;
  borderWidth: string;
  borderWidthThick: string;
  focusRingWidth: string;
  focusRingOffset: string;
  zBase: string;
  zDropdown: string;
  zSticky: string;
  zOverlay: string;
  zModal: string;
  zToast: string;
}

export interface ElevationTokens {
  shadowX: string;
  shadowY: string;
  shadowBlur: string;
  shadowSpread: string;
  shadowOpacity: string;
  shadowColor: string;
  shadow2Xs: string;
  shadowXs: string;
  shadowSm: string;
  shadow: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
  shadow2Xl: string;
}

export type ShadowLevel =
  | "shadow2Xs"
  | "shadowXs"
  | "shadowSm"
  | "shadow"
  | "shadowMd"
  | "shadowLg"
  | "shadowXl"
  | "shadow2Xl";

export interface ThemeScale extends SharedThemeTokens, ElevationTokens {
  background: string;
  foreground: string;
  text: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  notification: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

export interface UIPresetsContract {
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    full: number;
    modal: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
    section: number;
    screen: number;
    "4xl": number;
  };
  size: {
    controlSm: number;
    controlMd: number;
    controlLg: number;
    input: number;
    listItem: number;
    listItemCompact: number;
    iconTouch: number;
    avatarXs: number;
    avatarSm: number;
    avatarMd: number;
    avatarLg: number;
    avatarXl: number;
  };
  opacity: {
    disabled: number;
    muted: number;
    pressed: number;
    backdrop: number;
  };
}

export interface TypographyToken {
  fontFamily: string;
  fontWeight: FontWeightToken;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: TextTransformToken;
  textDecorationLine?: TextDecorationLineToken;
  fontVariant?: ReadonlyArray<FontVariantToken>;
}

export interface TypographyContract {
  eyebrow: TypographyToken;
  displayXL: TypographyToken;
  displayLG: TypographyToken;
  displayMD: TypographyToken;
  displaySM: TypographyToken;
  titleLG: TypographyToken;
  titleMD: TypographyToken;
  titleSM: TypographyToken;
  labelLG: TypographyToken;
  labelMD: TypographyToken;
  labelSM: TypographyToken;
  labelXS: TypographyToken;
  bodyLG: TypographyToken;
  bodyMD: TypographyToken;
  bodySM: TypographyToken;
  bodyXS: TypographyToken;
  captionLG: TypographyToken;
  captionSM: TypographyToken;
  buttonLG: TypographyToken;
  buttonMD: TypographyToken;
  buttonSM: TypographyToken;
  linkMD: TypographyToken;
  linkSM: TypographyToken;
  codeMD: TypographyToken;
  codeSM: TypographyToken;
  numericLG: TypographyToken;
  numericMD: TypographyToken;
  numericSM: TypographyToken;
}

export interface ButtonVariantToken {
  minHeight: number;
  paddingHorizontal: number;
  paddingVertical: number;
  text: TypographyToken;
}

export interface ButtonTokensContract {
  base: {
    borderRadius: number;
    borderCurve: "continuous";
    alignItems: "center";
    justifyContent: "center";
    flexDirection: "row";
    gap: number;
  };
  primary: ButtonVariantToken;
  secondary: ButtonVariantToken;
  ghost: ButtonVariantToken;
  icon: {
    sm: { width: number; height: number; borderRadius: number };
    md: { width: number; height: number; borderRadius: number };
    lg: { width: number; height: number; borderRadius: number };
  };
  state: {
    disabledOpacity: number;
    pressedOpacity: number;
    loadingOpacity: number;
  };
}

export interface CardTokensContract {
  base: {
    borderRadius: number;
    borderCurve: "continuous";
    padding: number;
    gap: number;
  };
  elevated: {
    borderWidth: number;
    shadowLevel: ShadowLevel;
  };
  outlined: {
    borderWidth: number;
    shadowLevel: ShadowLevel;
  };
  filled: {
    borderWidth: number;
    shadowLevel: ShadowLevel;
  };
  compact: {
    padding: number;
    gap: number;
    borderRadius: number;
  };
  cozy: {
    padding: number;
    gap: number;
    borderRadius: number;
  };
  spacious: {
    padding: number;
    gap: number;
    borderRadius: number;
  };
  media: {
    sm: { height: number; borderRadius: number };
    md: { height: number; borderRadius: number };
    lg: { height: number; borderRadius: number };
  };
}

export interface InputTokensContract {
  field: {
    minHeight: number;
    paddingHorizontal: number;
    paddingVertical: number;
    borderRadius: number;
    borderCurve: "continuous";
    borderWidth: number;
  };
  label: TypographyToken;
  helper: TypographyToken;
  error: TypographyToken;
}

export interface ListItemTokensContract {
  base: {
    minHeight: number;
    paddingHorizontal: number;
    paddingVertical: number;
    gap: number;
    borderRadius: number;
    borderCurve: "continuous";
  };
  compact: {
    minHeight: number;
    paddingHorizontal: number;
    paddingVertical: number;
    gap: number;
    borderRadius: number;
  };
  title: TypographyToken;
  subtitle: TypographyToken;
  meta: TypographyToken;
}

export interface BadgeTokensContract {
  base: {
    borderRadius: number;
    borderCurve: "continuous";
    paddingHorizontal: number;
    paddingVertical: number;
    minHeight: number;
    alignItems: "center";
    justifyContent: "center";
  };
  solid: {
    text: TypographyToken;
  };
  subtle: {
    text: TypographyToken;
  };
  outline: {
    borderWidth: number;
    text: TypographyToken;
  };
  dot: {
    size: number;
  };
}

export interface ChipTokensContract {
  base: {
    minHeight: number;
    paddingHorizontal: number;
    paddingVertical: number;
    borderRadius: number;
    borderCurve: "continuous";
    flexDirection: "row";
    alignItems: "center";
    gap: number;
  };
  compact: {
    minHeight: number;
    paddingHorizontal: number;
    paddingVertical: number;
  };
  text: TypographyToken;
  selected: {
    borderWidth: number;
  };
  unselected: {
    borderWidth: number;
  };
}

export interface ModalTokensContract {
  overlay: {
    opacity: number;
  };
  sheet: {
    borderTopLeftRadius: number;
    borderTopRightRadius: number;
    borderCurve: "continuous";
    paddingHorizontal: number;
    paddingTop: number;
    paddingBottom: number;
    gap: number;
    shadowLevel: ShadowLevel;
  };
  card: {
    borderRadius: number;
    borderCurve: "continuous";
    padding: number;
    gap: number;
    shadowLevel: ShadowLevel;
  };
  title: TypographyToken;
  description: TypographyToken;
  actionPrimary: ButtonVariantToken;
  actionSecondary: ButtonVariantToken;
}

export interface HeaderTokensContract {
  screen: {
    minHeight: number;
    paddingHorizontal: number;
    paddingVertical: number;
    gap: number;
  };
  title: TypographyToken;
  subtitle: TypographyToken;
  actionLabel: TypographyToken;
  actionIcon: {
    size: number;
    touchTarget: number;
  };
}

export interface AvatarTokensContract {
  xs: {
    size: number;
    radius: number;
    text: TypographyToken;
  };
  sm: {
    size: number;
    radius: number;
    text: TypographyToken;
  };
  md: {
    size: number;
    radius: number;
    text: TypographyToken;
  };
  lg: {
    size: number;
    radius: number;
    text: TypographyToken;
  };
  xl: {
    size: number;
    radius: number;
    text: TypographyToken;
  };
  ring: {
    width: number;
    offset: number;
  };
}

export interface ToastTokensContract {
  container: {
    minHeight: number;
    borderRadius: number;
    borderCurve: "continuous";
    paddingHorizontal: number;
    paddingVertical: number;
    gap: number;
    shadowLevel: ShadowLevel;
  };
  title: TypographyToken;
  message: TypographyToken;
  action: TypographyToken;
  icon: {
    size: number;
  };
}

export interface EmptyStateTokensContract {
  container: {
    paddingHorizontal: number;
    paddingVertical: number;
    alignItems: "center";
    justifyContent: "center";
    gap: number;
  };
  icon: {
    size: number;
  };
  title: TypographyToken;
  message: TypographyToken;
  cta: ButtonVariantToken;
}

export interface DialogTokensContract {
  overlay: {
    opacity: number;
  };
  container: {
    maxWidth: number;
    borderRadius: number;
    borderCurve: "continuous";
    padding: number;
    gap: number;
    borderWidth: number;
    shadowLevel: ShadowLevel;
  };
  title: TypographyToken;
  description: TypographyToken;
  actions: {
    gap: number;
    justifyContent: "flex-end";
  };
  actionPrimary: ButtonVariantToken;
  actionSecondary: ButtonVariantToken;
}

export interface AlertTokensContract {
  container: {
    borderRadius: number;
    borderCurve: "continuous";
    paddingHorizontal: number;
    paddingVertical: number;
    gap: number;
    borderWidth: number;
  };
  title: TypographyToken;
  message: TypographyToken;
  action: TypographyToken;
  icon: {
    size: number;
  };
}

export interface BannerTokensContract {
  container: {
    minHeight: number;
    borderRadius: number;
    borderCurve: "continuous";
    paddingHorizontal: number;
    paddingVertical: number;
    gap: number;
    borderWidth: number;
  };
  title: TypographyToken;
  message: TypographyToken;
  action: TypographyToken;
  icon: {
    size: number;
  };
}

export interface ActionSheetTokensContract {
  overlay: {
    opacity: number;
  };
  sheet: {
    borderTopLeftRadius: number;
    borderTopRightRadius: number;
    borderCurve: "continuous";
    paddingHorizontal: number;
    paddingTop: number;
    paddingBottom: number;
    gap: number;
    borderWidth: number;
  };
  title: TypographyToken;
  message: TypographyToken;
  option: {
    minHeight: number;
    borderRadius: number;
    paddingHorizontal: number;
    paddingVertical: number;
  };
  optionText: TypographyToken;
  cancelText: TypographyToken;
}

export interface AnimationTokensContract {
  duration: {
    instant: number;
    fast: number;
    standard: number;
    slow: number;
    slower: number;
  };
  spring: {
    snappy: {
      damping: number;
      stiffness: number;
      mass: number;
      overshootClamping: boolean;
      restDisplacementThreshold: number;
      restSpeedThreshold: number;
    };
    standard: {
      damping: number;
      stiffness: number;
      mass: number;
      overshootClamping: boolean;
      restDisplacementThreshold: number;
      restSpeedThreshold: number;
    };
    gentle: {
      damping: number;
      stiffness: number;
      mass: number;
      overshootClamping: boolean;
      restDisplacementThreshold: number;
      restSpeedThreshold: number;
    };
  };
  timing: {
    easeOut: string;
    easeInOut: string;
    emphasize: string;
  };
}

export interface BottomSheetTokensContract {
  modal: {
    snapPoints: ReadonlyArray<string>;
    borderRadius: number;
    borderCurve: "continuous";
    paddingHorizontal: number;
    paddingTop: number;
    paddingBottom: number;
    gap: number;
    shadowLevel: ShadowLevel;
  };
  detached: {
    snapPoints: ReadonlyArray<string>;
    bottomInset: number;
    sideInset: number;
    borderRadius: number;
    borderCurve: "continuous";
    paddingHorizontal: number;
    paddingTop: number;
    paddingBottom: number;
    gap: number;
    shadowLevel: ShadowLevel;
  };
  handle: {
    width: number;
    height: number;
    borderRadius: number;
    marginTop: number;
    marginBottom: number;
  };
  header: {
    title: TypographyToken;
    subtitle: TypographyToken;
  };
}

export interface ElementTheme {
  text: {
    primary: string;
    secondary: string;
    inverse: string;
    link: string;
    danger: string;
  };
  surface: {
    background: string;
    card: string;
    popover: string;
    muted: string;
    sidebar: string;
  };
  button: {
    primaryBg: string;
    primaryText: string;
    secondaryBg: string;
    secondaryText: string;
    ghostBg: string;
    ghostText: string;
    dangerBg: string;
    dangerText: string;
    border: string;
    ring: string;
  };
  card: {
    background: string;
    foreground: string;
    border: string;
    mutedBackground: string;
    shadowColor: string;
  };
  input: {
    background: string;
    text: string;
    placeholder: string;
    border: string;
    focusRing: string;
    invalid: string;
  };
  badge: {
    solidBg: string;
    solidText: string;
    subtleBg: string;
    subtleText: string;
    outlineBorder: string;
    outlineText: string;
    successBg: string;
    warningBg: string;
    dangerBg: string;
  };
  chip: {
    bg: string;
    text: string;
    border: string;
    selectedBg: string;
    selectedText: string;
  };
  listItem: {
    bg: string;
    text: string;
    subtitle: string;
    border: string;
    pressedBg: string;
  };
  modal: {
    overlay: string;
    sheetBg: string;
    sheetText: string;
    border: string;
  };
  bottomSheet: {
    background: string;
    foreground: string;
    border: string;
    handle: string;
    backdrop: string;
  };
  dialog: {
    background: string;
    foreground: string;
    border: string;
    overlay: string;
  };
  alert: {
    infoBg: string;
    infoText: string;
    infoBorder: string;
    successBg: string;
    warningBg: string;
    errorBg: string;
    accentText: string;
  };
  banner: {
    infoBg: string;
    infoText: string;
    infoBorder: string;
    successBg: string;
    warningBg: string;
    errorBg: string;
    accentText: string;
  };
  toast: {
    infoBg: string;
    infoText: string;
    successBg: string;
    warningBg: string;
    errorBg: string;
    onAccent: string;
    border: string;
  };
}

export interface SharedThemeTokens {
  backdropOpacity: string;
  border: string;
  input: string;
  ring: string;
  foreground: string;
  mutedForeground: string;
  primaryForeground: string;
  primary: string;
  destructive: string;
  destructiveForeground: string;
  background: string;
  card: string;
  popover: string;
  muted: string;
  sidebar: string;
  secondary: string;
  secondaryForeground: string;
  cardForeground: string;
  shadowColor: string;
  chart2: string;
  chart4: string;
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

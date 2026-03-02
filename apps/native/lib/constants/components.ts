import { SHARED_TOKENS, UI_PRESETS } from "./foundations";
import { Typography } from "./typography";

export const ButtonTokens = {
  base: {
    borderRadius: UI_PRESETS.radius.md,
    borderCurve: "continuous" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexDirection: "row" as const,
    gap: UI_PRESETS.spacing.md,
  },
  primary: { minHeight: UI_PRESETS.size.controlLg, paddingHorizontal: UI_PRESETS.spacing.xxxl, paddingVertical: UI_PRESETS.spacing.xl, text: Typography.buttonMD },
  secondary: { minHeight: UI_PRESETS.size.controlMd, paddingHorizontal: UI_PRESETS.spacing.xxl, paddingVertical: UI_PRESETS.spacing.lg, text: Typography.buttonMD },
  ghost: { minHeight: UI_PRESETS.size.controlSm, paddingHorizontal: UI_PRESETS.spacing.xl, paddingVertical: UI_PRESETS.spacing.md, text: Typography.buttonSM },
  icon: {
    sm: { width: UI_PRESETS.size.avatarSm, height: UI_PRESETS.size.avatarSm, borderRadius: UI_PRESETS.radius.sm },
    md: { width: UI_PRESETS.size.iconTouch, height: UI_PRESETS.size.iconTouch, borderRadius: UI_PRESETS.radius.md },
    lg: { width: UI_PRESETS.size.controlLg, height: UI_PRESETS.size.controlLg, borderRadius: UI_PRESETS.radius.lg },
  },
  state: { disabledOpacity: UI_PRESETS.opacity.disabled, pressedOpacity: UI_PRESETS.opacity.pressed, loadingOpacity: UI_PRESETS.opacity.muted },
} as const;

export const CardTokens = {
  base: { borderRadius: UI_PRESETS.radius.xl, borderCurve: "continuous" as const, padding: UI_PRESETS.spacing.xxxl, gap: UI_PRESETS.spacing.xl },
  elevated: { borderWidth: 0, shadowLevel: "shadowMd" },
  outlined: { borderWidth: 1, shadowLevel: "shadow2Xs" },
  filled: { borderWidth: 0, shadowLevel: "shadowSm" },
  compact: { padding: UI_PRESETS.spacing.xl, gap: UI_PRESETS.spacing.md, borderRadius: UI_PRESETS.radius.md },
  cozy: { padding: UI_PRESETS.spacing.xxxl, gap: UI_PRESETS.spacing.xl, borderRadius: UI_PRESETS.radius.xl },
  spacious: { padding: UI_PRESETS.spacing.section, gap: UI_PRESETS.spacing.xxl, borderRadius: UI_PRESETS.radius.xxl },
  media: {
    sm: { height: 120, borderRadius: UI_PRESETS.radius.sm },
    md: { height: 160, borderRadius: UI_PRESETS.radius.md },
    lg: { height: 220, borderRadius: UI_PRESETS.radius.lg },
  },
} as const;

export const InputTokens = {
  field: { minHeight: UI_PRESETS.size.input, paddingHorizontal: UI_PRESETS.spacing.xl, paddingVertical: UI_PRESETS.spacing.lg, borderRadius: UI_PRESETS.radius.md, borderCurve: "continuous" as const, borderWidth: 1 },
  label: Typography.labelMD,
  helper: Typography.captionLG,
  error: Typography.captionLG,
} as const;

export const ListItemTokens = {
  base: { minHeight: UI_PRESETS.size.listItem, paddingHorizontal: UI_PRESETS.spacing.xxxl, paddingVertical: UI_PRESETS.spacing.xl, gap: UI_PRESETS.spacing.xl, borderRadius: UI_PRESETS.radius.md, borderCurve: "continuous" as const },
  compact: { minHeight: UI_PRESETS.size.listItemCompact, paddingHorizontal: UI_PRESETS.spacing.xl, paddingVertical: UI_PRESETS.spacing.md, gap: UI_PRESETS.spacing.lg, borderRadius: UI_PRESETS.radius.sm },
  title: Typography.bodyMD,
  subtitle: Typography.bodySM,
  meta: Typography.captionLG,
} as const;

export const BadgeTokens = {
  base: { borderRadius: UI_PRESETS.radius.full, borderCurve: "continuous" as const, paddingHorizontal: UI_PRESETS.spacing.md, paddingVertical: UI_PRESETS.spacing.xs, minHeight: 20, alignItems: "center" as const, justifyContent: "center" as const },
  solid: { text: Typography.labelSM },
  subtle: { text: Typography.labelSM },
  outline: { borderWidth: 1, text: Typography.labelSM },
  dot: { size: 8 },
} as const;

export const ChipTokens = {
  base: { minHeight: 32, paddingHorizontal: UI_PRESETS.spacing.lg, paddingVertical: UI_PRESETS.spacing.sm, borderRadius: UI_PRESETS.radius.full, borderCurve: "continuous" as const, flexDirection: "row" as const, alignItems: "center" as const, gap: UI_PRESETS.spacing.sm },
  compact: { minHeight: 28, paddingHorizontal: UI_PRESETS.spacing.md, paddingVertical: 4 },
  text: Typography.labelSM,
  selected: { borderWidth: 1 },
  unselected: { borderWidth: 1 },
} as const;

export const ModalTokens = {
  overlay: { opacity: UI_PRESETS.opacity.backdrop },
  sheet: { borderTopLeftRadius: UI_PRESETS.radius.modal, borderTopRightRadius: UI_PRESETS.radius.modal, borderCurve: "continuous" as const, paddingHorizontal: UI_PRESETS.spacing.section, paddingTop: UI_PRESETS.spacing.xxxl, paddingBottom: UI_PRESETS.spacing.section, gap: UI_PRESETS.spacing.xxl, shadowLevel: "shadowXl" },
  card: { borderRadius: CardTokens.base.borderRadius, borderCurve: "continuous" as const, padding: CardTokens.base.padding, gap: CardTokens.base.gap, shadowLevel: "shadowLg" },
  title: Typography.titleLG,
  description: Typography.bodySM,
  actionPrimary: ButtonTokens.primary,
  actionSecondary: ButtonTokens.secondary,
} as const;

export const HeaderTokens = {
  screen: { minHeight: 56, paddingHorizontal: UI_PRESETS.spacing.xxxl, paddingVertical: UI_PRESETS.spacing.lg, gap: UI_PRESETS.spacing.md },
  title: Typography.titleMD,
  subtitle: Typography.captionLG,
  actionLabel: Typography.labelMD,
  actionIcon: { size: 20, touchTarget: UI_PRESETS.size.iconTouch },
} as const;

export const AvatarTokens = {
  xs: { size: UI_PRESETS.size.avatarXs, radius: UI_PRESETS.size.avatarXs / 2, text: Typography.labelXS },
  sm: { size: UI_PRESETS.size.avatarSm, radius: UI_PRESETS.size.avatarSm / 2, text: Typography.labelSM },
  md: { size: UI_PRESETS.size.avatarMd, radius: UI_PRESETS.size.avatarMd / 2, text: Typography.labelMD },
  lg: { size: UI_PRESETS.size.avatarLg, radius: UI_PRESETS.size.avatarLg / 2, text: Typography.labelLG },
  xl: { size: UI_PRESETS.size.avatarXl, radius: UI_PRESETS.size.avatarXl / 2, text: Typography.titleSM },
  ring: { width: 2, offset: 2 },
} as const;

export const ToastTokens = {
  container: { minHeight: 52, borderRadius: UI_PRESETS.radius.lg, borderCurve: "continuous" as const, paddingHorizontal: UI_PRESETS.spacing.xl, paddingVertical: UI_PRESETS.spacing.lg, gap: UI_PRESETS.spacing.md, shadowLevel: "shadowLg" },
  title: Typography.labelMD,
  message: Typography.bodySM,
  action: Typography.labelSM,
  icon: { size: 18 },
} as const;

export const EmptyStateTokens = {
  container: { paddingHorizontal: UI_PRESETS.spacing.section, paddingVertical: UI_PRESETS.spacing.screen, alignItems: "center" as const, justifyContent: "center" as const, gap: UI_PRESETS.spacing.lg },
  icon: { size: 40 },
  title: Typography.titleSM,
  message: Typography.bodySM,
  cta: ButtonTokens.secondary,
} as const;

export const DialogTokens = {
  overlay: { opacity: UI_PRESETS.opacity.backdrop },
  container: { maxWidth: 420, borderRadius: CardTokens.base.borderRadius, borderCurve: "continuous" as const, padding: CardTokens.base.padding, gap: CardTokens.base.gap, borderWidth: 1, shadowLevel: "shadowXl" },
  title: Typography.titleLG,
  description: Typography.bodySM,
  actions: { gap: UI_PRESETS.spacing.md, justifyContent: "flex-end" as const },
  actionPrimary: ButtonTokens.primary,
  actionSecondary: ButtonTokens.secondary,
} as const;

export const AlertTokens = {
  container: { borderRadius: UI_PRESETS.radius.md, borderCurve: "continuous" as const, paddingHorizontal: UI_PRESETS.spacing.xl, paddingVertical: UI_PRESETS.spacing.lg, gap: UI_PRESETS.spacing.md, borderWidth: 1 },
  title: Typography.labelMD,
  message: Typography.bodySM,
  action: Typography.labelSM,
  icon: { size: 16 },
} as const;

export const BannerTokens = {
  container: { minHeight: UI_PRESETS.size.listItem, borderRadius: UI_PRESETS.radius.lg, borderCurve: "continuous" as const, paddingHorizontal: UI_PRESETS.spacing.xl, paddingVertical: UI_PRESETS.spacing.lg, gap: UI_PRESETS.spacing.md, borderWidth: 1 },
  title: Typography.labelMD,
  message: Typography.bodySM,
  action: Typography.labelSM,
  icon: { size: 18 },
} as const;

export const ActionSheetTokens = {
  overlay: ModalTokens.overlay,
  sheet: { borderTopLeftRadius: ModalTokens.sheet.borderTopLeftRadius, borderTopRightRadius: ModalTokens.sheet.borderTopRightRadius, borderCurve: "continuous" as const, paddingHorizontal: ModalTokens.sheet.paddingHorizontal, paddingTop: ModalTokens.sheet.paddingTop, paddingBottom: ModalTokens.sheet.paddingBottom, gap: ModalTokens.sheet.gap, borderWidth: 1 },
  title: Typography.titleSM,
  message: Typography.bodySM,
  option: { minHeight: UI_PRESETS.size.controlMd, borderRadius: UI_PRESETS.radius.md, paddingHorizontal: UI_PRESETS.spacing.xl, paddingVertical: UI_PRESETS.spacing.lg },
  optionText: Typography.bodyMD,
  cancelText: Typography.labelMD,
} as const;

export const AnimationTokens = {
  duration: { instant: 100, fast: 160, standard: 240, slow: 360, slower: 480 },
  spring: {
    snappy: { damping: 22, stiffness: 320, mass: 0.9, overshootClamping: false, restDisplacementThreshold: 0.1, restSpeedThreshold: 0.1 },
    standard: { damping: 26, stiffness: 280, mass: 1, overshootClamping: false, restDisplacementThreshold: 0.1, restSpeedThreshold: 0.1 },
    gentle: { damping: 32, stiffness: 220, mass: 1.05, overshootClamping: false, restDisplacementThreshold: 0.1, restSpeedThreshold: 0.1 },
  },
  timing: { easeOut: SHARED_TOKENS.easingDecelerate, easeInOut: SHARED_TOKENS.easingStandard, emphasize: SHARED_TOKENS.easingEmphasized },
} as const;

export const BottomSheetTokens = {
  modal: { snapPoints: ["28%", "55%", "86%"] as const, borderRadius: UI_PRESETS.radius.modal, borderCurve: "continuous" as const, paddingHorizontal: UI_PRESETS.spacing.section, paddingTop: UI_PRESETS.spacing.xl, paddingBottom: UI_PRESETS.spacing.screen, gap: UI_PRESETS.spacing.xl, shadowLevel: "shadowXl" },
  detached: { snapPoints: ["32%", "62%"] as const, bottomInset: UI_PRESETS.spacing.section, sideInset: UI_PRESETS.spacing.xxxl, borderRadius: UI_PRESETS.radius.modal, borderCurve: "continuous" as const, paddingHorizontal: UI_PRESETS.spacing.section, paddingTop: UI_PRESETS.spacing.xl, paddingBottom: UI_PRESETS.spacing.section, gap: UI_PRESETS.spacing.xl, shadowLevel: "shadow2Xl" },
  handle: { width: 40, height: 4, borderRadius: UI_PRESETS.radius.full, marginTop: UI_PRESETS.spacing.sm, marginBottom: UI_PRESETS.spacing.sm },
  header: { title: Typography.titleSM, subtitle: Typography.bodySM },
} as const;

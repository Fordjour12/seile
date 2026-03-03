import { TYPE_SCALE } from "./tokens";

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

export const Typography = {
  eyebrow: {
    ...textBase,
    fontSize: TYPE_SCALE[1],
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: "uppercase" as const,
  },
  displayXL: { ...headingBase, fontSize: TYPE_SCALE[13], lineHeight: 42, letterSpacing: -0.4 },
  displayLG: { ...headingBase, fontSize: TYPE_SCALE[12], lineHeight: 36, letterSpacing: -0.3 },
  displayMD: { ...headingBase, fontWeight: "600" as const, fontSize: TYPE_SCALE[11], lineHeight: 32, letterSpacing: -0.2 },
  displaySM: { ...headingBase, fontWeight: "600" as const, fontSize: TYPE_SCALE[10], lineHeight: 28, letterSpacing: -0.15 },
  titleLG: { ...headingBase, fontWeight: "600" as const, fontSize: TYPE_SCALE[9], lineHeight: 27 },
  titleMD: { ...headingBase, fontWeight: "600" as const, fontSize: TYPE_SCALE[8], lineHeight: 24 },
  titleSM: { ...headingBase, fontWeight: "600" as const, fontSize: TYPE_SCALE[6], lineHeight: 22 },
  labelLG: { ...textBase, fontWeight: "500" as const, fontSize: TYPE_SCALE[6], lineHeight: 22 },
  labelMD: { ...textBase, fontWeight: "500" as const, fontSize: TYPE_SCALE[4], lineHeight: 20 },
  labelSM: { ...textBase, fontWeight: "500" as const, fontSize: TYPE_SCALE[2], lineHeight: 16, letterSpacing: 0.2 },
  labelXS: { ...textBase, fontWeight: "500" as const, fontSize: TYPE_SCALE[1], lineHeight: 14, letterSpacing: 0.24, textTransform: "uppercase" as const },
  bodyLG: { ...textBase, fontSize: TYPE_SCALE[7], lineHeight: 25 },
  bodyMD: { ...textBase, fontSize: TYPE_SCALE[5], lineHeight: 22 },
  bodySM: { ...textBase, fontSize: TYPE_SCALE[3], lineHeight: 19 },
  bodyXS: { ...textBase, fontSize: TYPE_SCALE[1], lineHeight: 16 },
  captionLG: { ...textBase, fontSize: TYPE_SCALE[2], lineHeight: 17, letterSpacing: 0.1 },
  captionSM: { ...textBase, fontSize: TYPE_SCALE[1], lineHeight: 15, letterSpacing: 0.12 },
  buttonLG: { ...textBase, fontWeight: "600" as const, fontSize: TYPE_SCALE[6], lineHeight: 20, letterSpacing: 0.1 },
  buttonMD: { ...textBase, fontWeight: "600" as const, fontSize: TYPE_SCALE[4], lineHeight: 18, letterSpacing: 0.1 },
  buttonSM: { ...textBase, fontWeight: "600" as const, fontSize: TYPE_SCALE[2], lineHeight: 16, letterSpacing: 0.12 },
  linkMD: { ...textBase, fontWeight: "500" as const, fontSize: TYPE_SCALE[4], lineHeight: 20, textDecorationLine: "underline" as const },
  linkSM: { ...textBase, fontWeight: "500" as const, fontSize: TYPE_SCALE[2], lineHeight: 17, textDecorationLine: "underline" as const },
  codeMD: { ...textBase, fontFamily: "monospace", fontSize: TYPE_SCALE[3], lineHeight: 19 },
  codeSM: { ...textBase, fontFamily: "monospace", fontSize: TYPE_SCALE[1], lineHeight: 16 },
  numericLG: { ...textBase, fontWeight: "600" as const, fontSize: TYPE_SCALE[9], lineHeight: 27, fontVariant: ["tabular-nums"] as const },
  numericMD: { ...textBase, fontWeight: "600" as const, fontSize: TYPE_SCALE[6], lineHeight: 22, fontVariant: ["tabular-nums"] as const },
  numericSM: { ...textBase, fontWeight: "500" as const, fontSize: TYPE_SCALE[3], lineHeight: 19, fontVariant: ["tabular-nums"] as const },
} as const;

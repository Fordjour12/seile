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
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: "uppercase" as const,
  },

  displayXL: { ...headingBase, fontSize: 36, lineHeight: 42, letterSpacing: -0.4 },
  displayLG: { ...headingBase, fontSize: 30, lineHeight: 36, letterSpacing: -0.3 },
  displayMD: { ...headingBase, fontWeight: "600" as const, fontSize: 26, lineHeight: 32, letterSpacing: -0.2 },
  displaySM: { ...headingBase, fontWeight: "600" as const, fontSize: 22, lineHeight: 28, letterSpacing: -0.15 },

  titleLG: { ...headingBase, fontWeight: "600" as const, fontSize: 20, lineHeight: 27 },
  titleMD: { ...headingBase, fontWeight: "600" as const, fontSize: 18, lineHeight: 24 },
  titleSM: { ...headingBase, fontWeight: "600" as const, fontSize: 16, lineHeight: 22 },

  labelLG: { ...textBase, fontWeight: "500" as const, fontSize: 16, lineHeight: 22 },
  labelMD: { ...textBase, fontWeight: "500" as const, fontSize: 14, lineHeight: 20 },
  labelSM: { ...textBase, fontWeight: "500" as const, fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
  labelXS: {
    ...textBase,
    fontWeight: "500" as const,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.24,
    textTransform: "uppercase" as const,
  },

  bodyLG: { ...textBase, fontSize: 17, lineHeight: 25 },
  bodyMD: { ...textBase, fontSize: 15, lineHeight: 22 },
  bodySM: { ...textBase, fontSize: 13, lineHeight: 19 },
  bodyXS: { ...textBase, fontSize: 11, lineHeight: 16 },

  captionLG: { ...textBase, fontSize: 12, lineHeight: 17, letterSpacing: 0.1 },
  captionSM: { ...textBase, fontSize: 11, lineHeight: 15, letterSpacing: 0.12 },

  buttonLG: { ...textBase, fontWeight: "600" as const, fontSize: 16, lineHeight: 20, letterSpacing: 0.1 },
  buttonMD: { ...textBase, fontWeight: "600" as const, fontSize: 14, lineHeight: 18, letterSpacing: 0.1 },
  buttonSM: { ...textBase, fontWeight: "600" as const, fontSize: 12, lineHeight: 16, letterSpacing: 0.12 },

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

  codeMD: { ...textBase, fontFamily: "monospace", fontSize: 13, lineHeight: 19 },
  codeSM: { ...textBase, fontFamily: "monospace", fontSize: 11, lineHeight: 16 },

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

import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

import { DOMAIN_TONES } from "./data";

export function getFirstRunTokens(isDark: boolean) {
  const theme = isDark ? NAV_THEME.dark : NAV_THEME.light;

  return {
    // surfaces
    background: theme.background,
    card: theme.card,
    cardBorder: theme.border,

    // text
    textPrimary: theme.foreground,
    textSecondary: theme.mutedForeground,
    textInverse: theme.primaryForeground,

    // brand/accent
    primary: theme.primary,
    primaryMuted: isDark
      ? `${theme.primary}1a`
      : `${theme.primary}14`,

    // insight card
    insightBg: isDark
      ? "rgba(19,19,31,0.96)"
      : "rgba(244,242,255,0.98)",
    insightBorder: "rgba(61,53,112,0.28)",
    insightText: isDark ? "#b4b4c6" : "#5f5f7c",

    // progress fill
    progressFill: theme.primary,

    // domain colors — semantic, kept verbatim
    domain: DOMAIN_TONES,

    // phase pills
    phaseSeed: isDark
      ? { bg: "#2a1e00", text: "#e0a040", border: "#6b4e00" }
      : { bg: "#FDF3E0", text: "#9A6B1A", border: "#F0D090" },
    phaseLearn: isDark
      ? { bg: `${theme.primary}1a`, text: theme.primary, border: `${theme.primary}33` }
      : { bg: `${theme.primary}14`, text: theme.primary, border: `${theme.primary}28` },
    phaseAct: isDark
      ? { bg: "#001e1a", text: "#40d4c0", border: "#006b5e" }
      : { bg: "#E6F5F3", text: "#2A7A6F", border: "#A8D8D3" },

    // celebration
    celebrationBg: isDark ? "#1f1a30" : "#f0edff",
    celebrationBorder: isDark ? "#3d3570" : "#c8c0ff",
    celebrationTitle: isDark ? "#c8c0ff" : "#534AB7",
    celebrationSub: isDark ? "#9b8fff" : "#7a70c0",

    // approval detail
    approvalDetailText: theme.primary,

    // new badge (context card)
    newBadgeBg: isDark ? "#1e1a30" : "#f0edff",
    newBadgeBorder: isDark ? "#3d3570" : "#c8c0ff",
    newBadgeText: theme.primary,

    // checkin nudge
    checkinAccent: "#d4537e",

    // completion / success indicator
    completionGreen: "#1d9e75",

    // pressed state
    pressedOpacity: 0.84,
  };
}

export type FirstRunV2Tokens = ReturnType<typeof getFirstRunTokens>;

export function useFirstRunV2Theme() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;
  const theme = isDark ? NAV_THEME.dark : NAV_THEME.light;
  const tokens = getFirstRunTokens(isDark);

  return { theme, tokens, isDark, colorScheme };
}

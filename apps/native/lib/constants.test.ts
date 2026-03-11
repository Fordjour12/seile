import { describe, expect, test } from "bun:test";

import * as constants from "./constants";
import type { ThemeMode } from "./constants/types";

const PUBLIC_EXPORTS = [
  "UI_PRESETS",
  "Typography",
  "ButtonTokens",
  "CardTokens",
  "InputTokens",
  "ListItemTokens",
  "BadgeTokens",
  "ChipTokens",
  "ModalTokens",
  "HeaderTokens",
  "AvatarTokens",
  "ToastTokens",
  "EmptyStateTokens",
  "DialogTokens",
  "AlertTokens",
  "BannerTokens",
  "ActionSheetTokens",
  "AnimationTokens",
  "BottomSheetTokens",
  "NAV_THEME",
  "UI_ELEMENT_THEME",
] as const;

describe("constants public surface", () => {
  test("preserves the expected top-level exports", () => {
    for (const exportName of PUBLIC_EXPORTS) {
      expect(constants).toHaveProperty(exportName);
    }
  });

  test("keeps React Native style tokens numeric where consumers expect numbers", () => {
    expect(constants.UI_PRESETS.radius.modal).toBe(24);
    expect(typeof constants.Typography.bodyMD.fontSize).toBe("number");
    expect(typeof constants.ButtonTokens.base.borderRadius).toBe("number");
    expect(typeof constants.InputTokens.field.minHeight).toBe("number");
    expect(typeof constants.BottomSheetTokens.handle.height).toBe("number");
  });
});

describe("theme derivation", () => {
  (["light", "dark"] as const).forEach((mode: ThemeMode) => {
    test(`derives UI element palette from NAV_THEME for ${mode} mode`, () => {
      const theme = constants.NAV_THEME[mode];
      const palette = constants.UI_ELEMENT_THEME[mode];

      expect(palette.text.primary).toBe(theme.foreground);
      expect(palette.button.primaryBg).toBe(theme.primary);
      expect(palette.card.shadowColor).toBe(theme.shadowColor);
      expect(palette.input.border).toBe(theme.input);
      expect(palette.modal.overlay).toBe(`hsla(0, 0%, 0%, ${theme.backdropOpacity})`);
      expect(palette.bottomSheet.backdrop).toBe(`hsla(0, 0%, 0%, ${theme.backdropOpacity})`);
    });
  });
});

## Rewrite Plan: apps/native/lib/constants.ts into a Typed, Modular Token System (No Breaking API)

### Summary

Rewrite apps/native/lib/constants.ts from a single ~1,000-line file into a modular design-token system while preserving current
import compatibility (@/lib/constants) and runtime behavior.
Primary goals:

1. Reduce maintenance risk and accidental coupling.
2. Enforce stronger typing for token usage.
3. Normalize runtime tokens to React Native-friendly numeric values where practical.
4. Keep migration low-risk via a compatibility shim.

### Scope and Non-Goals

In scope:

- Refactor constants into focused files by concern (typography, sizing, component tokens, theme colors).
- Keep all existing exported names available from @/lib/constants.
- Introduce internal type contracts for theme/token shape.
- Add lightweight guard tests for token integrity.

Out of scope:

- Visual redesign.
- Renaming public token exports in this phase.
- Rewriting every component to a new token API in one shot.

### Public API / Interface Changes

Compatibility-first: existing exports remain available with same names:

- UI_PRESETS, Typography, all \*Tokens, NAV_THEME, UI_ELEMENT_THEME.

Internal additions:

- Typed interfaces for theme scales and component token contracts.
- buildElementTheme gets explicit input/output types (instead of loose Record<string, string>).

Optional compatibility metadata:

- Add /\*_ @deprecated _/ JSDoc only where values are legacy/duplicated, without removing exports.

### Proposed File Structure

Create a folder and keep one barrel entrypoint:

- apps/native/lib/constants/index.ts
  Re-export all public constants to preserve current imports.
- apps/native/lib/constants/foundations.ts
  Base scales: spacing, radius, size, opacity, motion, shadows, z-index.
- apps/native/lib/constants/typography.ts
  Font families, weights, and Typography.
- apps/native/lib/constants/components.ts
  ButtonTokens, CardTokens, InputTokens, etc.
- apps/native/lib/constants/theme.ts
  NAV_THEME, light/dark palette, shared tokens, elevation tokens.
- apps/native/lib/constants/ui-element-theme.ts
  buildElementTheme and UI_ELEMENT_THEME.
- apps/native/lib/constants/types.ts
  Theme and token interfaces/types.

Keep apps/native/lib/constants.ts as a shim during migration:

- Either re-export from ./constants/index or become the actual index target.

### Implementation Approach (Decision-Complete)

1. Establish type contracts first:
   - ThemeScale type for color + shared properties used by buildElementTheme.
   - ElementTheme type for UI_ELEMENT_THEME.
   - Token types for component groups where shape matters (button/card/input/etc.).
2. Split foundations and typography:
   - Move UI_PRESETS and typography definitions into dedicated files.
   - Normalize RN runtime values to numbers where used as numeric style props.
   - Keep string tokens only where required (HSL colors, easing functions, percentages/snap points).
3. Split component token groups:
   - Move each \*Tokens block together into components.ts.
   - Replace cross-file circular value dependencies with imported foundations and typography.
4. Split theme:
   - Keep NAV_THEME values unchanged initially.
   - Keep shared + light/dark elevation composition explicit and typed.
5. Split UI element theme:
   - Convert buildElementTheme to typed input from NAV_THEME shape.
   - Ensure UI_ELEMENT_THEME.light/dark are derived from NAV_THEME only.
6. Preserve compatibility:
   - constants.ts exports exactly the current public symbols.
   - No call-site changes required in ~35 importing files for phase 1.
7. Optional cleanup phase (after parity):
   - Remove dead/duplicate aliases and unify any unused token keys.
   - Start component-by-component migration to stricter APIs (opt-in).

### Migration and Rollout Strategy

Phased with compatibility shim:

1. PR 1: Introduce modular files + re-export barrel, zero behavior changes.
2. PR 2: Add typings and numeric normalization with snapshot/shape tests.
3. PR 3+: Incremental consumer cleanup and deprecations.

This minimizes risk and allows quick rollback at each phase.

### Testing and Validation

Required checks:

1. bunx tsc -p apps/native/tsconfig.json --noEmit passes.
2. Token shape unit tests:
   - Ensure expected top-level exports exist.
   - Key screens render without undefined style warnings.
3. Visual regression sanity:
   - Compare representative screens using existing auth-smoke, tabs, cards, modals, bottom sheets.

Suggested test scenarios:

1. Button variants (primary/secondary/ghost) across themes.
2. Input + validation state colors.
3. Alert/banner/toast semantic states.
4. Typography weights/families consistency (Geist headings, Figtree body).

### Risks and Mitigations

- Risk: Silent style drift from value normalization.
  - Mitigation: Phase split + visual smoke checks before cleanup.
- Risk: Hidden dependency on legacy token keys.
  - Mitigation: export-shape tests and temporary deprecation markers.
- Risk: Type over-constraint blocks practical usage.
  - Mitigation: keep strict typing at foundations/theme boundaries first, then tighten gradually.

### Assumptions and Defaults Chosen

1. Rewrite goal: Safe modular split with no immediate public API break.
2. Token format: Normalize to RN numeric runtime tokens where appropriate.
3. Rollout: Phased migration with compatibility shim.
4. Existing imports from @/lib/constants remain valid during initial rollout.

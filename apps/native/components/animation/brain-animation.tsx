/**
 * BrainAnimation.tsx
 *
 * Animated version of the Life OS brain SVG.
 * Four modes driven by a single `mode` prop:
 *   "breathe" — splash / AI idle
 *   "pulse"   — AI thinking / approval pending
 *   "think"   — plan generation / weekly review loading
 *   "idle"    — resting / AI not active
 *
 * Stack:
 *   react-native-reanimated v4
 *   react-native-svg
 *
 * Usage:
 *   <BrainAnimation mode="breathe" size={200} />
 *   <BrainAnimation mode="think"   size={120} />
 */

import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { G, Path, Svg } from "react-native-svg";

// ─── Animated primitives ──────────────────────────────────────────────────────

const AnimatedG    = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

// ─── SVG source data ─────────────────────────────────────────────────────────

const BLOB_PATH =
  "M90.5433 233.157C101.528 228.657 104.239 153.758 127.16 125.673C150.082 97.5866 141.879 147.188 160.41 139.594C178.942 132.001 198.793 57.9616 253.09 24.8757C265.285 17.4225 272.293 27.3366 268.762 39.11C265.231 50.8835 256.2 62.4616 268.512 69.7116C280.825 76.9616 300.661 32.9304 330.786 17.6257C360.911 2.32098 374.223 7.20379 378.614 16.7116C383.004 26.2194 364.723 33.2272 376.098 39.3679C387.473 45.5085 406.817 24.3132 429.067 16.1804C451.317 8.04754 469.59 1.04754 476.262 10.1179C482.934 19.1882 465.895 23.2194 476.371 33.1882C486.848 43.1569 518.942 9.8366 546.09 1.66473C573.239 -6.50715 550.621 17.5163 562.286 27.985C573.95 38.4538 595.965 22.5163 612.989 26.8835C630.012 31.2507 622.762 43.5319 640.121 57.0788C657.481 70.6257 691.903 63.3991 699.16 72.7038C706.418 82.0085 686.364 88.3132 674.825 122.571C663.286 156.829 673.692 178.618 660.684 199.688C647.676 220.758 597.786 238.251 598.411 251.774C599.036 265.298 641.379 250.212 634.348 264.024C627.317 277.837 610.129 297.149 592.536 305.837C574.942 314.524 545.661 316.204 542.246 325.954C538.832 335.704 577.926 337.399 574.793 346.555C570.004 361.29 507.746 375.032 498.411 390.657C489.075 406.282 536.739 415.774 523.207 424.758C509.676 433.743 459.528 430.227 446.879 443.743C434.231 457.258 489.739 454.68 478.973 470.43C468.207 486.18 448.981 492.071 425.95 497.079C402.918 502.087 379.075 495.618 374.332 510.36C369.59 525.102 425.59 534.579 411.903 545.626C398.215 556.672 333.989 536.751 321.989 547.055C309.989 557.36 355.778 564.688 332.879 576.04C309.981 587.391 241.293 569.79 230.27 586.118C219.246 602.446 293.551 596.571 266.457 618.016C239.364 639.462 149.934 631.344 123.121 618.719C57.8011 591.438 11.8636 504.454 4.55893 460.227C-2.74576 416.001 -0.31607 413.532 5.15268 400.469C10.6214 387.407 33.5277 427.696 29.3324 391.055C25.1371 354.415 6.53549 343.829 14.4183 315.024C22.3011 286.219 31.6605 335.501 35.0902 300.649C38.5199 265.798 37.5433 219.719 57.5199 208.368C88.8324 190.571 75.3558 239.368 90.5433 233.157Z";

const STREAK_PATH =
  "M610.864 88.1101C559.778 83.4694 128.254 307.548 77.4419 495.61C177.95 349.149 610.864 88.1101 610.864 88.1101Z";

// ViewBox dimensions
const VB_W = 701;
const VB_H = 632;

// Geometric centre of the blob for transform-origin equivalent
const BLOB_CX = VB_W / 2;  // 350.5
const BLOB_CY = VB_H / 2;  // 316

// Think-mode fill colour cycle (purple ramp)
const THINK_COLORS = [
  "#613583",
  "#7F77DD",
  "#534AB7",
  "#3C3489",
  "#AFA9EC",
];

// ─── Types ────────────────────────────────────────────────────────────────────

export type BrainMode = "breathe" | "pulse" | "think" | "idle";

interface BrainAnimationProps {
  mode?: BrainMode;
  /** Rendered width in dp — height scales proportionally */
  size?: number;
  style?: object;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BrainAnimation({
  mode = "breathe",
  size = 200,
  style,
}: BrainAnimationProps) {
  // Linear time counter — drives all animations.
  // Runs from 0 → 2π continuously, then repeats.
  const t = useSharedValue(0);

  // Think-mode: colour index incremented on JS thread via setInterval.
  const fillIndex = useSharedValue(0);

  // ── Start / stop animations on mode change ─────────────────────────────

  useEffect(() => {
    cancelAnimation(t);
    t.value = 0;

    if (mode === "idle") return;

    const duration =
      mode === "breathe" ? 4000
      : mode === "pulse"   ? 1200
      : /* think */          3000;

    t.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration,
        easing: Easing.linear,
      }),
      -1,   // infinite
      false // do not reverse
    );
  }, [mode]);

  useEffect(() => {
    if (mode !== "think") return;

    fillIndex.value = 0;
    const id = setInterval(() => {
      fillIndex.value = (fillIndex.value + 1) % THINK_COLORS.length;
    }, 600);

    return () => clearInterval(id);
  }, [mode]);

  // ── Derived animated values ────────────────────────────────────────────

  /**
   * Blob scale — derived from t.
   * Each mode uses a different waveform.
   */
  const blobScale = useDerivedValue(() => {
    if (mode === "idle") return 1;
    if (mode === "breathe") return 0.96 + 0.06 * Math.sin(t.value);
    if (mode === "pulse") {
      const beat = Math.max(0, Math.sin(t.value));
      return 1 + 0.1 * Math.pow(beat, 3);
    }
    // think — organic wobble
    return 0.97 + 0.05 * Math.sin(t.value) * Math.cos(t.value * 0.7);
  });

  /** Blob opacity */
  const blobOpacity = useDerivedValue(() => {
    if (mode === "idle") return 1;
    if (mode === "breathe") return 0.82 + 0.18 * Math.sin(t.value + 0.3);
    if (mode === "pulse") {
      const beat = Math.max(0, Math.sin(t.value));
      return 0.7 + 0.3 * Math.pow(beat, 3);
    }
    return 0.85 + 0.15 * Math.sin(t.value * 0.5);
  });

  /**
   * Blob rotation in degrees — only active in think mode.
   * ±3° oscillation.
   */
  const blobRotation = useDerivedValue(() => {
    if (mode !== "think") return 0;
    return Math.sin(t.value * 0.4) * 3;
  });

  /**
   * Streak opacity — complements the blob.
   */
  const streakOpacity = useDerivedValue(() => {
    if (mode === "idle") return 1;
    if (mode === "breathe") return 0.7 + 0.3 * Math.sin(t.value + 0.5);
    if (mode === "pulse") {
      const beat = Math.max(0, Math.sin(t.value));
      return 0.4 + 0.6 * Math.pow(beat, 3);
    }
    return 0.5 + 0.5 * Math.abs(Math.sin(t.value * 0.6));
  });

  /**
   * Streak rotation — counter-rotates gently in think mode.
   */
  const streakRotation = useDerivedValue(() => {
    if (mode !== "think") return 0;
    return Math.sin(t.value * 0.3) * 8;
  });

  /**
   * Blob fill colour — only cycles in think mode.
   * Derived from fillIndex shared value.
   */
  const blobFill = useDerivedValue(() => {
    if (mode !== "think") return "#613583";
    return THINK_COLORS[Math.floor(fillIndex.value) % THINK_COLORS.length];
  });

  const streakCX = 344;
  const streakCY = 291;

  // ── Animated props ─────────────────────────────────────────────────────

  const blobAnimatedProps = useAnimatedProps(() => ({
    fill: blobFill.value,
  }));

  const blobGroupAnimatedProps = useAnimatedProps(() => ({
    opacity: blobOpacity.value,
    originX: BLOB_CX,
    originY: BLOB_CY,
    rotation: blobRotation.value,
    scale: blobScale.value,
  }));

  const streakGroupAnimatedProps = useAnimatedProps(() => ({
    opacity: streakOpacity.value,
    originX: streakCX,
    originY: streakCY,
    rotation: streakRotation.value,
  }));

  // ── Rendered size ──────────────────────────────────────────────────────

  const height = size * (VB_H / VB_W); // maintain aspect ratio

  return (
    <View style={[{ width: size, height }, style]}>
      <Svg
        width={size}
        height={height}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        fill="none"
      >
        {/* ── Blob ── */}
        <AnimatedG animatedProps={blobGroupAnimatedProps}>
          <AnimatedPath
            d={BLOB_PATH}
            animatedProps={blobAnimatedProps}
          />
        </AnimatedG>

        {/* ── Streak ── */}
        <AnimatedG animatedProps={streakGroupAnimatedProps}>
          <Path
            d={STREAK_PATH}
            fill="#220222"
          />
        </AnimatedG>
      </Svg>
    </View>
  );
}

// ─── Usage examples ───────────────────────────────────────────────────────────

/**
 * Splash screen — full-size breathe loop
 *
 * <BrainAnimation mode="breathe" size={280} />
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * AI orb background — small, idle until the AI is called
 *
 * const { isGenerating, hasPendingApproval } = useAIState()
 *
 * <BrainAnimation
 *   mode={isGenerating ? "think" : hasPendingApproval ? "pulse" : "breathe"}
 *   size={80}
 * />
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * Weekly plan generation loading screen
 *
 * <BrainAnimation mode="think" size={160} />
 * <Text>Reading your context across all domains…</Text>
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * Weekly review pre-read phase
 *
 * <BrainAnimation mode="think" size={120} />
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * Approval card — approval pending indicator
 *
 * <BrainAnimation mode="pulse" size={48} />
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * AI memory viewer — resting, not active
 *
 * <BrainAnimation mode="idle" size={64} />
 */

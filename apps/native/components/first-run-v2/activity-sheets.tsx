/**
 * Activity Sheets
 * ─────────────────────────────────────────────────────────────────────────────
 * Five modal bottom sheets for the Day-1 suggested activities, plus a
 * post-completion rating sheet that fires after every finished activity.
 *
 * Sheets:
 *   checkin    — three 1-5 discrete sliders (mood, energy, readiness)
 *   priorities — three numbered text inputs
 *   focus      — task name + 25-min countdown ring (purple)
 *   reflect    — personalised prompt + free-text textarea
 *   walk       — step-by-step instructions + 15-min countdown ring (teal)
 *   rating     — Useful/Meh/Not-really × Easy/Medium/Hard (auto-shown on done)
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, { useAnimatedProps, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMutation } from "convex/react";
import { api } from "@seile/backend/convexApi";

import { Text } from "@/components/ui";
import { NAV_THEME, UI_PRESETS, Typography } from "@/lib/constants";
import {
  cancelFocusBlockNotification,
  scheduleFocusBlockCompletionNotification,
} from "@/lib/focus-block-notifications";
import { useColorScheme } from "@/lib/use-color-scheme";
import type { UserProfileBiggestBlocker } from "@/lib/user-profile";
import {
  AnimatedCircle,
  useStaggeredEntrance,
} from "@/components/animation/life-os-reanimated-patterns";

// ─── Activity type ──────────────────────────────────────────────────────────

export type ActivitySheetType =
  | "checkin"
  | "priorities"
  | "focus"
  | "reflect"
  | "walk";

// Stub for when no assignmentId is available (static fallback activities).
// The real persistence happens in ActivitySheetsProvider via Convex mutation.
function recordActivityReflectionLocal(
  type: ActivitySheetType,
  useful: string,
  difficulty: string,
) {
  console.log("[activity_reflection:local]", { type, useful, difficulty });
}

// ─── Context ────────────────────────────────────────────────────────────────

type ActivitySheetsContextValue = {
  /** Open a sheet. Pass the activityId so completion marks the card done. */
  openSheet: (
    type: ActivitySheetType,
    activityId?: string,
    assignmentId?: string,
    options?: {
      startedAt?: number;
      durationMinutes?: number;
      task?: string;
    },
  ) => void;
};

const ActivitySheetsContext = createContext<ActivitySheetsContextValue>({
  openSheet: () => {},
});

export function useActivitySheets() {
  return useContext(ActivitySheetsContext);
}

// ─── Countdown ring ─────────────────────────────────────────────────────────

function CountdownRing({
  totalSeconds,
  elapsedSeconds,
  color,
  size,
}: {
  totalSeconds: number;
  elapsedSeconds: number;
  color: string;
  size: number;
}) {
  const r = size === 140 ? 58 : 44;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  const track = "rgba(130,130,140,0.18)";

  // Animate the ring fill smoothly between ticks
  const animatedOffset = useSharedValue(0);

  useEffect(() => {
    const target = circumference * (elapsedSeconds / totalSeconds);
    animatedOffset.value = withTiming(target, { duration: 400 });
  }, [elapsedSeconds, totalSeconds, circumference, animatedOffset]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: animatedOffset.value,
  }));

  const remaining = totalSeconds - elapsedSeconds;
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const display = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  const statusLabel =
    elapsedSeconds === 0
      ? "ready"
      : elapsedSeconds >= totalSeconds
        ? "done"
        : "running";

  return (
    <View style={{ alignItems: "center", width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: [{ rotate: "-90deg" }], position: "absolute" }}
      >
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke={track} strokeWidth={6} />
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={ringProps}
        />
      </Svg>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text selectable style={[styles.timerTime, { color: "#1C1B18" }]}>
          {display}
        </Text>
        <Text selectable style={styles.timerLabel}>
          {statusLabel}
        </Text>
      </View>
    </View>
  );
}

// ─── Timer hook ─────────────────────────────────────────────────────────────

function useTimer(
  totalSeconds: number,
  {
    initialElapsedSeconds = 0,
    autoStart = false,
  }: {
    initialElapsedSeconds?: number;
    autoStart?: boolean;
  } = {},
) {
  const boundedInitialElapsed = Math.min(initialElapsedSeconds, totalSeconds);
  const [elapsed, setElapsed] = useState(boundedInitialElapsed);
  const [running, setRunning] = useState(
    autoStart && boundedInitialElapsed < totalSeconds,
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (elapsed >= totalSeconds) return;
    setRunning(true);
  }, [elapsed, totalSeconds]);

  const pause = useCallback(() => setRunning(false), []);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
  }, []);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= totalSeconds) {
          setRunning(false);
          return totalSeconds;
        }
        return e + 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, totalSeconds]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  return { elapsed, running, start, pause, reset, done: elapsed >= totalSeconds };
}

// ─── Discrete slider (5-step) ───────────────────────────────────────────────

const SLIDER_LABELS: Record<
  "mood" | "energy" | "readiness",
  [string, string, string, string, string]
> = {
  mood: ["Low", "Okay", "Neutral", "Good", "Great"],
  energy: ["Drained", "Tired", "Okay", "Alert", "Sharp"],
  readiness: ["Avoidant", "Hesitant", "Ready", "Focused", "Locked in"],
};

function DiscreteSlider({
  metric,
  value,
  onChange,
  accentColor,
}: {
  metric: "mood" | "energy" | "readiness";
  value: number;
  onChange: (v: number) => void;
  accentColor: string;
}) {
  const labels = SLIDER_LABELS[metric];
  const name = metric.charAt(0).toUpperCase() + metric.slice(1);

  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderTop}>
        <Text selectable style={styles.sliderLabel}>
          {name}
        </Text>
        <Text selectable style={[styles.sliderValue, { color: accentColor }]}>
          {value}
        </Text>
      </View>
      <View style={styles.sliderDots}>
        {labels.map((lbl, i) => {
          const step = i + 1;
          const active = step <= value;
          return (
            <Pressable
              key={lbl}
              onPress={() => onChange(step)}
              style={styles.sliderStepWrap}
            >
              <View
                style={[
                  styles.sliderDot,
                  active
                    ? { backgroundColor: accentColor }
                    : { backgroundColor: "rgba(130,130,140,0.22)" },
                ]}
              />
              <Text selectable style={styles.sliderTick}>
                {lbl}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Staggered entrance wrapper ──────────────────────────────────────────────

function StaggeredItem({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  const { animatedStyle } = useStaggeredEntrance(index, 60);

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

// ─── Blocker prompts ─────────────────────────────────────────────────────────

const BLOCKER_PROMPTS: Record<UserProfileBiggestBlocker, string> = {
  follow_through:
    "You said follow-through is your biggest obstacle. Where did you get stuck today — even a little bit?",
  distraction:
    "You flagged distraction as your main challenge. When did your focus drift today?",
  overwhelm:
    "Overwhelm is your flagged blocker. What felt like too much today — even briefly?",
  energy:
    "Energy is what you said holds you back. When did your energy dip most today?",
};

// ─── Sheet chrome (shared wrapper) ──────────────────────────────────────────

const SCREEN_HEIGHT = Dimensions.get("window").height;
/** Max height the scrollable body can occupy (keeps header + footer visible). */
const BODY_MAX_HEIGHT = SCREEN_HEIGHT * 0.52;

function SheetFrame({
  icon,
  iconBg,
  title,
  meta,
  onClose,
  children,
  footer,
}: {
  icon: string;
  iconBg: string;
  title: string;
  meta: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.kavWrap}
    >
      <View style={styles.frame}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.sheetHead}>
          <View style={[styles.sheetIcon, { backgroundColor: iconBg }]}>
            <Text selectable style={styles.sheetIconEmoji}>
              {icon}
            </Text>
          </View>
          <View style={styles.sheetTitleWrap}>
            <Text selectable style={styles.sheetTitle}>
              {title}
            </Text>
            <Text selectable style={styles.sheetMeta}>
              {meta}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && { opacity: 0.6 },
            ]}
          >
            <FontAwesome name="times" size={13} color="#8A8780" />
          </Pressable>
        </View>

        {/* Scrollable body — explicit maxHeight so it never collapses */}
        <ScrollView
          style={{ maxHeight: BODY_MAX_HEIGHT }}
          contentContainerStyle={styles.sheetBodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        {/* Footer */}
        <View style={styles.sheetFoot}>{footer}</View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Rating sheet content ────────────────────────────────────────────────────

type RatingKey = "useful" | "diff";

function RatingSheet({
  onSubmit,
  onSkip,
  completedType,
}: {
  onSubmit: (useful: string, diff: string) => void;
  onSkip: () => void;
  completedType: ActivitySheetType;
}) {
  const [useful, setUseful] = useState("");
  const [diff, setDiff] = useState("");

  function pick(key: RatingKey, val: string) {
    if (key === "useful") setUseful(val);
    else setDiff(val);
  }

  function handleSubmit() {
    onSubmit(useful || "skipped", diff || "skipped");
  }

  const usefulOptions = ["Useful", "Meh", "Not really"] as const;
  const diffOptions = ["Easy", "Medium", "Hard"] as const;

  return (
    <SheetFrame
      icon="✓"
      iconBg="#E8F5EE"
      title="Nice work"
      meta="Quick rating — helps the AI learn faster"
      onClose={onSkip}
      footer={
        <>
          <SheetCta
            label="Submit feedback"
            color="#2D6A4F"
            onPress={handleSubmit}
          />
          <SheetGhost label="Skip rating" onPress={onSkip} />
        </>
      }
    >
      <Text selectable style={styles.sheetDesc}>
        Two quick questions. This directly improves the quality of your AI
        suggestions.
      </Text>

      <View style={styles.ratingRows}>
        <View style={styles.ratingRow}>
          <Text selectable style={styles.ratingLabel}>
            How useful was this?
          </Text>
          <View style={styles.ratingPills}>
            {usefulOptions.map((o) => (
              <Pressable
                key={o}
                onPress={() => pick("useful", o)}
                style={[
                  styles.ratingPill,
                  useful === o && styles.ratingPillSel,
                ]}
              >
                <Text
                  selectable
                  style={[
                    styles.ratingPillText,
                    useful === o && styles.ratingPillTextSel,
                  ]}
                >
                  {o}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.ratingRow}>
          <Text selectable style={styles.ratingLabel}>
            How hard was it?
          </Text>
          <View style={styles.ratingPills}>
            {diffOptions.map((o) => (
              <Pressable
                key={o}
                onPress={() => pick("diff", o)}
                style={[
                  styles.ratingPill,
                  diff === o && styles.ratingPillSel,
                ]}
              >
                <Text
                  selectable
                  style={[
                    styles.ratingPillText,
                    diff === o && styles.ratingPillTextSel,
                  ]}
                >
                  {o}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </SheetFrame>
  );
}

// ─── Check-in sheet ─────────────────────────────────────────────────────────

function CheckInSheet({
  onComplete,
  onSkip,
}: {
  onComplete: (meta: Record<string, number>) => void;
  onSkip: () => void;
}) {
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [readiness, setReadiness] = useState(3);
  const TEAL = "#2A7A6F";

  return (
    <SheetFrame
      icon="📋"
      iconBg="#E6F5F3"
      title="Morning check-in"
      meta="5 min · reflection · seeds AI baseline"
      onClose={onSkip}
      footer={
        <>
          <SheetCta
            label="Submit check-in"
            color={TEAL}
            onPress={() => onComplete({ mood, energy, readiness })}
          />
          <SheetGhost label="Skip for now" onPress={onSkip} />
        </>
      }
    >
      <View style={styles.sliders}>
        <StaggeredItem index={0}>
          <DiscreteSlider metric="mood" value={mood} onChange={setMood} accentColor={TEAL} />
        </StaggeredItem>
        <StaggeredItem index={1}>
          <DiscreteSlider metric="energy" value={energy} onChange={setEnergy} accentColor={TEAL} />
        </StaggeredItem>
        <StaggeredItem index={2}>
          <DiscreteSlider metric="readiness" value={readiness} onChange={setReadiness} accentColor={TEAL} />
        </StaggeredItem>
      </View>
    </SheetFrame>
  );
}

// ─── Priorities sheet ────────────────────────────────────────────────────────

function PrioritiesSheet({
  onComplete,
  onSkip,
}: {
  onComplete: (priorities: string[]) => void;
  onSkip: () => void;
}) {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");

  const placeholders = [
    "Most important thing today…",
    "Second priority…",
    "Third priority…",
  ];
  const values = [p1, p2, p3];
  const setters = [setP1, setP2, setP3];

  return (
    <SheetFrame
      icon="✏️"
      iconBg="#FDF3E0"
      title="Write 3 priorities"
      meta="10 min · tasks · what matters today"
      onClose={onSkip}
      footer={
        <>
          <SheetCta
            label="Save priorities"
            color="#1C1B18"
            onPress={() =>
              onComplete([p1, p2, p3].filter(Boolean))
            }
          />
          <SheetGhost label="Skip for now" onPress={onSkip} />
        </>
      }
    >
      <Text selectable style={[styles.sheetDesc, { marginBottom: 16 }]}>
        What three things would make today feel like a win? Keep them small
        enough to actually finish.
      </Text>
      <View style={styles.priorityRows}>
        {values.map((val, i) => (
          <StaggeredItem key={i} index={i}>
            <View style={styles.priorityRow}>
              <View style={styles.priorityNum}>
                <Text selectable style={styles.priorityNumText}>
                  {i + 1}
                </Text>
              </View>
              <TextInput
                style={styles.priorityInput}
                value={val}
                onChangeText={setters[i]}
                placeholder={placeholders[i]}
                placeholderTextColor="#C8C5BE"
                returnKeyType={i < 2 ? "next" : "done"}
              />
            </View>
          </StaggeredItem>
        ))}
      </View>
    </SheetFrame>
  );
}

// ─── Focus sheet ─────────────────────────────────────────────────────────────

function FocusSheet({
  activityId,
  durationMinutes = 25,
  startedAt,
  onComplete,
  onSkip,
  onNotificationTaskChange,
  onTimerStart,
}: {
  activityId?: string;
  durationMinutes?: number;
  startedAt?: number;
  onComplete: (task: string) => void;
  onSkip: () => void;
  onNotificationTaskChange: (task: string) => void;
  onTimerStart: (startedAt: number, metadata?: Record<string, unknown>) => void;
}) {
  const PURPLE = "#6B5ECD";
  const [task, setTask] = useState("");
  const hasTask = task.trim().length > 0;
  const totalSeconds = durationMinutes * 60;
  const initialElapsedSeconds = startedAt
    ? Math.min(Math.floor((Date.now() - startedAt) / 1000), totalSeconds)
    : 0;
  const [sessionStartedAt, setSessionStartedAt] = useState<number | undefined>(
    startedAt,
  );
  const canMarkComplete = hasTask && sessionStartedAt != null;
  useEffect(() => {
    setSessionStartedAt(startedAt);
  }, [startedAt]);
  const timer = useTimer(totalSeconds, {
    initialElapsedSeconds,
    autoStart:
      startedAt != null &&
      initialElapsedSeconds > 0 &&
      initialElapsedSeconds < totalSeconds,
  });

  function handleStartOrResume() {
    if (!hasTask) {
      Alert.alert(
        "Add a task first",
        "Enter what you're working on before starting the focus block.",
      );
      return;
    }

    if (timer.running) {
      timer.pause();
      return;
    }

    if (!sessionStartedAt) {
      const nextStartedAt = Date.now();
      setSessionStartedAt(nextStartedAt);
      onTimerStart(nextStartedAt, task ? { task } : undefined);
      if (activityId) {
        void scheduleFocusBlockCompletionNotification({
          activityId,
          task,
          secondsUntilCompletion: totalSeconds,
        }).catch((error) => {
          console.warn("[focus_notification] failed to schedule", error);
        });
      }
    }

    timer.start();
  }

  return (
    <SheetFrame
      icon="⚡"
      iconBg="#F0EEFF"
      title="Focus block"
      meta={`${durationMinutes} min · no interruptions`}
      onClose={onSkip}
      footer={
        <>
          <SheetCta
            label="Mark complete"
            color={PURPLE}
            onPress={() => {
              if (!canMarkComplete) {
                Alert.alert(
                  "Start the focus block first",
                  "Add what you're working on and start the timer before marking it complete.",
                );
                return;
              }

              onComplete(task);
            }}
          />
          <SheetGhost label="Skip" onPress={onSkip} />
        </>
      }
    >
      <Text selectable style={[styles.sheetDesc, { marginBottom: 20 }]}>
        Pick one thing to work on. Put your phone face-down. I'll track your
        completion rate over the week.
      </Text>

      {/* Task name input */}
      <View style={[styles.priorityRow, { marginBottom: 24 }]}>
        <TextInput
          style={[styles.priorityInput, { flex: 1 }]}
          value={task}
          onChangeText={(value) => {
            setTask(value);
            onNotificationTaskChange(value);
          }}
          placeholder="What are you working on?"
          placeholderTextColor="#C8C5BE"
          returnKeyType="done"
        />
      </View>

      {/* Timer */}
      <View style={styles.timerWrap}>
        <CountdownRing
          totalSeconds={totalSeconds}
          elapsedSeconds={timer.elapsed}
          color={PURPLE}
          size={140}
        />
        <View style={styles.timerControls}>
          <Pressable
            onPress={handleStartOrResume}
            style={({ pressed }) => [
              styles.timerPlayBtn,
              {
                backgroundColor: hasTask ? PURPLE : "rgba(107,94,205,0.4)",
                borderColor: hasTask ? PURPLE : "rgba(107,94,205,0.4)",
              },
              pressed && hasTask && { opacity: 0.8 },
            ]}
          >
            <Text selectable style={styles.timerPlayText}>
              {timer.running ? "Pause" : timer.elapsed > 0 ? "Resume" : "Start"}
            </Text>
          </Pressable>
          <Pressable
            onPress={timer.reset}
            style={({ pressed }) => [
              styles.timerPauseBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text selectable style={styles.timerPauseText}>
              Reset
            </Text>
          </Pressable>
        </View>
      </View>
    </SheetFrame>
  );
}

// ─── Reflect sheet ───────────────────────────────────────────────────────────

function ReflectSheet({
  biggestBlocker,
  onComplete,
  onSkip,
}: {
  biggestBlocker: UserProfileBiggestBlocker;
  onComplete: (text: string) => void;
  onSkip: () => void;
}) {
  const [text, setText] = useState("");
  const prompt = BLOCKER_PROMPTS[biggestBlocker];

  return (
    <SheetFrame
      icon="🪞"
      iconBg="#F5F4F1"
      title="Reflect on blocker"
      meta={`10 min · reflection · ${biggestBlocker.replace("_", " ")}`}
      onClose={onSkip}
      footer={
        <>
          <SheetCta
            label="Save reflection"
            color="#1C1B18"
            onPress={() => onComplete(text)}
          />
          <SheetGhost label="Skip" onPress={onSkip} />
        </>
      }
    >
      {/* Prompt card */}
      <View style={styles.reflectPrompt}>
        <Text selectable style={styles.reflectPromptText}>
          {prompt}
        </Text>
      </View>

      {/* Free-text input */}
      <TextInput
        style={styles.reflectInput}
        value={text}
        onChangeText={setText}
        placeholder="One sentence is enough. Be honest with yourself…"
        placeholderTextColor="#C8C5BE"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <Text selectable style={styles.reflectPrivacy}>
        This feeds the AI's understanding of your pattern. Not shared anywhere.
      </Text>
    </SheetFrame>
  );
}

// ─── Walk sheet ───────────────────────────────────────────────────────────────

const WALK_STEPS = [
  "Step outside — doesn't need to be far, just away from your screen.",
  "Leave your phone in your pocket. Let your mind wander.",
  "Come back and tap done. That's it.",
] as const;

function WalkSheet({
  durationMinutes = 15,
  startedAt,
  onComplete,
  onSkip,
  onTimerStart,
}: {
  durationMinutes?: number;
  startedAt?: number;
  onComplete: () => void;
  onSkip: () => void;
  onTimerStart: (startedAt: number) => void;
}) {
  const TEAL = "#2A7A6F";
  const totalSeconds = durationMinutes * 60;
  const initialElapsedSeconds = startedAt
    ? Math.min(Math.floor((Date.now() - startedAt) / 1000), totalSeconds)
    : 0;
  const [sessionStartedAt, setSessionStartedAt] = useState<number | undefined>(
    startedAt,
  );
  useEffect(() => {
    setSessionStartedAt(startedAt);
  }, [startedAt]);
  const timer = useTimer(totalSeconds, {
    initialElapsedSeconds,
    autoStart:
      startedAt != null &&
      initialElapsedSeconds > 0 &&
      initialElapsedSeconds < totalSeconds,
  });

  function handleStartOrResume() {
    if (timer.running) {
      timer.pause();
      return;
    }

    if (!sessionStartedAt) {
      const nextStartedAt = Date.now();
      setSessionStartedAt(nextStartedAt);
      onTimerStart(nextStartedAt);
    }

    timer.start();
  }

  return (
    <SheetFrame
      icon="🚶"
      iconBg="#E6F5F3"
      title="Walk after lunch"
      meta={`${durationMinutes} min · exercise · resets afternoon focus`}
      onClose={onSkip}
      footer={
        <>
          <SheetCta
            label="Done — I walked"
            color={TEAL}
            onPress={onComplete}
          />
          <SheetGhost label="Skip" onPress={onSkip} />
        </>
      }
    >
      <Text selectable style={[styles.sheetDesc, { marginBottom: 16 }]}>
        Added because low energy is one of your flagged blockers. Even a short
        walk significantly improves afternoon focus scores.
      </Text>

      {/* Step cards — staggered entrance */}
      <View style={styles.walkSteps}>
        {WALK_STEPS.map((step, i) => (
          <StaggeredItem key={i} index={i}>
            <View style={styles.walkStep}>
              <View style={styles.walkNum}>
                <Text selectable style={styles.walkNumText}>
                  {i + 1}
                </Text>
              </View>
              <Text selectable style={styles.walkStepText}>
                {step}
              </Text>
            </View>
          </StaggeredItem>
        ))}
      </View>

      {/* Timer */}
      <View style={[styles.timerWrap, { marginTop: 16 }]}>
        <CountdownRing
          totalSeconds={totalSeconds}
          elapsedSeconds={timer.elapsed}
          color={TEAL}
          size={110}
        />
        <View style={styles.timerControls}>
          <Pressable
            onPress={handleStartOrResume}
            style={({ pressed }) => [
              styles.timerPlayBtn,
              { backgroundColor: TEAL, borderColor: TEAL },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text selectable style={styles.timerPlayText}>
              {timer.running ? "Pause" : timer.elapsed > 0 ? "Resume" : "Start"}
            </Text>
          </Pressable>
          <Pressable
            onPress={timer.reset}
            style={({ pressed }) => [
              styles.timerPauseBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text selectable style={styles.timerPauseText}>
              Reset
            </Text>
          </Pressable>
        </View>
      </View>
    </SheetFrame>
  );
}

// ─── Shared CTA buttons ──────────────────────────────────────────────────────

function SheetCta({
  label,
  color,
  onPress,
}: {
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.sheetCta,
        { backgroundColor: color },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text selectable style={styles.sheetCtaText}>
        {label}
      </Text>
    </Pressable>
  );
}

function SheetGhost({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.sheetGhost,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text selectable style={styles.sheetGhostText}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────

type SheetState =
  | {
      kind: "activity";
      type: ActivitySheetType;
      activityId?: string;
      assignmentId?: string;
      startedAt?: number;
      durationMinutes?: number;
      task?: string;
    }
  | {
      kind: "rating";
      completedType: ActivitySheetType;
      activityId?: string;
      assignmentId?: string;
    }
  | null;

export function ActivitySheetsProvider({
  children,
  biggestBlocker = "follow_through",
  onActivityStart,
  onActivityComplete,
  onActivitySkip,
}: {
  children: React.ReactNode;
  biggestBlocker?: UserProfileBiggestBlocker;
  onActivityStart?: (activityId: string, startedAt?: number) => void;
  /** Called with the activity id when a user completes an activity + rating. */
  onActivityComplete?: (activityId: string) => void;
  onActivitySkip?: (activityId: string) => void;
}) {
  const [sheetState, setSheetState] = useState<SheetState>(null);
  const recordActivityReflection = useMutation(
    api.firstRunDays.recordActivityReflection,
  );
  const recordActivityCompletion = useMutation(
    api.firstRunDays.recordActivityCompletion,
  );

  const persistActivityEvent = useCallback(
    (
      assignmentId: string | undefined,
      action: "started" | "completed" | "skipped",
      metadata?: Record<string, unknown>,
    ) => {
      if (!assignmentId) {
        return;
      }

      void recordActivityCompletion({
        assignmentId: assignmentId as any,
        action,
        metadata,
        elapsedMs:
          typeof metadata?.elapsedMs === "number"
            ? (metadata.elapsedMs as number)
            : undefined,
      }).catch((error) => {
        Alert.alert(
          "Activity update failed",
          error instanceof Error ? error.message : "Could not record activity progress.",
        );
      });
    },
    [recordActivityCompletion],
  );

  const openSheet = useCallback(
    (
      type: ActivitySheetType,
      activityId?: string,
      assignmentId?: string,
      options?: {
        startedAt?: number;
        durationMinutes?: number;
        task?: string;
      },
    ) => {
      if (type !== "focus" && type !== "walk") {
        persistActivityEvent(assignmentId, "started");
        if (activityId) onActivityStart?.(activityId);
      }
      setSheetState({
        kind: "activity",
        type,
        activityId,
        assignmentId,
        startedAt: options?.startedAt,
        durationMinutes: options?.durationMinutes,
        task: options?.task,
      });
    },
    [onActivityStart, persistActivityEvent],
  );

  function closeAll() {
    setSheetState(null);
  }

  function handleSkip(type: ActivitySheetType) {
    const activityId = sheetState?.activityId;
    const assignmentId = sheetState?.assignmentId;
    persistActivityEvent(assignmentId, "skipped");
    if (type === "focus" && activityId) {
      void cancelFocusBlockNotification(activityId).catch((error) => {
        console.warn("[focus_notification] failed to cancel", error);
      });
    }
    if (activityId) onActivitySkip?.(activityId);
    closeAll();
  }

  function handleComplete(type: ActivitySheetType, metadata?: Record<string, unknown>) {
    const activityId = sheetState?.activityId;
    const assignmentId = sheetState?.assignmentId;
    persistActivityEvent(assignmentId, "completed", metadata);
    if (type === "focus" && activityId) {
      void cancelFocusBlockNotification(activityId).catch((error) => {
        console.warn("[focus_notification] failed to cancel", error);
      });
    }
    // Mark the card done immediately
    if (activityId) onActivityComplete?.(activityId);
    // Slide directly into rating sheet
    setSheetState({ kind: "rating", completedType: type, activityId, assignmentId });
  }

  function handleRatingSubmit(useful: string, diff: string) {
    const completedType =
      sheetState?.kind === "rating" ? sheetState.completedType : "checkin";
    const assignmentId = sheetState?.assignmentId;

    if (assignmentId) {
      // Persist reflection to Convex
      void recordActivityReflection({
        assignmentId: assignmentId as any,
        useful: useful || "skipped",
        difficulty: diff || "skipped",
      }).catch((error) => {
        console.warn("[activity_reflection] failed to persist", error);
      });
    } else {
      // Fallback for static activities without an assignmentId
      recordActivityReflectionLocal(completedType, useful, diff);
    }

    closeAll();
  }

  const isActivityVisible =
    sheetState?.kind === "activity" && sheetState.type != null;
  const isRatingVisible = sheetState?.kind === "rating";
  const activeType = sheetState?.kind === "activity" ? sheetState.type : null;

  return (
    <ActivitySheetsContext.Provider value={{ openSheet }}>
      {children}

      {/* ── Activity sheet ── */}
      <Modal
        visible={isActivityVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeAll}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={closeAll} />
          {activeType === "checkin" && (
            <CheckInSheet
              onComplete={(meta) => handleComplete("checkin", meta)}
              onSkip={() => handleSkip("checkin")}
            />
          )}
          {activeType === "priorities" && (
            <PrioritiesSheet
              onComplete={(priorities) =>
                handleComplete("priorities", { priorities })
              }
              onSkip={() => handleSkip("priorities")}
            />
          )}
          {activeType === "focus" && (
            <FocusSheet
              activityId={
                sheetState?.kind === "activity"
                  ? sheetState.activityId
                  : undefined
              }
              durationMinutes={
                sheetState?.kind === "activity"
                  ? sheetState.durationMinutes
                  : undefined
              }
              startedAt={
                sheetState?.kind === "activity"
                  ? sheetState.startedAt
                  : undefined
              }
              onComplete={(task) =>
                handleComplete("focus", {
                  task,
                  startedAt:
                    sheetState?.kind === "activity"
                      ? sheetState.startedAt
                      : undefined,
                  elapsedMs:
                    sheetState?.kind === "activity" &&
                    sheetState.startedAt != null
                      ? Math.max(Date.now() - sheetState.startedAt, 0)
                      : undefined,
                })
              }
              onSkip={() => handleSkip("focus")}
              onNotificationTaskChange={(task) => {
                setSheetState((prev) =>
                  prev?.kind === "activity"
                    ? { ...prev, task }
                    : prev,
                );
              }}
              onTimerStart={(nextStartedAt, metadata) => {
                const assignmentId =
                  sheetState?.kind === "activity"
                    ? sheetState.assignmentId
                    : undefined;
                const activityId =
                  sheetState?.kind === "activity"
                    ? sheetState.activityId
                    : undefined;
                persistActivityEvent(assignmentId, "started", {
                  startedAt: nextStartedAt,
                  ...metadata,
                });
                if (activityId) {
                  onActivityStart?.(activityId, nextStartedAt);
                }
                setSheetState((prev) =>
                  prev?.kind === "activity"
                    ? { ...prev, startedAt: nextStartedAt, task: metadata?.task as string | undefined }
                    : prev,
                );
              }}
            />
          )}
          {activeType === "reflect" && (
            <ReflectSheet
              biggestBlocker={biggestBlocker}
              onComplete={(text) => handleComplete("reflect", { text })}
              onSkip={() => handleSkip("reflect")}
            />
          )}
          {activeType === "walk" && (
            <WalkSheet
              durationMinutes={
                sheetState?.kind === "activity"
                  ? sheetState.durationMinutes
                  : undefined
              }
              startedAt={
                sheetState?.kind === "activity"
                  ? sheetState.startedAt
                  : undefined
              }
              onComplete={() =>
                handleComplete("walk", {
                  startedAt:
                    sheetState?.kind === "activity"
                      ? sheetState.startedAt
                      : undefined,
                  elapsedMs:
                    sheetState?.kind === "activity" &&
                    sheetState.startedAt != null
                      ? Math.max(Date.now() - sheetState.startedAt, 0)
                      : undefined,
                })
              }
              onSkip={() => handleSkip("walk")}
              onTimerStart={(nextStartedAt) => {
                const assignmentId =
                  sheetState?.kind === "activity"
                    ? sheetState.assignmentId
                    : undefined;
                const activityId =
                  sheetState?.kind === "activity"
                    ? sheetState.activityId
                    : undefined;
                persistActivityEvent(assignmentId, "started", {
                  startedAt: nextStartedAt,
                });
                if (activityId) {
                  onActivityStart?.(activityId, nextStartedAt);
                }
                setSheetState((prev) =>
                  prev?.kind === "activity"
                    ? { ...prev, startedAt: nextStartedAt }
                    : prev,
                );
              }}
            />
          )}
        </View>
      </Modal>

      {/* ── Rating sheet (auto-shown after completion) ── */}
      <Modal
        visible={isRatingVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeAll}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={closeAll} />
          <RatingSheet
            completedType={
              sheetState?.kind === "rating"
                ? sheetState.completedType
                : "checkin"
            }
            onSubmit={handleRatingSubmit}
            onSkip={closeAll}
          />
        </View>
      </Modal>
    </ActivitySheetsContext.Provider>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Modal root
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(28,27,24,0.45)",
  },

  // Sheet frame
  kavWrap: {
    justifyContent: "flex-end",
  },
  frame: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "#E8E6E1",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
  },
  sheetHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E8E6E1",
    gap: 12,
  },
  sheetIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sheetIconEmoji: {
    fontSize: 18,
    lineHeight: 22,
  },
  sheetTitleWrap: {
    flex: 1,
  },
  sheetTitle: {
    fontFamily: "Geist",
    fontWeight: "600",
    fontSize: 17,
    lineHeight: 22,
    color: "#1C1B18",
  },
  sheetMeta: {
    fontSize: 12,
    lineHeight: 16,
    color: "#8A8780",
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E6E1",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sheetBodyContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 8,
  },
  sheetFoot: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 36 : 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E8E6E1",
    gap: 8,
  },

  // CTA buttons
  sheetCta: {
    alignItems: "center",
    borderRadius: 13,
    height: 50,
    justifyContent: "center",
    width: "100%",
  },
  sheetCtaText: {
    fontFamily: "Figtree",
    fontWeight: "600",
    fontSize: 14,
    color: "#FAFAF8",
  },
  sheetGhost: {
    alignItems: "center",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E8E6E1",
    height: 46,
    justifyContent: "center",
    width: "100%",
  },
  sheetGhostText: {
    fontSize: 14,
    color: "#8A8780",
  },

  // Shared desc
  sheetDesc: {
    fontSize: 13,
    lineHeight: 20,
    color: "#8A8780",
  },

  // Discrete slider
  sliders: {
    gap: 20,
  },
  sliderRow: {
    gap: 8,
  },
  sliderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderLabel: {
    fontFamily: "Geist",
    fontWeight: "600",
    fontSize: 13,
    color: "#1C1B18",
  },
  sliderValue: {
    fontFamily: "Geist",
    fontWeight: "600",
    fontSize: 13,
    minWidth: 20,
    textAlign: "right",
  },
  sliderDots: {
    flexDirection: "row",
    gap: 6,
  },
  sliderStepWrap: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  sliderDot: {
    width: "100%",
    height: 8,
    borderRadius: 4,
  },
  sliderTick: {
    fontSize: 9,
    color: "#C8C5BE",
    textAlign: "center",
  },

  // Priority rows
  priorityRows: {
    gap: 8,
  },
  priorityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E6E1",
    backgroundColor: "#F5F4F1",
  },
  priorityNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1C1B18",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  priorityNumText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FAFAF8",
  },
  priorityInput: {
    flex: 1,
    fontSize: 14,
    color: "#1C1B18",
    fontFamily: "Geist",
  },

  // Timer
  timerWrap: {
    alignItems: "center",
    gap: 16,
  },
  timerTime: {
    fontFamily: "Geist",
    fontWeight: "300",
    fontSize: 32,
    lineHeight: 36,
  },
  timerLabel: {
    fontSize: 11,
    color: "#8A8780",
    marginTop: 4,
  },
  timerControls: {
    flexDirection: "row",
    gap: 10,
  },
  timerPlayBtn: {
    paddingHorizontal: 24,
    paddingVertical: 9,
    borderRadius: 99,
    borderWidth: 1,
  },
  timerPlayText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FAFAF8",
  },
  timerPauseBtn: {
    paddingHorizontal: 24,
    paddingVertical: 9,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#D4D1CA",
    backgroundColor: "#F5F4F1",
  },
  timerPauseText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1C1B18",
  },

  // Reflect
  reflectPrompt: {
    backgroundColor: "#F5F4F1",
    borderLeftWidth: 3,
    borderLeftColor: "#9A6B1A",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  reflectPromptText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#8A8780",
  },
  reflectInput: {
    backgroundColor: "#F5F4F1",
    borderWidth: 1,
    borderColor: "#E8E6E1",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#1C1B18",
    minHeight: 100,
    fontFamily: "Geist",
  },
  reflectPrivacy: {
    fontSize: 12,
    color: "#C8C5BE",
    marginTop: 8,
  },

  // Walk steps
  walkSteps: {
    gap: 10,
  },
  walkStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E6E1",
    backgroundColor: "#F5F4F1",
  },
  walkNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D4D1CA",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  walkNumText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#8A8780",
  },
  walkStepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#1C1B18",
  },

  // Rating
  ratingRows: {
    gap: 16,
  },
  ratingRow: {
    gap: 10,
  },
  ratingLabel: {
    fontFamily: "Geist",
    fontWeight: "600",
    fontSize: 13,
    color: "#1C1B18",
  },
  ratingPills: {
    flexDirection: "row",
    gap: 6,
  },
  ratingPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#E8E6E1",
  },
  ratingPillSel: {
    backgroundColor: "#1C1B18",
    borderColor: "#1C1B18",
  },
  ratingPillText: {
    fontSize: 12,
    color: "#8A8780",
  },
  ratingPillTextSel: {
    color: "#FAFAF8",
  },
});

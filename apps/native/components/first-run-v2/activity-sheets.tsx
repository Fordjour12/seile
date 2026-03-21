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

import FontAwesome from "@expo/vector-icons/FontAwesome";

import { Text } from "@/components/ui";
import { NAV_THEME, UI_PRESETS, Typography } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import type { UserProfileBiggestBlocker } from "@/lib/user-profile";

// ─── Activity type ──────────────────────────────────────────────────────────

export type ActivitySheetType =
  | "checkin"
  | "priorities"
  | "focus"
  | "reflect"
  | "walk";

// ─── Stub mutations (replace with real Convex calls later) ──────────────────

function recordActivityEvent(
  type: ActivitySheetType,
  action: "started" | "completed" | "skipped",
  metadata?: Record<string, unknown>,
) {
  console.log("[activity_event]", { type, action, ...metadata });
}

function recordActivityReflection(
  type: ActivitySheetType,
  useful: string,
  difficulty: string,
) {
  console.log("[activity_reflection]", { type, useful, difficulty, confidenceDelta: 10 });
}

// ─── Context ────────────────────────────────────────────────────────────────

type ActivitySheetsContextValue = {
  openSheet: (type: ActivitySheetType) => void;
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
  const offset = circumference * (elapsedSeconds / totalSeconds);
  const cx = size / 2;
  const cy = size / 2;
  const track = "rgba(130,130,140,0.18)";

  const remaining = totalSeconds - elapsedSeconds;
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const display = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  return (
    <View style={{ alignItems: "center", width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: [{ rotate: "-90deg" }], position: "absolute" }}
      >
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke={track} strokeWidth={6} />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </Svg>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text selectable style={[styles.timerTime, { color: "#1C1B18" }]}>
          {display}
        </Text>
        <Text selectable style={styles.timerLabel}>
          {elapsedSeconds === 0
            ? "ready"
            : elapsedSeconds >= totalSeconds
              ? "done"
              : "running"}
        </Text>
      </View>
    </View>
  );
}

// ─── Timer hook ─────────────────────────────────────────────────────────────

function useTimer(totalSeconds: number) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
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
      style={styles.frame}
    >
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

      {/* Scrollable body */}
      <ScrollView
        style={styles.sheetBody}
        contentContainerStyle={styles.sheetBodyContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {/* Footer */}
      <View style={styles.sheetFoot}>{footer}</View>
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
        <DiscreteSlider metric="mood" value={mood} onChange={setMood} accentColor={TEAL} />
        <DiscreteSlider metric="energy" value={energy} onChange={setEnergy} accentColor={TEAL} />
        <DiscreteSlider metric="readiness" value={readiness} onChange={setReadiness} accentColor={TEAL} />
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
          <View key={i} style={styles.priorityRow}>
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
        ))}
      </View>
    </SheetFrame>
  );
}

// ─── Focus sheet ─────────────────────────────────────────────────────────────

function FocusSheet({
  onComplete,
  onSkip,
}: {
  onComplete: (task: string) => void;
  onSkip: () => void;
}) {
  const PURPLE = "#6B5ECD";
  const [task, setTask] = useState("");
  const timer = useTimer(25 * 60);

  return (
    <SheetFrame
      icon="⚡"
      iconBg="#F0EEFF"
      title="Focus block"
      meta="25 min · no interruptions"
      onClose={onSkip}
      footer={
        <>
          <SheetCta
            label="Mark complete"
            color={PURPLE}
            onPress={() => onComplete(task)}
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
          onChangeText={setTask}
          placeholder="What are you working on?"
          placeholderTextColor="#C8C5BE"
          returnKeyType="done"
        />
      </View>

      {/* Timer */}
      <View style={styles.timerWrap}>
        <CountdownRing
          totalSeconds={25 * 60}
          elapsedSeconds={timer.elapsed}
          color={PURPLE}
          size={140}
        />
        <View style={styles.timerControls}>
          <Pressable
            onPress={timer.running ? timer.pause : timer.start}
            style={({ pressed }) => [
              styles.timerPlayBtn,
              { backgroundColor: PURPLE, borderColor: PURPLE },
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
  onComplete,
  onSkip,
}: {
  onComplete: () => void;
  onSkip: () => void;
}) {
  const TEAL = "#2A7A6F";
  const timer = useTimer(15 * 60);

  return (
    <SheetFrame
      icon="🚶"
      iconBg="#E6F5F3"
      title="Walk after lunch"
      meta="15 min · exercise · resets afternoon focus"
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

      {/* Step cards */}
      <View style={styles.walkSteps}>
        {WALK_STEPS.map((step, i) => (
          <View key={i} style={styles.walkStep}>
            <View style={styles.walkNum}>
              <Text selectable style={styles.walkNumText}>
                {i + 1}
              </Text>
            </View>
            <Text selectable style={styles.walkStepText}>
              {step}
            </Text>
          </View>
        ))}
      </View>

      {/* Timer */}
      <View style={[styles.timerWrap, { marginTop: 16 }]}>
        <CountdownRing
          totalSeconds={15 * 60}
          elapsedSeconds={timer.elapsed}
          color={TEAL}
          size={110}
        />
        <View style={styles.timerControls}>
          <Pressable
            onPress={timer.running ? timer.pause : timer.start}
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
  | { kind: "activity"; type: ActivitySheetType }
  | { kind: "rating"; completedType: ActivitySheetType }
  | null;

export function ActivitySheetsProvider({
  children,
  biggestBlocker = "follow_through",
}: {
  children: React.ReactNode;
  biggestBlocker?: UserProfileBiggestBlocker;
}) {
  const [sheetState, setSheetState] = useState<SheetState>(null);

  const openSheet = useCallback((type: ActivitySheetType) => {
    recordActivityEvent(type, "started");
    setSheetState({ kind: "activity", type });
  }, []);

  function closeAll() {
    setSheetState(null);
  }

  function handleSkip(type: ActivitySheetType) {
    recordActivityEvent(type, "skipped");
    closeAll();
  }

  function handleComplete(type: ActivitySheetType, metadata?: Record<string, unknown>) {
    recordActivityEvent(type, "completed", metadata);
    // Slide directly into rating sheet
    setSheetState({ kind: "rating", completedType: type });
  }

  function handleRatingSubmit(useful: string, diff: string) {
    const completedType =
      sheetState?.kind === "rating" ? sheetState.completedType : "checkin";
    recordActivityReflection(completedType, useful, diff);
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
              onComplete={(task) => handleComplete("focus", { task })}
              onSkip={() => handleSkip("focus")}
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
              onComplete={() => handleComplete("walk")}
              onSkip={() => handleSkip("walk")}
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
  frame: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "82%",
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
  sheetBody: {
    flex: 1,
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

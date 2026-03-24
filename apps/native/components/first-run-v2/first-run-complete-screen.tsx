import React, { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { router } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@seile/backend/convexApi";

import { Text } from "@/components/ui";
import { Container } from "@/components/container";
import { UI_PRESETS, Typography } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { useFirstRunV2Theme } from "@/components/first-run-v2/tokens";
import {
  FIRST_RUN_TODAY_STATES,
  type CompleteDay,
  type DayActivityItem,
  useCompleteDays,
} from "@/components/first-run-v2/data";
import {
  ActionCard,
  AISuggestionCard,
  CheckInCard,
  ConfidenceCard,
  DayActivityCard,
  DomainUnlockCard,
  EmptyHabitCard,
  ExperienceStage,
  FirstRunScroll,
  InsightCard,
  PhasePill,
  ProgressCard,
  RecapCard,
  SectionTitle,
} from "@/components/first-run-v2/shared";
import {
  ActivitySheetsProvider,
  useActivitySheets,
  type ActivitySheetType,
} from "@/components/first-run-v2/activity-sheets";

// ─── Day dots row ──────────────────────────────────────────────────────────

function DayDotsRow({
  total,
  done,
  phase,
}: {
  total: number;
  done: number;
  phase: "seed" | "learn" | "act";
}) {
  const { tokens } = useFirstRunV2Theme();

  const phaseAccent = {
    seed: tokens.phaseSeed.text,
    learn: tokens.phaseLearn.text,
    act: tokens.phaseAct.text,
  }[phase];

  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i < done;
        const isCurrent = i === done;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: isDone
                  ? tokens.textPrimary
                  : isCurrent
                    ? phaseAccent
                    : tokens.cardBorder,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// ─── Avatar / initials button ──────────────────────────────────────────────

function AvatarButton({ name }: { name?: string | null }) {
  const { tokens } = useFirstRunV2Theme();
  const initials = name
    ? name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <Pressable
      onPress={() => router.push("/(tabs)/settings" as never)}
      style={({ pressed }) => [
        styles.avatarButton,
        {
          backgroundColor: tokens.primaryMuted,
          borderColor: tokens.cardBorder,
        },
        pressed && { opacity: tokens.pressedOpacity },
      ]}
    >
      <Text
        selectable
        style={[styles.avatarInitials, { color: tokens.primary }]}
      >
        {initials}
      </Text>
    </Pressable>
  );
}

// ─── Day chip row ──────────────────────────────────────────────────────────

function DayChipRow({
  completeDays,
  selectedDay,
  maxUnlocked,
  onSelect,
}: {
  completeDays: CompleteDay[];
  selectedDay: number;
  maxUnlocked: number;
  onSelect: (day: number) => void;
}) {
  const { tokens } = useFirstRunV2Theme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRowContent}
    >
      {completeDays.map((d) => {
        const isSelected = d.day === selectedDay;
        const isLocked = d.day > maxUnlocked;

        return (
          <Pressable
            key={d.day}
            onPress={() => !isLocked && onSelect(d.day)}
            style={({ pressed }) => [
              styles.dayChip,
              isSelected
                ? {
                    backgroundColor: tokens.primary,
                    borderColor: tokens.primary,
                  }
                : {
                    backgroundColor: "transparent",
                    borderColor: tokens.cardBorder,
                  },
              isLocked && styles.dayChipLocked,
              pressed && !isLocked && { opacity: tokens.pressedOpacity },
            ]}
          >
            <Text
              selectable
              style={[
                styles.dayChipText,
                {
                  color: isSelected
                    ? tokens.textInverse
                    : isLocked
                      ? tokens.textSecondary
                      : tokens.textPrimary,
                  opacity: isLocked ? 0.45 : 1,
                },
              ]}
            >
              Day {d.day}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Incomplete activities banner ─────────────────────────────────────────

function IncompleteBanner({
  count,
  onGoBack,
}: {
  count: number;
  onGoBack: () => void;
}) {
  const { tokens } = useFirstRunV2Theme();

  return (
    <Pressable
      onPress={onGoBack}
      style={({ pressed }) => [
        styles.incompleteBanner,
        {
          backgroundColor: tokens.phaseLearn?.bg ?? "#2a1040",
          borderColor: tokens.phaseLearn?.border ?? "#6b4e9e",
        },
        pressed && { opacity: 0.84 },
      ]}
    >
      <View style={styles.incompleteBannerContent}>
        <Text selectable style={[styles.incompleteBannerIcon]}>
          ⏳
        </Text>
        <View style={styles.incompleteBannerText}>
          <Text
            selectable
            style={[
              styles.incompleteBannerTitle,
              { color: tokens.textPrimary },
            ]}
          >
            {count} unfinished {count === 1 ? "activity" : "activities"} from
            earlier
          </Text>
          <Text
            selectable
            style={[
              styles.incompleteBannerSub,
              { color: tokens.textSecondary },
            ]}
          >
            Tap to go back and finish them
          </Text>
        </View>
        <Text
          selectable
          style={[
            styles.incompleteBannerChevron,
            { color: tokens.textSecondary },
          ]}
        >
          ‹
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Per-day content ──────────────────────────────────────────────────────

function DayContent({
  day,
  doneIds,
  startedIds,
  startedAtById,
  onToggleActivity,
  onCompleteCta,
  onSuggestionFeedback,
  onGoToPreviousDay,
}: {
  day: CompleteDay;
  doneIds: Set<string>;
  startedIds: Set<string>;
  startedAtById: Record<string, number>;
  onToggleActivity: (id: string) => void;
  onCompleteCta: () => void;
  onSuggestionFeedback: (
    suggestionId: string | undefined,
    verdict: "accepted" | "dismissed" | "snoozed",
  ) => void;
  onGoToPreviousDay: () => void;
}) {
  const { tokens } = useFirstRunV2Theme();
  const { openSheet } = useActivitySheets();

  // Confidence card items: use the ConfidenceCard-compatible shape
  const confidenceItems = day.confidence
    ? day.confidence.map((c) => ({
        label: c.label,
        score: c.score,
        tier: c.tier,
      }))
    : undefined;

  return (
    <>
      {/* ── Header block ── */}
      <View style={styles.dayHeader}>
        <Text
          selectable
          variant="muted"
          style={[styles.dayEyebrow, { color: tokens.textSecondary }]}
        >
          {day.eyebrow}
        </Text>
        <View style={styles.dayTitleRow}>
          <Text
            selectable
            variant="h3"
            style={[styles.dayTitle, { color: tokens.textPrimary }]}
          >
            {day.title}{" "}
            <Text
              selectable
              variant="h3"
              style={[
                styles.dayTitle,
                styles.dayTitleItalic,
                { color: tokens.textPrimary },
              ]}
            >
              {day.titleItalic}
            </Text>
          </Text>
          <PhasePill phase={day.phase} />
        </View>
      </View>

      {/* ── Incomplete activities banner ── */}
      {day.incompletePreviousDayCount != null &&
      day.incompletePreviousDayCount > 0 ? (
        <IncompleteBanner
          count={day.incompletePreviousDayCount}
          onGoBack={onGoToPreviousDay}
        />
      ) : null}

      {/* ── Insight card ── */}
      <InsightCard
        label={day.insightEyebrow}
        body={day.insightText}
        actions={[]}
      />

      {/* ── Progress + day dots ── */}
      <View>
        <ProgressCard
          label={`Day ${day.day} of 7`}
          progress={day.progressPercent}
          subtitle={day.insightSub}
        />
        <View style={styles.dotsRowWrapper}>
          <DayDotsRow total={7} done={day.dotsDone} phase={day.phase} />
        </View>
      </View>

      {/* ── Check-in card ── */}
      {day.hasCheckin ? <CheckInCard /> : null}

      {/* ── Activities ── */}
      {day.activities && day.activities.length > 0 ? (
        <>
          <SectionTitle label="Suggested activities" />
          {day.activities.map((activity: DayActivityItem) => {
            const isDone = activity.done === true || doneIds.has(activity.id);
            const isStarted =
              !isDone &&
              (activity.started === true || startedIds.has(activity.id));

            return (
              <DayActivityCard
                key={activity.id}
                item={activity}
                status={isDone ? "done" : isStarted ? "started" : "pending"}
                startedAt={startedAtById[activity.id] ?? activity.startedAt}
                durationMinutes={activity.durationMinutes}
                onToggle={() => onToggleActivity(activity.id)}
                onStart={
                  activity.sheetType
                    ? () =>
                        openSheet(
                          activity.sheetType as ActivitySheetType,
                          activity.id,
                          activity.assignmentId,
                          {
                            startedAt:
                              startedAtById[activity.id] ?? activity.startedAt,
                            durationMinutes: activity.durationMinutes,
                          },
                        )
                    : undefined
                }
              />
            );
          })}
        </>
      ) : null}

      {/* ── AI suggestion ── */}
      {day.suggestion ? (
        <>
          <SectionTitle label={day.suggestion.eyebrow} />
          <AISuggestionCard
            item={day.suggestion}
            onAccept={() =>
              onSuggestionFeedback(day.suggestion?.suggestionId, "accepted")
            }
            onDismiss={() =>
              onSuggestionFeedback(day.suggestion?.suggestionId, "dismissed")
            }
            onSnooze={
              day.suggestion.snoozeLabel
                ? () =>
                    onSuggestionFeedback(
                      day.suggestion?.suggestionId,
                      "snoozed",
                    )
                : undefined
            }
          />
        </>
      ) : null}

      {/* ── Domain unlock ── */}
      {day.unlock ? (
        <>
          <SectionTitle label="Domain unlock" />
          <DomainUnlockCard item={day.unlock} />
        </>
      ) : null}

      {/* ── Confidence ── */}
      {confidenceItems ? (
        <>
          {day.confidenceLabel ? (
            <SectionTitle label={day.confidenceLabel} />
          ) : null}
          <ConfidenceCard items={confidenceItems} />
        </>
      ) : null}

      {/* ── Recap (day 7) ── */}
      {day.recap ? <RecapCard recap={day.recap} onCta={onCompleteCta} /> : null}

      {/* ── Day 1: suggested priorities + habits ── */}
      {day.day === 1 ? <Day1Extras /> : null}
    </>
  );
}

function Day1Extras() {
  const day1 = FIRST_RUN_TODAY_STATES.find((s) => s.id === "day1-morning");
  if (!day1) return null;

  return (
    <>
      {day1.actions?.length ? (
        <>
          <SectionTitle label="Suggested to start" />
          {day1.actions.map((item) => (
            <ActionCard
              key={item.title}
              item={item}
              previewTitle={item.title}
            />
          ))}
        </>
      ) : null}

      {day1.prompt ? (
        <>
          <SectionTitle label="Habits" />
          <EmptyHabitCard
            title={day1.prompt.title}
            subtitle={day1.prompt.subtitle}
          />
        </>
      ) : null}
    </>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────

export function FirstRunCompleteScreen() {
  const { user, daysSinceFirstLogin, completeFirstRun } = useAuth();
  const { tokens } = useFirstRunV2Theme();
  const completeDays = useCompleteDays();
  const recordSuggestionFeedback = useMutation(
    api.firstRunDays.recordSuggestionFeedback,
  );
  const seedDayActivities = useMutation(api.firstRunDays.seedDayActivities);

  // Determine max unlocked day: daysSinceFirstLogin is 0-based days after first login
  // Day 1 is always unlocked. daysSinceFirstLogin=0 → day 1, 1 → day 2, etc.
  const rawDays = daysSinceFirstLogin ?? 0;
  const maxUnlocked = Math.min(Math.max(rawDays + 1, 1), 7);

  const [selectedDay, setSelectedDay] = useState<number>(maxUnlocked);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [startedIds, setStartedIds] = useState<Set<string>>(new Set());
  const [startedAtById, setStartedAtById] = useState<Record<string, number>>(
    {},
  );

  // Auto-seed activities for the current day if they haven't been seeded yet.
  // This handles the case where onboarding was initialized before the seeding
  // code was deployed — the scheduled seedDayActivitiesForUser never ran.
  const seededDaysRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    // Check if the current day's activities came from the backend (have assignmentId)
    // or are static fallback (no assignmentId). If static, trigger seeding.
    const currentDayData = completeDays[maxUnlocked - 1];
    const hasBackendActivities = currentDayData?.activities?.some(
      (a) => a.assignmentId,
    );

    if (!hasBackendActivities && !seededDaysRef.current.has(maxUnlocked)) {
      seededDaysRef.current.add(maxUnlocked);
      // Seed all days up to and including the current unlocked day
      for (let d = 1; d <= maxUnlocked; d++) {
        const dayData = completeDays[d - 1];
        const dayHasBackend = dayData?.activities?.some((a) => a.assignmentId);
        if (!dayHasBackend) {
          void seedDayActivities({ dayNumber: d }).catch(() => {
            // Seeding failed silently — static fallback will still work
          });
        }
      }
    }
  }, [completeDays, maxUnlocked, seedDayActivities]);

  const currentDay = completeDays[selectedDay - 1] ?? completeDays[0];

  function handleToggleActivity(id: string) {
    setDoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleCompleteCta() {
    await completeFirstRun();
    router.replace("/(tabs)" as never);
  }

  function handleSuggestionFeedback(
    suggestionId: string | undefined,
    verdict: "accepted" | "dismissed" | "snoozed",
  ) {
    if (!suggestionId) {
      Alert.alert(
        "Suggestion unavailable",
        "No backend suggestion is attached to this card yet.",
      );
      return;
    }

    void recordSuggestionFeedback({
      suggestionId: suggestionId as any,
      verdict,
    }).catch((error) => {
      Alert.alert(
        "Update failed",
        error instanceof Error
          ? error.message
          : "Could not save suggestion feedback.",
      );
    });
  }

  // Pull biggestBlocker from user profile if available
  const biggestBlocker = (user as { biggestBlocker?: string } | null)
    ?.biggestBlocker as
    | "follow_through"
    | "distraction"
    | "overwhelm"
    | "energy"
    | undefined;

  return (
    <ActivitySheetsProvider
      biggestBlocker={biggestBlocker ?? "follow_through"}
      onActivityStart={(id, startedAt) => {
        setStartedIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        if (typeof startedAt === "number") {
          setStartedAtById((prev) => ({ ...prev, [id]: startedAt }));
        }
      }}
      onActivityComplete={(id) => {
        setDoneIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        setStartedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setStartedAtById((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }}
      onActivitySkip={(id) => {
        setStartedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setStartedAtById((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }}
    >
      <Container>
        <FirstRunScroll>
          {/* ── Top row: label + day counter + avatar ── */}
          <View style={styles.topRow}>
            <View style={styles.topRowLeft}>
              <Text
                selectable
                variant="muted"
                style={[styles.screenLabel, { color: tokens.textSecondary }]}
              >
                First run
              </Text>
              <View
                style={[
                  styles.dayCounter,
                  {
                    backgroundColor: tokens.primaryMuted,
                    borderColor: tokens.cardBorder,
                  },
                ]}
              >
                <Text
                  selectable
                  variant="muted"
                  style={[styles.dayCounterText, { color: tokens.background }]}
                >
                  Day {maxUnlocked} of 7
                </Text>
              </View>
            </View>
            <AvatarButton name={user?.name} />
          </View>

          {/* ── Day chip selector ── */}
          <DayChipRow
            completeDays={completeDays}
            selectedDay={selectedDay}
            maxUnlocked={maxUnlocked}
            onSelect={setSelectedDay}
          />

          {/* ── Animated per-day content ── */}
          <ExperienceStage stageKey={`day-${selectedDay}`}>
            <DayContent
              day={currentDay}
              doneIds={doneIds}
              startedIds={startedIds}
              startedAtById={startedAtById}
              onToggleActivity={handleToggleActivity}
              onCompleteCta={handleCompleteCta}
              onSuggestionFeedback={handleSuggestionFeedback}
              onGoToPreviousDay={() => {
                // Navigate to the most recent day with incomplete activities
                for (let d = selectedDay - 1; d >= 1; d--) {
                  if (d <= maxUnlocked) {
                    setSelectedDay(d);
                    return;
                  }
                }
              }}
            />
          </ExperienceStage>
        </FirstRunScroll>
      </Container>
    </ActivitySheetsProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  topRowLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
  },
  screenLabel: {
    fontFamily: "Geist",
    fontWeight: "700",
    fontSize: Typography.eyebrow.fontSize,
    letterSpacing: Typography.eyebrow.letterSpacing,
    textTransform: "uppercase",
  },
  dayCounter: {
    borderRadius: UI_PRESETS.radius.full,
    borderWidth: 1,
    paddingHorizontal: UI_PRESETS.spacing.lg,
    paddingVertical: 3,
  },
  dayCounterText: {
    fontFamily: "Geist",
    fontWeight: "600",
    fontSize: Typography.labelXS.fontSize,
    letterSpacing: Typography.labelXS.letterSpacing,
    textTransform: "uppercase",
  },
  avatarButton: {
    alignItems: "center",
    borderRadius: UI_PRESETS.radius.full,
    borderWidth: 1,
    height: UI_PRESETS.size.avatarSm,
    justifyContent: "center",
    width: UI_PRESETS.size.avatarSm,
  },
  avatarInitials: {
    fontFamily: "Geist",
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 16,
  },
  chipRowContent: {
    gap: UI_PRESETS.spacing.md,
  },
  dayChip: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: UI_PRESETS.radius.full,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: UI_PRESETS.spacing.xl,
    paddingVertical: UI_PRESETS.spacing.sm,
  },
  dayChipLocked: {
    opacity: 0.5,
  },
  dayChipText: {
    fontFamily: "Geist",
    fontWeight: "600",
    fontSize: Typography.bodySM.fontSize,
    lineHeight: Typography.bodySM.lineHeight,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 3,
    marginTop: UI_PRESETS.spacing.md,
  },
  dot: {
    borderRadius: 2,
    flex: 1,
    height: 3,
  },
  dayHeader: {
    gap: UI_PRESETS.spacing.sm,
  },
  dayEyebrow: {
    fontFamily: "Geist",
    fontWeight: "700",
    fontSize: Typography.eyebrow.fontSize,
    letterSpacing: Typography.eyebrow.letterSpacing,
    textTransform: "uppercase",
  },
  dayTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.md,
  },
  dayTitle: {
    fontWeight: "700",
    lineHeight: 32,
  },
  dayTitleItalic: {
    fontStyle: "italic",
  },
  dotsRowWrapper: {
    marginTop: UI_PRESETS.spacing.md,
    paddingHorizontal: UI_PRESETS.spacing.section,
  },
  // Incomplete activities banner
  incompleteBanner: {
    borderRadius: UI_PRESETS.radius.lg,
    borderWidth: 1,
    padding: UI_PRESETS.spacing.lg,
  },
  incompleteBannerContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
  },
  incompleteBannerIcon: {
    fontSize: 20,
    lineHeight: 24,
  },
  incompleteBannerText: {
    flex: 1,
    gap: 2,
  },
  incompleteBannerTitle: {
    fontFamily: "Geist",
    fontWeight: "600",
    fontSize: Typography.bodySM.fontSize,
    lineHeight: Typography.bodySM.lineHeight,
  },
  incompleteBannerSub: {
    fontSize: Typography.labelXS.fontSize,
    lineHeight: Typography.labelXS.lineHeight,
  },
  incompleteBannerChevron: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 24,
  },
});

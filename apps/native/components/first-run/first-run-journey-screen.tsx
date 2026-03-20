import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useRouter } from "expo-router";

import {
  FIRST_RUN_TODAY_STATES,
  WEEK_ONE_STATES,
  type FirstRunTodayState,
  type WeekOneState,
} from "@/components/first-run/data";
import {
  ActionCard,
  ApprovalCard,
  CelebrationCard,
  ContextCard,
  EmptyHabitCard,
  ExperienceStage,
  FirstRunScroll,
  HabitRail,
  InsightCard,
  MetricsRow,
  ProgressCard,
  PromptCard,
  ScreenHeader,
  SectionTitle,
  SetupCard,
  useFirstRunTheme,
} from "@/components/first-run/shared";
import { Container } from "@/components/container";
import { Button, Chip, Text } from "@/components/ui";
import { useAuth } from "@/lib/v1-auth-context";

type JourneyDay = {
  day: number;
  label: string;
  states: Array<
    | {
        id: string;
        label: string;
        kind: "day-one";
        content: FirstRunTodayState;
      }
    | {
        id: string;
        label: string;
        kind: "week-one";
        content: WeekOneState;
      }
  >;
};

const JOURNEY_DAYS: JourneyDay[] = [
  {
    day: 1,
    label: "Day 1",
    states: [
      {
        id: "day1-morning",
        label: "AM",
        kind: "day-one",
        content: FIRST_RUN_TODAY_STATES.find((state) => state.id === "day1-morning")!,
      },
      {
        id: "day1-evening",
        label: "PM",
        kind: "day-one",
        content: FIRST_RUN_TODAY_STATES.find((state) => state.id === "day1-evening")!,
      },
    ],
  },
  {
    day: 2,
    label: "Day 2",
    states: [
      {
        id: "day2",
        label: "Today",
        kind: "week-one",
        content: WEEK_ONE_STATES.find((state) => state.id === "day2")!,
      },
    ],
  },
  {
    day: 3,
    label: "Day 3",
    states: [
      {
        id: "day3",
        label: "Today",
        kind: "week-one",
        content: WEEK_ONE_STATES.find((state) => state.id === "day3")!,
      },
    ],
  },
  {
    day: 4,
    label: "Day 4",
    states: [
      {
        id: "day4",
        label: "Today",
        kind: "week-one",
        content: WEEK_ONE_STATES.find((state) => state.id === "day4")!,
      },
    ],
  },
  {
    day: 5,
    label: "Day 5",
    states: [
      {
        id: "day5",
        label: "Today",
        kind: "week-one",
        content: WEEK_ONE_STATES.find((state) => state.id === "day5")!,
      },
    ],
  },
  {
    day: 6,
    label: "Day 6",
    states: [
      {
        id: "day6",
        label: "Today",
        kind: "week-one",
        content: WEEK_ONE_STATES.find((state) => state.id === "day6")!,
      },
    ],
  },
  {
    day: 7,
    label: "Day 7",
    states: [
      {
        id: "day7",
        label: "Today",
        kind: "week-one",
        content: WEEK_ONE_STATES.find((state) => state.id === "day7")!,
      },
    ],
  },
];

function getCurrentJourneyDay(daysSinceFirstLogin: number | null): number {
  return Math.max(1, Math.min(7, (daysSinceFirstLogin ?? 0) + 1));
}

export function FirstRunJourneyScreen() {
  const { daysSinceFirstLogin, user, completeFirstRun } = useAuth();
  const router = useRouter();
  const { theme } = useFirstRunTheme();

  const maxUnlockedDay = getCurrentJourneyDay(daysSinceFirstLogin);
  const availableDays = useMemo(
    () => JOURNEY_DAYS.filter((day) => day.day <= maxUnlockedDay),
    [maxUnlockedDay],
  );

  const [selectedDay, setSelectedDay] = useState<number>(maxUnlockedDay);
  const [selectedStageId, setSelectedStageId] = useState<string>(
    availableDays[availableDays.length - 1]?.states[0]?.id ?? "day1-morning",
  );

  useEffect(() => {
    const nextDay = Math.min(selectedDay, maxUnlockedDay);
    const dayGroup =
      availableDays.find((day) => day.day === nextDay) ??
      availableDays[availableDays.length - 1];

    setSelectedDay(dayGroup.day);
    setSelectedStageId((current) =>
      dayGroup.states.some((state) => state.id === current)
        ? current
        : dayGroup.states[0].id,
    );
  }, [availableDays, maxUnlockedDay, selectedDay]);

  const selectedDayGroup =
    availableDays.find((day) => day.day === selectedDay) ?? availableDays[0];
  const selectedStage =
    selectedDayGroup.states.find((state) => state.id === selectedStageId) ??
    selectedDayGroup.states[0];

  const initials = (user?.name ?? user?.email ?? "BO")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Container>
      <FirstRunScroll>
        <View style={styles.topRow}>
          <View style={styles.dayHeader}>
            <Text
              selectable
              variant="muted"
              style={[
                styles.dayLabel,
                { color: theme.mutedForeground },
              ]}
            >
              First run
            </Text>
            <Text selectable variant="small" style={{ color: theme.foreground }}>
              Day {maxUnlockedDay} of 7
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/(tabs)/two")}
            style={({ pressed }) => [
              styles.avatarButton,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
              pressed && styles.pressed,
            ]}
          >
            <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
              {initials}
            </Text>
          </Pressable>
        </View>

        <View style={styles.dayChipRow}>
          {availableDays.map((day) => (
            <Chip
              key={day.day}
              label={day.label}
              selected={selectedDay === day.day}
              onSelect={() => {
                setSelectedDay(day.day);
                setSelectedStageId(day.states[0].id);
              }}
            />
          ))}
        </View>

        {selectedDayGroup.states.length > 1 ? (
          <View style={styles.segmentRow}>
            {selectedDayGroup.states.map((state) => (
              <Chip
                key={state.id}
                label={state.label}
                selected={selectedStageId === state.id}
                onSelect={() => setSelectedStageId(state.id)}
              />
            ))}
          </View>
        ) : null}

        <ExperienceStage stageKey={selectedStage.id}>
          {selectedStage.kind === "day-one" ? (
            <DayOneStageView stage={selectedStage.content} />
          ) : (
            <WeekOneStageView
              stage={selectedStage.content}
              onComplete={() => {
                void completeFirstRun();
              }}
            />
          )}
        </ExperienceStage>
      </FirstRunScroll>
    </Container>
  );
}

function DayOneStageView({ stage }: { stage: FirstRunTodayState }) {
  return (
    <>
      <ScreenHeader
        eyebrow={stage.eyebrow}
        title={stage.title}
        subtitle={stage.subtitle}
      />

      <InsightCard
        label={stage.insightLabel}
        badge={stage.insightBadge}
        body={stage.insightBody}
        actions={stage.insightActions}
      />

      <ProgressCard
        label={stage.progressLabel}
        progress={stage.progress}
        subtitle={stage.progressSubtitle}
      />

      {stage.actions?.length ? (
        <>
          <SectionTitle label="Suggested to start" />
          {stage.actions.map((item) => (
            <ActionCard key={item.title} item={item} previewTitle={item.title} />
          ))}
        </>
      ) : null}

      {stage.metrics?.length ? (
        <>
          <SectionTitle label="Day 1 snapshot" />
          <MetricsRow items={stage.metrics} />
        </>
      ) : null}

      {stage.habits?.length ? (
        <>
          <SectionTitle label="Habits" />
          <HabitRail items={stage.habits} />
        </>
      ) : null}

      {stage.prompt ? (
        stage.id === "day1-morning" ? (
          <>
            <SectionTitle label="Habits" />
            <EmptyHabitCard
              title={stage.prompt.title}
              subtitle={stage.prompt.subtitle}
            />
          </>
        ) : (
          <PromptCard
            title={stage.prompt.title}
            subtitle={stage.prompt.subtitle}
            accentColor={stage.prompt.accentColor}
          />
        )
      ) : null}

      {stage.setupItems?.length ? (
        <>
          <SectionTitle label="Activate domains" />
          {stage.setupItems.map((item) => (
            <SetupCard key={item.title} item={item} />
          ))}
        </>
      ) : null}
    </>
  );
}

function WeekOneStageView({
  stage,
  onComplete,
}: {
  stage: WeekOneState;
  onComplete: () => void;
}) {
  return (
    <>
      <ScreenHeader
        badge={stage.badge}
        dateLabel={stage.dateLabel}
        title={stage.title}
        subtitle={stage.subtitle}
      />

      <InsightCard
        label={stage.insightLabel}
        body={stage.insightBody}
        actions={stage.insightActions}
      />

      <ProgressCard
        label={stage.progressLabel}
        progress={stage.progress}
        subtitle={stage.progressSubtitle}
      />

      {stage.actions?.length ? (
        <>
          <SectionTitle label="Today's priorities" />
          {stage.actions.map((item) => (
            <ActionCard key={item.title} item={item} previewTitle={item.title} />
          ))}
        </>
      ) : null}

      {stage.prompt ? (
        <PromptCard
          title={stage.prompt.title}
          subtitle={stage.prompt.subtitle}
          accentColor={stage.prompt.accentColor}
        />
      ) : null}

      {stage.contextItems?.length ? <ContextCard items={stage.contextItems} /> : null}

      {stage.habits?.length ? (
        <>
          <SectionTitle label="Habits" />
          <HabitRail items={stage.habits} />
        </>
      ) : null}

      {stage.setupItems?.length ? (
        <>
          <SectionTitle label="Next unlocks" />
          {stage.setupItems.map((item) => (
            <SetupCard key={item.title} item={item} />
          ))}
        </>
      ) : null}

      {stage.approval ? (
        <ApprovalCard
          title={stage.approval.title}
          subtitle={stage.approval.subtitle}
          details={stage.approval.details}
        />
      ) : null}

      {stage.celebration ? (
        <CelebrationCard
          title={stage.celebration.title}
          subtitle={stage.celebration.subtitle}
        />
      ) : null}

      {stage.metrics?.length ? (
        <>
          <SectionTitle label="Your first week" />
          <MetricsRow items={stage.metrics} />
        </>
      ) : null}

      {stage.id === "day7" ? (
        <Button title="Unlock weekly review" onPress={onComplete} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayHeader: {
    gap: 4,
  },
  dayLabel: {
    fontFamily: "Geist",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  avatarButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  dayChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  pressed: {
    opacity: 0.84,
  },
});

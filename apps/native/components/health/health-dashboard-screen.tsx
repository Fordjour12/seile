import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Badge, Button, Card, Chip, Input, ListItem, SectionHeader, Text } from "@/components";
import { Container } from "@/components/container";
import { api } from "@/lib/backend-api";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

const healthApi = api.health;
const TODAY = formatLocalDateKey(new Date());

const LEVEL_OPTIONS = ["low", "medium", "high"] as const;
const WORKOUT_TYPES = [
  "strength",
  "running",
  "walking",
  "cycling",
  "yoga",
  "stretching",
  "sports",
  "recovery",
] as const;
const CADENCE_OPTIONS = ["daily", "weekdays", "weekly", "custom"] as const;
const DIFFICULTY_OPTIONS = ["low", "medium", "high"] as const;
const GOAL_TYPE_OPTIONS = [
  "exercise_frequency",
  "distance",
  "weight",
  "sleep",
  "steps",
  "recovery",
  "custom",
] as const;

export function HealthDashboardScreen() {
  const dashboard = useQuery(healthApi.queries.getHealthDashboard, {});
  const createWorkout = useMutation(healthApi.mutations.createWorkout);
  const createHealthHabit = useMutation(healthApi.mutations.createHealthHabit);
  const createHealthGoal = useMutation(healthApi.mutations.createHealthGoal);
  const logHealthMetrics = useMutation(healthApi.mutations.logHealthMetrics);
  const logEnergy = useMutation(healthApi.mutations.logEnergy);

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [status, setStatus] = useState("Health system ready.");
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const [workoutType, setWorkoutType] = useState<(typeof WORKOUT_TYPES)[number]>("walking");
  const [workoutDuration, setWorkoutDuration] = useState("30");
  const [workoutIntensity, setWorkoutIntensity] =
    useState<(typeof LEVEL_OPTIONS)[number]>("medium");
  const [workoutDate, setWorkoutDate] = useState(TODAY);

  const [habitName, setHabitName] = useState("Drink water");
  const [habitCadence, setHabitCadence] = useState<(typeof CADENCE_OPTIONS)[number]>("daily");
  const [habitTargetValue, setHabitTargetValue] = useState("8");
  const [habitUnit, setHabitUnit] = useState("glasses");
  const [habitDifficulty, setHabitDifficulty] =
    useState<(typeof DIFFICULTY_OPTIONS)[number]>("low");

  const [goalTitle, setGoalTitle] = useState("Exercise 3x this week");
  const [goalType, setGoalType] =
    useState<(typeof GOAL_TYPE_OPTIONS)[number]>("exercise_frequency");
  const [goalTargetValue, setGoalTargetValue] = useState("3");
  const [goalUnit, setGoalUnit] = useState("sessions");
  const [goalDeadline, setGoalDeadline] = useState(TODAY);

  const [metricsDate, setMetricsDate] = useState(TODAY);
  const [sleepHours, setSleepHours] = useState("7.5");
  const [steps, setSteps] = useState("8000");
  const [metricsEnergyLevel, setMetricsEnergyLevel] =
    useState<(typeof LEVEL_OPTIONS)[number]>("medium");

  const [energyLevel, setEnergyLevel] = useState<(typeof LEVEL_OPTIONS)[number]>("medium");
  const [stressLevel, setStressLevel] = useState<(typeof LEVEL_OPTIONS)[number]>("medium");
  const [fatigueLevel, setFatigueLevel] = useState<(typeof LEVEL_OPTIONS)[number]>("medium");

  const signals = dashboard?.signals;
  const scoreCards = [
    { label: "Sleep", value: signals?.sleepScore ?? 0, tone: theme.chart2 },
    { label: "Recovery", value: signals?.recoveryScore ?? 0, tone: theme.chart4 },
    { label: "Fatigue", value: signals?.fatigueScore ?? 0, tone: theme.destructive },
    { label: "Load", value: signals?.workoutLoad ?? 0, tone: theme.primary },
  ];

  const runTask = async (key: string, task: () => Promise<unknown>, message: string) => {
    if (busyKey) return;
    setBusyKey(key);
    setStatus("Saving...");
    try {
      await task();
      setStatus(message);
    } catch (error) {
      setStatus(formatError(error));
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <Container>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <SectionHeader title="Health" subtitle="ENERGY ENGINE" />

        <Card style={[styles.heroCard, { backgroundColor: theme.chart2 }]}>
          <Text variant="small" style={styles.heroEyebrow}>
            CURRENT CAPACITY
          </Text>
          <Text variant="h2" style={[styles.heroTitle, { color: "#fff" }]}>
            {signals ? `${capitalize(signals.capacityEstimate)} energy` : "Loading health signals"}
          </Text>
          <Text variant="small" style={[styles.heroBody, { color: "#fff" }]}>
            {signals
              ? `Energy is ${signals.currentEnergyLevel}, recovery is ${signals.recoveryScore}/100, and the planner should default to ${signals.suggestedPlanningMode} mode.`
              : "Recent sleep, workouts, and check-ins are being translated into planning capacity."}
          </Text>
          <View style={styles.badgeRow}>
            <Badge color={signals?.recoveryRecommended ? "warning" : "success"}>
              {signals?.recoveryRecommended ? "Recovery needed" : "Stable load"}
            </Badge>
            <Badge color="primary">{dashboard?.totals.workoutMinutesThisWeek ?? 0} min</Badge>
            <Badge color="secondary">{dashboard?.totals.workoutsThisWeek ?? 0} workouts</Badge>
          </View>
        </Card>

        <View style={styles.grid}>
          {scoreCards.map((card) => (
            <Card key={card.label} variant="outline" style={styles.metricCard}>
              <Text variant="small">{card.label}</Text>
              <Text variant="h3" style={{ color: card.tone }}>
                {Math.round(card.value)}
              </Text>
            </Card>
          ))}
        </View>

        <Card variant="outline">
          <SectionHeader title="Quick Energy Log" subtitle="LOW FRICTION SIGNAL" />
          <Text variant="small">Energy</Text>
          <View style={styles.chipRow}>
            {LEVEL_OPTIONS.map((value) => (
              <Chip
                key={`energy-${value}`}
                label={capitalize(value)}
                selected={energyLevel === value}
                onSelect={() => setEnergyLevel(value)}
              />
            ))}
          </View>
          <Text variant="small">Stress</Text>
          <View style={styles.chipRow}>
            {LEVEL_OPTIONS.map((value) => (
              <Chip
                key={`stress-${value}`}
                label={capitalize(value)}
                selected={stressLevel === value}
                onSelect={() => setStressLevel(value)}
              />
            ))}
          </View>
          <Text variant="small">Fatigue</Text>
          <View style={styles.chipRow}>
            {LEVEL_OPTIONS.map((value) => (
              <Chip
                key={`fatigue-${value}`}
                label={capitalize(value)}
                selected={fatigueLevel === value}
                onSelect={() => setFatigueLevel(value)}
              />
            ))}
          </View>
          <Button
            title="Log energy"
            loading={busyKey === "energy"}
            onPress={() =>
              void runTask(
                "energy",
                () =>
                  logEnergy({
                    energyLevel,
                    stressLevel,
                    fatigueLevel,
                  }),
                "Energy check-in saved.",
              )
            }
          />
          <Text variant="muted">{status}</Text>
        </Card>

        <Card>
          <SectionHeader title="Health Metrics" subtitle="SLEEP, STEPS, READINESS" />
          <Input value={metricsDate} onChangeText={setMetricsDate} placeholder="YYYY-MM-DD" />
          <Input
            value={sleepHours}
            onChangeText={setSleepHours}
            keyboardType="decimal-pad"
            placeholder="Sleep hours"
          />
          <Input
            value={steps}
            onChangeText={setSteps}
            keyboardType="number-pad"
            placeholder="Steps"
          />
          <Text variant="small">Energy level</Text>
          <View style={styles.chipRow}>
            {LEVEL_OPTIONS.map((value) => (
              <Chip
                key={`metric-${value}`}
                label={capitalize(value)}
                selected={metricsEnergyLevel === value}
                onSelect={() => setMetricsEnergyLevel(value)}
              />
            ))}
          </View>
          <Button
            title="Save metrics"
            variant="secondary"
            loading={busyKey === "metrics"}
            onPress={() =>
              void runTask(
                "metrics",
                () =>
                  logHealthMetrics({
                    date: metricsDate,
                    sleepHours: Number(sleepHours),
                    steps: Number(steps),
                    energyLevel: metricsEnergyLevel,
                  }),
                "Health metrics saved.",
              )
            }
          />
        </Card>

        <Card variant="outline">
          <SectionHeader title="Workout Log" subtitle="PLANNER-COMPATIBLE" />
          <Input value={workoutDate} onChangeText={setWorkoutDate} placeholder="YYYY-MM-DD" />
          <Input
            value={workoutDuration}
            onChangeText={setWorkoutDuration}
            keyboardType="number-pad"
            placeholder="Duration in minutes"
          />
          <Text variant="small">Workout type</Text>
          <View style={styles.chipRow}>
            {WORKOUT_TYPES.map((value) => (
              <Chip
                key={value}
                label={capitalize(value)}
                selected={workoutType === value}
                onSelect={() => setWorkoutType(value)}
              />
            ))}
          </View>
          <Text variant="small">Intensity</Text>
          <View style={styles.chipRow}>
            {LEVEL_OPTIONS.map((value) => (
              <Chip
                key={`workout-${value}`}
                label={capitalize(value)}
                selected={workoutIntensity === value}
                onSelect={() => setWorkoutIntensity(value)}
              />
            ))}
          </View>
          <Button
            title="Log workout"
            loading={busyKey === "workout"}
            onPress={() =>
              void runTask(
                "workout",
                () =>
                  createWorkout({
                    type: workoutType,
                    durationMinutes: Number(workoutDuration),
                    intensity: workoutIntensity,
                    date: workoutDate,
                  }),
                "Workout logged.",
              )
            }
          />
          <View style={styles.listColumn}>
            {(dashboard?.recentWorkouts ?? []).map(
              (workout: {
                _id: string;
                workoutType: string;
                durationMinutes: number;
                intensity: string;
                date: string;
              }) => (
                <ListItem
                  key={workout._id}
                  title={capitalize(workout.workoutType)}
                  subtitle={`${workout.durationMinutes} min · ${capitalize(workout.intensity)} intensity`}
                  meta={formatShortDate(workout.date)}
                />
              ),
            )}
          </View>
        </Card>

        <Card>
          <SectionHeader title="Health Goals" subtitle="MEASURABLE OUTCOMES" />
          <Input value={goalTitle} onChangeText={setGoalTitle} placeholder="Goal title" />
          <Input
            value={goalTargetValue}
            onChangeText={setGoalTargetValue}
            keyboardType="decimal-pad"
            placeholder="Target value"
          />
          <Input value={goalUnit} onChangeText={setGoalUnit} placeholder="Unit" />
          <Input value={goalDeadline} onChangeText={setGoalDeadline} placeholder="YYYY-MM-DD" />
          <Text variant="small">Goal type</Text>
          <View style={styles.chipRow}>
            {GOAL_TYPE_OPTIONS.map((value) => (
              <Chip
                key={value}
                label={humanizeKey(value)}
                selected={goalType === value}
                onSelect={() => setGoalType(value)}
              />
            ))}
          </View>
          <Button
            title="Add health goal"
            loading={busyKey === "goal"}
            onPress={() =>
              void runTask(
                "goal",
                () =>
                  createHealthGoal({
                    title: goalTitle,
                    goalType,
                    targetValue: Number(goalTargetValue),
                    unit: goalUnit,
                    deadline: goalDeadline,
                  }),
                "Health goal created.",
              )
            }
          />
          <View style={styles.listColumn}>
            {(dashboard?.goals ?? []).map(
              (goal: {
                _id: string;
                title: string;
                goalType: string;
                targetValue: number;
                unit: string;
                status: string;
              }) => (
                <ListItem
                  key={goal._id}
                  title={goal.title}
                  subtitle={`${humanizeKey(goal.goalType)} · ${goal.targetValue} ${goal.unit}`}
                  right={
                    <Badge color={goal.status === "active" ? "success" : "secondary"}>
                      {capitalize(goal.status)}
                    </Badge>
                  }
                />
              ),
            )}
          </View>
        </Card>

        <Card variant="outline">
          <SectionHeader title="Health Habits" subtitle="CONSISTENCY LAYER" />
          <Input value={habitName} onChangeText={setHabitName} placeholder="Habit name" />
          <Input
            value={habitTargetValue}
            onChangeText={setHabitTargetValue}
            keyboardType="number-pad"
            placeholder="Target value"
          />
          <Input value={habitUnit} onChangeText={setHabitUnit} placeholder="Unit" />
          <Text variant="small">Cadence</Text>
          <View style={styles.chipRow}>
            {CADENCE_OPTIONS.map((value) => (
              <Chip
                key={value}
                label={capitalize(value)}
                selected={habitCadence === value}
                onSelect={() => setHabitCadence(value)}
              />
            ))}
          </View>
          <Text variant="small">Difficulty</Text>
          <View style={styles.chipRow}>
            {DIFFICULTY_OPTIONS.map((value) => (
              <Chip
                key={`difficulty-${value}`}
                label={capitalize(value)}
                selected={habitDifficulty === value}
                onSelect={() => setHabitDifficulty(value)}
              />
            ))}
          </View>
          <Button
            title="Add health habit"
            variant="secondary"
            loading={busyKey === "habit"}
            onPress={() =>
              void runTask(
                "habit",
                () =>
                  createHealthHabit({
                    name: habitName,
                    cadence: habitCadence,
                    targetValue: Number(habitTargetValue),
                    unit: habitUnit,
                    difficulty: habitDifficulty,
                  }),
                "Health habit created.",
              )
            }
          />
          <View style={styles.listColumn}>
            {(dashboard?.habits ?? []).map(
              (habit: {
                _id: string;
                name: string;
                cadence: string;
                targetValue: number;
                unit: string;
                difficulty: string;
              }) => (
                <ListItem
                  key={habit._id}
                  title={habit.name}
                  subtitle={`${capitalize(habit.cadence)} · ${habit.targetValue} ${habit.unit}`}
                  right={
                    <Badge color={habit.difficulty === "high" ? "warning" : "secondary"}>
                      {capitalize(habit.difficulty)}
                    </Badge>
                  }
                />
              ),
            )}
          </View>
        </Card>

        <Card>
          <SectionHeader title="Energy Models" subtitle="PLANNER INPUTS" />
          <View style={styles.modelSection}>
            {signals?.dailyEnergyModel.map(
              (zone: { zone: string; label: string; energyLevel: string; score: number }) => (
                <ListItem
                  key={zone.zone}
                  compact
                  title={zone.label}
                  subtitle={`${capitalize(zone.energyLevel)} energy`}
                  meta={`${zone.score}`}
                />
              ),
            )}
          </View>
          <View style={styles.modelSection}>
            {signals?.weeklyEnergyModel.map(
              (day: { day: string; energyLevel: string; score: number }) => (
                <ListItem
                  key={day.day}
                  compact
                  title={capitalize(day.day)}
                  subtitle={`${capitalize(day.energyLevel)} energy`}
                  meta={`${day.score}`}
                />
              ),
            )}
          </View>
          {signals?.burnoutSignals.length ? (
            <View style={styles.signalList}>
              {signals.burnoutSignals.map((signal: string) => (
                <Text key={signal} variant="small" style={{ color: theme.destructive }}>
                  {signal}
                </Text>
              ))}
            </View>
          ) : null}
        </Card>
      </ScrollView>
    </Container>
  );
}

function capitalize(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function humanizeKey(value: string) {
  return value
    .split("_")
    .map((part) => capitalize(part))
    .join(" ");
}

function formatShortDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Request failed.";
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  heroCard: {
    gap: 10,
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: "#fff",
  },
  heroBody: {
    color: "#fff",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: "47%",
    gap: 4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  listColumn: {
    gap: 8,
  },
  modelSection: {
    gap: 8,
  },
  signalList: {
    gap: 6,
  },
});

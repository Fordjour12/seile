import { useMutation, useQuery } from "convex/react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";

import { Badge, Button, Card, Chip, Input, ListItem, SectionHeader, Switch, Text } from "@/components";
import { Container } from "@/components/container";
import { api } from "@/lib/backend-api";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

const DAY_OPTIONS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type GoalHorizon = "year" | "month" | "week" | "day";
type GoalPriority = "low" | "medium" | "high";
type EnergyPattern = "morning" | "midday" | "evening" | "mixed";
type PlanningStyle = "structured" | "flexible" | "minimal";

const plannerApi = api as unknown as Record<string, Record<string, any>>;

export default function PlannerScreen() {
  const dashboard = useQuery(plannerApi["planner/queries"].getPlannerDashboard, {});
  const createWeeklyPlan = useMutation(plannerApi["planner/mutations"].createWeeklyPlanDraft);
  const replanPeriod = useMutation(plannerApi["planner/mutations"].replanPeriod);
  const createReview = useMutation(plannerApi["planner/mutations"].submitWeeklyReview);
  const upsertProfile = useMutation(plannerApi["planner/mutations"].upsertPlannerProfile);
  const createGoal = useMutation(plannerApi["planner/mutations"].createPlanningGoal);
  const setAgentEnabled = useMutation(plannerApi["planner/mutations"].setAgentEnabled);
  const setPlanItemStatus = useMutation(plannerApi["planner/mutations"].setPlanItemStatus);

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [status, setStatus] = useState("Planner ready.");
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const [timezone, setTimezone] = useState("UTC");
  const [maxTasksPerDay, setMaxTasksPerDay] = useState("3");
  const [energyPattern, setEnergyPattern] = useState<EnergyPattern>("morning");
  const [planningStyle, setPlanningStyle] = useState<PlanningStyle>("structured");
  const [deepWorkPreference, setDeepWorkPreference] = useState(true);
  const [restDays, setRestDays] = useState<string[]>(["sunday"]);

  const [goalTitle, setGoalTitle] = useState("");
  const [goalDomain, setGoalDomain] = useState("work");
  const [goalHorizon, setGoalHorizon] = useState<GoalHorizon>("week");
  const [goalPriority, setGoalPriority] = useState<GoalPriority>("high");

  useEffect(() => {
    if (!dashboard?.profile) return;
    setTimezone(dashboard.profile.timezone);
    setMaxTasksPerDay(String(dashboard.profile.maxTasksPerDay));
    setEnergyPattern(dashboard.profile.energyPattern);
    setPlanningStyle(dashboard.profile.planningStyle);
    setDeepWorkPreference(dashboard.profile.deepWorkPreference);
    setRestDays(dashboard.profile.restDays);
  }, [dashboard?.profile]);

  const currentPlan = dashboard?.currentPlan;
  const currentPlanItems = dashboard?.currentPlanItems ?? [];
  const groupedItems = groupPlanItemsByDate(currentPlanItems);

  const runAction = async (key: string, action: () => Promise<unknown>, successMessage: string) => {
    if (busyKey) return;
    setBusyKey(key);
    setStatus("Working...");
    try {
      await action();
      setStatus(successMessage);
    } catch (error) {
      setStatus(formatError(error));
    } finally {
      setBusyKey(null);
    }
  };

  const handleSaveProfile = async () => {
    await runAction(
      "profile",
      () =>
        upsertProfile({
          timezone: timezone.trim() || "UTC",
          workHours: {
            start: "09:00",
            end: "17:00",
          },
          restDays,
          energyPattern,
          planningStyle,
          maxTasksPerDay: Number(maxTasksPerDay) || 3,
          deepWorkPreference,
        }),
      "Planner profile saved.",
    );
  };

  const handleAddGoal = async () => {
    await runAction(
      "goal",
      () =>
        createGoal({
          title: goalTitle,
          domain: goalDomain,
          horizon: goalHorizon,
          priority: goalPriority,
        }),
      "Goal added.",
    );
    setGoalTitle("");
  };

  const handleCreatePlan = async (mode: "zero_input" | "recovery") => {
    await runAction(
      mode,
      () => createWeeklyPlan({ mode }),
      mode === "recovery" ? "Recovery week drafted." : "Balanced week drafted.",
    );
  };

  const handleReplan = async () => {
    if (!currentPlan?._id) return;
    await runAction(
      "replan",
      () =>
        replanPeriod({
          planId: currentPlan._id,
          reason: "User requested a lighter, more realistic remainder.",
          preserveLockedItems: true,
        }),
      "Remaining week replanned.",
    );
  };

  const handleReview = async () => {
    if (!currentPlan?._id) return;
    await runAction(
      "review",
      () =>
        createReview({
          planId: currentPlan._id,
          stressRating: 3,
          satisfactionRating: 3,
        }),
      "Weekly review captured.",
    );
  };

  const handleAgentToggle = async (value: boolean) => {
    await runAction(
      "agent",
      () => setAgentEnabled({ agentEnabled: value }),
      value ? "Planner agent enabled." : "Planner agent disabled.",
    );
  };

  const handleTogglePlanItem = async (itemId: string, currentStatus: string) => {
    await runAction(
      `item-${itemId}`,
      () =>
        setPlanItemStatus({
          itemId,
          status: currentStatus === "done" ? "pending" : "done",
        }),
      "Plan item updated.",
    );
  };

  return (
    <Container>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <SectionHeader title="Planner" subtitle="AI CHIEF-OF-STAFF" />

        <Card style={[styles.heroCard, { backgroundColor: theme.primary }]}>
          <Text variant="small" style={styles.heroKicker}>
            WEEK OF {dashboard?.week.startDate ?? "LOADING"}
          </Text>
          <Text variant="h2" style={[styles.heroTitle, { color: theme.primaryForeground }]}>
            {currentPlan?.title ?? "Build a realistic week"}
          </Text>
          <Text variant="small" style={[styles.heroBody, { color: theme.primaryForeground }]}>
            {currentPlan?.summary ??
              "This planner keeps weekly priorities capped, spreads real work across safe days, and protects recovery space."}
          </Text>
          <View style={styles.heroRow}>
            <Badge color={dashboard?.agentState?.agentEnabled ? "success" : "warning"}>
              {dashboard?.agentState?.agentEnabled ? "Agent On" : "Agent Off"}
            </Badge>
            <Badge color={currentPlan?.recoverySuggested ? "warning" : "secondary"}>
              {currentPlan?.recoverySuggested ? "Recovery" : "Balanced"}
            </Badge>
            <Badge color="primary">
              Burnout {currentPlan?.burnoutRiskScore ?? dashboard?.agentState?.burnoutScore ?? 0}
            </Badge>
          </View>
        </Card>

        <Card variant="outline">
          <SectionHeader title="Actions" subtitle="WEEKLY CONTROL" />
          <View style={styles.actionRow}>
            <Button
              title="Balanced week"
              style={styles.flex}
              onPress={() => void handleCreatePlan("zero_input")}
              loading={busyKey === "zero_input"}
            />
            <Button
              title="Recovery week"
              variant="secondary"
              style={styles.flex}
              onPress={() => void handleCreatePlan("recovery")}
              loading={busyKey === "recovery"}
            />
          </View>
          <View style={styles.actionRow}>
            <Button
              title="Replan remainder"
              variant="outline"
              style={styles.flex}
              onPress={() => void handleReplan()}
              disabled={!currentPlan?._id}
              loading={busyKey === "replan"}
            />
            <Button
              title="Log review"
              variant="ghost"
              style={styles.flex}
              onPress={() => void handleReview()}
              disabled={!currentPlan?._id}
              loading={busyKey === "review"}
            />
          </View>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelGroup}>
              <Text variant="body">Planner agent</Text>
              <Text variant="muted">Sunday review, Monday draft, Wednesday drift check.</Text>
            </View>
            <Switch
              value={dashboard?.agentState?.agentEnabled ?? false}
              onValueChange={(value) => void handleAgentToggle(value)}
            />
          </View>
          <Text variant="muted">{status}</Text>
        </Card>

        <Card>
          <SectionHeader title="Profile" subtitle="CAPACITY GUARDRAILS" />
          <Input value={timezone} onChangeText={setTimezone} placeholder="Timezone" />
          <Input
            value={maxTasksPerDay}
            onChangeText={setMaxTasksPerDay}
            keyboardType="number-pad"
            placeholder="Max tasks per day"
          />
          <Text variant="small">Energy pattern</Text>
          <View style={styles.chipRow}>
            {(["morning", "midday", "evening", "mixed"] as const).map((value) => (
              <Chip
                key={value}
                label={capitalize(value)}
                selected={energyPattern === value}
                onSelect={() => setEnergyPattern(value)}
              />
            ))}
          </View>
          <Text variant="small">Planning style</Text>
          <View style={styles.chipRow}>
            {(["structured", "flexible", "minimal"] as const).map((value) => (
              <Chip
                key={value}
                label={capitalize(value)}
                selected={planningStyle === value}
                onSelect={() => setPlanningStyle(value)}
              />
            ))}
          </View>
          <Text variant="small">Rest days</Text>
          <View style={styles.chipRow}>
            {DAY_OPTIONS.map((day) => (
              <Chip
                key={day}
                label={day.slice(0, 3).toUpperCase()}
                selected={restDays.includes(day)}
                onSelect={() => setRestDays(toggleValue(restDays, day))}
              />
            ))}
          </View>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelGroup}>
              <Text variant="body">Deep work protection</Text>
              <Text variant="muted">Prefer longer uninterrupted focus windows.</Text>
            </View>
            <Switch value={deepWorkPreference} onValueChange={setDeepWorkPreference} />
          </View>
          <Button
            title="Save profile"
            onPress={() => void handleSaveProfile()}
            loading={busyKey === "profile"}
          />
        </Card>

        <Card variant="outline">
          <SectionHeader title="Goals" subtitle="WEEKLY INPUTS" />
          <Input
            value={goalTitle}
            onChangeText={setGoalTitle}
            placeholder="Goal title"
          />
          <Input
            value={goalDomain}
            onChangeText={setGoalDomain}
            placeholder="Domain"
          />
          <Text variant="small">Horizon</Text>
          <View style={styles.chipRow}>
            {(["year", "month", "week", "day"] as const).map((value) => (
              <Chip
                key={value}
                label={capitalize(value)}
                selected={goalHorizon === value}
                onSelect={() => setGoalHorizon(value)}
              />
            ))}
          </View>
          <Text variant="small">Priority</Text>
          <View style={styles.chipRow}>
            {(["high", "medium", "low"] as const).map((value) => (
              <Chip
                key={value}
                label={capitalize(value)}
                selected={goalPriority === value}
                onSelect={() => setGoalPriority(value)}
              />
            ))}
          </View>
          <Button
            title="Add goal"
            onPress={() => void handleAddGoal()}
            disabled={!goalTitle.trim()}
            loading={busyKey === "goal"}
          />
          {dashboard?.goals.length ? (
            <View style={styles.listColumn}>
              {dashboard.goals.map((goal) => (
                <ListItem
                  key={goal._id}
                  title={goal.title}
                  subtitle={`${capitalize(goal.horizon)} · ${goal.domain}`}
                  right={
                    <Badge color={goal.priority === "high" ? "destructive" : goal.priority === "medium" ? "warning" : "secondary"}>
                      {capitalize(goal.priority)}
                    </Badge>
                  }
                />
              ))}
            </View>
          ) : (
            <Text variant="muted">No goals yet. The planner will fall back to zero-input starter tasks.</Text>
          )}
        </Card>

        <Card>
          <SectionHeader title="Current Week" subtitle="EXECUTION VIEW" />
          {currentPlan ? (
            <>
              <View style={styles.heroRow}>
                {currentPlan.priorityTitles.map((title) => (
                  <Badge key={title} color="primary">
                    {title}
                  </Badge>
                ))}
              </View>
              {currentPlan.warnings.length ? (
                <View style={styles.warningList}>
                  {currentPlan.warnings.map((warning) => (
                    <Text key={warning} variant="small" style={{ color: theme.destructive }}>
                      {warning}
                    </Text>
                  ))}
                </View>
              ) : null}
              <View style={styles.listColumn}>
                {Object.entries(groupedItems).map(([date, items]) => (
                  <View key={date} style={styles.dayGroup}>
                    <Text variant="h3">{formatDateLabel(date)}</Text>
                    {items.map((item) => (
                      <ListItem
                        key={item._id}
                        title={item.title}
                        subtitle={[item.itemType.toUpperCase(), item.startTime ? `${item.startTime}${item.endTime ? `-${item.endTime}` : ""}` : null]
                          .filter(Boolean)
                          .join(" · ")}
                        meta={item.status === "done" ? "Done" : item.priority}
                        onPress={() => void handleTogglePlanItem(item._id, item.status)}
                        right={
                          <Badge color={item.status === "done" ? "success" : item.priority === "high" ? "warning" : "secondary"}>
                            {item.status}
                          </Badge>
                        }
                      />
                    ))}
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text variant="muted">No weekly plan yet. Create a balanced or recovery week above.</Text>
          )}
        </Card>
      </ScrollView>
    </Container>
  );
}

function groupPlanItemsByDate(items: Array<{
  _id: string;
  date: string;
  title: string;
  itemType: string;
  status: string;
  priority: string;
  startTime?: string;
  endTime?: string;
}>) {
  return items.reduce<Record<string, typeof items>>((accumulator, item) => {
    const current = accumulator[item.date] ?? [];
    current.push(item);
    accumulator[item.date] = current.sort((left, right) => (left.startTime ?? "23:59").localeCompare(right.startTime ?? "23:59"));
    return accumulator;
  }, {});
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

function formatDateLabel(date: string) {
  return new Date(`${date}T00:00:00.000Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function capitalize(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
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
  heroKicker: {
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: "#fff",
  },
  heroBody: {
    color: "#fff",
  },
  heroRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  switchLabelGroup: {
    flex: 1,
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
  warningList: {
    gap: 6,
  },
  dayGroup: {
    gap: 8,
  },
});

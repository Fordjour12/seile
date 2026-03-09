import { ScrollView, View } from "react-native";

import { Badge, Button, Card, Chip, Input, ListItem, Switch, Text } from "@/components";
import { Container } from "@/components/container";
import {
  capitalizePlannerLabel,
  togglePlannerValue,
  usePlannerSettings,
} from "@/lib/planner/use-planner-settings";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export function PlannerSettingsScreen() {
  const {
    dashboard,
    plannerModel,
    dayOptions,
    status,
    busyKey,
    timezone,
    setTimezone,
    maxTasksPerDay,
    setMaxTasksPerDay,
    energyPattern,
    setEnergyPattern,
    planningStyle,
    setPlanningStyle,
    deepWorkPreference,
    setDeepWorkPreference,
    restDays,
    setRestDays,
    goalTitle,
    setGoalTitle,
    goalDomain,
    setGoalDomain,
    goalHorizon,
    setGoalHorizon,
    goalPriority,
    setGoalPriority,
    saveProfile,
    addGoal,
    toggleAgent,
  } = usePlannerSettings();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Container>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 32,
          gap: 16,
        }}
      >
        <Card style={{ gap: 14 }}>
          <Text variant="h3">Planner Profile</Text>
          <Input value={timezone} onChangeText={setTimezone} placeholder="Timezone" />
          <Input
            value={maxTasksPerDay}
            onChangeText={setMaxTasksPerDay}
            keyboardType="number-pad"
            placeholder="Max tasks per day"
          />
          <View style={{ gap: 8 }}>
            <Text variant="small">Energy pattern</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {(["morning", "midday", "evening", "mixed"] as const).map((value) => (
                <Chip
                  key={value}
                  label={capitalizePlannerLabel(value)}
                  selected={energyPattern === value}
                  onSelect={() => setEnergyPattern(value)}
                />
              ))}
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Text variant="small">Planning style</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {(["structured", "flexible", "minimal"] as const).map((value) => (
                <Chip
                  key={value}
                  label={capitalizePlannerLabel(value)}
                  selected={planningStyle === value}
                  onSelect={() => setPlanningStyle(value)}
                />
              ))}
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Text variant="small">Rest days</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {dayOptions.map((day) => (
                <Chip
                  key={day}
                  label={day.slice(0, 3).toUpperCase()}
                  selected={restDays.includes(day)}
                  onSelect={() => setRestDays(togglePlannerValue(restDays, day))}
                />
              ))}
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text>Deep work protection</Text>
              <Text variant="muted">Prefer longer uninterrupted focus windows.</Text>
            </View>
            <Switch value={deepWorkPreference} onValueChange={setDeepWorkPreference} />
          </View>
          <Button title="Save profile" onPress={() => void saveProfile()} loading={busyKey === "profile"} />
        </Card>

        <Card variant="outline" style={{ gap: 14 }}>
          <Text variant="h3">Goals</Text>
          <Input value={goalTitle} onChangeText={setGoalTitle} placeholder="Goal title" />
          <Input value={goalDomain} onChangeText={setGoalDomain} placeholder="Domain" />
          <View style={{ gap: 8 }}>
            <Text variant="small">Horizon</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {(["year", "month", "week", "day"] as const).map((value) => (
                <Chip
                  key={value}
                  label={capitalizePlannerLabel(value)}
                  selected={goalHorizon === value}
                  onSelect={() => setGoalHorizon(value)}
                />
              ))}
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Text variant="small">Priority</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {(["high", "medium", "low"] as const).map((value) => (
                <Chip
                  key={value}
                  label={capitalizePlannerLabel(value)}
                  selected={goalPriority === value}
                  onSelect={() => setGoalPriority(value)}
                />
              ))}
            </View>
          </View>
          <Button
            title="Add goal"
            onPress={() => void addGoal()}
            disabled={!goalTitle.trim()}
            loading={busyKey === "goal"}
          />
          {(dashboard?.goals ?? []).length ? (
            <View style={{ gap: 8 }}>
              {(dashboard?.goals ?? []).map((goal: any) => (
                <ListItem
                  key={goal._id}
                  title={goal.title}
                  subtitle={`${capitalizePlannerLabel(goal.horizon)} · ${goal.domain}`}
                  right={
                    <Badge
                      color={
                        goal.priority === "high"
                          ? "destructive"
                          : goal.priority === "medium"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {capitalizePlannerLabel(goal.priority)}
                    </Badge>
                  }
                />
              ))}
            </View>
          ) : (
            <Text variant="muted">No goals yet. Add a few so the planner can tailor your week.</Text>
          )}
        </Card>

        <Card style={{ gap: 14 }}>
          <Text variant="h3">AI & Automation</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text>Planner automation</Text>
              <Text variant="muted">
                Sunday review, Monday draft, and midweek drift checks when enabled.
              </Text>
            </View>
            <Switch
              value={dashboard?.agentState?.agentEnabled ?? false}
              onValueChange={(value) => void toggleAgent(value)}
            />
          </View>
          {plannerModel ? (
            <View style={{ gap: 4 }}>
              <Text variant="small">Active model</Text>
              <Badge variant="outline" color="secondary">
                {plannerModel}
              </Badge>
            </View>
          ) : null}
        </Card>

        <Card variant="ghost" style={{ gap: 8 }}>
          <Text variant="h3">Status</Text>
          <Text selectable style={{ color: status.includes("failed") || status.includes("Error") ? theme.destructive : theme.foreground }}>
            {status}
          </Text>
        </Card>
      </ScrollView>
    </Container>
  );
}

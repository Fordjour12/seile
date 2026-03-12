import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";

import { plannerApi } from "@/lib/planner/api";
import { sharedGoalsApi } from "@/lib/api/shared-goals";

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

export function usePlannerSettings() {
  const dashboard = useQuery(plannerApi["planner/queries"].getPlannerDashboard, {});
  const home = useQuery(plannerApi["planner/queries"].getPlannerChatHome, {});
  const upsertProfile = useMutation(plannerApi["planner/mutations"].upsertPlannerProfile);
  const createGoal = useMutation(sharedGoalsApi.mutations.createSharedGoal);
  const setAgentEnabled = useMutation(plannerApi["planner/mutations"].setAgentEnabled);

  const [status, setStatus] = useState("Planner settings ready.");
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const [timezone, setTimezone] = useState("UTC");
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("17:00");
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
    if (!dashboard?.profile) {
      return;
    }

    setTimezone(dashboard.profile.timezone);
    setWorkStart(dashboard.profile.workHours.start);
    setWorkEnd(dashboard.profile.workHours.end);
    setMaxTasksPerDay(String(dashboard.profile.maxTasksPerDay));
    setEnergyPattern(dashboard.profile.energyPattern);
    setPlanningStyle(dashboard.profile.planningStyle);
    setDeepWorkPreference(dashboard.profile.deepWorkPreference);
    setRestDays(dashboard.profile.restDays);
  }, [dashboard?.profile]);

  const runMutation = async (key: string, callback: () => Promise<unknown>, successMessage: string) => {
    if (busyKey) {
      return false;
    }

    setBusyKey(key);
    setStatus("Saving...");
    try {
      await callback();
      setStatus(successMessage);
      return true;
    } catch (error) {
      setStatus(formatPlannerError(error));
      return false;
    } finally {
      setBusyKey(null);
    }
  };

  const saveProfile = async () => {
    const normalizedWorkStart = normalizePlannerTime(workStart);
    const normalizedWorkEnd = normalizePlannerTime(workEnd);

    if (!normalizedWorkStart || !normalizedWorkEnd) {
      setStatus("Work hours must use HH:MM 24-hour format.");
      return;
    }

    await runMutation(
      "profile",
      () =>
        upsertProfile({
          timezone: timezone.trim() || "UTC",
          workHours: {
            start: normalizedWorkStart,
            end: normalizedWorkEnd,
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

  const addGoal = async () => {
    const success = await runMutation(
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
    if (success) {
      setGoalTitle("");
    }
  };

  const toggleAgent = async (value: boolean) => {
    await runMutation(
      "agent",
      () => setAgentEnabled({ agentEnabled: value }),
      value ? "Planner automation enabled." : "Planner automation disabled.",
    );
  };

  return {
    dashboard,
    plannerModel: home?.plannerModel ?? null,
    dayOptions: DAY_OPTIONS,
    status,
    busyKey,
    timezone,
    setTimezone,
    workStart,
    setWorkStart,
    workEnd,
    setWorkEnd,
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
  };
}

export function togglePlannerValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

export function capitalizePlannerLabel(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

function formatPlannerError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Planner settings request failed.";
}

function normalizePlannerTime(value: string) {
  const trimmed = value.trim();
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(trimmed) ? trimmed : null;
}

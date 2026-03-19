import { Stack } from "expo-router";

import { PlannerGoalDetailScreen } from "@/components/planner/planner-goal-detail-screen";

export default function PlannerGoalDetailRoute() {
  return (
    <>
      <Stack.Screen options={{ title: "Goal", headerShown: true }} />
      <PlannerGoalDetailScreen />
    </>
  );
}

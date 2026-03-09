import { useLocalSearchParams } from "expo-router";

import { SchedulerTaskDeleteScreen } from "@/components/scheduler/scheduler-task-delete-screen";

export default function SchedulerTaskDeleteRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <SchedulerTaskDeleteScreen taskId={id} />;
}

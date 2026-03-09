import { useLocalSearchParams } from "expo-router";

import { SchedulerTaskUpdateScreen } from "@/components/scheduler/scheduler-task-update-screen";

export default function SchedulerTaskUpdateRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <SchedulerTaskUpdateScreen taskId={id} />;
}

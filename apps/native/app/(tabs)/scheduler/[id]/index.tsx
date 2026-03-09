import { useLocalSearchParams } from "expo-router";

import { SchedulerTaskDetailScreen } from "@/components/scheduler/scheduler-task-detail-screen";

export default function SchedulerTaskRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <SchedulerTaskDetailScreen taskId={id} />;
}

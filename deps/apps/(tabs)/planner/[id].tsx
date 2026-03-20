import { useLocalSearchParams } from "expo-router";

import { PlannerChatScreen } from "@/components/planner/planner-chat-screen";

export default function PlannerThreadRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const threadId = Array.isArray(params.id) ? params.id[0] : params.id;

  return <PlannerChatScreen threadId={threadId} readOnly />;
}

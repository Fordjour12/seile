import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { ScrollView, View } from "react-native";

import { Badge, Button, Card, ListItem, Text } from "@/components";
import { Container } from "@/components/container";
import { api } from "@/lib/backend-api";

const plannerApi = api as unknown as Record<string, Record<string, any>>;

export function PlannerOverviewScreen() {
  const router = useRouter();
  const home = useQuery(plannerApi["planner/queries"].getPlannerChatHome, {});
  const plans = useQuery(plannerApi["planner/queries"].listPlans, { type: "week" }) as
    | Array<{
        _id: string;
        title: string;
        summary: string;
        mode: string;
        startDate: string;
        endDate: string;
        burnoutRiskScore?: number;
        recoverySuggested?: boolean;
      }>
    | undefined;
  const threads = useQuery(plannerApi["planner/queries"].listPlannerChatThreads, {
    paginationOpts: { cursor: null, numItems: 20 },
  }) as
    | {
        page: Array<{
          id: string;
          title: string;
          summary: string;
          status: string;
          createdAt: number;
          isActive: boolean;
        }>;
      }
    | undefined;

  return (
    <Container>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 32,
          gap: 16,
        }}
      >
        <Card style={{ gap: 12 }}>
          <Text variant="muted">AI Chief-of-Staff</Text>
          <Text variant="h2">Planner workspace</Text>
          <Text variant="small">
            Browse your weekly plans, reopen previous planner conversations, or jump into a fresh chat.
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Badge color={home?.agentState?.agentEnabled ? "success" : "warning"}>
              {home?.agentState?.agentEnabled ? "Agent On" : "Agent Off"}
            </Badge>
            {home?.currentPlan ? (
              <Badge color={home.currentPlan.recoverySuggested ? "warning" : "secondary"}>
                {home.currentPlan.recoverySuggested ? "Recovery week" : home.currentPlan.mode}
              </Badge>
            ) : (
              <Badge color="secondary">No current plan</Badge>
            )}
          </View>
          <Button title="Open chat" onPress={() => router.push("/planner/chat")} />
        </Card>

        <Card variant="outline" style={{ gap: 12 }}>
          <Text variant="h3">Plans</Text>
          {(plans ?? []).length ? (
            <View style={{ gap: 8 }}>
              {(plans ?? []).map((plan) => (
                <ListItem
                  key={plan._id}
                  title={plan.title}
                  subtitle={`${plan.startDate} to ${plan.endDate} · ${plan.summary}`}
                  onPress={() => router.push(`/planner/plans/${plan._id}`)}
                  right={
                    <View style={{ alignItems: "flex-end", gap: 6 }}>
                      <Badge color={plan.recoverySuggested ? "warning" : "secondary"}>
                        {plan.recoverySuggested ? "Recovery" : plan.mode}
                      </Badge>
                      <Badge variant="outline" color="primary">
                        Burnout {plan.burnoutRiskScore ?? 0}
                      </Badge>
                    </View>
                  }
                />
              ))}
            </View>
          ) : (
            <Text variant="muted">No weekly plans yet. Start from chat to draft one.</Text>
          )}
        </Card>

        <Card variant="outline" style={{ gap: 12 }}>
          <Text variant="h3">Previous chats</Text>
          {(threads?.page ?? []).length ? (
            <View style={{ gap: 8 }}>
              {(threads?.page ?? []).map((thread) => (
                <ListItem
                  key={thread.id}
                  title={thread.title}
                  subtitle={thread.summary || "Planner conversation"}
                  onPress={() => router.push(`/planner/${thread.id}`)}
                  right={
                    thread.isActive ? (
                      <Badge color="success">Active</Badge>
                    ) : (
                      <Badge variant="outline" color="secondary">
                        {new Date(thread.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Badge>
                    )
                  }
                />
              ))}
            </View>
          ) : (
            <Text variant="muted">No planner conversations yet.</Text>
          )}
        </Card>
      </ScrollView>
    </Container>
  );
}

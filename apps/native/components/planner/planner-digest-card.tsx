import { View } from "react-native";

import { Badge, Card, Text } from "@/components";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export function PlannerDigestCard({
  home,
}: {
  home:
    | {
        week: { startDate: string; endDate: string };
        currentPlan: {
          title: string;
          summary: string;
          mode: string;
          burnoutRiskScore: number | null;
          recoverySuggested: boolean;
        } | null;
        agentState: {
          agentEnabled: boolean;
          burnoutScore: number;
        } | null;
      }
    | undefined;
}) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const burnoutScore = home?.currentPlan?.burnoutRiskScore ?? home?.agentState?.burnoutScore ?? 0;

  return (
    <Card
      style={{
        backgroundColor: theme.primary,
        gap: 12,
      }}
    >
      <Text variant="small" style={{ color: "rgba(255,255,255,0.74)", letterSpacing: 1.2 }}>
        WEEKLY BRIEF
      </Text>
      <Text variant="h2" style={{ color: theme.primaryForeground }}>
        {home?.currentPlan?.title ?? "Build a realistic week"}
      </Text>
      <Text variant="small" style={{ color: theme.primaryForeground }}>
        {home?.currentPlan?.summary ??
          `Week of ${home?.week.startDate ?? "loading"} to ${home?.week.endDate ?? "loading"}. Ask the planner to draft, adjust, or review your week.`}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Badge color={home?.agentState?.agentEnabled ? "success" : "warning"}>
          {home?.agentState?.agentEnabled ? "Agent On" : "Agent Off"}
        </Badge>
        <Badge color={home?.currentPlan?.recoverySuggested ? "warning" : "secondary"}>
          {home?.currentPlan?.recoverySuggested ? "Recovery" : home?.currentPlan?.mode ?? "No Plan"}
        </Badge>
        <Badge color="primary">Burnout {burnoutScore}</Badge>
      </View>
      <Text variant="muted" style={{ color: "rgba(255,255,255,0.72)" }}>
        {home?.week.startDate
          ? `Week of ${home.week.startDate}`
          : "Your planner keeps priorities capped and protects recovery space."}
      </Text>
    </Card>
  );
}

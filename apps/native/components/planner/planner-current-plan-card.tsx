import { useRouter } from "expo-router";
import { View } from "react-native";

import { Badge, Button, Card, Text } from "@/components";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type PlannerHome = {
  currentPlan: {
    _id: string;
    title: string;
    summary: string;
    mode: string;
    priorityTitles: string[];
    warnings: string[];
    burnoutRiskScore: number | null;
    recoverySuggested: boolean;
  } | null;
};

export function PlannerCurrentPlanCard({
  home,
}: {
  home: PlannerHome | undefined;
}) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const plan = home?.currentPlan;

  if (!plan) {
    return null;
  }

  return (
    <Card
      variant="outline"
      style={{
        gap: 12,
        borderColor: theme.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="muted">Current plan</Text>
          <Text variant="h3">{plan.title}</Text>
          <Text variant="small">{plan.summary}</Text>
        </View>
        <Badge color={plan.recoverySuggested ? "warning" : "secondary"}>
          {plan.recoverySuggested ? "Recovery" : plan.mode}
        </Badge>
      </View>

      {plan.priorityTitles.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {plan.priorityTitles.slice(0, 3).map((priority) => (
            <Badge key={priority} variant="outline" color="primary">
              {priority}
            </Badge>
          ))}
        </View>
      ) : null}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Badge color="primary">Burnout {plan.burnoutRiskScore ?? 0}</Badge>
        {plan.warnings.length ? <Badge color="warning">{plan.warnings.length} warnings</Badge> : null}
      </View>

      <Button
        title="Open plan"
        variant="outline"
        onPress={() => router.push(`/planner/plans/${plan._id}`)}
      />
    </Card>
  );
}

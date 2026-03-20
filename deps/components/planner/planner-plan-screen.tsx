import { ScrollView, View } from "react-native";

import { Badge, Button, Card, ListItem, Text } from "@/components";
import { Container } from "@/components/container";
import { usePlannerPlan } from "@/lib/planner/use-planner-plan";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export function PlannerPlanScreen() {
  const {
    plan,
    groupedItems,
    status,
    busyKey,
    toggleItemDone,
    replan,
    review,
  } = usePlannerPlan();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  if (!plan) {
    return (
      <Container>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        >
          <Card variant="outline" style={{ gap: 8 }}>
            <Text variant="h3">Plan unavailable</Text>
            <Text variant="muted">This weekly plan could not be loaded.</Text>
          </Card>
        </ScrollView>
      </Container>
    );
  }

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
        <Card
          style={{
            gap: 12,
            backgroundColor: theme.primary,
          }}
        >
          <Text variant="small" style={{ color: "rgba(255,255,255,0.72)", letterSpacing: 1.1 }}>
            EXECUTION VIEW
          </Text>
          <Text variant="h2" style={{ color: theme.primaryForeground }}>
            {plan.plan.title}
          </Text>
          <Text variant="small" style={{ color: theme.primaryForeground }}>
            {plan.plan.summary}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Badge color={plan.plan.recoverySuggested ? "warning" : "secondary"}>
              {plan.plan.recoverySuggested ? "Recovery" : plan.plan.mode}
            </Badge>
            <Badge color="primary">Burnout {plan.plan.burnoutRiskScore ?? 0}</Badge>
            <Badge color="secondary">
              {plan.plan.startDate} to {plan.plan.endDate}
            </Badge>
          </View>
        </Card>

        {plan.plan.priorityTitles.length ? (
          <Card variant="outline" style={{ gap: 10 }}>
            <Text variant="h3">Priorities</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {plan.plan.priorityTitles.map((priority: string) => (
                <Badge key={priority} variant="outline" color="primary">
                  {priority}
                </Badge>
              ))}
            </View>
          </Card>
        ) : null}

        {plan.plan.warnings.length ? (
          <Card variant="outline" style={{ gap: 8, borderColor: theme.border }}>
            <Text variant="h3">Warnings</Text>
            {plan.plan.warnings.map((warning: string) => (
              <Text key={warning} variant="small">
                • {warning}
              </Text>
            ))}
          </Card>
        ) : null}

        <Card variant="ghost" style={{ gap: 10, padding: 0 }}>
          <Text variant="h3">This week</Text>
          {groupedItems.map((section) => (
            <Card key={section.date} variant="outline" style={{ gap: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <Text variant="h3">{section.label}</Text>
                <Badge variant="outline" color="secondary">
                  {section.items.length} items
                </Badge>
              </View>

              <View style={{ gap: 8 }}>
                {section.items.map((item) => {
                  const canToggle = item.status === "pending" || item.status === "done";
                  return (
                    <ListItem
                      key={item._id}
                      title={item.title}
                      subtitle={buildPlanItemSubtitle(item)}
                      onPress={canToggle ? () => void toggleItemDone(item._id, item.status) : undefined}
                      right={
                        <View style={{ alignItems: "flex-end", gap: 6 }}>
                          <Badge
                            color={
                              item.status === "done"
                                ? "success"
                                : item.status === "dropped"
                                  ? "destructive"
                                  : item.status === "moved"
                                    ? "warning"
                                    : "secondary"
                            }
                          >
                            {item.status}
                          </Badge>
                          {item.locked ? (
                            <Badge variant="outline" color="secondary">
                              Locked
                            </Badge>
                          ) : null}
                        </View>
                      }
                    />
                  );
                })}
              </View>
            </Card>
          ))}
        </Card>

        {plan.review ? (
          <Card style={{ gap: 10 }}>
            <Text variant="h3">Latest review</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <Badge color="primary">Completion {plan.review.completionRate}%</Badge>
              {plan.review.stressRating !== undefined ? (
                <Badge color="warning">Stress {plan.review.stressRating}/5</Badge>
              ) : null}
              {plan.review.satisfactionRating !== undefined ? (
                <Badge color="secondary">Satisfaction {plan.review.satisfactionRating}/5</Badge>
              ) : null}
            </View>
            {plan.review.improvementSuggestions.slice(0, 3).map((suggestion: string) => (
              <Text key={suggestion} variant="small">
                • {suggestion}
              </Text>
            ))}
          </Card>
        ) : null}

        <Card variant="outline" style={{ gap: 12 }}>
          <Text variant="h3">Actions</Text>
          <Button
            title="Replan remainder"
            variant="outline"
            onPress={() => void replan()}
            loading={busyKey === "replan"}
          />
          <Button
            title="Run weekly review"
            variant="secondary"
            onPress={() => void review()}
            loading={busyKey === "review"}
          />
        </Card>

        <Card variant="ghost" style={{ gap: 8 }}>
          <Text variant="h3">Status</Text>
          <Text
            selectable
            style={{
              color:
                status.includes("failed") || status.includes("Error")
                  ? theme.destructive
                  : theme.foreground,
            }}
          >
            {status}
          </Text>
        </Card>
      </ScrollView>
    </Container>
  );
}

function buildPlanItemSubtitle(item: {
  itemType: string;
  date: string;
  startTime?: string;
  endTime?: string;
  priority: string;
  effort: string;
}) {
  const timeWindow =
    item.startTime && item.endTime
      ? `${item.startTime} - ${item.endTime}`
      : item.startTime
        ? item.startTime
        : "Flexible";

  return `${item.itemType} · ${timeWindow} · ${item.priority} priority · ${item.effort} effort`;
}

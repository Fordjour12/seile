import { type ComponentProps, type ReactNode } from "react";
import {
  Alert as RNAlert,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type SpendingRow = {
  id: string;
  name: string;
  amount: string;
  width: `${number}%`;
  color: string;
};

type AppTheme = (typeof NAV_THEME)[keyof typeof NAV_THEME];

type SavingsGoal = {
  id: string;
  name: string;
  progressLabel: string;
  percent: string;
  percentValue: number;
  color: string;
  icon: ComponentProps<typeof FontAwesome>["name"];
  iconBackground: string;
  route?: string;
};

type RecurringItem = {
  id: string;
  name: string;
  meta: string;
  amount: string;
  due: string;
  dueColor: string;
  icon: ComponentProps<typeof FontAwesome>["name"];
  iconColor: string;
  iconBackground: string;
};

const SPENDING_ROWS: SpendingRow[] = [
  { id: "housing", name: "Housing", amount: "GHc 1,200", width: "90%", color: "#2f7dd1" },
  { id: "food", name: "Food", amount: "GHc 680", width: "55%", color: "#1fa97f" },
  { id: "subscriptions", name: "Subscriptions", amount: "GHc 340", width: "32%", color: "#7b6df6" },
  { id: "transport", name: "Transport", amount: "GHc 290", width: "28%", color: "#d07a36" },
  { id: "other", name: "Other", amount: "GHc 250", width: "22%", color: "#848691" },
];

const SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: "emergency",
    name: "Emergency fund",
    progressLabel: "GHc 3,200 of GHc 8,000 · GHc 400/mo",
    percent: "40%",
    percentValue: 40,
    color: "#1fa97f",
    icon: "shield",
    iconBackground: "rgba(31, 169, 127, 0.14)",
    route: "/(tabs)/domains/finance",
  },
  {
    id: "equipment",
    name: "Equipment upgrade",
    progressLabel: "GHc 850 of GHc 2,500 · GHc 200/mo",
    percent: "34%",
    percentValue: 34,
    color: "#2f7dd1",
    icon: "briefcase",
    iconBackground: "rgba(47, 125, 209, 0.14)",
    route: "/(tabs)/domains/finance",
  },
];

const RECURRING_GROUPS: Array<{ id: string; label: string; items: RecurringItem[] }> = [
  {
    id: "this-week",
    label: "Due this week",
    items: [
      {
        id: "internet",
        name: "Internet",
        meta: "Monthly · auto-pay",
        amount: "GHc 180",
        due: "Due Sun Mar 16",
        dueColor: "#a896ff",
        icon: "globe",
        iconColor: "#91bfff",
        iconBackground: "rgba(47, 125, 209, 0.16)",
      },
      {
        id: "cloud",
        name: "Cloud tools",
        meta: "Monthly · subscriptions",
        amount: "GHc 95",
        due: "Due Sat Mar 15",
        dueColor: "#a896ff",
        icon: "cloud",
        iconColor: "#b8abff",
        iconBackground: "rgba(123, 109, 246, 0.14)",
      },
    ],
  },
  {
    id: "later",
    label: "Later this month",
    items: [
      {
        id: "rent",
        name: "Rent",
        meta: "Monthly · manual pay",
        amount: "GHc 1,200",
        due: "Due Mar 28",
        dueColor: "#8b8f9d",
        icon: "home",
        iconColor: "#91bfff",
        iconBackground: "rgba(47, 125, 209, 0.14)",
      },
      {
        id: "tithe",
        name: "Tithe",
        meta: "Monthly · Faith domain",
        amount: "GHc 150",
        due: "Due Mar 30",
        dueColor: "#8b8f9d",
        icon: "bullseye",
        iconColor: "#b8abff",
        iconBackground: "rgba(123, 109, 246, 0.14)",
      },
    ],
  },
];

export function FinanceDomainScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const { width } = useWindowDimensions();
  const router = useRouter();
  const compactMetrics = width < 390;

  function openPlaceholder(title: string, message: string) {
    RNAlert.alert(title, message);
  }

  function navigateTo(href: string) {
    router.push(href as never);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -68,
          right: -72,
          width: 230,
          height: 230,
          borderRadius: 999,
          backgroundColor: isDarkColorScheme ? "rgba(31, 169, 127, 0.14)" : "rgba(31, 169, 127, 0.1)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 260,
          left: -92,
          width: 220,
          height: 220,
          borderRadius: 999,
          backgroundColor: isDarkColorScheme ? "rgba(123, 109, 246, 0.12)" : "rgba(123, 109, 246, 0.08)",
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.xl,
          paddingBottom: 48,
          gap: 16,
        }}
      >
        <Animated.View entering={FadeInDown.duration(420)}>
          <LinearGradient
            colors={
              isDarkColorScheme
                ? ["rgba(21, 34, 28, 0.98)", "rgba(12, 14, 18, 0.98)"]
                : ["rgba(234, 248, 241, 0.98)", "rgba(246, 250, 248, 0.98)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 28,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: isDarkColorScheme ? "rgba(62, 112, 86, 0.34)" : "rgba(76, 146, 112, 0.18)",
              padding: 18,
              gap: 16,
              boxShadow: theme.shadowLg,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <Badge variant="subtle" color="success">
                Finance domain
              </Badge>
              <Button
                title="Add entry"
                size="sm"
                onPress={() => navigateTo("/(tabs)/domains/finance")}
                style={{
                  minHeight: 34,
                  paddingHorizontal: 14,
                  backgroundColor: isDarkColorScheme ? "rgba(31, 169, 127, 0.16)" : "rgba(31, 169, 127, 0.12)",
                }}
              />
            </View>

            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: "#1fa97f",
                  }}
                />
                <Text
                  selectable
                  style={{
                    fontFamily: "Geist",
                    fontSize: 18,
                    fontWeight: "700",
                    color: theme.foreground,
                  }}
                >
                  March 2026 overview
                </Text>
              </View>
              <Text
                selectable
                variant="small"
                style={{
                  color: theme.mutedForeground,
                }}
              >
                14 days remaining · one overdue review dragging the domain score down.
              </Text>
            </View>

            <View
              style={{
                flexDirection: compactMetrics ? "column" : "row",
                gap: 10,
              }}
            >
              <MetricPill label="Health" value="55%" valueColor="#d07a36" theme={theme} />
              <MetricPill label="Remaining" value="GHc 1,240" valueColor="#1fa97f" theme={theme} />
              <MetricPill label="Trend" value="+GHc 420" valueColor="#b8abff" theme={theme} />
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(420)}>
          <Pressable
            onPress={() => navigateTo("/(tabs)/domains/finance")}
            style={({ pressed }) => ({
              opacity: pressed ? 0.92 : 1,
            })}
          >
            <Card
              style={{
                borderRadius: 22,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: isDarkColorScheme ? "rgba(126, 89, 30, 0.46)" : "rgba(186, 117, 23, 0.24)",
                backgroundColor: isDarkColorScheme ? "rgba(31, 22, 8, 0.94)" : "rgba(255, 245, 228, 0.96)",
                padding: 14,
                gap: 10,
                boxShadow: theme.shadowSm,
              }}
            >
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isDarkColorScheme ? "rgba(186, 117, 23, 0.16)" : "rgba(186, 117, 23, 0.12)",
                  }}
                >
                  <FontAwesome name="exclamation-circle" size={16} color="#d69030" />
                </View>
                <View style={{ flex: 1, gap: 5 }}>
                  <Text
                    selectable
                    style={{
                      fontFamily: "Geist",
                      fontSize: 14,
                      fontWeight: "700",
                      color: isDarkColorScheme ? "#f2d08a" : "#8a5c14",
                    }}
                  >
                    Budget review overdue · 4 days
                  </Text>
                  <Text
                    selectable
                    variant="small"
                    style={{
                      color: isDarkColorScheme ? "rgba(242, 208, 138, 0.72)" : "#916a26",
                    }}
                  >
                    Q2 variance review was due Monday. Clearing it raises Finance health back above 80%.
                  </Text>
                  <Text
                    selectable
                    variant="small"
                    style={{
                      color: "#d69030",
                      fontFamily: "Geist",
                      fontWeight: "700",
                    }}
                  >
                    Start review now
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(420)}>
          <Card
            style={{
              borderRadius: 24,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: isDarkColorScheme ? "rgba(73, 108, 92, 0.3)" : "rgba(74, 148, 109, 0.16)",
              padding: 18,
              gap: 16,
              boxShadow: theme.shadowLg,
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
              <View>
                <Text
                  selectable
                  variant="muted"
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    fontFamily: "Geist",
                    fontWeight: "700",
                  }}
                >
                  Monthly budget
                </Text>
                <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                  Mar 1-31
                </Text>
              </View>
              <Badge variant="subtle" color="success">
                On pace
              </Badge>
            </View>

            <View
              style={{
                flexDirection: compactMetrics ? "column" : "row",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <View style={{ gap: 4 }}>
                <Text selectable variant="muted">
                  Spent
                </Text>
                <Text
                  selectable
                  style={{
                    fontFamily: "Geist",
                    fontSize: 30,
                    fontWeight: "700",
                    lineHeight: 32,
                    color: theme.foreground,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  GHc 2,760
                </Text>
              </View>
              <View style={{ gap: 4, alignItems: compactMetrics ? "flex-start" : "flex-end" }}>
                <Text selectable variant="muted">
                  Budget
                </Text>
                <Text
                  selectable
                  style={{
                    fontFamily: "Geist",
                    fontSize: 18,
                    fontWeight: "600",
                    color: theme.mutedForeground,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  GHc 4,000
                </Text>
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <View
                style={{
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: isDarkColorScheme ? "rgba(255,255,255,0.08)" : "rgba(30, 41, 59, 0.08)",
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: "69%",
                    height: "100%",
                    borderRadius: 999,
                    backgroundColor: "#1fa97f",
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: compactMetrics ? "column" : "row",
                  justifyContent: "space-between",
                  gap: 6,
                }}
              >
                <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                  69% used · 14 days left
                </Text>
                <Text
                  selectable
                  variant="small"
                  style={{
                    color: "#1fa97f",
                    fontFamily: "Geist",
                    fontWeight: "700",
                  }}
                >
                  GHc 1,240 remaining
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: compactMetrics ? "column" : "row",
                gap: 10,
              }}
            >
              <BudgetStat label="Daily remaining" value="GHc 88" valueColor="#1fa97f" theme={theme} />
              <BudgetStat label="Avg surplus" value="GHc 420" valueColor="#d07a36" theme={theme} />
              <BudgetStat label="Daily avg spend" value="GHc 197" valueColor={theme.foreground} theme={theme} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(420)}>
          <SectionCard title="Spending breakdown" detail="GHc 2,760 total" theme={theme}>
            {SPENDING_ROWS.map((row) => (
              <View
                key={row.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingVertical: 6,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: row.color,
                  }}
                />
                <Text selectable style={{ flex: 1, color: theme.foreground }}>
                  {row.name}
                </Text>
                <View style={{ width: width < 380 ? 60 : 82 }}>
                  <View
                    style={{
                      height: 4,
                      borderRadius: 999,
                      backgroundColor: isDarkColorScheme ? "rgba(255,255,255,0.08)" : "rgba(30, 41, 59, 0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: row.width,
                        height: "100%",
                        borderRadius: 999,
                        backgroundColor: row.color,
                      }}
                    />
                  </View>
                </View>
                <Text
                  selectable
                  variant="small"
                  style={{
                    width: 72,
                    textAlign: "right",
                    color: theme.mutedForeground,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {row.amount}
                </Text>
              </View>
            ))}
          </SectionCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(420)} style={{ gap: 10 }}>
          <SectionHeading title="Savings goals" />
          {SAVINGS_GOALS.map((goal) => (
            <Pressable
              key={goal.id}
              onPress={() => (goal.route ? navigateTo(goal.route) : openPlaceholder(goal.name, "Savings detail route is next."))}
              style={({ pressed }) => ({
                opacity: pressed ? 0.94 : 1,
              })}
            >
              <Card
                style={{
                  borderRadius: 18,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: theme.border,
                  padding: 14,
                  gap: 12,
                  boxShadow: theme.shadowSm,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: goal.iconBackground,
                    }}
                  >
                    <FontAwesome name={goal.icon} size={15} color={goal.color} />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text
                      selectable
                      style={{
                        fontFamily: "Geist",
                        fontWeight: "700",
                        color: theme.foreground,
                      }}
                    >
                      {goal.name}
                    </Text>
                    <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                      {goal.progressLabel}
                    </Text>
                  </View>
                  <Text
                    selectable
                    variant="small"
                    style={{
                      color: goal.color,
                      fontFamily: "Geist",
                      fontWeight: "700",
                    }}
                  >
                    {goal.percent}
                  </Text>
                </View>

                <View
                  style={{
                    height: 4,
                    borderRadius: 999,
                    backgroundColor: isDarkColorScheme ? "rgba(255,255,255,0.08)" : "rgba(30, 41, 59, 0.08)",
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${goal.percentValue}%`,
                      height: "100%",
                      borderRadius: 999,
                      backgroundColor: goal.color,
                    }}
                  />
                </View>
              </Card>
            </Pressable>
          ))}

          <Pressable
            onPress={() => navigateTo("/(tabs)/domains/finance")}
            style={({ pressed }) => ({
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Card
              style={{
                borderRadius: 18,
                borderCurve: "continuous",
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: isDarkColorScheme ? "rgba(31, 169, 127, 0.34)" : "rgba(31, 169, 127, 0.3)",
                padding: 16,
                backgroundColor: isDarkColorScheme ? "rgba(17, 25, 22, 0.55)" : "rgba(240, 250, 245, 0.7)",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <FontAwesome name="plus" size={13} color={theme.mutedForeground} />
                <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                  Add savings goal
                </Text>
              </View>
            </Card>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(420)} style={{ gap: 10 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <SectionHeading title="Recurring this month" />
            <Pressable onPress={() => navigateTo("/(tabs)/domains/finance")}>
              <Text
                selectable
                variant="small"
                style={{
                  color: theme.primary,
                  fontFamily: "Geist",
                  fontWeight: "700",
                }}
              >
                View all
              </Text>
            </Pressable>
          </View>

          {RECURRING_GROUPS.map((group) => (
            <Card
              key={group.id}
              style={{
                borderRadius: 18,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: theme.border,
                padding: 14,
                gap: 8,
                boxShadow: theme.shadowSm,
              }}
            >
              <Text
                selectable
                variant="muted"
                style={{
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  fontFamily: "Geist",
                  fontWeight: "700",
                  color: theme.mutedForeground,
                }}
              >
                {group.label}
              </Text>

              {group.items.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => navigateTo("/(tabs)/domains/finance")}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.94 : 1,
                  })}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      paddingVertical: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 11,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: item.iconBackground,
                      }}
                    >
                      <FontAwesome name={item.icon} size={14} color={item.iconColor} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        selectable
                        style={{
                          fontFamily: "Geist",
                          fontWeight: "700",
                          color: theme.foreground,
                        }}
                      >
                        {item.name}
                      </Text>
                      <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
                        {item.meta}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 2 }}>
                      <Text
                        selectable
                        variant="small"
                        style={{
                          fontFamily: "Geist",
                          fontWeight: "700",
                          color: theme.foreground,
                          fontVariant: ["tabular-nums"],
                        }}
                      >
                        {item.amount}
                      </Text>
                      <Text selectable variant="muted" style={{ color: item.dueColor }}>
                        {item.due}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </Card>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(360).duration(420)}>
          <Card
            style={{
              borderRadius: 20,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: isDarkColorScheme ? "rgba(110, 98, 190, 0.34)" : "rgba(110, 98, 190, 0.2)",
              backgroundColor: isDarkColorScheme ? "rgba(18, 18, 32, 0.95)" : "rgba(243, 241, 255, 0.98)",
              padding: 16,
              gap: 12,
              boxShadow: theme.shadowSm,
            }}
          >
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: "#a896ff",
                  marginTop: 6,
                }}
              />
              <View style={{ flex: 1, gap: 10 }}>
                <Text selectable style={{ color: isDarkColorScheme ? "#c8c2ff" : "#5c54c9" }}>
                  You are still on track to finish March with a GHc 420 surplus. The one blocker is the budget review.
                  Clear it today and the Finance score recovers fast.
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  <ActionChip label="Do the review" onPress={() => navigateTo("/(tabs)/domains/finance")} theme={theme} />
                  <ActionChip
                    label="Approve savings goal"
                    onPress={() =>
                      openPlaceholder(
                        "Savings approval",
                        "The approval flow for this design is not wired yet, but the action treatment is in place.",
                      )
                    }
                    theme={theme}
                  />
                  <ActionChip label="3-month trends" onPress={() => navigateTo("/(tabs)/domains/finance")} theme={theme} />
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function MetricPill({
  label,
  value,
  valueColor,
  theme,
}: {
  label: string;
  value: string;
  valueColor: string;
  theme: AppTheme;
}) {
  return (
    <View
      style={{
        flex: 1,
        minHeight: 72,
        borderRadius: 18,
        borderCurve: "continuous",
        padding: 12,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        gap: 4,
      }}
    >
      <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
        {label}
      </Text>
      <Text
        selectable
        style={{
          fontFamily: "Geist",
          fontSize: 18,
          fontWeight: "700",
          color: valueColor,
          fontVariant: ["tabular-nums"],
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function BudgetStat({
  label,
  value,
  valueColor,
  theme,
}: {
  label: string;
  value: string;
  valueColor: string;
  theme: AppTheme;
}) {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 18,
        borderCurve: "continuous",
        padding: 12,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
        gap: 5,
      }}
    >
      <Text
        selectable
        style={{
          fontFamily: "Geist",
          fontSize: 18,
          fontWeight: "700",
          color: valueColor,
          fontVariant: ["tabular-nums"],
        }}
      >
        {value}
      </Text>
      <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
        {label}
      </Text>
    </View>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <Text
      selectable
      variant="muted"
      style={{
        textTransform: "uppercase",
        letterSpacing: 1.2,
        fontFamily: "Geist",
        fontWeight: "700",
      }}
    >
      {title}
    </Text>
  );
}

function SectionCard({
  title,
  detail,
  theme,
  children,
}: {
  title: string;
  detail: string;
  theme: AppTheme;
  children: ReactNode;
}) {
  return (
    <Card
      style={{
        borderRadius: 20,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: theme.border,
        padding: 16,
        gap: 8,
        boxShadow: theme.shadowSm,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 4,
        }}
      >
        <SectionHeading title={title} />
        <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
          {detail}
        </Text>
      </View>
      {children}
    </Card>
  );
}

function ActionChip({
  label,
  onPress,
  theme,
}: {
  label: string;
  onPress: () => void;
  theme: AppTheme;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 999,
        borderCurve: "continuous",
        paddingHorizontal: 12,
        paddingVertical: 7,
        backgroundColor: "rgba(110, 98, 190, 0.12)",
        borderWidth: 1,
        borderColor: "rgba(110, 98, 190, 0.22)",
        opacity: pressed ? 0.84 : 1,
      })}
    >
      <Text
        selectable
        variant="small"
        style={{
          color: theme.primary,
          fontFamily: "Geist",
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

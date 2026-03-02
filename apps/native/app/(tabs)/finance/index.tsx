import {
  Text,
  View,
  SectionHeader,
  OverviewChartCard,
  AccountOverviewCard,
  type AccountOverviewMetrics,
  BudgetEnvelopesList,
  type BudgetEnvelope,
  DebtSnapshotCard,
  type DebtItem,
} from "@/components";
import { Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";

import { NAV_THEME, Typography, CardTokens, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

const OPACITY = {
  pressed: 0.84,
};

const sampleEnvelopes: BudgetEnvelope[] = [
  {
    id: "1",
    name: "Groceries",
    budgeted: 500,
    spent: 320,
    color: "#22c55e",
    icon: "G",
  },
  {
    id: "2",
    name: "Dining Out",
    budgeted: 200,
    spent: 180,
    color: "#f59e0b",
    icon: "D",
  },
  {
    id: "3",
    name: "Transportation",
    budgeted: 150,
    spent: 90,
    color: "#3b82f6",
    icon: "T",
  },
];

const sampleDebts: DebtItem[] = [
  {
    id: "db-1",
    name: "Student Loan",
    type: "installment",
    originalBalance: 35000,
    currentBalance: 21450,
    monthlyDue: 1200,
  },
  {
    id: "db-2",
    name: "Car Loan",
    type: "installment",
    originalBalance: 18500,
    currentBalance: 9600,
    monthlyDue: 920,
  },
  {
    id: "db-3",
    name: "Credit Card",
    type: "revolving",
    originalBalance: 8200,
    currentBalance: 5450,
    monthlyDue: 650,
  },
  {
    id: "db-4",
    name: "Store Card",
    type: "revolving",
    originalBalance: 2600,
    currentBalance: 1350,
    monthlyDue: 220,
  },
];

const sampleAccountOverview: AccountOverviewMetrics = {
  totalCash: 18345.79,
  moneyInMtd: 8950.0,
  moneyOutMtd: 6124.45,
  accountsCount: 5,
  periodLabel: "Mar 2026 · Month-to-date",
};

export default function Index() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const navItems = [
    {
      key: "accounting",
      badge: "AC",
      label: "Accounts",
      meta: "Tracked accounts: 0",
      route: "/(tabs)/finance/accounts",
    },
    {
      key: "recurring",
      badge: "RC",
      label: "Schedules",
      meta: "Active: 0 · Subscriptions: 0",
      route: "/(tabs)/finance/recurring",
    },
    {
      key: "insights",
      badge: "IN",
      label: "Insights",
      meta: "Advanced metrics and anomalies",
      route: "/(tabs)/finance/insights",
    },
    {
      key: "debt",
      badge: "DB",
      label: "Debt",
      meta: "Prioritize payoff strategy",
      route: "/(tabs)/finance/debt",
    },
    {
      key: "investments",
      badge: "IV",
      label: "Investments",
      meta: "Track portfolio value",
      route: "/(tabs)/finance/planning/investments",
    },
  ];

  //className="flex-1 bg-background"
  // contentContainerClassName="p-6 pb-24 gap-6"

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
      {/*<View style={styles.container}>*/}
      {/*<View>*/}
      <SectionHeader title="Overview" subtitle="MONTHLY SNAPSHOT" />
      <AccountOverviewCard
        metrics={sampleAccountOverview}
        onViewAccountsPress={() => router.push("/(tabs)/finance/accounts" as any)}
      />
      <OverviewChartCard />
      <DebtSnapshotCard
        debts={sampleDebts}
        onViewAllPress={() => router.push("/(tabs)/finance/debt" as any)}
      />

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <SectionHeader title="" subtitle="BUDGET ENVELOPES" />
          <Pressable
            onPress={() => router.push("/(tabs)/finance/budget" as any)}
          >
            <Text style={[Typography.labelSM, { color: theme.chart4 }]}>
              View All
            </Text>
          </Pressable>
        </View>
        <BudgetEnvelopesList envelopes={sampleEnvelopes} />
      </View>

      <View style={styles.actionsSection}>
        <SectionHeader title="" subtitle="ACTIONS" />
        <View>
          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                pressed && { opacity: OPACITY.pressed },
              ]}
              onPress={() =>
                router.push("/(tabs)/finance/transactions/add" as any)
              }
            >
              <Text style={[Typography.bodyMD, { color: theme.text }]}>
                Log Transaction
              </Text>
              <Text
                style={[Typography.captionSM, { color: theme.mutedForeground }]}
              >
                Manual expense entry
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                pressed && { opacity: OPACITY.pressed },
              ]}
              onPress={() =>
                router.push("/(tabs)/finance/recurring/add" as any)
              }
            >
              <Text style={[Typography.bodyMD, { color: theme.text }]}>
                Add Schedule
              </Text>
              <Text
                style={[Typography.captionSM, { color: theme.mutedForeground }]}
              >
                Payment schedule
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.actionCardWide,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                marginTop: UI_PRESETS.spacing.md,
              },
              pressed && { opacity: OPACITY.pressed },
            ]}
            onPress={() => router.push("/(tabs)/finance/budget" as any)}
          >
            <Text style={[Typography.bodyMD, { color: theme.text }]}>
              Budgeting
            </Text>
            <Text
              style={[Typography.captionSM, { color: theme.mutedForeground }]}
            >
              Budgeting Envelopes Overview
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Quick Navigation" />
        <View style={styles.grid}>
          {navItems.map((nav, index) => (
            <Pressable
              key={nav.key}
              style={({ pressed }) => [
                styles.card,
                {
                  width:
                    navItems.length % 2 === 1 && index === navItems.length - 1
                      ? "100%"
                      : "48%",
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
                pressed && { opacity: OPACITY.pressed },
              ]}
              onPress={() => router.push(nav.route as any)}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: theme.chart4 + "20",
                      borderColor: theme.chart4,
                    },
                  ]}
                >
                  <Text
                    style={[Typography.labelXS, { color: theme.background }]}
                  >
                    {nav.badge}
                  </Text>
                </View>
                <Text
                  style={[Typography.bodySM, { color: theme.mutedForeground }]}
                >
                  →
                </Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={[Typography.titleSM, { color: theme.text }]}>
                  {nav.label}
                </Text>
                <Text
                  style={[
                    Typography.captionSM,
                    { color: theme.mutedForeground, marginTop: 2 },
                  ]}
                >
                  {nav.meta}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
      {/*</View>*/}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: UI_PRESETS.spacing.screen,
  },
  actionsSection: {
    marginTop: UI_PRESETS.spacing.md,
    gap: UI_PRESETS.spacing.md,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.sm,
  },
  actionCard: {
    flex: 1,
    minWidth: 140,
    borderRadius: CardTokens.base.borderRadius,
    borderWidth: 1,
    padding: UI_PRESETS.spacing.md,
    gap: UI_PRESETS.spacing.xs,
  },
  actionCardWide: {
    minWidth: 140,
    borderRadius: CardTokens.base.borderRadius,
    borderWidth: 1,
    padding: UI_PRESETS.spacing.md,
    gap: UI_PRESETS.spacing.xs,
  },
  section: {
    marginTop: UI_PRESETS.spacing.md,
    gap: UI_PRESETS.spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: UI_PRESETS.spacing["4xl"],
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.md,
  },
  card: {
    minHeight: 128,
    borderRadius: CardTokens.base.borderRadius,
    borderWidth: 1,
    padding: UI_PRESETS.spacing.md,
    gap: UI_PRESETS.spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: UI_PRESETS.spacing.sm,
    paddingVertical: 2,
    borderRadius: UI_PRESETS.radius.full,
    borderWidth: 1,
  },
  cardContent: {
    gap: 2,
  },
});

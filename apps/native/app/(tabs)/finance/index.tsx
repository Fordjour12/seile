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
  SavingsSummaryCard,
  type DebtItem,
} from "@/components";
import { Pressable, ScrollView } from "react-native";
import { useRouter, type Href } from "expo-router";
import { StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";

import { NAV_THEME, Typography, CardTokens, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { listAccounts } from "@/lib/accounts";
import { getTransactionSummary } from "@/lib/transactions";
import { listDebtPlans } from "@/lib/debt";
import { getSavingsSummary } from "@/lib/savings";
import { getBudgetSummary } from "@/lib/budget";

const OPACITY = {
  pressed: 0.84,
};


export default function Index() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [accountOverview, setAccountOverview] = useState<AccountOverviewMetrics>({
    totalCash: 0,
    moneyInMtd: 8950,
    moneyOutMtd: 6124.45,
    accountsCount: 0,
    periodLabel: "Mar 2026 · Month-to-date",
  });

  const [debtItems, setDebtItems] = useState<DebtItem[]>([]);
  const [savingsSummary, setSavingsSummary] = useState({
    totalTarget: 0,
    totalCurrent: 0,
    percentComplete: 0,
    totalMonthlyCommitment: 0,
    countByStatus: {} as Record<string, number>,
  });

  const [budgetSummary, setBudgetSummary] = useState({
    activePeriod: null as null | {
      id: string;
      year: number;
      month: number;
      incomeTarget: number;
      totalAllocated: number;
      unallocated: number;
    },
    overspentCount: 0,
    topEnvelopes: [] as BudgetEnvelope[],
  });

  useEffect(() => {
    async function loadAccountOverview() {
      try {
        const [accounts, summary] = await Promise.all([
          listAccounts(),
          getTransactionSummary(
            new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
            new Date().toISOString(),
          ),
        ]);
        const totalCash = accounts.reduce((sum, account) => sum + account.balance, 0);
        const now = new Date();
        const periodLabel = `${now.toLocaleString("en-US", { month: "short" })} ${now.getFullYear()} · Month-to-date`;

        const [debts, savings, budget] = await Promise.all([listDebtPlans(), getSavingsSummary(), getBudgetSummary()]);

        setAccountOverview({
          totalCash,
          moneyInMtd: summary.income,
          moneyOutMtd: summary.expense,
          accountsCount: accounts.length,
          periodLabel,
        });
        setDebtItems(debts.map((debt) => ({
          id: debt.id,
          name: debt.name,
          type: debt.debtType,
          originalBalance: debt.originalBalance,
          currentBalance: debt.currentBalance,
          monthlyDue: debt.monthlyDue,
          apr: debt.apr,
        })));
        setSavingsSummary(savings);
        setBudgetSummary({
          activePeriod: budget.activePeriod
            ? {
                id: budget.activePeriod.id,
                year: budget.activePeriod.year,
                month: budget.activePeriod.month,
                incomeTarget: budget.activePeriod.incomeTarget,
                totalAllocated: budget.activePeriod.totalAllocated,
                unallocated: budget.activePeriod.unallocated,
              }
            : null,
          overspentCount: budget.overspentCount,
          topEnvelopes: budget.topEnvelopes.map((envelope) => ({
            id: envelope.id,
            name: envelope.name,
            budgeted: envelope.effectiveAllocation,
            spent: envelope.actualSpend,
            color: envelope.color ?? theme.chart2,
            icon: envelope.icon,
          })),
        });
      } catch {
        const accounts = await listAccounts();
        const totalCash = accounts.reduce((sum, account) => sum + account.balance, 0);

        setAccountOverview((previous) => ({
          ...previous,
          totalCash,
          accountsCount: accounts.length,
        }));
      }
    }

    void loadAccountOverview();
  }, []);

  const navItems = [
    {
      key: "accounting",
      badge: "AC",
      label: "Accounts",
      meta: `Tracked accounts: ${accountOverview.accountsCount}`,
      route: "/(tabs)/finance/accounts",
    },
    {
      key: "recurring",
      badge: "RC",
      label: "Schedules",
      meta: "Recurring flows and subscriptions",
      route: "/(tabs)/finance/recurring",
    },
    {
      key: "transactions",
      badge: "TX",
      label: "Transactions",
      meta: "Create, review, and reverse entries",
      route: "/(tabs)/finance/transactions",
    },
    {
      key: "debt",
      badge: "DB",
      label: "Debt",
      meta: "Prioritize payoff strategy",
      route: "/(tabs)/finance/debt",
    },
    {
      key: "budget",
      badge: "BG",
      label: "Budget",
      meta: budgetSummary.activePeriod
        ? `Active ${String(budgetSummary.activePeriod.month).padStart(2, "0")}/${budgetSummary.activePeriod.year}`
        : "Plan envelopes and allocations",
      route: "/(tabs)/finance/budget",
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
        metrics={accountOverview}
        onViewAccountsPress={() => router.push("/(tabs)/finance/accounts" as Href)}
      />
      <OverviewChartCard />
      <DebtSnapshotCard
        debts={debtItems}
        onViewAllPress={() => router.push("/(tabs)/finance/debt" as Href)}
      />
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <SectionHeader title="" subtitle="SAVINGS GOALS" />
          <Pressable onPress={() => router.push("/(tabs)/finance/savings" as Href)}>
            <Text style={[Typography.labelSM, { color: theme.chart4 }]}>
              View All
            </Text>
          </Pressable>
        </View>
        <SavingsSummaryCard
          totalTarget={savingsSummary.totalTarget}
          totalCurrent={savingsSummary.totalCurrent}
          percentComplete={savingsSummary.percentComplete}
          goalsCount={Object.values(savingsSummary.countByStatus).reduce((sum, count) => sum + count, 0)}
        />
        <View style={styles.sectionHeaderRow}>
          <Text style={[Typography.bodyMD, { color: theme.text }]}>Total Monthly Commitment</Text>
          <Text style={[Typography.labelSM, { color: theme.primary }]}>
            {(debtItems.reduce((sum, debt) => sum + debt.monthlyDue, 0) + savingsSummary.totalMonthlyCommitment).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <SectionHeader title="" subtitle="BUDGET ENVELOPES" />
          <Pressable
            onPress={() => router.push("/(tabs)/finance/budget" as Href)}
          >
            <Text style={[Typography.labelSM, { color: theme.chart4 }]}>
              View All
            </Text>
          </Pressable>
        </View>
        {budgetSummary.activePeriod ? (
          <View style={styles.sectionHeaderRow}>
            <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>
              {`Active period: ${budgetSummary.activePeriod.year}-${String(budgetSummary.activePeriod.month).padStart(2, "0")}`}
            </Text>
            {budgetSummary.overspentCount > 0 ? (
              <Text style={[Typography.labelSM, { color: theme.destructive }]}>
                {`${budgetSummary.overspentCount} overspent`}
              </Text>
            ) : null}
          </View>
        ) : (
          <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>No active budget</Text>
        )}
        <BudgetEnvelopesList envelopes={budgetSummary.topEnvelopes} />
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
                router.push("/(tabs)/finance/transactions/create" as Href)
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
                router.push("/(tabs)/finance/recurring/create" as Href)
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
            onPress={() => router.push("/(tabs)/finance/budget" as Href)}
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
              onPress={() => router.push(nav.route as Href)}
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

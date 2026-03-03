import {
  AccountOverviewCard,
  OverviewChartCard,
  SectionHeader,
  Text,
  ThemedBarChart,
  View,
  type AccountOverviewMetrics,
} from "@/components";
import { CardTokens, NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";

type MonthlyFlow = {
  month: string;
  in: number;
  out: number;
};

type AccountRecord = {
  id: string;
  name: string;
  institution: string;
  type: "Checking" | "Savings" | "Cash";
  balance: number;
  monthlyFlow?: MonthlyFlow[];
};

const accounts: AccountRecord[] = [
  {
    id: "acc-1",
    name: "Main Checking",
    institution: "Ecobank",
    type: "Checking",
    balance: 9340.62,
    monthlyFlow: [
      { month: "Jan", in: 3600, out: 2510 },
      { month: "Feb", in: 3880, out: 2924 },
      { month: "Mar", in: 4120, out: 3185 },
      { month: "Apr", in: 4060, out: 2870 },
    ],
  },
  {
    id: "acc-2",
    name: "Emergency Savings",
    institution: "CalBank",
    type: "Savings",
    balance: 6895,
    monthlyFlow: [
      { month: "Jan", in: 1100, out: 300 },
      { month: "Feb", in: 980, out: 120 },
      { month: "Mar", in: 1140, out: 240 },
      { month: "Apr", in: 1020, out: 160 },
    ],
  },
  {
    id: "acc-3",
    name: "Wallet Cash",
    institution: "On hand",
    type: "Cash",
    balance: 530.4,
  },
];

function formatCurrency(amount: number): string {
  return `GH₵${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function AccountsIndex() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const trendData = useMemo(() => {
    const flowMonths = accounts
      .flatMap((account) => account.monthlyFlow ?? [])
      .reduce<Record<string, { in: number; out: number }>>((acc, monthFlow) => {
        const current = acc[monthFlow.month] ?? { in: 0, out: 0 };
        acc[monthFlow.month] = {
          in: current.in + monthFlow.in,
          out: current.out + monthFlow.out,
        };
        return acc;
      }, {});

    return Object.entries(flowMonths).map(([month, flow]) => ({
      month,
      in: flow.in,
      out: flow.out,
    }));
  }, []);

  const overviewMetrics: AccountOverviewMetrics = useMemo(() => {
    const totalCash = accounts.reduce((sum, account) => sum + account.balance, 0);
    const latestFlow = trendData.at(-1);

    return {
      totalCash,
      moneyInMtd: latestFlow?.in ?? 0,
      moneyOutMtd: latestFlow?.out ?? 0,
      accountsCount: accounts.length,
      periodLabel: latestFlow ? `${latestFlow.month} · Month-to-date` : "Current Month (MTD)",
    };
  }, [trendData]);

  const hasMonthlyTrend = trendData.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <SectionHeader title="Accounts" subtitle="OVERVIEW" />
        <AccountOverviewCard
          style={styles.overviewCard}
          metrics={overviewMetrics}
          onViewAccountsPress={() => router.push("/(tabs)/finance/accounts" as any)}
        />
      </View>

      {hasMonthlyTrend ? (
        <View style={styles.section}>
          <SectionHeader title="Cash Trend" subtitle="MONTHLY FLOW" />
          <OverviewChartCard
            title="Monthly Money In"
            periodLabel="Last 4 Months"
            avgLabel="Current month inflow"
            totalLabel={formatCurrency(overviewMetrics.moneyInMtd)}
            growthLabel="Auto"
            tooltipMonth={trendData.at(-1)?.month ?? "Current"}
            tooltipValue={formatCurrency(overviewMetrics.moneyInMtd)}
          />
          <View
            style={[
              styles.chartCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[Typography.titleSM, { color: theme.text }]}>Monthly Money Out</Text>
            <ThemedBarChart
              data={trendData.map((monthFlow) => ({ label: monthFlow.month, value: monthFlow.out }))}
              highlightedIndex={Math.max(0, trendData.length - 1)}
              height={114}
              barWidth={34}
              spacing={UI_PRESETS.spacing.sm}
            />
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="Quick Actions" subtitle="ACTIONS" />
        <View style={styles.quickActionsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/(tabs)/finance/accounts/create" as any)}
          >
            <Text style={[Typography.titleSM, { color: theme.text }]}>Create account</Text>
            <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Add a manual account</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
            onPress={() => {}}
          >
            <Text style={[Typography.titleSM, { color: theme.text }]}>Import accounts</Text>
            <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Sync from statements</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Account List" subtitle="TRACKED ACCOUNTS" />
        <View style={styles.listWrap}>
          {accounts.map((account) => (
            <Pressable
              key={account.id}
              style={({ pressed }) => [
                styles.accountRow,
                { backgroundColor: theme.card, borderColor: theme.border },
                pressed && styles.pressed,
              ]}
              onPress={() => router.push(`/(tabs)/finance/accounts/${account.id}/update` as any)}
            >
              <View style={styles.accountMeta}>
                <Text style={[Typography.titleSM, { color: theme.text }]}>{account.name}</Text>
                <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>
                  {account.institution} · {account.type}
                </Text>
              </View>
              <Text style={[Typography.titleSM, { color: theme.text }]}>{formatCurrency(account.balance)}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: UI_PRESETS.spacing.screen,
  },
  contentContainer: {
    paddingTop: UI_PRESETS.spacing.md,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.section,
  },
  section: {
    gap: UI_PRESETS.spacing.md,
  },
  overviewCard: {
    marginTop: 0,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
  actionCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: CardTokens.base.borderRadius,
    padding: UI_PRESETS.spacing.md,
    gap: UI_PRESETS.spacing.xs,
  },
  chartCard: {
    borderWidth: 1,
    borderRadius: CardTokens.base.borderRadius,
    padding: UI_PRESETS.spacing.md,
    gap: UI_PRESETS.spacing.sm,
  },
  listWrap: {
    gap: UI_PRESETS.spacing.sm,
  },
  accountRow: {
    borderWidth: 1,
    borderRadius: CardTokens.base.borderRadius,
    paddingHorizontal: UI_PRESETS.spacing.md,
    paddingVertical: UI_PRESETS.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: UI_PRESETS.spacing.sm,
  },
  accountMeta: {
    flex: 1,
    gap: UI_PRESETS.spacing.xs,
  },
  pressed: {
    opacity: UI_PRESETS.opacity.pressed,
  },
});

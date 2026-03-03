import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter, type Href } from "expo-router";
import {
  AccountOverviewCard,
  Banner,
  Button,
  Card,
  EmptyState,
  ListItem,
  OverviewChartCard,
  SectionHeader,
  Spinner,
  Text,
  ThemedBarChart,
  View,
  type AccountOverviewMetrics,
} from "@/components";
import { formatAccountStatus, listAccounts, mapAccountListItem, type Account } from "@/lib/accounts";
import {
  formatTransactionAmount,
  formatTransactionTime,
  listTransactions,
  type TransactionRecord,
} from "@/lib/transactions";
import { CardTokens, NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "GHS",
});

type MonthlyFlow = {
  month: string;
  in: number;
  out: number;
};

function formatCurrency(amount: number): string {
  return `GH₵${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function AccountsIndexScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  const refreshAccounts = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);

    try {
      const nextAccounts = await listAccounts();
      setAccounts(nextAccounts);

      try {
        const latestTransactions = await listTransactions({ limit: 10 });
        setTransactions(latestTransactions);
      } catch {
        setTransactions([]);
      }
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAccounts();
  }, [refreshAccounts]);

  const accountsWithFlow = useMemo(
    () =>
      accounts.map((account, index) => {
        const base = Math.max(Math.abs(account.balance), 100);
        const multiplier = 0.12 + index * 0.02;

        const monthlyFlow: MonthlyFlow[] = [
          { month: "Jan", in: base * (0.92 + multiplier), out: base * (0.55 + multiplier * 0.6) },
          { month: "Feb", in: base * (0.96 + multiplier), out: base * (0.58 + multiplier * 0.6) },
          { month: "Mar", in: base * (1 + multiplier), out: base * (0.61 + multiplier * 0.6) },
          { month: "Apr", in: base * (1.04 + multiplier), out: base * (0.64 + multiplier * 0.6) },
        ];

        return {
          ...account,
          monthlyFlow,
        };
      }),
    [accounts],
  );

  const trendData = useMemo(() => {
    const flowMonths = accountsWithFlow
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
  }, [accountsWithFlow]);

  const overviewMetrics: AccountOverviewMetrics = useMemo(() => {
    const totalCash = accountsWithFlow.reduce((sum, account) => sum + account.balance, 0);
    const latestFlow = trendData.at(-1);

    return {
      totalCash,
      moneyInMtd: latestFlow?.in ?? 0,
      moneyOutMtd: latestFlow?.out ?? 0,
      accountsCount: accountsWithFlow.length,
      periodLabel: latestFlow ? `${latestFlow.month} · Month-to-date` : "Current Month (MTD)",
    };
  }, [accountsWithFlow, trendData]);

  const totalBalance = overviewMetrics.totalCash;
  const hasMonthlyTrend = trendData.length > 0;

  const balanceByType = useMemo(() => {
    const grouped = accounts.reduce<Record<string, number>>((acc, account) => {
      const key = account.type.toUpperCase();
      acc[key] = (acc[key] ?? 0) + Math.max(account.balance, 0);
      return acc;
    }, {});

    const points = Object.entries(grouped).map(([label, value]) => ({ label, value }));
    const maxValue = Math.max(...points.map((point) => point.value), 0);
    const highlightedIndex = points.findIndex((point) => point.value === maxValue);

    return { points, highlightedIndex: highlightedIndex < 0 ? 0 : highlightedIndex };
  }, [accounts]);

  const showEmptyState = !isLoading && !hasError && accounts.length === 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader
        title="Accounts"
        subtitle="Cash, cards, and investment accounts"
        actionLabel="New"
        onActionPress={() => router.push("/(tabs)/finance/accounts/create" as Href)}
      />

      <AccountOverviewCard metrics={overviewMetrics} style={styles.overviewCard} />
      <Card variant="outline" style={[styles.summaryCard, { borderColor: theme.border }]}>
        <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Tracked Total</Text>
        <Text style={[Typography.titleLG, styles.summaryValue, { color: theme.text }]}>
          {currencyFormatter.format(totalBalance)}
        </Text>
      </Card>

      {hasError ? (
        <Banner
          variant="error"
          title="Unable to load accounts"
          message="Please check your connection and try again."
          actionLabel="Retry"
          onActionPress={() => {
            void refreshAccounts();
          }}
        />
      ) : null}

      {isLoading ? (
        <View style={styles.centeredState}>
          <Spinner size="large" />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading accounts…</Text>
        </View>
      ) : null}

      {showEmptyState ? (
        <EmptyState
          title="No accounts yet"
          message="Create your first account to start tracking cash flow and balances."
          actionLabel="Create account"
          onActionPress={() => router.push("/(tabs)/finance/accounts/create" as Href)}
        />
      ) : null}

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

      {!isLoading && !hasError && balanceByType.points.length > 0 ? (
        <Card variant="outline" style={[styles.chartCard, { borderColor: theme.border }]}>
          <Text style={[Typography.titleSM, { color: theme.text }]}>Balance by Account Type</Text>
          <ThemedBarChart
            data={balanceByType.points}
            highlightedIndex={balanceByType.highlightedIndex}
            height={112}
            barWidth={34}
            spacing={UI_PRESETS.spacing.sm}
          />
        </Card>
      ) : null}

      {!isLoading && !hasError ? (
        <View style={styles.quickActionsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/(tabs)/finance/accounts/create" as Href)}
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
            onPress={() => {
              void refreshAccounts();
            }}
          >
            <Text style={[Typography.titleSM, { color: theme.text }]}>Refresh balances</Text>
            <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>Reload account data</Text>
          </Pressable>
        </View>
      ) : null}


      {!isLoading && !hasError && accounts.length > 0 ? (
        <Card variant="outline" style={[styles.listCard, { borderColor: theme.border }]}>
          <SectionHeader title="Linked Accounts" subtitle={`${accounts.length} total`} />
          <View style={styles.list}>
            {accounts.map((account) => {
              const mapped = mapAccountListItem(account);

              return (
                <ListItem
                  key={mapped.id}
                  title={mapped.title}
                  subtitle={mapped.subtitle}
                  meta={mapped.balanceLabel}
                  onPress={() => router.push(`/(tabs)/finance/accounts/${account.id}/update` as Href)}
                  right={
                    <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>
                      {formatAccountStatus(account.status)}
                    </Text>
                  }
                  style={styles.listItem}
                />
              );
            })}
          </View>
        </Card>
      ) : null}

      {!isLoading && !hasError && accounts[0] ? (
        <View style={styles.actionsRow}>
          <Button
            title="Edit First Account"
            variant="outline"
            style={styles.actionButton}
            onPress={() => router.push(`/(tabs)/finance/accounts/${accounts[0].id}/update` as Href)}
          />
          <Button
            title="Delete First Account"
            variant="destructive"
            style={styles.actionButton}
            onPress={() => router.push(`/(tabs)/finance/accounts/${accounts[0].id}/delete` as Href)}
          />
        </View>
      ) : null}

      {!isLoading && !hasError ? (
        <Button title="Create Account" onPress={() => router.push("/(tabs)/finance/accounts/create" as Href)} />
      ) : null}



      {!isLoading && !hasError && transactions.length > 0 ? (
        <Card variant="outline" style={[styles.listCard, { borderColor: theme.border }]}>
          <SectionHeader title="Recent Transactions" subtitle="LATEST 10" />
          <View style={styles.list}>
            {transactions.map((transaction) => (
              <ListItem
                key={transaction.id}
                title={transaction.title}
                subtitle={`${transaction.category} · ${transaction.accountName} · ${formatTransactionTime(transaction.createdAt)}`}
                onPress={() => router.push(`/(tabs)/finance/transactions/${transaction.id}` as Href)}
                right={
                  <Text
                    style={[
                      Typography.labelSM,
                      {
                        color: transaction.direction === "in" ? theme.chart2 : theme.destructive,
                      },
                    ]}
                  >
                    {formatTransactionAmount(transaction.amount, transaction.direction, transaction.currencyCode)}
                  </Text>
                }
                style={styles.listItem}
              />
            ))}
          </View>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.xl,
    paddingTop: UI_PRESETS.spacing.screen,
  },
  overviewCard: {
    marginTop: 0,
    marginBottom: 0,
  },
  summaryCard: {
    gap: UI_PRESETS.spacing.sm,
  },
  summaryValue: {
    marginTop: UI_PRESETS.spacing.xs,
  },
  centeredState: {
    gap: UI_PRESETS.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: UI_PRESETS.spacing.section,
  },
  section: {
    gap: UI_PRESETS.spacing.md,
  },
  chartCard: {
    gap: UI_PRESETS.spacing.sm,
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
  listCard: {
    gap: UI_PRESETS.spacing.md,
  },
  list: {
    gap: UI_PRESETS.spacing.sm,
  },
  listItem: {
    borderRadius: UI_PRESETS.radius.md,
  },
  actionsRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  pressed: {
    opacity: UI_PRESETS.opacity.pressed,
  },
});

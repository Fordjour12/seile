import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  Banner,
  Button,
  Card,
  EmptyState,
  ListItem,
  SectionHeader,
  Spinner,
  Text,
  View,
} from "@/components";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type Account = {
  id: string;
  name: string;
  institution: string;
  type: "Checking" | "Savings" | "Credit Card" | "Brokerage";
  currency: string;
  status: "Active" | "Inactive";
  balance: number;
};

const sampleAccounts: Account[] = [
  {
    id: "acc-001",
    name: "Daily Spending",
    institution: "Northstar Bank",
    type: "Checking",
    currency: "USD",
    status: "Active",
    balance: 4821.34,
  },
  {
    id: "acc-002",
    name: "Emergency Fund",
    institution: "Northstar Bank",
    type: "Savings",
    currency: "USD",
    status: "Active",
    balance: 14550.22,
  },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function AccountsIndexScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAccounts(sampleAccounts);
      setIsLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + account.balance, 0),
    [accounts],
  );

  const retry = () => {
    setHasError(false);
    setIsLoading(true);
    setTimeout(() => {
      setAccounts(sampleAccounts);
      setIsLoading(false);
    }, 450);
  };

  const showEmptyState = !isLoading && !hasError && accounts.length === 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader
        title="Accounts"
        subtitle="Cash, cards, and investment accounts"
        actionLabel="New"
        onActionPress={() => router.push("/(tabs)/finance/accounts/create" as any)}
      />

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
          onActionPress={retry}
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
          onActionPress={() => router.push("/(tabs)/finance/accounts/create" as any)}
        />
      ) : null}

      {!isLoading && !hasError && accounts.length > 0 ? (
        <Card variant="outline" style={[styles.listCard, { borderColor: theme.border }]}>
          <SectionHeader title="Linked Accounts" subtitle={`${accounts.length} total`} />
          <View style={styles.list}>
            {accounts.map((account) => (
              <ListItem
                key={account.id}
                title={account.name}
                subtitle={`${account.institution} · ${account.type} · ${account.currency}`}
                meta={currencyFormatter.format(account.balance)}
                onPress={() => router.push(`/(tabs)/finance/accounts/${account.id}/update` as any)}
                right={<Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>{account.status}</Text>}
                style={styles.listItem}
              />
            ))}
          </View>
        </Card>
      ) : null}

      {!isLoading && !hasError ? (
        <Button title="Create Account" onPress={() => router.push("/(tabs)/finance/accounts/create" as any)} />
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
  listCard: {
    gap: UI_PRESETS.spacing.md,
  },
  list: {
    gap: UI_PRESETS.spacing.sm,
  },
  listItem: {
    borderRadius: UI_PRESETS.radius.md,
  },
});

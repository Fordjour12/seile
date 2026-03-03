import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { formatAccountStatus, listAccounts, mapAccountListItem, type Account } from "@/lib/accounts";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "GHS",
});

export default function AccountsIndexScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const refreshAccounts = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);

    try {
      const nextAccounts = await listAccounts();
      setAccounts(nextAccounts);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAccounts();
  }, [refreshAccounts]);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + account.balance, 0),
    [accounts],
  );

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
          onActionPress={() => router.push("/(tabs)/finance/accounts/create" as any)}
        />
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
                  onPress={() => router.push(`/(tabs)/finance/accounts/${account.id}/update` as any)}
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
            onPress={() => router.push(`/(tabs)/finance/accounts/${accounts[0].id}/update` as any)}
          />
          <Button
            title="Delete First Account"
            variant="destructive"
            style={styles.actionButton}
            onPress={() => router.push(`/(tabs)/finance/accounts/${accounts[0].id}/delete` as any)}
          />
        </View>
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
    paddingTop: UI_PRESETS.spacing.screen,
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
  actionsRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});

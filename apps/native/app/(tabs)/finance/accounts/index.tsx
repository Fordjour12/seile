import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";

import { Alert, Button, Text, View } from "@/components";
import { UI_PRESETS } from "@/lib/constants";
import { listAccounts, type AccountRecord } from "./data";

export default function AccountsIndex() {
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    const records = await listAccounts();
    setAccounts(records);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Accounts</Text>
        <Button title="Create" onPress={() => router.push("/(tabs)/finance/accounts/create")} />
      </View>

      {isLoading ? <Text>Loading accounts…</Text> : null}

      {!isLoading && accounts.length === 0 ? (
        <Alert
          title="No accounts yet"
          message="Create your first account to start tracking balances and cash flow."
          variant="info"
        />
      ) : null}

      {accounts.map((account) => (
        <Pressable
          key={account.id}
          style={styles.item}
          onPress={() => router.push(`/(tabs)/finance/accounts/${account.id}/update`)}
        >
          <Text style={styles.itemTitle}>{account.name}</Text>
          <Text style={styles.meta}>
            {account.type.toUpperCase()} · {account.currency} {account.balance.toFixed(2)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: UI_PRESETS.spacing.screen,
    gap: UI_PRESETS.spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: "Geist",
    fontSize: 22,
  },
  item: {
    borderWidth: 1,
    borderColor: "#A6ADC8",
    borderRadius: UI_PRESETS.radius.lg,
    padding: UI_PRESETS.spacing.xl,
    gap: UI_PRESETS.spacing.xs,
  },
  itemTitle: {
    fontFamily: "Geist",
    fontSize: 16,
  },
  meta: {
    fontFamily: "Figtree",
    opacity: UI_PRESETS.opacity.muted,
  },
});

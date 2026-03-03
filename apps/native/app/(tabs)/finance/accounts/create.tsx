import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AccountForm, Button, Card, Text, View, type AccountFormValues } from "@/components";
import { createAccount, formatAccountBalance, type Account, type CreateAccountPayload } from "@/lib/accounts";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function CreateAccount() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<Account | null>(null);

  const handleCreate = async (values: AccountFormValues) => {
    setLoading(true);

    try {
      const payload: CreateAccountPayload = {
        name: values.name,
        type: values.type,
        openingBalance: Number(values.balance),
        currencyCode: "GHS",
      };

      const account = await createAccount(payload);
      setCreated(account);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.foreground }]}>Create Account</Text>
      <AccountForm mode="create" submitLabel="Create account" loading={loading} onSubmit={handleCreate} />

      {created ? (
        <Card variant="outline" style={[styles.summaryCard, { borderColor: theme.border }]}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Created</Text>
          <Text style={[Typography.bodyMD, { color: theme.text }]}>{created.name}</Text>
          <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>
            {formatAccountBalance(created.balance, created.currencyCode)}
          </Text>
        </Card>
      ) : null}

      <Button title="Back to accounts" variant="outline" onPress={() => router.replace("/(tabs)/finance/accounts" as any)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: UI_PRESETS.spacing.md,
    paddingTop: UI_PRESETS.spacing["4xl"],
  },
  title: {
    ...Typography.titleLG,
    paddingHorizontal: UI_PRESETS.spacing.section,
  },
  summaryCard: {
    gap: UI_PRESETS.spacing.xs,
    marginHorizontal: UI_PRESETS.spacing.section,
  },
});

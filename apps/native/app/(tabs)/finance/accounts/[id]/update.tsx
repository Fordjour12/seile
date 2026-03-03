import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AccountForm, Banner, Button, Spinner, Text, View, type AccountFormValues } from "@/components";
import { getAccount, updateAccount, type Account, type UpdateAccountPayload } from "@/lib/accounts";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function UpdateAccount() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) {
        setIsLoading(false);
        setError("Account ID is missing.");
        return;
      }

      const found = await getAccount(id);
      setAccount(found);
      setIsLoading(false);

      if (!found) {
        setError("Account not found.");
      }
    }

    void load();
  }, [id]);

  const handleUpdate = async (values: AccountFormValues) => {
    if (!id) {
      setError("Account ID is missing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: UpdateAccountPayload = {
        name: values.name,
        type: values.type,
        status: values.isActive ? "active" : "archived",
        balance: Number(values.balance),
      };

      const updated = await updateAccount(id, payload);
      setAccount(updated);

      if (!updated) {
        setError("Unable to update account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.foreground }]}>Update Account</Text>

      {error ? (
        <Banner
          variant="error"
          title="Update issue"
          message={error}
          actionLabel="Back"
          onActionPress={() => router.replace("/(tabs)/finance/accounts" as any)}
        />
      ) : null}

      {isLoading ? (
        <View style={styles.loadingState}>
          <Spinner />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading account…</Text>
        </View>
      ) : null}

      {!isLoading && account ? (
        <AccountForm
          mode="update"
          submitLabel="Save changes"
          loading={loading}
          initialValues={{
            name: account.name,
            balance: `${account.balance}`,
            type: account.type,
            isActive: account.status === "active",
          }}
          onSubmit={handleUpdate}
        />
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
  loadingState: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
    paddingHorizontal: UI_PRESETS.spacing.section,
  },
});

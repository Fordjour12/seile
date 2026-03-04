import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { useRouter, type Href } from "expo-router";

import { toast } from "sonner-native";
import { Text, View } from "@/components";
import { AccountForm, type AccountFormValues } from "@/components/account-form";
import { createAccount, type CreateAccountPayload } from "@/lib/accounts";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function CreateAccount() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
      toast.success("Account created", {
        description: `${account.name} is ready to use.`,
      });
      router.replace("/(tabs)/finance/accounts" as Href);
    } catch {
      toast.error("Could not create account", {
        description: "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.foreground }]}>Create Account</Text>
      <AccountForm mode="create" submitLabel="Create account" loading={loading} onSubmit={handleCreate} />
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
});

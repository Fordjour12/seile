import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { router } from "expo-router";
import { toast } from "sonner-native";

import { Alert, Button, Input, Text, View } from "@/components";
import { UI_PRESETS } from "@/lib/constants";
import { updateAccount } from "../data";
import { useRouteAccount } from "./route-context";

export default function UpdateAccount() {
  const { account, accountId, isLoading, error } = useRouteAccount();

  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!account) {
      return;
    }

    setName(account.name);
    setBalance(String(account.balance));
  }, [account]);

  const canSubmit = name.trim().length > 1 && Number.isFinite(Number(balance));

  const handleUpdate = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateAccount(accountId, {
        name: name.trim(),
        balance: Number(balance),
      });

      toast.success("Account updated", {
        description: `${name.trim()} has been saved.`,
      });

      router.replace("/(tabs)/finance/accounts");
    } catch {
      toast.error("Update failed", {
        description: "That account could not be updated.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <Text>Loading account…</Text>
      </View>
    );
  }

  if (!account) {
    return (
      <View style={styles.screen}>
        <Alert
          variant="warning"
          title="Account unavailable"
          message={error ?? "This account was deleted or cannot be loaded."}
          actionLabel="Back to accounts"
          onActionPress={() => router.replace("/(tabs)/finance/accounts")}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Update account</Text>
      <Text style={styles.meta}>Editing: {account.id}</Text>

      <View style={[styles.form, isSubmitting && styles.disabledBlock]}>
        <Input value={name} onChangeText={setName} editable={!isSubmitting} />
        <Input value={balance} onChangeText={setBalance} editable={!isSubmitting} keyboardType="decimal-pad" />
      </View>

      <Button title="Update" onPress={handleUpdate} disabled={!canSubmit} loading={isSubmitting} />
      <Button
        title="Delete account"
        variant="destructive"
        onPress={() => router.push(`/(tabs)/finance/accounts/${account.id}/delete`)}
        disabled={isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: UI_PRESETS.spacing.screen,
    gap: UI_PRESETS.spacing.lg,
  },
  title: {
    fontFamily: "Geist",
    fontSize: 22,
  },
  meta: {
    fontFamily: "Figtree",
    opacity: UI_PRESETS.opacity.muted,
  },
  form: {
    gap: UI_PRESETS.spacing.md,
  },
  disabledBlock: {
    opacity: UI_PRESETS.opacity.disabled,
  },
});

import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { router } from "expo-router";
import { toast } from "sonner-native";

import { Alert, Button, Dialog, Text, View } from "@/components";
import { UI_PRESETS } from "@/lib/constants";
import { deleteAccount } from "../data";
import { useRouteAccount } from "./route-context";

export default function DeleteAccount() {
  const { account, accountId, isLoading, error } = useRouteAccount();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      const deleted = await deleteAccount(accountId);
      toast.success("Account deleted", {
        description: `${deleted.name} was removed.`,
      });
      router.replace("/(tabs)/finance/accounts");
    } catch {
      toast.error("Delete failed", {
        description: "This account may have already been removed.",
      });
      setIsDeleting(false);
      setConfirmOpen(false);
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
          message={error ?? "This account no longer exists."}
          actionLabel="Back to accounts"
          onActionPress={() => router.replace("/(tabs)/finance/accounts")}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Delete account</Text>

      <Alert
        variant="warning"
        title="You're about to permanently delete this account"
        message={`${account.name} · ${account.type.toUpperCase()} · ${account.currency} ${account.balance.toFixed(2)}\nLast updated ${new Date(account.updatedAt).toLocaleString()}`}
      />

      <View style={isDeleting ? styles.disabledBlock : undefined}>
        <Button
          title="Confirm deletion"
          variant="destructive"
          onPress={() => setConfirmOpen(true)}
          disabled={isDeleting}
        />
      </View>

      <Button title="Cancel" variant="ghost" onPress={() => router.back()} disabled={isDeleting} />

      <Dialog
        visible={confirmOpen}
        title={`Delete ${account.name}?`}
        description={`${account.type.toUpperCase()} account with ${account.currency} ${account.balance.toFixed(2)} will be permanently removed.`}
        tone="destructive"
        confirmLabel="Delete now"
        cancelLabel="Keep account"
        onCancel={() => !isDeleting && setConfirmOpen(false)}
        onConfirm={handleDelete}
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
  disabledBlock: {
    opacity: UI_PRESETS.opacity.disabled,
  },
});

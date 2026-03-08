import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";
import {
  useDeleteAccount,
  formatAccountBalance,
  formatAccountType,
  type DeleteAccountPayload,
  useAccount,
} from "@/lib/accounts";
import {
  Alert,
  Banner,
  Button,
  Card,
  Dialog,
  EmptyState,
  SectionHeader,
  Spinner,
  Text,
  View,
} from "@/components";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function DeleteAccountScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const account = useAccount(id);
  const deleteAccount = useDeleteAccount();
  const isLoading = Boolean(id) && account === undefined;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDelete = async () => {
    if (!id) {
      setError("Account ID is missing.");
      return;
    }

    setShowDialog(false);
    setIsDeleting(true);
    setError(null);

    try {
      const payload: DeleteAccountPayload = {
        id,
        hardDelete: false,
      };

      const success = await deleteAccount(payload);
      if (!success) {
        setError("Deletion failed. Try again.");
        toast.error("Delete failed", {
          description: "This account may have already been removed.",
        });
        return;
      }

      toast.success("Account deleted", {
        description: `${account?.name ?? "Account"} was archived.`,
      });
      router.replace("/(tabs)/finance/accounts" as Href);
    } catch {
      setError("Deletion failed. Try again.");
      toast.error("Delete failed", {
        description: "This account may have already been removed.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const notFound = !isLoading && !account;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader title="Delete Account" subtitle={`Account ID: ${id ?? "unknown"}`} />

      {error ? (
        <Banner
          variant="error"
          title="Deletion failed"
          message={error}
          actionLabel="Retry"
          onActionPress={() => setError(null)}
        />
      ) : null}

      {isLoading ? (
        <View style={styles.deletingState}>
          <Spinner />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading account…</Text>
        </View>
      ) : null}

      {notFound ? (
        <EmptyState
          title="Account not found"
          message="This account no longer exists, so there is nothing to delete."
          actionLabel="Back to accounts"
          onActionPress={() => router.replace("/(tabs)/finance/accounts" as Href)}
        />
      ) : null}

      {!isLoading && account ? (
        <Card variant="outline" style={[styles.confirmCard, { borderColor: theme.border }]}>
          <Text style={[Typography.titleSM, { color: theme.text }]}>Archive {account.name}?</Text>
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>This action archives the account for history.</Text>

          <Alert
            variant="error"
            title="This action cannot be undone"
            message={`${formatAccountType(account.type)} account with ${formatAccountBalance(account.balance, account.currencyCode)} will be archived.`}
          />

          {isDeleting ? (
            <View style={styles.deletingState}>
              <Spinner />
              <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Deleting account…</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Button title="Cancel" variant="outline" onPress={() => router.back()} />
            <Button
              title="Delete Account"
              variant="destructive"
              onPress={() => setShowDialog(true)}
              loading={isDeleting}
            />
          </View>
        </Card>
      ) : null}

      <Dialog
        visible={showDialog}
        title="Confirm archive"
        description="Archiving keeps history but removes this account from active workflows."
        confirmLabel="Yes, archive"
        cancelLabel="Keep account"
        tone="destructive"
        onCancel={() => setShowDialog(false)}
        onConfirm={onDelete}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.lg,
  },
  confirmCard: {
    gap: UI_PRESETS.spacing.md,
  },
  deletingState: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
  actions: {
    gap: UI_PRESETS.spacing.sm,
    marginTop: UI_PRESETS.spacing.sm,
  },
});

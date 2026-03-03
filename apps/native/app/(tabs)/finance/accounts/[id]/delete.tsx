import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [hasError, setHasError] = useState(id === "error");
  const [notFound] = useState(!id);

  const onDelete = () => {
    setShowDialog(false);
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      router.replace("/(tabs)/finance/accounts" as any);
    }, 900);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader title="Delete Account" subtitle={`Account ID: ${id ?? "unknown"}`} />

      {hasError ? (
        <Banner
          variant="error"
          title="Deletion failed"
          message="Try again, or cancel and review linked transactions first."
          actionLabel="Retry"
          onActionPress={() => setHasError(false)}
        />
      ) : null}

      {notFound ? (
        <EmptyState
          title="Account not found"
          message="This account no longer exists, so there is nothing to delete."
          actionLabel="Back to accounts"
          onActionPress={() => router.replace("/(tabs)/finance/accounts" as any)}
        />
      ) : (
        <Card variant="outline" style={[styles.confirmCard, { borderColor: theme.border }]}>
          <Text style={[Typography.titleSM, { color: theme.text }]}>Delete this account permanently?</Text>
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>
            This action removes the account and disconnects it from future reconciliation workflows.
          </Text>

          <Alert
            variant="error"
            title="This action cannot be undone"
            message="Associated transactions may lose account references unless reassigned first."
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
      )}

      <Dialog
        visible={showDialog}
        title="Confirm deletion"
        description="Deleting this account is permanent. Continue?"
        confirmLabel="Yes, delete"
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

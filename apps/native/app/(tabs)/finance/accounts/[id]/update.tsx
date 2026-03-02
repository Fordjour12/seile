import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Banner,
  Button,
  Card,
  EmptyState,
  Input,
  SectionHeader,
  Spinner,
  Text,
  View,
} from "@/components";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function UpdateAccountScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [type, setType] = useState("Checking");
  const [currency, setCurrency] = useState("USD");
  const [openingBalance, setOpeningBalance] = useState("0.00");
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!id) {
        setNotFound(true);
      } else if (id === "error") {
        setHasError(true);
      } else {
        setName("Daily Spending");
        setInstitution("Northstar Bank");
        setType("Checking");
        setCurrency("USD");
        setOpeningBalance("4821.34");
        setStatus("Active");
      }
      setIsLoading(false);
    }, 550);

    return () => clearTimeout(timer);
  }, [id]);

  const isValid = useMemo(
    () => name.trim().length > 0 && institution.trim().length > 0 && currency.trim().length === 3,
    [currency, institution, name],
  );

  const onSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      router.replace("/(tabs)/finance/accounts" as any);
    }, 700);
  };

  const retryLoad = () => {
    setHasError(false);
    setIsLoading(true);
    setTimeout(() => {
      setName("Daily Spending");
      setInstitution("Northstar Bank");
      setType("Checking");
      setCurrency("USD");
      setOpeningBalance("4821.34");
      setStatus("Active");
      setIsLoading(false);
    }, 500);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader title="Update Account" subtitle={`Account ID: ${id ?? "unknown"}`} />

      {isLoading ? (
        <View style={styles.centeredState}>
          <Spinner size="large" />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading account details…</Text>
        </View>
      ) : null}

      {!isLoading && hasError ? (
        <Banner
          variant="error"
          title="Failed to load account"
          message="Please retry to continue editing this account."
          actionLabel="Retry"
          onActionPress={retryLoad}
        />
      ) : null}

      {!isLoading && !hasError && notFound ? (
        <EmptyState
          title="Account not found"
          message="This account may have been removed or the link is outdated."
          actionLabel="Back to accounts"
          onActionPress={() => router.replace("/(tabs)/finance/accounts" as any)}
        />
      ) : null}

      {!isLoading && !hasError && !notFound ? (
        <Card variant="outline" style={[styles.formCard, { borderColor: theme.border }]}>
          <View style={styles.fieldGroup}>
            <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Account name</Text>
            <Input value={name} onChangeText={setName} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Institution</Text>
            <Input value={institution} onChangeText={setInstitution} />
          </View>

          <View style={styles.inlineRow}>
            <View style={styles.inlineField}>
              <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Type</Text>
              <Input value={type} onChangeText={setType} />
            </View>
            <View style={styles.inlineField}>
              <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Currency</Text>
              <Input value={currency} onChangeText={(value) => setCurrency(value.toUpperCase())} maxLength={3} />
            </View>
          </View>

          <View style={styles.inlineRow}>
            <View style={styles.inlineField}>
              <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Opening balance</Text>
              <Input value={openingBalance} onChangeText={setOpeningBalance} keyboardType="decimal-pad" />
            </View>
            <View style={styles.inlineField}>
              <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Status</Text>
              <Input value={status} onChangeText={setStatus} />
            </View>
          </View>

          <View style={styles.actions}>
            <Button title="Save Changes" onPress={onSave} disabled={!isValid} loading={isSaving} />
            <Button title="Delete Account" variant="destructive" onPress={() => router.push(`/(tabs)/finance/accounts/${id}/delete` as any)} />
          </View>
        </Card>
      ) : null}

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
  centeredState: {
    alignItems: "center",
    justifyContent: "center",
    gap: UI_PRESETS.spacing.sm,
    paddingVertical: UI_PRESETS.spacing.section,
  },
  formCard: {
    gap: UI_PRESETS.spacing.md,
  },
  fieldGroup: {
    gap: UI_PRESETS.spacing.xs,
  },
  inlineRow: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
  },
  inlineField: {
    flex: 1,
    gap: UI_PRESETS.spacing.xs,
  },
  actions: {
    gap: UI_PRESETS.spacing.sm,
    marginTop: UI_PRESETS.spacing.sm,
  },
});

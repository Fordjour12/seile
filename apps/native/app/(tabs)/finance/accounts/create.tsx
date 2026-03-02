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

export default function CreateAccountScreen() {
  const router = useRouter();
  const { template } = useLocalSearchParams<{ template?: string }>();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [type, setType] = useState("Checking");
  const [currency, setCurrency] = useState("USD");
  const [openingBalance, setOpeningBalance] = useState("0.00");
  const [status, setStatus] = useState("Active");

  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (template === "missing") {
        setHasLoadError(true);
      }
      setIsLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [template]);

  const isValid = useMemo(
    () => name.trim().length > 0 && institution.trim().length > 0 && currency.trim().length === 3,
    [currency, institution, name],
  );

  const submit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.replace("/(tabs)/finance/accounts" as any);
    }, 700);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <Spinner size="large" />
        <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Loading account form…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeader title="Create Account" subtitle="Add a new account to your finance workspace" />

      {hasLoadError ? (
        <Banner
          variant="error"
          title="Unable to load account defaults"
          message="Retry to load institutions and account suggestions."
          actionLabel="Retry"
          onActionPress={() => setHasLoadError(false)}
        />
      ) : null}

      <Card variant="outline" style={[styles.formCard, { borderColor: theme.border }]}>
        <Text style={[Typography.titleSM, { color: theme.text }]}>Account details</Text>

        <View style={styles.fieldGroup}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Account name</Text>
          <Input value={name} onChangeText={setName} placeholder="Everyday Checking" />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Institution</Text>
          <Input value={institution} onChangeText={setInstitution} placeholder="Northstar Bank" />
        </View>

        <View style={styles.inlineRow}>
          <View style={styles.inlineField}>
            <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Type</Text>
            <Input value={type} onChangeText={setType} placeholder="Checking" />
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
            <Input value={status} onChangeText={setStatus} placeholder="Active" />
          </View>
        </View>
      </Card>

      {!hasLoadError && !isSubmitting && !isValid ? (
        <EmptyState title="Complete required fields" message="Account name, institution, and a 3-letter currency are required." />
      ) : null}

      <View style={styles.actions}>
        <Button title="Create Account" onPress={submit} disabled={!isValid} loading={isSubmitting} />
        <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
      </View>

      {isSubmitting ? (
        <View style={styles.submittingRow}>
          <Spinner />
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>Saving account…</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
    paddingHorizontal: UI_PRESETS.spacing.screen,
  },
  screen: { flex: 1 },
  content: {
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.lg,
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
  },
  submittingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_PRESETS.spacing.sm,
  },
});

import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter, type Href } from "expo-router";
import { toast } from "sonner-native";

import {
  Button,
  Card,
  Chip,
  FinanceAccountPicker,
  FinanceAmountField,
  FinanceCategoryPicker,
  FinanceDateTimePickerField,
  Input,
  Text,
  View,
} from "@/components";
import { listAccounts, type Account } from "@/lib/accounts";
import { listCategories, type CategoryOption } from "@/lib/categories";
import { createSubscription } from "@/lib/subscriptions";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

const SCHEDULE_TYPES: Array<"weekly" | "monthly" | "yearly"> = ["weekly", "monthly", "yearly"];
const SUBSCRIPTION_STATUSES: Array<"active" | "trial" | "paused" | "cancelled"> = [
  "active",
  "trial",
  "paused",
  "cancelled",
];

function normalizeCategoryId(categoryId: string | undefined): string | undefined {
  if (!categoryId || categoryId.startsWith("fallback-")) {
    return undefined;
  }
  return categoryId;
}

export default function CreateSubscriptionScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [serviceName, setServiceName] = useState("");
  const [amount, setAmount] = useState("");
  const [currencyCode, setCurrencyCode] = useState("GHS");
  const [accountId, setAccountId] = useState("");
  const [scheduleType, setScheduleType] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [status, setStatus] = useState<"active" | "trial" | "paused" | "cancelled">("active");
  const [trialEndsAt, setTrialEndsAt] = useState<string | undefined>(undefined);
  const [startAt, setStartAt] = useState<string | undefined>(new Date().toISOString());
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const rows = await listAccounts();
        setAccounts(rows.filter((item) => item.status === "active"));
      } catch {
        setAccounts([]);
      }
    }

    void loadAccounts();
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategories(await listCategories());
      } catch (error) {
        toast.error("Could not load categories", {
          description: error instanceof Error ? error.message : "Please try again.",
        });
      }
    }

    void loadCategories();
  }, []);

  const amountError = useMemo(() => {
    const parsed = Number(amount);
    if (!amount.length) return "Amount is required";
    if (!Number.isFinite(parsed) || parsed <= 0) return "Enter a valid amount";
    return null;
  }, [amount]);

  async function onSubmit() {
    if (!serviceName.trim()) {
      toast.error("Service name is required");
      return;
    }

    if (amountError) {
      toast.error("Fix form issues", { description: amountError });
      return;
    }

    if (!accountId.trim()) {
      toast.error("Account ID is required");
      return;
    }

    setLoading(true);
    try {
      await createSubscription({
        serviceName: serviceName.trim(),
        amount: Number(amount),
        currencyCode,
        accountId: accountId.trim(),
        categoryId: normalizeCategoryId(categoryId),
        scheduleType,
        startAt: startAt ?? new Date().toISOString(),
        status,
        trialEndsAt: status === "trial" ? trialEndsAt : undefined,
      });

      toast.success("Subscription created");
      router.replace("/(tabs)/finance/recurring" as Href);
    } catch (error) {
      toast.error("Could not create subscription", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.foreground }]}>Create Subscription</Text>
      <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
        Track renewals, trial windows, and recurring service spend.
      </Text>

      <Card variant="outline" style={[styles.sectionCard, { borderColor: theme.border }]}>
        <View style={styles.fieldGroup}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Service name</Text>
          <Input value={serviceName} onChangeText={setServiceName} placeholder="Netflix" />
        </View>

        <FinanceAmountField
          value={amount}
          currencyCode={currencyCode}
          onChangeValue={setAmount}
          error={amount.length > 0 ? amountError ?? undefined : undefined}
        />

        <View style={styles.fieldGroup}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Currency Code</Text>
          <Input value={currencyCode} onChangeText={setCurrencyCode} autoCapitalize="characters" maxLength={3} />
        </View>

        <View style={styles.fieldGroup}>
          <FinanceAccountPicker
            label="Billing account"
            accounts={accounts}
            selectedAccountId={accountId}
            onSelectAccount={setAccountId}
          />
        </View>
      </Card>

      <Card variant="outline" style={[styles.sectionCard, { borderColor: theme.border }]}>
        <View style={styles.fieldGroup}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Schedule type</Text>
          <View style={styles.chipGrid}>
            {SCHEDULE_TYPES.map((item) => (
              <Chip key={item} label={item} selected={scheduleType === item} onSelect={() => setScheduleType(item)} />
            ))}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Status</Text>
          <View style={styles.chipGrid}>
            {SUBSCRIPTION_STATUSES.map((item) => (
              <Chip key={item} label={item} selected={status === item} onSelect={() => setStatus(item)} />
            ))}
          </View>
        </View>

        {status === "trial" ? (
          <FinanceDateTimePickerField
            label="Trial end"
            value={trialEndsAt}
            mode="date"
            onChangeValue={setTrialEndsAt}
          />
        ) : null}

        <FinanceDateTimePickerField
          label="Start at"
          value={startAt}
          mode="datetime"
          onChangeValue={setStartAt}
        />

        <FinanceCategoryPicker
          categories={categories}
          selectedCategoryId={categoryId}
          onSelectCategory={setCategoryId}
        />
      </Card>

      <Button title={loading ? "Creating..." : "Create subscription"} onPress={onSubmit} disabled={loading} />
      <Button title="Back to schedules" variant="outline" onPress={() => router.replace("/(tabs)/finance/recurring" as Href)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingTop: UI_PRESETS.spacing.screen,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.md,
  },
  title: { ...Typography.titleLG },
  subtitle: { ...Typography.bodySM },
  sectionCard: { gap: UI_PRESETS.spacing.md },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.xs,
  },
  fieldGroup: { gap: UI_PRESETS.spacing.xs },
});

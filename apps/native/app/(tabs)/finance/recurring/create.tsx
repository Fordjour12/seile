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
  FinanceScheduleFields,
  Input,
  Text,
  View,
} from "@/components";
import { listAccounts, type Account } from "@/lib/accounts";
import { listCategories, type CategoryOption } from "@/lib/categories";
import { createRecurringTransaction, type RecurringKind, type ScheduleType } from "@/lib/recurring";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

const RECURRING_KINDS: RecurringKind[] = ["expense", "income", "transfer"];

function normalizeCategoryId(categoryId: string | undefined): string | undefined {
  if (!categoryId || categoryId.startsWith("fallback-")) {
    return undefined;
  }
  return categoryId;
}

export default function CreateRecurringScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [kind, setKind] = useState<RecurringKind>("expense");
  const [amount, setAmount] = useState("");
  const [currencyCode, setCurrencyCode] = useState("GHS");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("monthly");
  const [interval, setInterval] = useState("1");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [accountId, setAccountId] = useState("");
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [startAt, setStartAt] = useState<string | undefined>(new Date().toISOString());
  const [endAt, setEndAt] = useState<string | undefined>(undefined);
  const [note, setNote] = useState("");
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
      const rows = await listCategories();
      setCategories(rows);
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
    if (amountError) {
      toast.error("Fix form issues", { description: amountError });
      return;
    }

    if (kind === "transfer" && (!fromAccountId.trim() || !toAccountId.trim())) {
      toast.error("Transfer requires accounts", {
        description: "Provide both from and to account IDs.",
      });
      return;
    }

    if (kind !== "transfer" && !accountId.trim()) {
      toast.error("Account required", {
        description: "Provide accountId for this schedule.",
      });
      return;
    }

    setLoading(true);
    try {
      await createRecurringTransaction({
        kind,
        amount: Number(amount),
        currencyCode,
        scheduleType,
        interval: Math.max(1, Number(interval) || 1),
        dayOfMonth: scheduleType === "monthly" ? Math.max(1, Math.min(28, Number(dayOfMonth) || 1)) : undefined,
        dayOfWeek: scheduleType === "weekly" ? Math.max(0, Math.min(6, Number(dayOfWeek) || 0)) : undefined,
        startAt: startAt ?? new Date().toISOString(),
        endAt,
        accountId: kind === "transfer" ? undefined : accountId.trim(),
        fromAccountId: kind === "transfer" ? fromAccountId.trim() : undefined,
        toAccountId: kind === "transfer" ? toAccountId.trim() : undefined,
        categoryId: normalizeCategoryId(categoryId),
        note: note.trim() || undefined,
      });

      toast.success("Schedule created");
      router.replace("/(tabs)/finance/recurring" as Href);
    } catch (error) {
      toast.error("Could not create schedule", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.foreground }]}>Create Schedule</Text>
      <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
        Define a rule once and let entries generate automatically.
      </Text>

      <Card variant="outline" style={[styles.sectionCard, { borderColor: theme.border }]}>
        <View style={styles.fieldGroup}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Kind</Text>
          <View style={styles.kindGrid}>
            {RECURRING_KINDS.map((item) => (
              <Chip key={item} label={item} selected={kind === item} onSelect={() => setKind(item)} />
            ))}
          </View>
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
      </Card>

      <Card variant="outline" style={[styles.sectionCard, { borderColor: theme.border }]}>
        <FinanceScheduleFields
          scheduleType={scheduleType}
          interval={interval}
          dayOfMonth={dayOfMonth}
          dayOfWeek={dayOfWeek}
          onScheduleTypeChange={setScheduleType}
          onIntervalChange={setInterval}
          onDayOfMonthChange={setDayOfMonth}
          onDayOfWeekChange={setDayOfWeek}
        />
      </Card>

      <Card variant="outline" style={[styles.sectionCard, { borderColor: theme.border }]}>
        {kind === "transfer" ? (
          <>
            <FinanceAccountPicker
              label="From account"
              accounts={accounts}
              selectedAccountId={fromAccountId}
              onSelectAccount={(id) => {
                setFromAccountId(id);
                if (toAccountId === id) {
                  setToAccountId("");
                }
              }}
            />
            <FinanceAccountPicker
              label="To account"
              accounts={accounts}
              excludedAccountIds={fromAccountId ? [fromAccountId] : []}
              selectedAccountId={toAccountId}
              onSelectAccount={setToAccountId}
            />
          </>
        ) : (
          <FinanceAccountPicker
            label="Account"
            accounts={accounts}
            selectedAccountId={accountId}
            onSelectAccount={setAccountId}
          />
        )}

        <FinanceCategoryPicker
          categories={categories}
          selectedCategoryId={categoryId}
          onSelectCategory={setCategoryId}
        />

        <FinanceDateTimePickerField
          label="Start at"
          value={startAt}
          mode="datetime"
          onChangeValue={setStartAt}
        />

        <FinanceDateTimePickerField
          label="End at (optional)"
          value={endAt}
          mode="datetime"
          onChangeValue={setEndAt}
        />

        <View style={styles.fieldGroup}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Note</Text>
          <Input value={note} onChangeText={setNote} placeholder="Rent, salary, utilities..." />
        </View>
      </Card>

      <Button title={loading ? "Creating..." : "Create schedule"} onPress={onSubmit} disabled={loading} />
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
  kindGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.xs,
  },
  fieldGroup: { gap: UI_PRESETS.spacing.xs },
});

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
import { createTransaction, type TransactionKind } from "@/lib/transactions";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

const KINDS: TransactionKind[] = ["expense", "income", "transfer", "adjustment"];

function normalizeCategoryId(categoryId: string | undefined): string | undefined {
  if (!categoryId || categoryId.startsWith("fallback-")) {
    return undefined;
  }
  return categoryId;
}

export default function CreateTransactionScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [kind, setKind] = useState<TransactionKind>("expense");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [currencyCode, setCurrencyCode] = useState("GHS");
  const [accountId, setAccountId] = useState("");
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [occurredAt, setOccurredAt] = useState<string | undefined>(new Date().toISOString());
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
    if (!amount.length) return "Amount is required";
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) return "Enter a valid amount";
    return null;
  }, [amount]);

  async function onSubmit() {
    if (amountError) {
      toast.error("Fix form issues", { description: amountError });
      return;
    }

    const parsedAmount = Number(amount);

    if (kind === "transfer" && (!fromAccountId.trim() || !toAccountId.trim())) {
      toast.error("Transfer requires accounts", {
        description: "Provide both fromAccountId and toAccountId.",
      });
      return;
    }

    if (kind !== "transfer" && !accountId.trim()) {
      toast.error("Account required", {
        description: "Provide accountId for this transaction.",
      });
      return;
    }

    setLoading(true);
    try {
      await createTransaction({
        kind,
        amount: parsedAmount,
        currencyCode: currencyCode.trim().toUpperCase() || "GHS",
        accountId: kind === "transfer" ? undefined : accountId.trim(),
        fromAccountId: kind === "transfer" ? fromAccountId.trim() : undefined,
        toAccountId: kind === "transfer" ? toAccountId.trim() : undefined,
        categoryId: normalizeCategoryId(categoryId),
        note: note.trim() || undefined,
        occurredAt,
      });

      toast.success("Transaction created");
      router.replace("/(tabs)/finance/transactions" as Href);
    } catch (error) {
      toast.error("Could not create transaction", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.foreground }]}>Create Transaction</Text>
      <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
        Use a quick, structured form to log movement between accounts.
      </Text>

      <Card variant="outline" style={[styles.sectionCard, { borderColor: theme.border }]}>
        <View style={styles.section}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Transaction kind</Text>
          <View style={styles.kindGrid}>
            {KINDS.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={kind === item}
                onSelect={() => setKind(item)}
              />
            ))}
          </View>
        </View>

        <FinanceAmountField
          value={amount}
          currencyCode={currencyCode.trim().toUpperCase() || "GHS"}
          onChangeValue={setAmount}
          error={amount.length > 0 ? amountError ?? undefined : undefined}
        />

        <View style={styles.fieldGroup}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Currency Code</Text>
          <Input value={currencyCode} onChangeText={setCurrencyCode} autoCapitalize="characters" maxLength={3} />
        </View>
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
          label="Occurred at"
          value={occurredAt}
          mode="datetime"
          onChangeValue={setOccurredAt}
        />

        <View style={styles.fieldGroup}>
          <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>Note</Text>
          <Input
            value={note}
            onChangeText={setNote}
            placeholder="Optional description"
            multiline
            numberOfLines={3}
          />
        </View>
      </Card>

      <Button title={loading ? "Creating..." : "Create transaction"} onPress={onSubmit} disabled={loading} />
      <Button
        title="Back to transactions"
        variant="outline"
        onPress={() => router.replace("/(tabs)/finance/transactions" as Href)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingTop: UI_PRESETS.spacing.screen,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.md,
  },
  title: {
    ...Typography.titleLG,
  },
  subtitle: {
    ...Typography.bodySM,
  },
  section: {
    gap: UI_PRESETS.spacing.xs,
  },
  kindGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.xs,
  },
  sectionCard: {
    gap: UI_PRESETS.spacing.md,
  },
  fieldGroup: {
    gap: UI_PRESETS.spacing.xs,
  },
});

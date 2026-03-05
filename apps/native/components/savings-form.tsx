import React, { useMemo, useState } from "react";
import { StyleSheet } from "react-native";

import {
  Button,
  Chip,
  FinanceAccountPicker,
  FinanceAmountField,
  FinanceCategoryPicker,
  FinanceDateTimePickerField,
  Input,
  Text,
  View,
} from "@/components";
import type { Account } from "@/lib/accounts";
import type { CategoryOption } from "@/lib/categories";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export type SavingsFormMode = "create" | "update";

export interface SavingsFormValues {
  name: string;
  targetAmount: string;
  currentAmount: string;
  monthlyContribution: string;
  targetDate?: string;
  linkedAccountId?: string;
  categoryId?: string;
  notes: string;
  isActive: boolean;
}

interface SavingsFormProps {
  mode: SavingsFormMode;
  initialValues?: Partial<SavingsFormValues>;
  accounts: Account[];
  categories: CategoryOption[];
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: SavingsFormValues) => Promise<void> | void;
}

const DEFAULT_VALUES: SavingsFormValues = {
  name: "",
  targetAmount: "",
  currentAmount: "",
  monthlyContribution: "",
  targetDate: undefined,
  linkedAccountId: undefined,
  categoryId: undefined,
  notes: "",
  isActive: true,
};

type FieldName = "name" | "targetAmount" | "currentAmount" | "monthlyContribution" | "targetDate";

function parseNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function SavingsForm({
  mode,
  initialValues,
  accounts,
  categories,
  submitLabel,
  loading = false,
  onSubmit,
}: SavingsFormProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const seededValues = useMemo(
    () => ({
      ...DEFAULT_VALUES,
      ...initialValues,
    }),
    [initialValues],
  );

  const [name, setName] = useState(seededValues.name);
  const [targetAmount, setTargetAmount] = useState(seededValues.targetAmount);
  const [currentAmount, setCurrentAmount] = useState(seededValues.currentAmount);
  const [monthlyContribution, setMonthlyContribution] = useState(seededValues.monthlyContribution);
  const [targetDate, setTargetDate] = useState(seededValues.targetDate);
  const [linkedAccountId, setLinkedAccountId] = useState(seededValues.linkedAccountId);
  const [categoryId, setCategoryId] = useState(seededValues.categoryId);
  const [notes, setNotes] = useState(seededValues.notes);
  const [isActive, setIsActive] = useState(seededValues.isActive);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

  const clearError = (field: FieldName) => {
    if (!errors[field]) return;
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<FieldName, string>> = {};
    const parsedTarget = parseNumber(targetAmount);
    const parsedCurrent = parseNumber(currentAmount);
    const parsedMonthly = monthlyContribution.trim() ? Number(monthlyContribution) : undefined;

    if (!name.trim()) nextErrors.name = "Goal name is required.";
    if (parsedTarget === null || parsedTarget <= 0) nextErrors.targetAmount = "Enter a valid target amount.";
    if (parsedCurrent === null || parsedCurrent < 0) nextErrors.currentAmount = "Enter a valid current amount.";
    if (parsedTarget !== null && parsedCurrent !== null && parsedCurrent > parsedTarget) {
      nextErrors.currentAmount = "Current amount cannot exceed target amount.";
    }
    if (parsedMonthly !== undefined && (!Number.isFinite(parsedMonthly) || parsedMonthly < 0)) {
      nextErrors.monthlyContribution = "Monthly contribution must be a valid number.";
    }
    if (targetDate) {
      const parsedDate = new Date(targetDate);
      if (Number.isNaN(parsedDate.getTime()) || parsedDate.getTime() <= Date.now()) {
        nextErrors.targetDate = "Target date must be in the future.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      name: name.trim(),
      targetAmount: targetAmount.trim(),
      currentAmount: currentAmount.trim(),
      monthlyContribution: monthlyContribution.trim(),
      targetDate,
      linkedAccountId,
      categoryId,
      notes: notes.trim(),
      isActive,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.foreground }]}>Goal Name</Text>
        <Input
          value={name}
          onChangeText={(value) => {
            setName(value);
            clearError("name");
          }}
          placeholder={mode === "create" ? "e.g. Emergency Fund" : "Update savings goal name"}
        />
        {errors.name ? <Text style={[styles.errorText, { color: theme.destructive }]}>{errors.name}</Text> : null}
      </View>

      <FinanceAmountField
        label="Target Amount"
        value={targetAmount}
        error={errors.targetAmount}
        onChangeValue={(value) => {
          setTargetAmount(value);
          clearError("targetAmount");
        }}
      />
      <FinanceAmountField
        label="Current Amount"
        value={currentAmount}
        error={errors.currentAmount}
        onChangeValue={(value) => {
          setCurrentAmount(value);
          clearError("currentAmount");
        }}
      />
      <FinanceAmountField
        label="Monthly Contribution"
        value={monthlyContribution}
        error={errors.monthlyContribution}
        placeholder="Optional"
        onChangeValue={(value) => {
          setMonthlyContribution(value);
          clearError("monthlyContribution");
        }}
      />

      <FinanceDateTimePickerField
        label="Target Date"
        mode="date"
        value={targetDate}
        placeholder="Optional target date"
        onChangeValue={(value) => {
          setTargetDate(value);
          clearError("targetDate");
        }}
      />
      {errors.targetDate ? <Text style={[styles.errorText, { color: theme.destructive }]}>{errors.targetDate}</Text> : null}

      <FinanceAccountPicker
        label="Linked Account"
        placeholder="Select account (optional)"
        accounts={accounts}
        selectedAccountId={linkedAccountId}
        onSelectAccount={setLinkedAccountId}
      />

      <FinanceCategoryPicker
        label="Category"
        categories={categories}
        selectedCategoryId={categoryId}
        onSelectCategory={setCategoryId}
      />

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.foreground }]}>Notes</Text>
        <Input value={notes} onChangeText={setNotes} placeholder="Optional notes" multiline />
      </View>

      <View style={[styles.switchRow, { borderColor: theme.border, backgroundColor: theme.card }]}>
        <View style={styles.switchCopy}>
          <Text style={[styles.label, { color: theme.foreground }]}>Goal Status</Text>
          <Text style={[styles.helperText, { color: theme.mutedForeground }]}>
            {isActive ? "Active goals show up in planning views." : "Save as draft until you are ready."}
          </Text>
        </View>
        <Chip label={isActive ? "Active" : "Draft"} selected={isActive} onSelect={(selected) => setIsActive(selected)} />
      </View>

      <Button title={submitLabel} loading={loading} onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: UI_PRESETS.spacing.section,
    paddingHorizontal: UI_PRESETS.spacing.section,
    paddingBottom: UI_PRESETS.spacing.section,
  },
  fieldGroup: {
    gap: UI_PRESETS.spacing.md,
  },
  label: {
    ...Typography.labelMD,
  },
  helperText: {
    ...Typography.captionLG,
  },
  errorText: {
    ...Typography.captionLG,
    paddingHorizontal: UI_PRESETS.spacing.section,
  },
  switchRow: {
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.lg,
    paddingVertical: UI_PRESETS.spacing.xl,
    paddingHorizontal: UI_PRESETS.spacing.xxxl,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: UI_PRESETS.spacing.xl,
  },
  switchCopy: {
    flex: 1,
    gap: UI_PRESETS.spacing.xs,
  },
});

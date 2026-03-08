import React, { useMemo, useState } from "react";
import { StyleSheet } from "react-native";

import { Button, Chip, FinanceAmountField, FinanceCategoryPicker, Input, Text, View } from "@/components";
import type { CategoryOption } from "@/lib/categories";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export type BudgetEnvelopeFormMode = "create" | "update";

export interface BudgetEnvelopeFormValues {
  categoryId?: string;
  allocatedAmount: string;
  rolloverEnabled: boolean;
  notes: string;
}

interface BudgetEnvelopeFormProps {
  mode: BudgetEnvelopeFormMode;
  categories: CategoryOption[];
  initialValues?: Partial<BudgetEnvelopeFormValues>;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: BudgetEnvelopeFormValues) => Promise<void> | void;
}

const DEFAULT_VALUES: BudgetEnvelopeFormValues = {
  categoryId: undefined,
  allocatedAmount: "",
  rolloverEnabled: false,
  notes: "",
};

type FieldName = "categoryId" | "allocatedAmount";

export function BudgetEnvelopeForm({
  mode,
  categories,
  initialValues,
  submitLabel,
  loading = false,
  onSubmit,
}: BudgetEnvelopeFormProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const seededValues = useMemo(() => ({ ...DEFAULT_VALUES, ...initialValues }), [initialValues]);

  const [categoryId, setCategoryId] = useState(seededValues.categoryId);
  const [allocatedAmount, setAllocatedAmount] = useState(seededValues.allocatedAmount);
  const [rolloverEnabled, setRolloverEnabled] = useState(seededValues.rolloverEnabled);
  const [notes, setNotes] = useState(seededValues.notes);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

  const validate = () => {
    const nextErrors: Partial<Record<FieldName, string>> = {};
    const parsedAmount = Number(allocatedAmount);

    if (mode === "create" && !categoryId) {
      nextErrors.categoryId = "Select a category.";
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      nextErrors.allocatedAmount = "Enter a valid allocation amount.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit({
      categoryId,
      allocatedAmount: allocatedAmount.trim(),
      rolloverEnabled,
      notes: notes.trim(),
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FinanceCategoryPicker
        label="Category"
        categories={categories}
        selectedCategoryId={categoryId}
        onSelectCategory={setCategoryId}
      />
      {errors.categoryId ? <Text style={[styles.errorText, { color: theme.destructive }]}>{errors.categoryId}</Text> : null}

      <FinanceAmountField
        label="Allocated Amount"
        value={allocatedAmount}
        error={errors.allocatedAmount}
        onChangeValue={setAllocatedAmount}
      />

      <View style={[styles.switchRow, { borderColor: theme.border, backgroundColor: theme.card }]}>
        <View style={styles.switchCopy}>
          <Text style={[styles.label, { color: theme.foreground }]}>Rollover</Text>
          <Text style={[styles.helperText, { color: theme.mutedForeground }]}>
            Carry unused allocation into the next period when the period closes.
          </Text>
        </View>
        <Chip
          label={rolloverEnabled ? "Enabled" : "Disabled"}
          selected={rolloverEnabled}
          onSelect={(selected) => setRolloverEnabled(selected)}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.foreground }]}>Notes</Text>
        <Input value={notes} onChangeText={setNotes} placeholder="Optional notes" multiline />
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

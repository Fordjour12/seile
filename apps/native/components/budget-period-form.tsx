import React, { useMemo, useState } from "react";
import { StyleSheet } from "react-native";

import { Button, FinanceAmountField, Input, Text, View } from "@/components";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export type BudgetPeriodFormMode = "create" | "update";

export interface BudgetPeriodFormValues {
  year: string;
  month: string;
  incomeTarget: string;
  notes: string;
}

interface BudgetPeriodFormProps {
  mode: BudgetPeriodFormMode;
  initialValues?: Partial<BudgetPeriodFormValues>;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: BudgetPeriodFormValues) => Promise<void> | void;
}

const DEFAULT_VALUES: BudgetPeriodFormValues = {
  year: `${new Date().getFullYear()}`,
  month: `${new Date().getMonth() + 1}`,
  incomeTarget: "",
  notes: "",
};

type FieldName = "year" | "month" | "incomeTarget";

export function BudgetPeriodForm({
  mode,
  initialValues,
  submitLabel,
  loading = false,
  onSubmit,
}: BudgetPeriodFormProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const seededValues = useMemo(() => ({ ...DEFAULT_VALUES, ...initialValues }), [initialValues]);

  const [year, setYear] = useState(seededValues.year);
  const [month, setMonth] = useState(seededValues.month);
  const [incomeTarget, setIncomeTarget] = useState(seededValues.incomeTarget);
  const [notes, setNotes] = useState(seededValues.notes);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

  const clearError = (field: FieldName) => {
    if (!errors[field]) return;
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<FieldName, string>> = {};
    const parsedYear = Number(year);
    const parsedMonth = Number(month);
    const parsedIncome = Number(incomeTarget);

    if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      nextErrors.year = "Enter a valid year.";
    }
    if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      nextErrors.month = "Month must be between 1 and 12.";
    }
    if (!Number.isFinite(parsedIncome) || parsedIncome < 0) {
      nextErrors.incomeTarget = "Enter a valid income target.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      year: year.trim(),
      month: month.trim(),
      incomeTarget: incomeTarget.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.row}>
        <View style={styles.fieldHalf}>
          <Text style={[styles.label, { color: theme.foreground }]}>Year</Text>
          <Input
            value={year}
            onChangeText={(value) => {
              setYear(value);
              clearError("year");
            }}
            keyboardType="number-pad"
            editable={mode === "create"}
          />
          {errors.year ? <Text style={[styles.errorText, { color: theme.destructive }]}>{errors.year}</Text> : null}
        </View>
        <View style={styles.fieldHalf}>
          <Text style={[styles.label, { color: theme.foreground }]}>Month</Text>
          <Input
            value={month}
            onChangeText={(value) => {
              setMonth(value);
              clearError("month");
            }}
            keyboardType="number-pad"
            editable={mode === "create"}
          />
          {errors.month ? <Text style={[styles.errorText, { color: theme.destructive }]}>{errors.month}</Text> : null}
        </View>
      </View>

      <FinanceAmountField
        label="Income Target"
        value={incomeTarget}
        error={errors.incomeTarget}
        onChangeValue={(value) => {
          setIncomeTarget(value);
          clearError("incomeTarget");
        }}
      />

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
  row: {
    flexDirection: "row",
    gap: UI_PRESETS.spacing.md,
  },
  fieldHalf: {
    flex: 1,
    gap: UI_PRESETS.spacing.md,
  },
  fieldGroup: {
    gap: UI_PRESETS.spacing.md,
  },
  label: {
    ...Typography.labelMD,
  },
  errorText: {
    ...Typography.captionLG,
  },
});

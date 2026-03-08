import React, { useMemo, useState } from "react";
import { StyleSheet } from "react-native";

import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { Button } from "./button";
import { Chip } from "./chip";
import { Input } from "./input";
import { Text } from "./text";
import { View } from "./view";

export type DebtFormMode = "create" | "update";
export type DebtType = "installment" | "revolving";

export interface DebtFormValues {
  name: string;
  debtType: DebtType;
  originalBalance: string;
  currentBalance: string;
  monthlyDue: string;
  apr: string;
  isActive: boolean;
}

interface DebtFormProps {
  mode: DebtFormMode;
  initialValues?: Partial<DebtFormValues>;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: DebtFormValues) => Promise<void> | void;
}

const DEFAULT_VALUES: DebtFormValues = {
  name: "",
  debtType: "installment",
  originalBalance: "",
  currentBalance: "",
  monthlyDue: "",
  apr: "",
  isActive: true,
};

type FieldName = "name" | "originalBalance" | "currentBalance" | "monthlyDue" | "apr";

function parseRequiredNumber(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function DebtForm({
  mode,
  initialValues,
  submitLabel,
  loading = false,
  onSubmit,
}: DebtFormProps) {
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
  const [debtType, setDebtType] = useState<DebtType>(seededValues.debtType);
  const [originalBalance, setOriginalBalance] = useState(seededValues.originalBalance);
  const [currentBalance, setCurrentBalance] = useState(seededValues.currentBalance);
  const [monthlyDue, setMonthlyDue] = useState(seededValues.monthlyDue);
  const [apr, setApr] = useState(seededValues.apr);
  const [isActive, setIsActive] = useState(seededValues.isActive);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

  const clearError = (field: FieldName) => {
    if (!errors[field]) {
      return;
    }

    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<FieldName, string>> = {};
    const parsedOriginalBalance = parseRequiredNumber(originalBalance);
    const parsedCurrentBalance = parseRequiredNumber(currentBalance);
    const parsedMonthlyDue = parseRequiredNumber(monthlyDue);
    const parsedApr = apr.trim() ? Number(apr.trim()) : undefined;

    if (!name.trim()) {
      nextErrors.name = "Debt name is required.";
    }

    if (parsedOriginalBalance === null || parsedOriginalBalance < 0) {
      nextErrors.originalBalance = "Enter a valid original balance.";
    }

    if (parsedCurrentBalance === null || parsedCurrentBalance < 0) {
      nextErrors.currentBalance = "Enter a valid current balance.";
    }

    if (parsedMonthlyDue === null || parsedMonthlyDue < 0) {
      nextErrors.monthlyDue = "Enter a valid monthly due amount.";
    }

    if (parsedOriginalBalance !== null && parsedCurrentBalance !== null && parsedCurrentBalance > parsedOriginalBalance) {
      nextErrors.currentBalance = "Current balance cannot exceed original balance.";
    }

    if (parsedApr !== undefined && (!Number.isFinite(parsedApr) || parsedApr < 0 || parsedApr > 100)) {
      nextErrors.apr = "APR must be between 0 and 100.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    await onSubmit({
      name: name.trim(),
      debtType,
      originalBalance: originalBalance.trim(),
      currentBalance: currentBalance.trim(),
      monthlyDue: monthlyDue.trim(),
      apr: apr.trim(),
      isActive,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.foreground }]}>Debt Name</Text>
        <Input
          value={name}
          onChangeText={(value) => {
            setName(value);
            clearError("name");
          }}
          placeholder={mode === "create" ? "e.g. Visa Card" : "Update debt name"}
          returnKeyType="next"
        />
        {errors.name ? <Text style={[styles.errorText, { color: theme.destructive }]}>{errors.name}</Text> : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.foreground }]}>Debt Type</Text>
        <View style={styles.chipRow}>
          <Chip label="Installment" selected={debtType === "installment"} onSelect={() => setDebtType("installment")} />
          <Chip label="Revolving" selected={debtType === "revolving"} onSelect={() => setDebtType("revolving")} />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.foreground }]}>Original Balance</Text>
        <Input
          value={originalBalance}
          onChangeText={(value) => {
            setOriginalBalance(value);
            clearError("originalBalance");
          }}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
        {errors.originalBalance ? (
          <Text style={[styles.errorText, { color: theme.destructive }]}>{errors.originalBalance}</Text>
        ) : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.foreground }]}>Current Balance</Text>
        <Input
          value={currentBalance}
          onChangeText={(value) => {
            setCurrentBalance(value);
            clearError("currentBalance");
          }}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
        <Text style={[styles.helperText, { color: theme.mutedForeground }]}>
          Keep this aligned with your latest statement balance.
        </Text>
        {errors.currentBalance ? (
          <Text style={[styles.errorText, { color: theme.destructive }]}>{errors.currentBalance}</Text>
        ) : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.foreground }]}>Monthly Due</Text>
        <Input
          value={monthlyDue}
          onChangeText={(value) => {
            setMonthlyDue(value);
            clearError("monthlyDue");
          }}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
        {errors.monthlyDue ? (
          <Text style={[styles.errorText, { color: theme.destructive }]}>{errors.monthlyDue}</Text>
        ) : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.foreground }]}>APR</Text>
        <Input
          value={apr}
          onChangeText={(value) => {
            setApr(value);
            clearError("apr");
          }}
          keyboardType="decimal-pad"
          placeholder="Optional"
        />
        <Text style={[styles.helperText, { color: theme.mutedForeground }]}>
          Enter the annual interest rate as a percentage.
        </Text>
        {errors.apr ? <Text style={[styles.errorText, { color: theme.destructive }]}>{errors.apr}</Text> : null}
      </View>

      <View style={[styles.switchRow, { borderColor: theme.border, backgroundColor: theme.card }]}>
        <View style={styles.switchCopy}>
          <Text style={[styles.label, { color: theme.foreground }]}>Plan Status</Text>
          <Text style={[styles.helperText, { color: theme.mutedForeground }]}>
            {isActive ? "Active and visible in debt planning." : "Saved as draft until you are ready."}
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
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: UI_PRESETS.spacing.md,
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

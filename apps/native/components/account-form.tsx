import React, { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { Button } from "@/components/button";
import { Chip } from "@/components/chip";
import { Input } from "@/components/input";
import { Switch } from "@/components/switch";
import { Text } from "@/components/text";
import { View } from "@/components/view";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export type AccountFormMode = "create" | "update";
export type AccountType = "checking" | "savings";

export interface AccountFormValues {
  name: string;
  balance: string;
  type: AccountType;
  isActive: boolean;
}

interface AccountFormProps {
  mode: AccountFormMode;
  initialValues?: Partial<AccountFormValues>;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: AccountFormValues) => Promise<void> | void;
}

const DEFAULT_VALUES: AccountFormValues = {
  name: "",
  balance: "",
  type: "checking",
  isActive: true,
};

export function AccountForm({
  mode,
  initialValues,
  submitLabel,
  loading = false,
  onSubmit,
}: AccountFormProps) {
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
  const [balance, setBalance] = useState(seededValues.balance);
  const [type, setType] = useState<AccountType>(seededValues.type);
  const [isActive, setIsActive] = useState(seededValues.isActive);
  const [errors, setErrors] = useState<Partial<Record<"name" | "balance", string>>>({});

  const validate = () => {
    const nextErrors: Partial<Record<"name" | "balance", string>> = {};

    if (!name.trim()) {
      nextErrors.name = "Account name is required.";
    }

    const normalizedBalance = balance.trim();
    if (!normalizedBalance) {
      nextErrors.balance = "Starting balance is required.";
    } else if (Number.isNaN(Number(normalizedBalance))) {
      nextErrors.balance = "Enter a valid number for balance.";
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
      balance: balance.trim(),
      type,
      isActive,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.foreground }]}>Account Name</Text>
        <Input
          value={name}
          onChangeText={(value) => {
            setName(value);
            if (errors.name) {
              setErrors((prev) => ({ ...prev, name: undefined }));
            }
          }}
          placeholder={mode === "create" ? "e.g. Everyday Checking" : "Update account name"}
          returnKeyType="next"
        />
        {errors.name ? <Text style={[styles.errorText, { color: theme.destructive }]}>{errors.name}</Text> : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.foreground }]}>Balance</Text>
        <Input
          value={balance}
          onChangeText={(value) => {
            setBalance(value);
            if (errors.balance) {
              setErrors((prev) => ({ ...prev, balance: undefined }));
            }
          }}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
        {errors.balance ? (
          <Text style={[styles.errorText, { color: theme.destructive }]}>{errors.balance}</Text>
        ) : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.foreground }]}>Account Type</Text>
        <View style={styles.chipRow}>
          <Chip label="Checking" selected={type === "checking"} onSelect={() => setType("checking")} />
          <Chip label="Savings" selected={type === "savings"} onSelect={() => setType("savings")} />
        </View>
      </View>

      <View style={[styles.switchRow, { borderColor: theme.border, backgroundColor: theme.card }]}>
        <View style={styles.switchCopy}>
          <Text style={[styles.label, { color: theme.foreground }]}>Status</Text>
          <Text style={[styles.helperText, { color: theme.mutedForeground }]}>
            {isActive ? "Active and visible in lists" : "Inactive and hidden from default lists"}
          </Text>
        </View>
        <Switch value={isActive} onValueChange={setIsActive} />
      </View>

      <Button title={submitLabel} loading={loading} onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: UI_PRESETS.spacing.section,
    padding: UI_PRESETS.spacing.section,
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
    gap: UI_PRESETS.spacing.md,
    flexWrap: "wrap",
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
    flexShrink: 1,
    gap: UI_PRESETS.spacing.xs,
  },
});

import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";

import type { Account } from "@/lib/accounts";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

import { BottomSheet } from "./bottom-sheet";
import { Input } from "./input";
import { Text } from "./text";
import { View } from "./view";

type FinanceAccountPickerProps = {
  label: string;
  placeholder?: string;
  accounts: Account[];
  selectedAccountId?: string;
  excludedAccountIds?: string[];
  onSelectAccount: (accountId: string) => void;
};

export function FinanceAccountPicker({
  label,
  placeholder = "Select account",
  accounts,
  selectedAccountId,
  excludedAccountIds = [],
  onSelectAccount,
}: FinanceAccountPickerProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");

  const selected = accounts.find((item) => item.id === selectedAccountId);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter((item) => {
      if (excludedAccountIds.includes(item.id)) {
        return false;
      }
      if (!q) {
        return true;
      }
      return item.name.toLowerCase().includes(q) || item.type.toLowerCase().includes(q);
    });
  }, [accounts, excludedAccountIds, query]);

  return (
    <View style={styles.container}>
      <Text style={[Typography.labelSM, { color: theme.mutedForeground }]}>{label}</Text>

      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text style={[Typography.bodySM, { color: selected ? theme.foreground : theme.mutedForeground }]}>
          {selected ? selected.name : placeholder}
        </Text>
      </Pressable>

      <BottomSheet
        visible={visible}
        onClose={() => {
          setVisible(false);
          setQuery("");
        }}
        title={label}
        subtitle="Pick one account"
        snapPoints={["70%"]}
      >
        <Input value={query} onChangeText={setQuery} placeholder="Search accounts" />

        <ScrollView contentContainerStyle={styles.listContent}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                onSelectAccount(item.id);
                setVisible(false);
                setQuery("");
              }}
              style={({ pressed }) => [
                styles.option,
                {
                  borderColor: selectedAccountId === item.id ? theme.primary : theme.border,
                  backgroundColor: theme.card,
                  opacity: pressed ? 0.86 : 1,
                },
              ]}
            >
              <View style={styles.optionRow}>
                <Text style={[Typography.bodySM, { color: theme.foreground }]}>{item.name}</Text>
                <Text style={[Typography.captionSM, { color: theme.mutedForeground }]}>
                  {item.currencyCode} {item.balance.toFixed(2)}
                </Text>
              </View>
              <Text style={[Typography.captionSM, { color: theme.mutedForeground, textTransform: "capitalize" }]}>
                {item.type}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: UI_PRESETS.spacing.xs,
  },
  trigger: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.md,
    paddingHorizontal: UI_PRESETS.spacing.sm,
    justifyContent: "center",
  },
  listContent: {
    gap: UI_PRESETS.spacing.xs,
    paddingTop: UI_PRESETS.spacing.xs,
    paddingBottom: UI_PRESETS.spacing.lg,
  },
  option: {
    borderWidth: 1,
    borderRadius: UI_PRESETS.radius.md,
    paddingHorizontal: UI_PRESETS.spacing.sm,
    paddingVertical: UI_PRESETS.spacing.sm,
    gap: UI_PRESETS.spacing.xs,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: UI_PRESETS.spacing.sm,
  },
});

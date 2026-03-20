import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";

import type { CategoryOption } from "@/lib/categories";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

import { BottomSheet } from "./bottom-sheet";
import { Input } from "./input";
import { Text } from "./text";
import { View } from "./view";

type FinanceCategoryPickerProps = {
  label?: string;
  categories: CategoryOption[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string | undefined) => void;
};

export function FinanceCategoryPicker({
  label = "Category",
  categories,
  selectedCategoryId,
  onSelectCategory,
}: FinanceCategoryPickerProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");

  const selected = categories.find((item) => item.id === selectedCategoryId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((item) => item.name.toLowerCase().includes(q));
  }, [categories, query]);

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
          {selected ? selected.name : "Select category (optional)"}
        </Text>
      </Pressable>

      <BottomSheet
        visible={visible}
        onClose={() => {
          setVisible(false);
          setQuery("");
        }}
        title={label}
        subtitle="Pick one category"
        snapPoints={["60%"]}
      >
        <Input value={query} onChangeText={setQuery} placeholder="Search categories" />

        <Pressable
          onPress={() => {
            onSelectCategory(undefined);
            setVisible(false);
            setQuery("");
          }}
          style={({ pressed }) => [
            styles.clear,
            {
              borderColor: theme.border,
              backgroundColor: theme.card,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Text style={[Typography.bodySM, { color: theme.mutedForeground }]}>No category</Text>
        </Pressable>

        <ScrollView contentContainerStyle={styles.listContent}>
          {filtered.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                onSelectCategory(item.id);
                setVisible(false);
                setQuery("");
              }}
              style={({ pressed }) => [
                styles.option,
                {
                  borderColor: selectedCategoryId === item.id ? theme.primary : theme.border,
                  backgroundColor: theme.card,
                  opacity: pressed ? 0.86 : 1,
                },
              ]}
            >
              <Text style={[Typography.bodySM, { color: theme.foreground }]}>{item.name}</Text>
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
  clear: {
    marginTop: UI_PRESETS.spacing.xs,
    minHeight: 40,
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
  },
});

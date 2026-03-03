import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { AccountForm, Text, View, type AccountFormValues } from "@/components";
import { NAV_THEME, Typography, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function UpdateAccount() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (_values: AccountFormValues) => {
    setLoading(true);
    setLoading(false);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.foreground }]}>Update Account</Text>
      <AccountForm
        mode="update"
        submitLabel="Save changes"
        loading={loading}
        initialValues={{
          name: "Primary Checking",
          balance: "2500.00",
          type: "checking",
          isActive: true,
        }}
        onSubmit={handleUpdate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: UI_PRESETS.spacing.md,
    paddingTop: UI_PRESETS.spacing["4xl"],
  },
  title: {
    ...Typography.titleLG,
    paddingHorizontal: UI_PRESETS.spacing.section,
  },
});

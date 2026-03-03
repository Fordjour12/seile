import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { router } from "expo-router";
import { toast } from "sonner-native";

import { Alert, Button, Input, Text, View } from "@/components";
import { UI_PRESETS } from "@/lib/constants";
import { createAccount } from "./data";

export default function CreateAccount() {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = name.trim().length > 1 && Number.isFinite(Number(balance));

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createAccount({
        name: name.trim(),
        balance: Number(balance),
        type: "checking",
        currency: "USD",
      });

      toast.success("Account created", {
        description: `${name.trim()} is ready to use.`,
      });

      router.replace("/(tabs)/finance/accounts");
    } catch {
      toast.error("Could not create account", {
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Create account</Text>
      <Alert
        variant="info"
        title="Tip"
        message="You'll be redirected to Accounts after a successful save."
      />
      <View style={[styles.form, isSubmitting && styles.disabledBlock]}>
        <Input
          value={name}
          onChangeText={setName}
          editable={!isSubmitting}
          placeholder="Account name"
        />
        <Input
          value={balance}
          onChangeText={setBalance}
          editable={!isSubmitting}
          keyboardType="decimal-pad"
          placeholder="Starting balance"
        />
      </View>
      <Button title="Save account" onPress={handleSubmit} disabled={!canSubmit} loading={isSubmitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: UI_PRESETS.spacing.screen,
    gap: UI_PRESETS.spacing.lg,
  },
  title: {
    fontFamily: "Geist",
    fontSize: 22,
  },
  form: {
    gap: UI_PRESETS.spacing.md,
  },
  disabledBlock: {
    opacity: UI_PRESETS.opacity.disabled,
  },
});

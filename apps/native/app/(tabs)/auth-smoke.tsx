import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Container } from "@/components/container";
import { Badge, Button, Card, SectionHeader, Text as AppText } from "@/components";
import { useAuth } from "@/lib/auth-context";
import { useLocalAuth } from "@/lib/use-local-auth";

export default function AuthSmokeScreen() {
  const {
    isLocked,
    isBiometricEnabled,
    isLoading,
    lock,
    unlock,
    enableBiometric,
    disableBiometric,
  } = useAuth();
  const { isReady, isSupported, isEnrolled, securityLevel, authenticationTypes } = useLocalAuth();

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>("No action yet.");

  const status = useMemo(
    () => ({
      locked: isLocked ? "Locked" : "Unlocked",
      biometric: isBiometricEnabled ? "Enabled" : "Disabled",
      hardware: isSupported ? "Supported" : "Not Supported",
      enrolled: isEnrolled ? "Enrolled" : "Not Enrolled",
      level: securityLevel,
      types: authenticationTypes.length > 0 ? authenticationTypes.join(", ") : "None",
    }),
    [authenticationTypes, isBiometricEnabled, isEnrolled, isLocked, isSupported, securityLevel],
  );

  const run = async (fn: () => Promise<{ success: boolean; error?: string }>, label: string) => {
    if (busy) return;
    setBusy(true);
    setResult(`${label}...`);
    const res = await fn();
    setResult(res.success ? `${label}: success` : `${label}: ${res.error ?? "failed"}`);
    setBusy(false);
  };

  return (
    <Container>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <SectionHeader title="Auth Smoke Test" subtitle="Validate startup biometric flow quickly" />

        <Card variant="outline">
          <AppText variant="h3">Current Status</AppText>
          <View style={styles.row}>
            <Badge color={isLocked ? "warning" : "success"}>{status.locked}</Badge>
            <Badge color={isBiometricEnabled ? "primary" : "secondary"}>{status.biometric}</Badge>
            <Badge color={isReady ? "success" : "warning"}>{isReady ? "Ready" : "Checking..."}</Badge>
          </View>
          <AppText variant="small">Auth loading: {isLoading ? "true" : "false"}</AppText>
          <AppText variant="small">Hardware: {status.hardware}</AppText>
          <AppText variant="small">Enrolled: {status.enrolled}</AppText>
          <AppText variant="small">Security: {status.level}</AppText>
          <AppText variant="small">Types: {status.types}</AppText>
        </Card>

        <Card>
          <AppText variant="h3">Actions</AppText>
          <View style={styles.row}>
            <Button title="Lock Now" onPress={() => lock()} variant="secondary" style={styles.flex} />
            <Button title="Unlock Now" onPress={() => run(unlock, "Unlock")} style={styles.flex} />
          </View>
          <View style={styles.row}>
            <Button
              title="Enable Biometric"
              onPress={() => run(enableBiometric, "Enable biometric")}
              variant="primary"
              style={styles.flex}
            />
            <Button
              title="Disable Biometric"
              onPress={async () => {
                if (busy) return;
                setBusy(true);
                await disableBiometric();
                setResult("Disable biometric: success");
                setBusy(false);
              }}
              variant="ghost"
              style={styles.flex}
            />
          </View>
          <AppText variant="muted">{result}</AppText>
        </Card>

        <Card variant="outline">
          <AppText variant="h3">Startup Checklist</AppText>
          <AppText variant="small">1. Enable biometrics.</AppText>
          <AppText variant="small">2. Kill app completely.</AppText>
          <AppText variant="small">3. Reopen app and confirm biometric prompt appears before content.</AppText>
        </Card>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  flex: {
    flex: 1,
  },
});

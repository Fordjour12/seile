import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useConvexAuth, useQuery } from "convex/react";

import { Container } from "@/components/container";
import { Badge, Button, Card, SectionHeader, Text as AppText } from "@/components";
import { authClient, useSession } from "@/lib/auth-client";
import { apiAny } from "@/lib/backend-api";
import { bootstrapUserData } from "@/lib/bootstrap-user-data";

function formatError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Request failed";
}

export default function AuthSmokeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { data: session, isPending: isSessionPending } = useSession();
  const {
    data: passkeys,
    isPending: isPasskeysPending,
    refetch: refetchPasskeys,
  } = authClient.useListPasskeys();
  const currentUser = useQuery(
    apiAny.auth.getCurrentUser,
    isAuthenticated ? {} : "skip",
  );

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>("No action yet.");

  const runAddPasskey = async () => {
    if (busy) return;
    setBusy(true);
    setResult("Registering passkey...");

    const response = await authClient.passkey.addPasskey({
      name: session?.user?.email ?? "Seile passkey",
      authenticatorAttachment: "platform",
    });

    if (response.error) {
      setResult(`Passkey failed: ${response.error.message || "Request failed"}`);
      setBusy(false);
      return;
    }

    await refetchPasskeys().catch(() => undefined);
    setResult("Passkey registered");
    setBusy(false);
  };

  const runBootstrap = async () => {
    if (busy) return;
    setBusy(true);
    setResult("Bootstrapping...");
    try {
      const response = await bootstrapUserData();
      setResult(
        response.created
          ? `Bootstrap complete: ${response.seededCount} categories created`
          : "Bootstrap skipped: user data already exists",
      );
    } catch (error) {
      setResult(`Bootstrap failed: ${formatError(error)}`);
    } finally {
      setBusy(false);
    }
  };

  const runSignOut = async () => {
    if (busy) return;
    setBusy(true);
    setResult("Signing out...");
    try {
      await authClient.signOut({
        fetchOptions: {
          throw: true,
        },
      });
      setResult("Signed out");
      router.replace("/(auth)/sign-in");
    } catch (error) {
      setResult(`Sign out failed: ${formatError(error)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <SectionHeader title="Auth Diagnostics" subtitle="BETTER AUTH + CONVEX" />

        <Card variant="outline">
          <AppText variant="h3">Current Status</AppText>
          <View style={styles.row}>
            <Badge color={isAuthenticated ? "success" : "warning"}>
              {isAuthenticated ? "Authenticated" : "Signed Out"}
            </Badge>
            <Badge color={isLoading ? "warning" : "primary"}>
              {isLoading ? "Convex Loading" : "Convex Ready"}
            </Badge>
            <Badge color={isSessionPending ? "warning" : "secondary"}>
              {isSessionPending ? "Session Pending" : "Session Ready"}
            </Badge>
          </View>
          <AppText variant="small">
            Session user: {session?.user?.email ?? "none"}
          </AppText>
          <AppText variant="small">
            Session id: {session?.session?.id ?? "none"}
          </AppText>
          <AppText variant="small">
            Convex user id: {currentUser?.id ?? "none"}
          </AppText>
          <AppText variant="small">
            Passkeys: {isPasskeysPending ? "loading" : String(passkeys?.length ?? 0)}
          </AppText>
        </Card>

        <Card>
          <AppText variant="h3">Actions</AppText>
          <View style={styles.row}>
            <Button
              title="Add passkey"
              onPress={runAddPasskey}
              style={styles.flex}
              disabled={!isAuthenticated}
            />
          </View>
          <View style={styles.row}>
            <Button
              title="Run bootstrap"
              onPress={runBootstrap}
              variant="secondary"
              style={styles.flex}
              disabled={!isAuthenticated}
              loading={busy}
            />
            <Button
              title="Sign out"
              onPress={runSignOut}
              variant="destructive"
              style={styles.flex}
              disabled={!isAuthenticated}
            />
          </View>
          <AppText variant="muted">{result}</AppText>
        </Card>

        {isAuthenticated ? (
          <Card variant="outline">
            <AppText variant="h3">Registered Passkeys</AppText>
            {passkeys && passkeys.length > 0 ? (
              passkeys.map((passkey) => (
                <View key={passkey.id} style={styles.passkeyRow}>
                  <AppText variant="small">{passkey.name || passkey.id}</AppText>
                  <AppText variant="muted">{passkey.deviceType}</AppText>
                </View>
              ))
            ) : (
              <AppText variant="small">No passkeys registered yet.</AppText>
            )}
          </Card>
        ) : null}
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
  passkeyRow: {
    gap: 4,
  },
});

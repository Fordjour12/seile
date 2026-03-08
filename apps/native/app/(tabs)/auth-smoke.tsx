import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";

import { Container } from "@/components/container";
import {
  Badge,
  Button,
  Card,
  SectionHeader,
  Text as AppText,
} from "@/components";
import { authClient, useSession } from "@/lib/auth-client";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/backend-api";

function formatError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Request failed";
}

export default function AuthSmokeScreen() {
  const router = useRouter();
  const { user, hasHydrated, isLoading } = useAuth();
  const isAuthenticated = Boolean(user);
  const authStatus = !hasHydrated || isLoading ? "loading" : "ready";
  const { data: session, isPending: isSessionPending } = useSession();
  const {
    data: passkeys,
    isPending: isPasskeysPending,
    refetch: refetchPasskeys,
  } = authClient.useListPasskeys();
  const currentUser = useQuery(
    api.auth.getCurrentUser,
    isAuthenticated ? {} : "skip",
  );

  const [busyAction, setBusyAction] = useState<
    "passkey" | "bootstrap" | "signout" | null
  >(null);
  const [result, setResult] = useState<string>("No action yet.");
  const busy = busyAction !== null;

  const runAddPasskey = async () => {
    if (busy) return;
    setBusyAction("passkey");
    setResult("Registering passkey...");

    try {
      const response = await authClient.passkey.addPasskey({
        name: session?.user?.email ?? "Seile passkey",
        authenticatorAttachment: "platform",
      });

      if (response.error) {
        setResult(
          `Passkey failed: ${response.error.message || "Request failed"}`,
        );
        return;
      }

      await refetchPasskeys().catch(() => undefined);
      setResult("Passkey registered");
    } finally {
      setBusyAction(null);
    }
  };

  const runBootstrap = async () => {
    if (busy) return;
    setBusyAction("bootstrap");
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
      setBusyAction(null);
    }
  };

  const runSignOut = async () => {
    if (busy) return;
    setBusyAction("signout");
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
      setBusyAction(null);
    }
  };

  return (
    <Container>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <SectionHeader
          title="Auth Diagnostics"
          subtitle="BETTER AUTH + CONVEX"
        />

        <Card variant="outline">
          <AppText variant="h3">Current Status</AppText>
          <View style={styles.row}>
            <Badge color={isAuthenticated ? "success" : "warning"}>
              {isAuthenticated ? "Authenticated" : "Signed Out"}
            </Badge>
            <Badge color={authStatus === "loading" ? "warning" : "primary"}>
              {authStatus === "loading" ? "Auth Loading" : "Auth Ready"}
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
            Convex user id: {currentUser?._id ?? "none"}
          </AppText>
          <AppText variant="small">
            Passkeys:{" "}
            {isPasskeysPending ? "loading" : String(passkeys?.length ?? 0)}
          </AppText>
        </Card>

        <Card>
          <AppText variant="h3">Actions</AppText>
          <View style={styles.row}>
            <Button
              title="Add passkey"
              onPress={runAddPasskey}
              style={styles.flex}
              disabled={!isAuthenticated || busy}
              loading={busyAction === "passkey"}
            />
          </View>
          <View style={styles.row}>
            <Button
              title="Run bootstrap"
              onPress={runBootstrap}
              variant="secondary"
              style={styles.flex}
              disabled={!isAuthenticated || busy}
              loading={busyAction === "bootstrap"}
            />
            <Button
              title="Sign out"
              onPress={runSignOut}
              variant="destructive"
              style={styles.flex}
              disabled={!isAuthenticated || busy}
              loading={busyAction === "signout"}
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
                  <AppText variant="small">
                    {passkey.name || passkey.id}
                  </AppText>
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

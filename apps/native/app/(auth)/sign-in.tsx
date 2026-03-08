import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Link, useRouter } from "expo-router";

import { Button, Card, Input, Text } from "@/components";
import { Container } from "@/components/container";
import { authClient } from "@/lib/auth-client";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

function formatError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to sign in";
}

export default function SignInScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasskeySignIn = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);

    const result = await authClient.signIn.passkey({
      autoFill: false,
    });

    if (result.error) {
      setError(result.error.message || "Unable to sign in with passkey");
      setBusy(false);
      return;
    }

    router.replace("/(tabs)/finance");
    setBusy(false);
  };

  const handleSubmit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe: true,
        fetchOptions: {
          throw: true,
        },
      });
      router.replace("/(tabs)/finance");
    } catch (nextError) {
      setError(formatError(nextError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text variant="h1">Seile</Text>
          <Text variant="small" style={{ color: theme.mutedForeground }}>
            Sign in to sync your finance workspace with Convex.
          </Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.form}>
            <Text variant="h3">Sign In</Text>
            <Input
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              autoComplete="password"
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {error ? (
              <Text variant="small" style={{ color: theme.destructive }}>
                {error}
              </Text>
            ) : null}
            <Button
              title="Sign In"
              onPress={handleSubmit}
              loading={busy}
              disabled={!email.trim() || password.length === 0}
            />
            <Button
              title="Sign In With Passkey"
              onPress={handlePasskeySignIn}
              variant="secondary"
              disabled={busy}
            />
            <Text variant="muted">
              Register a passkey after your first email sign-in from the session diagnostics screen.
            </Text>
          </View>
        </Card>

        <View style={styles.footer}>
          <Text variant="small" style={{ color: theme.mutedForeground }}>
            No account yet?
          </Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <Text variant="small" style={{ color: theme.primary }}>
                Create one
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    gap: 20,
  },
  hero: {
    gap: 8,
  },
  card: {
    gap: 16,
  },
  form: {
    gap: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});

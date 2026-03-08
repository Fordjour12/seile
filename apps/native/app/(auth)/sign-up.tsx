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

  return "Unable to create account";
}

export default function SignUpScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (busy) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
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
          <Text variant="h1">Create Account</Text>
          <Text variant="small" style={{ color: theme.mutedForeground }}>
            Start with a fresh Better Auth session and seeded finance categories.
          </Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.form}>
            <Input
              autoCapitalize="words"
              autoComplete="name"
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <Input
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              autoComplete="new-password"
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Input
              autoComplete="new-password"
              placeholder="Confirm password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            {error ? (
              <Text variant="small" style={{ color: theme.destructive }}>
                {error}
              </Text>
            ) : null}
            <Button
              title="Create Account"
              onPress={handleSubmit}
              loading={busy}
              disabled={!name.trim() || !email.trim() || password.length === 0 || confirmPassword.length === 0}
            />
          </View>
        </Card>

        <View style={styles.footer}>
          <Text variant="small" style={{ color: theme.mutedForeground }}>
            Already have an account?
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text variant="small" style={{ color: theme.primary }}>
                Sign in
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

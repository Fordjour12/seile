import type { ReactNode } from "react";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

import { Text } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type AuthShellProps = {
  children: ReactNode;
  minHeightOffset?: number;
};

type AuthBackLinkProps = {
  href: string;
  label: string;
};

type AuthSocialButtonProps = {
  title: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  onPress: () => void;
  disabled?: boolean;
};

type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  hint?: string;
  rightActionLabel?: string;
  onRightActionPress?: () => void;
  containerStyle?: ViewStyle;
};

export function AuthShell({ children, minHeightOffset = 120 }: AuthShellProps) {
  const { colorScheme } = useColorScheme();
  const { height } = useWindowDimensions();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const minHeight = Math.max(height - UI_PRESETS.spacing.screen * 2, 760);
  const accentGlow =
    colorScheme === "dark"
      ? "rgba(174, 135, 255, 0.16)"
      : "rgba(108, 76, 255, 0.12)";
  const warmGlow =
    colorScheme === "dark"
      ? "rgba(116, 231, 190, 0.12)"
      : "rgba(139, 226, 204, 0.16)";

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.overlay,
          {
            backgroundColor:
              colorScheme === "dark"
                ? "rgba(8, 10, 18, 0.82)"
                : "rgba(248, 249, 252, 0.82)",
          },
        ]}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        bounces={false}
        contentContainerStyle={[
          styles.content,
          { minHeight: Math.max(minHeight - minHeightOffset, 640) },
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function AuthBackLink({ href, label }: AuthBackLinkProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Link href={href} asChild>
      <Pressable
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            gap: 6,
          }}
        >
          <FontAwesome
            name="angle-left"
            size={16}
            color={theme.mutedForeground}
          />
          <Text
            selectable
            variant="small"
            style={{ color: theme.mutedForeground }}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

export function AuthDivider() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View style={styles.dividerRow}>
      <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
      <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
        or email
      </Text>
      <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
    </View>
  );
}

export function AuthSocialButton({
  title,
  icon,
  onPress,
  disabled = false,
}: AuthSocialButtonProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        borderRadius: 14,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.card,
        minHeight: 52,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        opacity: disabled ? 0.5 : pressed ? 0.82 : 1,
      })}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: icon === "google" ? "#ffffff" : "#000000",
          borderWidth: icon === "apple" ? 1 : 0,
          borderColor: icon === "apple" ? "#333333" : "transparent",
        }}
      >
        <FontAwesome
          name={icon}
          size={12}
          color={icon === "google" ? "#4285F4" : "#ffffff"}
        />
      </View>
      <Text selectable variant="small" style={{ color: theme.foreground }}>
        {title}
      </Text>
    </Pressable>
  );
}

export function AuthField({
  label,
  error,
  hint,
  rightActionLabel,
  onRightActionPress,
  containerStyle,
  ...props
}: AuthFieldProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <View style={[styles.fieldGroup, containerStyle]}>
      <Text
        selectable
        variant="muted"
        style={{
          color: theme.mutedForeground,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {label}
      </Text>
      <View>
        <TextInput
          placeholderTextColor={theme.mutedForeground}
          style={{
            minHeight: 52,
            borderRadius: 12,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: error ? "#8f3131" : theme.border,
            backgroundColor: theme.card,
            color: theme.foreground,
            paddingHorizontal: 16,
            paddingRight: rightActionLabel ? 68 : 16,
            fontFamily: "Figtree",
            fontSize: 15,
          }}
          {...props}
        />
        {rightActionLabel ? (
          <Pressable
            onPress={onRightActionPress}
            style={({ pressed }) => ({
              position: "absolute",
              right: 14,
              top: 0,
              bottom: 0,
              justifyContent: "center",
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Text
              selectable
              variant="muted"
              style={{ color: theme.mutedForeground }}
            >
              {rightActionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text selectable variant="muted" style={{ color: "#e24b4a" }}>
          {error}
        </Text>
      ) : hint ? (
        <Text
          selectable
          variant="muted"
          style={{ color: theme.mutedForeground }}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const score = getPasswordStrength(password);
  const labels = ["Enter a password", "Too short", "Fair", "Good", "Strong"];
  const colors = ["#444444", "#e24b4a", "#ba7517", "#9b8fff", "#1d9e75"];
  const activeColor = colors[score];

  return (
    <View style={{ gap: 6 }}>
      <View style={styles.meterRow}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.meterBar,
              {
                backgroundColor:
                  index < Math.max(score, password.length === 0 ? 0 : 1)
                    ? activeColor
                    : "#1e1e22",
              },
            ]}
          />
        ))}
      </View>
      <Text selectable variant="muted" style={{ color: activeColor }}>
        {labels[score]}
      </Text>
    </View>
  );
}

export function getPasswordStrength(password: string) {
  if (!password.length) {
    return 0;
  }

  let score = 0;
  if (password.length >= 8) {
    score += 1;
  }
  if (/[A-Z]/.test(password)) {
    score += 1;
  }
  if (/[0-9]/.test(password)) {
    score += 1;
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  return Math.max(1, Math.min(4, score));
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdropOrb: {
    position: "absolute",
    borderRadius: 999,
  },
  backdropOrbTop: {
    width: 220,
    height: 220,
    top: -40,
    right: -40,
  },
  backdropOrbBottom: {
    width: 260,
    height: 260,
    bottom: 90,
    left: -90,
  },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: UI_PRESETS.spacing.screen,
    paddingTop: UI_PRESETS.spacing.section,
    paddingBottom: UI_PRESETS.spacing.section,
    gap: UI_PRESETS.spacing.xl,
  },
  wordmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  wordmarkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1e1a30",
    borderWidth: 1,
    borderColor: "#3d3570",
    alignItems: "center",
    justifyContent: "center",
  },
  wordmarkGrid: {
    width: 22,
    height: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },
  wordmarkCell: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  fieldGroup: {
    gap: 6,
  },
  meterRow: {
    flexDirection: "row",
    gap: 4,
  },
  meterBar: {
    flex: 1,
    height: 4,
    borderRadius: 999,
  },
});

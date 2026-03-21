import { Pressable, Switch, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";

import { Text } from "@/components/ui";
import { NOTIFICATION_OPTIONS } from "@/components/auth/onboarding/data";
import { StepShell } from "@/components/auth/onboarding/shared";
import type {
  OnboardingNotificationKey,
  OnboardingNotifications,
  OnboardingTheme,
} from "@/components/auth/onboarding/types";

export function StepNotifications({
  theme,
  notifications,
  onToggleNotification,
  onBack,
  onNext,
}: {
  theme: OnboardingTheme;
  notifications: OnboardingNotifications;
  onToggleNotification: (key: OnboardingNotificationKey) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <StepShell
      stepLabel="Step 7 of 8"
      title="When should I check in with you?"
      subtitle="You can adjust timing later in Profile. These are just defaults."
      onBack={onBack}
      onNext={onNext}
    >
      <View style={{ gap: 8 }}>
        {NOTIFICATION_OPTIONS.map((item) => {
          const active = notifications[item.key];

          return (
            <Pressable
              key={item.key}
              onPress={() => onToggleNotification(item.key)}
              style={({ pressed }) => ({
                borderRadius: 14,
                borderCurve: "continuous",
                padding: 14,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                opacity: pressed ? 0.88 : 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              })}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(30, 26, 48, 0.96)",
                }}
              >
                <FontAwesome name="clock-o" size={12} color="#9b8fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  selectable
                  variant="small"
                  style={{
                    color: theme.foreground,
                    fontFamily: "Geist",
                    fontWeight: "700",
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  selectable
                  variant="muted"
                  style={{ color: theme.mutedForeground, marginTop: 2 }}
                >
                  {item.subtitle}
                </Text>
              </View>
              <Switch
                value={active}
                onValueChange={() => onToggleNotification(item.key)}
                trackColor={{ false: "#252530", true: "#9b8fff" }}
                thumbColor="#ffffff"
              />
            </Pressable>
          );
        })}
      </View>
    </StepShell>
  );
}

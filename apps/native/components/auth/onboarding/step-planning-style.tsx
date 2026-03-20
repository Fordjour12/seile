import { Pressable, View } from "react-native";

import { Text } from "@/components/ui";
import { STYLE_OPTIONS } from "@/components/auth/onboarding/data";
import { StepShell } from "@/components/auth/onboarding/shared";
import type {
  OnboardingTheme,
  PlanningStyle,
} from "@/components/auth/onboarding/types";

export function StepPlanningStyle({
  theme,
  planningStyle,
  onSelectPlanningStyle,
  onBack,
  onNext,
}: {
  theme: OnboardingTheme;
  planningStyle: PlanningStyle;
  onSelectPlanningStyle: (value: PlanningStyle) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <StepShell
      stepLabel="Step 3 of 6"
      title="How do you like to plan?"
      subtitle="This shapes how the AI builds your weekly plan. You can change it any time."
      onBack={onBack}
      onNext={onNext}
    >
      <View style={{ gap: 8 }}>
        {STYLE_OPTIONS.map((item) => {
          const selected = planningStyle === item.id;

          return (
            <Pressable
              key={item.id}
              onPress={() => onSelectPlanningStyle(item.id)}
              style={({ pressed }) => ({
                borderRadius: 16,
                borderCurve: "continuous",
                padding: 16,
                backgroundColor: selected
                  ? "rgba(30, 22, 40, 0.96)"
                  : theme.card,
                borderWidth: 1,
                borderColor: selected
                  ? "rgba(61, 53, 112, 0.9)"
                  : theme.border,
                opacity: pressed ? 0.88 : 1,
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
              })}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: item.color,
                  marginTop: 3,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  selectable
                  style={{
                    color: theme.foreground,
                    fontFamily: "Geist",
                    fontWeight: "700",
                    marginBottom: 3,
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  selectable
                  variant="small"
                  style={{
                    color: theme.mutedForeground,
                    lineHeight: 18,
                  }}
                >
                  {item.description}
                </Text>
              </View>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  borderWidth: 1.5,
                  borderColor: selected ? "#9b8fff" : theme.border,
                  backgroundColor: selected ? "#9b8fff" : "transparent",
                }}
              >
                {selected ? (
                  <View
                    style={{
                      position: "absolute",
                      inset: 5,
                      borderRadius: 999,
                      backgroundColor: "#0e0e10",
                    }}
                  />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </StepShell>
  );
}

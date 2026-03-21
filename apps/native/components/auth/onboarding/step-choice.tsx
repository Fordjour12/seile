import { Pressable, View } from "react-native";

import { Text } from "@/components/ui";
import { StepShell } from "@/components/auth/onboarding/shared";
import type { OnboardingTheme } from "@/components/auth/onboarding/types";

type ChoiceOption<T extends string> = {
  id: T;
  label: string;
  description: string;
  color?: string;
  example?: string;
};

export function StepChoice<T extends string>({
  theme,
  stepLabel,
  title,
  subtitle,
  value,
  options,
  onSelect,
  onBack,
  onNext,
}: {
  theme: OnboardingTheme;
  stepLabel: string;
  title: string;
  subtitle: string;
  value: T;
  options: ReadonlyArray<ChoiceOption<T>>;
  onSelect: (value: T) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <StepShell
      stepLabel={stepLabel}
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      onNext={onNext}
    >
      <View style={{ gap: 8 }}>
        {options.map((item) => {
          const selected = value === item.id;

          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              style={({ pressed }) => ({
                borderRadius: 16,
                borderCurve: "continuous",
                padding: 16,
                backgroundColor: selected ? "rgba(30, 22, 40, 0.96)" : theme.card,
                borderWidth: 1,
                borderColor: selected ? "rgba(61, 53, 112, 0.9)" : theme.border,
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
                  backgroundColor: item.color ?? "#9b8fff",
                  marginTop: 4,
                }}
              />
              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  selectable
                  style={{
                    color: theme.foreground,
                    fontFamily: "Geist",
                    fontWeight: "700",
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  selectable
                  variant="small"
                  style={{ color: theme.mutedForeground, lineHeight: 18 }}
                >
                  {item.description}
                </Text>
                {item.example ? (
                  <Text
                    selectable
                    variant="muted"
                    style={{
                      color: theme.mutedForeground,
                      fontStyle: "italic",
                      lineHeight: 18,
                    }}
                  >
                    {item.example}
                  </Text>
                ) : null}
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
                      inset: 4,
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

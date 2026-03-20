import { Pressable, View } from "react-native";

import { Card, Text } from "@/components/ui";
import { TONE_OPTIONS } from "@/components/auth/onboarding/data";
import { StepShell } from "@/components/auth/onboarding/shared";
import type {
  AiTone,
  OnboardingTheme,
} from "@/components/auth/onboarding/types";

export function StepAiTone({
  theme,
  aiTone,
  onSelectAiTone,
  onBack,
  onNext,
}: {
  theme: OnboardingTheme;
  aiTone: AiTone;
  onSelectAiTone: (value: AiTone) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <StepShell
      stepLabel="Step 4 of 6"
      title="How should the AI talk to you?"
      subtitle="This changes how suggestions, nudges, and summaries are written throughout the app."
      onBack={onBack}
      onNext={onNext}
    >
      <View style={{ gap: 8 }}>
        {TONE_OPTIONS.map((item) => {
          const selected = aiTone === item.id;

          return (
            <Pressable
              key={item.id}
              onPress={() => onSelectAiTone(item.id)}
              style={({ pressed }) => ({
                borderRadius: 14,
                borderCurve: "continuous",
                padding: 14,
                backgroundColor: selected
                  ? "rgba(30, 22, 40, 0.96)"
                  : theme.card,
                borderWidth: 1,
                borderColor: selected
                  ? "rgba(61, 53, 112, 0.9)"
                  : theme.border,
                opacity: pressed ? 0.88 : 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              })}
            >
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
                  {item.label}
                </Text>
                <Text
                  selectable
                  variant="muted"
                  style={{
                    color: theme.mutedForeground,
                    marginTop: 2,
                    fontStyle: "italic",
                    lineHeight: 17,
                  }}
                >
                  {item.example}
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
                      inset: 3,
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
      <Card
        style={{
          borderRadius: 10,
          borderCurve: "continuous",
          padding: 12,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.card,
        }}
      >
        <Text
          selectable
          variant="muted"
          style={{ color: theme.mutedForeground, marginBottom: 4 }}
        >
          Also applies to
        </Text>
        <Text
          selectable
          variant="small"
          style={{ color: theme.foreground, lineHeight: 20 }}
        >
          Today suggestions - domain nudges - plan summaries - weekly review -
          approval language
        </Text>
      </Card>
    </StepShell>
  );
}

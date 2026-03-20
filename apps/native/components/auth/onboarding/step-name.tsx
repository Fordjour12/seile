import { TextInput } from "react-native";

import { Text } from "@/components/ui";
import { StepShell } from "@/components/auth/onboarding/shared";
import type { OnboardingTheme } from "@/components/auth/onboarding/types";

export function StepName({
  theme,
  name,
  onChangeName,
  onBack,
  onNext,
}: {
  theme: OnboardingTheme;
  name: string;
  onChangeName: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <StepShell
      stepLabel="Step 1 of 6"
      title="What should I call you?"
      subtitle="This is your personal space. Just your first name is fine."
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!name.trim()}
    >
      <TextInput
        value={name}
        onChangeText={onChangeName}
        placeholder="Your name..."
        placeholderTextColor={theme.mutedForeground}
        style={{
          minHeight: 54,
          borderRadius: 14,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.card,
          color: theme.foreground,
          paddingHorizontal: 16,
          fontFamily: "Figtree",
          fontSize: 18,
        }}
      />
      <Text
        selectable
        variant="muted"
        style={{ color: theme.mutedForeground }}
      >
        Used in greetings and planning sessions - nothing else.
      </Text>
    </StepShell>
  );
}

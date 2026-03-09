import { View } from "react-native";

import { Chip, Text } from "@/components";
import type { PlannerQuickPrompt } from "@/lib/planner/use-planner-chat";

export function PlannerQuickPrompts({
  prompts,
  disabled,
  onPromptPress,
}: {
  prompts: PlannerQuickPrompt[];
  disabled?: boolean;
  onPromptPress: (prompt: PlannerQuickPrompt) => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Text variant="small">Quick prompts</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {prompts.map((prompt) => (
          <Chip
            key={prompt.id}
            label={prompt.label}
            disabled={disabled}
            onSelect={() => onPromptPress(prompt)}
          />
        ))}
      </View>
    </View>
  );
}

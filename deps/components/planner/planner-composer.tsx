import { View } from "react-native";

import { Button, Input, Text } from "@/components";

export function PlannerComposer({
  value,
  onChangeText,
  onSend,
  disabled,
  status,
}: {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  status: string;
}) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder="Ask the planner to build, adjust, or review your week"
          multiline
          editable={!disabled}
          containerStyle={{ flex: 1 }}
          style={{ minHeight: 72, textAlignVertical: "top" }}
        />
        <Button
          title="Send"
          onPress={onSend}
          disabled={disabled || !value.trim()}
        />
      </View>
      <Text variant="muted">{status}</Text>
    </View>
  );
}

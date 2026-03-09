import { Pressable, View } from "react-native";

import { Card, Text } from "@/components";
import type { PlannerChatMessage } from "@/lib/planner/use-planner-chat";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export function PlannerChatMessageRow({
  message,
  onRetry,
}: {
  message: PlannerChatMessage;
  onRetry?: (messageId: string) => void;
}) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const isUser = message.role === "user";

  return (
    <View
      style={{
        alignItems: isUser ? "flex-end" : "flex-start",
      }}
    >
      <Card
        style={{
          gap: 8,
          maxWidth: "88%",
          backgroundColor: isUser ? theme.primary : theme.card,
          borderWidth: isUser ? 0 : 1,
          borderColor: theme.border,
        }}
      >
        <Text
          variant="muted"
          style={{
            color: isUser ? "rgba(255,255,255,0.76)" : theme.mutedForeground,
          }}
        >
          {isUser ? "You" : "Planner"}
        </Text>
        <Text
          selectable
          style={{
            color: isUser ? theme.primaryForeground : theme.foreground,
          }}
        >
          {message.text}
        </Text>
        {message.status === "failed" ? (
          <View style={{ gap: 8 }}>
            <Text variant="small" selectable style={{ color: theme.destructive }}>
              {message.error ?? "Message failed."}
            </Text>
            {onRetry ? (
              <Pressable onPress={() => onRetry(message.id)}>
                <Text variant="small" style={{ color: theme.foreground }}>
                  Retry
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : message.status === "pending" ? (
          <Text
            variant="small"
            style={{ color: isUser ? "rgba(255,255,255,0.76)" : theme.mutedForeground }}
          >
            Sending...
          </Text>
        ) : null}
      </Card>
    </View>
  );
}

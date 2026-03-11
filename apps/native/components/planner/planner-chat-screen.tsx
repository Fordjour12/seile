import { useEffect, useRef } from "react";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { ScrollView, View } from "react-native";

import { Card, Text } from "@/components";
import { Container } from "@/components/container";
import { PlannerChatMessageRow } from "@/components/planner/planner-chat-message";
import { PlannerComposer } from "@/components/planner/planner-composer";
import { PlannerCurrentPlanCard } from "@/components/planner/planner-current-plan-card";
import { PlannerDigestCard } from "@/components/planner/planner-digest-card";
import { PlannerQuickPrompts } from "@/components/planner/planner-quick-prompts";
import { usePlannerChat } from "@/lib/planner/use-planner-chat";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export function PlannerChatScreen({
  threadId,
  readOnly = false,
}: {
  threadId?: string;
  readOnly?: boolean;
}) {
  return <PlannerChatThreadScreen threadId={threadId} readOnly={readOnly} />;
}

export function PlannerChatThreadScreen({
  threadId,
  readOnly = false,
}: {
  threadId?: string;
  readOnly?: boolean;
}) {
  const {
    home,
    thread,
    messages,
    composerText,
    setComposerText,
    sendMessage,
    retryMessage,
    status,
    isSending,
    quickPrompts,
    hasConversation,
    isLoading,
  } = usePlannerChat({ threadId, readOnly });
  const scrollRef = useRef<ScrollView | null>(null);
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length]);

  return (
    <Container>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          ref={scrollRef}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 24,
            gap: 16,
          }}
        >
          {!readOnly ? <PlannerDigestCard home={home} /> : null}
          {!readOnly ? <PlannerCurrentPlanCard home={home} /> : null}
          {!readOnly ? (
            <PlannerQuickPrompts
              prompts={quickPrompts}
              disabled={isSending}
              onPromptPress={(prompt) => void sendMessage(prompt.prompt)}
            />
          ) : null}

          {readOnly && thread ? (
            <Card variant="outline" style={{ gap: 8 }}>
              <Text variant="muted">Previous chat</Text>
              <Text variant="h3">{thread.title}</Text>
              {thread.summary ? <Text variant="small">{thread.summary}</Text> : null}
            </Card>
          ) : null}

          <View style={{ gap: 12 }}>
            {isLoading ? (
              <Card variant="outline" style={{ gap: 8 }}>
                <Text variant="small">Loading planner chat...</Text>
              </Card>
            ) : null}

            {!isLoading && !hasConversation && !readOnly ? (
              <Card
                style={{
                  gap: 10,
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text variant="muted">Planner</Text>
                <Text>
                  I can draft a week, replan a loaded schedule, or review your previous week.
                  For goals, energy patterns, rest days, and automation, open Planner Settings.
                </Text>
              </Card>
            ) : null}

            {messages.map((message) => (
              <PlannerChatMessageRow
                key={message.id}
                message={message}
                onRetry={(messageId) => void retryMessage(messageId)}
            {messages.map((message) => (
              <PlannerChatMessageRow
                key={message.id}
                message={message}
                onRetry={readOnly ? undefined : (messageId) => void retryMessage(messageId)}
              />
            ))}
          </View>
        </ScrollView>

        {!readOnly ? (
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: theme.border,
              backgroundColor: theme.background,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 16,
            }}
          >
            <PlannerComposer
              value={composerText}
              onChangeText={setComposerText}
              onSend={() => void sendMessage()}
              disabled={isSending}
              status={status}
            />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </Container>
  );
}

import { View } from "react-native";

import Animated, { LinearTransition } from "react-native-reanimated";

import { Button, Card, Text } from "@/components/ui";
import { AnimatedStage } from "@/components/auth/onboarding-flow-motion";
import { TONE_MESSAGES, type DomainOption } from "@/components/auth/onboarding/data";
import type {
  AiTone,
  OnboardingTheme,
} from "@/components/auth/onboarding/types";

export function StepSummary({
  theme,
  minHeight,
  displayName,
  summaryDomains,
  aiTone,
  pinnedDomainIds,
  onWelcomeScreen,
  onUseExistingAccount,
  onBack,
}: {
  theme: OnboardingTheme;
  minHeight: number;
  displayName: string;
  summaryDomains: DomainOption[];
  aiTone: AiTone;
  pinnedDomainIds: string[];
  onWelcomeScreen: () => void;
  onUseExistingAccount: () => void;
  onBack: () => void;
}) {
  return (
    <AnimatedStage
      stageKey="onboarding-step-7"
      style={{
        flex: 1,
        justifyContent: "space-between",
        gap: 20,
        minHeight: minHeight - 120,
      }}
    >
      <View style={{ gap: 16 }}>
        <View style={{ gap: 8 }}>
          <Text
            selectable
            variant="muted"
            style={{
              textTransform: "uppercase",
              letterSpacing: 1,
              color: theme.mutedForeground,
              fontFamily: "Geist",
              fontWeight: "700",
            }}
          >
            Step 6 of 6
          </Text>
          <Text
            selectable
            style={{
              color: theme.foreground,
              fontFamily: "Geist",
              fontSize: 28,
              fontWeight: "700",
              lineHeight: 34,
            }}
          >
            You're set up, {displayName}.
          </Text>
          <Text
            selectable
            variant="small"
            style={{ color: theme.mutedForeground, lineHeight: 22 }}
          >
            Here's what I know heading into your first week. I'll learn more as
            you use the app.
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {summaryDomains.map((item) => (
            <Animated.View
              key={item.id}
              layout={LinearTransition.springify().damping(18).stiffness(180)}
              style={{
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: item.background,
                borderWidth: 1,
                borderColor: `${item.color}66`,
              }}
            >
              <Text
                selectable
                variant="muted"
                style={{
                  color: item.color,
                  fontFamily: "Geist",
                  fontWeight: "700",
                }}
              >
                {item.label}
              </Text>
            </Animated.View>
          ))}
        </View>

        <Card
          style={{
            borderRadius: 16,
            borderCurve: "continuous",
            padding: 16,
            gap: 10,
            borderWidth: 1,
            borderColor: "rgba(42, 42, 64, 0.9)",
            backgroundColor: "rgba(19, 19, 31, 0.96)",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                backgroundColor: "#9b8fff",
              }}
            />
            <Text
              selectable
              variant="muted"
              style={{
                color: theme.primary,
                textTransform: "uppercase",
                letterSpacing: 1,
                fontFamily: "Geist",
                fontWeight: "700",
              }}
            >
              First message
            </Text>
          </View>
          <Text
            selectable
            variant="small"
            style={{ color: "#b0b0c0", lineHeight: 22 }}
          >
            {TONE_MESSAGES[aiTone]}
          </Text>
        </Card>

        <Card
          style={{
            borderRadius: 14,
            borderCurve: "continuous",
            padding: 14,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.card,
          }}
        >
          <Text
            selectable
            variant="muted"
            style={{
              color: theme.mutedForeground,
              textTransform: "uppercase",
              letterSpacing: 1,
              fontFamily: "Geist",
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            What happens next
          </Text>
          <View style={{ gap: 8 }}>
            {[
              ["#9b8fff", "You'll land on Today - your daily command center"],
              ["#1d9e75", "The AI will suggest your first priorities and habits"],
              [
                "#ba7517",
                "Your first weekly plan generates after your first check-in",
              ],
              [
                "#534AB7",
                pinnedDomainIds.length > 0
                  ? `${pinnedDomainIds.length} pinned domain${pinnedDomainIds.length === 1 ? "" : "s"} will be featured first across the app`
                  : "Your selected domains shape the first week of suggestions",
              ],
            ].map(([color, label]) => (
              <View
                key={label}
                style={{
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "flex-start",
                }}
              >
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    backgroundColor: color,
                    marginTop: 6,
                  }}
                />
                <Text
                  selectable
                  variant="small"
                  style={{
                    color: theme.foreground,
                    lineHeight: 18,
                    flex: 1,
                  }}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

      <View style={{ gap: 8 }}>
        <Button
          title="Welcome To Seile OS"
          onPress={onWelcomeScreen}
          style={{ borderRadius: 14, borderCurve: "continuous" }}
        />
                <Button
          title="Back"
          variant="ghost"
          onPress={onBack}
          style={{ borderRadius: 14, borderCurve: "continuous" }}
        />
      </View>
    </AnimatedStage>
  );
}

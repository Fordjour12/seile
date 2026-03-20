import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, {
  FadeInDown,
  LinearTransition,
} from "react-native-reanimated";

import { Badge, Text } from "@/components/ui";
import {
  DOMAIN_OPTIONS,
  MAX_PINNED_DOMAINS,
} from "@/components/auth/onboarding/data";
import { StepShell } from "@/components/auth/onboarding/shared";
import type { OnboardingTheme } from "@/components/auth/onboarding/types";

export function StepDomains({
  theme,
  domains,
  pinnedDomainIds,
  onToggleDomain,
  onTogglePinnedDomain,
  onBack,
  onNext,
}: {
  theme: OnboardingTheme;
  domains: string[];
  pinnedDomainIds: string[];
  onToggleDomain: (id: string) => void;
  onTogglePinnedDomain: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <StepShell
      stepLabel="Step 2 of 6"
      title="Which areas of life matter most to you?"
      subtitle="Select all that apply. You can change this any time."
      onBack={onBack}
      onNext={onNext}
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {DOMAIN_OPTIONS.map((item, index) => {
          const selected = domains.includes(item.id);
          const isOnlySelected = selected && domains.length === 1;
          const isPinned = pinnedDomainIds.includes(item.id);
          const hasReachedPinLimit =
            !isPinned && pinnedDomainIds.length >= MAX_PINNED_DOMAINS;

          return (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(90 + index * 45).duration(280)}
              layout={LinearTransition.springify().damping(18).stiffness(180)}
              style={{ width: "48.5%", minWidth: 150 }}
            >
              <Pressable
                onPress={() => onToggleDomain(item.id)}
                style={({ pressed }) => ({
                  borderRadius: 16,
                  borderCurve: "continuous",
                  padding: 14,
                  borderWidth: selected ? 1.5 : 1,
                  borderColor: selected ? item.color : theme.border,
                  backgroundColor: selected ? `${item.color}22` : theme.card,
                  opacity: pressed ? 0.88 : 1,
                })}
              >
                <View
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 16,
                    height: 16,
                    borderRadius: 999,
                    borderWidth: 1.5,
                    borderColor: selected ? item.color : theme.border,
                    backgroundColor: selected ? item.color : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selected ? (
                    <FontAwesome name="check" size={8} color="#ffffff" />
                  ) : null}
                </View>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: item.background,
                    marginBottom: 8,
                  }}
                >
                  <FontAwesome
                    name={item.icon as ComponentProps<typeof FontAwesome>["name"]}
                    size={14}
                    color={item.color}
                  />
                </View>
                <Text
                  selectable
                  variant="small"
                  style={{
                    color: theme.foreground,
                    fontFamily: "Geist",
                    fontWeight: "700",
                    marginBottom: 2,
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  selectable
                  variant="muted"
                  style={{ color: theme.mutedForeground, lineHeight: 16 }}
                >
                  {item.subtitle}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  {selected ? (
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation();
                        onTogglePinnedDomain(item.id);
                      }}
                      style={({ pressed }) => ({
                        borderRadius: 999,
                        borderCurve: "continuous",
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderWidth: 1,
                        borderColor: isPinned ? item.color : theme.border,
                        backgroundColor: isPinned ? `${item.color}22` : theme.card,
                        opacity: pressed ? 0.82 : hasReachedPinLimit ? 0.56 : 1,
                      })}
                    >
                      <Text
                        selectable
                        variant="muted"
                        style={{
                          color: isPinned ? item.color : theme.mutedForeground,
                          fontFamily: "Geist",
                          fontWeight: "700",
                        }}
                      >
                        {isPinned ? "Unpin" : "Pin"}
                      </Text>
                    </Pressable>
                  ) : null}
                  {isPinned ? (
                    <Badge variant="outline" color="secondary">
                      Pinned
                    </Badge>
                  ) : null}
                  {hasReachedPinLimit ? (
                    <Badge variant="outline" color="secondary">
                      Max 4
                    </Badge>
                  ) : null}
                  {isOnlySelected ? (
                    <Badge variant="outline" color="secondary">
                      Keep 1+
                    </Badge>
                  ) : null}
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
      <Text
        selectable
        variant="muted"
        style={{ color: theme.mutedForeground, textAlign: "center" }}
      >
        Pick the domains that matter most right now. Keep at least one selected,
        and pin up to four to feature them first.
      </Text>
    </StepShell>
  );
}
